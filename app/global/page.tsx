"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { SignInButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { AuthControls } from "@/components/auth-controls";
import { getDefaultRetireDate } from "@/lib/retirement";
import { calculateHorizonDay1, SCENARIO_PRESETS } from "@/lib/planner";

type Theme = "light" | "dark";
type BudgetMode = "low" | "balanced" | "full";
type GenderCategory = "male" | "female_pro" | "female_worker" | "special_male" | "special_female";
type EmploymentType = "private" | "government_civilian" | "government_disciplined";

type SummaryCard = {
  key: string;
  title: string;
  value: string;
  details: string[];
  accent: string;
};

type SocialInsuranceProfile = {
  pension: string;
  medical: string;
  housing: string;
  unemployment: string;
  workplace: string;
  note: string;
};

type CityOption = {
  value: string;
  label: { en: string; zh: string };
  insurance: SocialInsuranceProfile;
};

type ProvinceOption = {
  value: string;
  label: { en: string; zh: string };
  cities: CityOption[];
};

type CountryOption = {
  value: string;
  label: { en: string; zh: string };
  provinces: ProvinceOption[];
};

type Copy = {
  brand: string;
  since: string;
  nav: { summary: string; customize: string; budget: string; stories: string };
  goal: string;
  slogan: string;
  interest: string;
  heroBadge: string;
  heroCaption: string;
  summaryTitle: string;
  summaryLead: string;
  summaryIntro: string;
  customizeTitle: string;
  customizeDesc: string;
  dob: string;
  country: string;
  province: string;
  city: string;
  gender: string;
  employmentType: string;
  employmentOptions: { private: string; governmentCivilian: string; governmentDisciplined: string };
  genderOptions: { male: string; femalePro: string; femaleWorker: string; specialMale: string; specialFemale: string };
  defaultRetireLabel: string;
  defaultRetireValue: string;
  yearsSavedLabel: string;
  retirementDisclaimer: string;
  save: string;
  spend: string;
  projectionTitle: string;
  projectionYears: string;
  projectionAge: string;
  projectionYear: string;
  projectionCapital: string;
  tierLabel: string;
  tierTop: string;
  tierElite: string;
  tierStrong: string;
  tierSteady: string;
  rankLabel: string;
  rankAmong: string;
  shareTitle: string;
  shareLead: string;
  sharePost: string;
  shareCopy: string;
  shareLink: string;
  shareChannels: string[];
  localSave: string;
  localSaved: string;
  cloudSave: string;
  saving: string;
  saveRequiresSignIn: string;
  freeHint: string;
  signInHint: string;
  authMissing: string;
  budgetTitle: string;
  budgetLead: string;
  budgetLocked: string;
  lowBudgetLabel: string;
  lowBudgetCopy: string;
  balancedBudgetLabel: string;
  balancedBudgetCopy: string;
  fullBudgetLabel: string;
  fullBudgetCopy: string;
  selectedPlan: string;
  insuranceTitle: string;
  insuranceLead: string;
  insuranceFields: { pension: string; medical: string; housing: string; unemployment: string; workplace: string; note: string };
  storiesTitle: string;
  storiesLead: string;
  stories: { name: string; role: string; text: string; image: string }[];
  currentSavings: string;
  monthlyIncome: string;
  monthlyExpenses: string;
  nestEgg: string;
  monthlySurplus: string;
  monthlyGap: string;
  horizonDate: string;
  scenarioLabel: string;
  scenarioBase: string;
  scenarioOptimistic: string;
  scenarioStress: string;
  assumptionsTitle: string;
  returnRateLabel: string;
  inflationRateLabel: string;
  multiplierLabel: string;
  pensionIncome: string;
};

import { GLOBAL_REGIONS } from "@/lib/data/regions-global";

import { GLOBAL_COPY } from "@/lib/copy/global";
import { BUDGETS } from "@/lib/data/budgets";

const COMING_SOON_COUNTRIES = new Set(["us", "uk"]);

const copy = GLOBAL_COPY;
const REGIONS: CountryOption[] = GLOBAL_REGIONS;

function calcAgeFromDob(dob: string) {
  if (!dob) return 32;

  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return 32;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return Math.max(18, age);
}

function getCountry(country: string) {
  return REGIONS.find((item) => item.value === country) ?? REGIONS[0];
}

function getProvince(country: string, province: string) {
  return getCountry(country).provinces.find((item) => item.value === province) ?? getCountry(country).provinces[0];
}

function getCity(country: string, province: string, city: string) {
  return getProvince(country, province).cities.find((item) => item.value === city) ?? getProvince(country, province).cities[0];
}

function getInsurance(country: string, province: string, city: string): SocialInsuranceProfile {
  return getCity(country, province, city).insurance;
}

function toMonthIndex(date: Date) {
  return date.getFullYear() * 12 + date.getMonth();
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function getCnRetireDate(dob: string, gender: GenderCategory) {
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const baseAge = gender === "female_worker" ? 50 : gender === "female_pro" ? 55 : gender === "special_female" ? 45 : gender === "special_male" ? 55 : 60;
  const capAge = gender === "female_worker" ? 55 : gender === "female_pro" ? 58 : gender === "special_female" ? 50 : gender === "special_male" ? 58 : 63;
  const paceMonths = gender === "female_worker" || gender === "special_female" ? 2 : 4;

  const baseRetireDate = addMonths(birthDate, baseAge * 12);
  const reformStart = new Date(2025, 0, 1);

  if (toMonthIndex(baseRetireDate) < toMonthIndex(reformStart)) {
    return baseRetireDate;
  }

  const diffMonths = toMonthIndex(baseRetireDate) - toMonthIndex(reformStart);
  const delayMonths = Math.floor(diffMonths / paceMonths);
  const delayedDate = addMonths(baseRetireDate, delayMonths);
  const capDate = addMonths(birthDate, capAge * 12);

  return toMonthIndex(delayedDate) > toMonthIndex(capDate) ? capDate : delayedDate;
}

function getTier(years: number) {
  if (years <= 6) {
    return { key: "top", label: "Top", zhLabel: "顶层", percentile: 95, fireworks: true };
  }

  if (years <= 10) {
    return { key: "elite", label: "Elite", zhLabel: "精英", percentile: 85, fireworks: false };
  }

  if (years <= 15) {
    return { key: "strong", label: "Strong", zhLabel: "稳健", percentile: 65, fireworks: false };
  }

  return { key: "steady", label: "Steady", zhLabel: "稳步", percentile: 40, fireworks: false };
}

function getRank(percentile: number) {
  const rank = Math.max(1, Math.round((100 - percentile) * 10));
  return { rank, outOf: 1000 };
}

function yearOnly(date: Date) {
  return `${date.getFullYear()}`;
}

function buildShareText(lang: string, input: { brand: string; date: string; countyLine: string }) {
  if (false) {
    return `我将在 ${input.date} 年退休。${input.brand} ${input.countyLine}`;
  }

  return `I'm going to retire in the year of ${input.date}. ${input.brand} ${input.countyLine}`;
}

function socialChannels(lang: string) {
  return false
    ? [
        { key: "wechat", label: "微信", icon: "W" },
        { key: "weibo", label: "微博", icon: "WB" },
        { key: "rednote", label: "小红书", icon: "RD" }
      ]
    : [
        { key: "x", label: "X", icon: "X" },
        { key: "linkedin", label: "LinkedIn", icon: "in" },
        { key: "whatsapp", label: "WhatsApp", icon: "WA" }
      ];
}

function summaryCards(lang: string): SummaryCard[] {
  return false
    ? [
        { key: "simplify", title: "极简规划", value: "一张表的复杂，变成几项输入", details: ["复杂规则一键简化。", "算法实时更新保持最新。"], accent: "#c97a3a" },
        { key: "local", title: "地区规则", value: "按地区退休政策计算", details: ["内地规则已内置。", "港澳台新已覆盖，更多即将上线。"], accent: "#4b6f5a" },
        { key: "save", title: "提前年数", value: "显示使用 Horizon 可节省多少年", details: ["默认退休日期对比你的计划。", "每次调整都可实时看到变化。"], accent: "#2f4a6b" },
        { key: "community", title: "最佳实践", value: "互相学习、分享、变现（即将上线）", details: ["跟随同类人群的成功路径。", "分享你的方案，一起提升。"], accent: "#8b5cf6" }
      ]
    : [
        { key: "simplify", title: "Simplified Plan", value: "Complex math reduced to a few inputs", details: ["We compress dense rules into a clean workflow.", "Real-time updates keep it current."], accent: "#c97a3a" },
        { key: "local", title: "Regional Rules", value: "Built for your retirement policy", details: ["Mainland rules are embedded.", "HK/MO/TW/SG covered, more coming."], accent: "#4b6f5a" },
        { key: "save", title: "Years Saved", value: "See years saved with Horizon", details: ["Compare default retirement vs your plan.", "Every adjustment updates the savings."], accent: "#2f4a6b" },
        { key: "community", title: "Best Practices", value: "Learn, share, earn (coming soon)", details: ["Follow playbooks from people like you.", "Share your plan and improve together."], accent: "#8b5cf6" }
      ];
}

function money(value: number, lang: string) {
  return new Intl.NumberFormat(false ? "zh-CN" : "en-US", {
    style: "currency",
    currency: false ? "CNY" : "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export default function HomePage() {
    const [theme, setTheme] = useState<Theme>("light");
  const [dob, setDob] = useState("1990-01-01");
  const [country, setCountry] = useState("cn");
  const [province, setProvince] = useState("zhejiang");
  const [city, setCity] = useState("hangzhou");
  const [gender, setGender] = useState<GenderCategory>("male");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("private");
  const [currentSavings, setCurrentSavings] = useState(150000);
  const [monthlyIncome, setMonthlyIncome] = useState(12000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(9600);
  const [spend, setSpend] = useState(2800);
  const [scenario, setScenario] = useState<"base" | "optimistic" | "stress">("base");
  const [pensionIncome, setPensionIncome] = useState(0);
  const [budgetMode, setBudgetMode] = useState<BudgetMode>("balanced");
  const [saveState, setSaveState] = useState("");
  const [expandedSummary, setExpandedSummary] = useState<string | null>(null);
  const [shareState, setShareState] = useState("");
  const [hideSensitive, setHideSensitive] = useState(false);

  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const age = useMemo(() => calcAgeFromDob(dob), [dob]);
  const plannerResult = useMemo(() => calculateHorizonDay1({
    age,
    city,
    maritalStatus: "single",
    currentSavings,
    monthlyIncome,
    monthlyExpenses,
    monthlyTargetSpendAtRetirement: spend,
    annualReturnRate: SCENARIO_PRESETS[scenario].annualReturnRate,
    annualInflationRate: SCENARIO_PRESETS[scenario].annualInflationRate,
    multiplier: SCENARIO_PRESETS[scenario].multiplier,
    pensionIncome: pensionIncome > 0 ? pensionIncome : undefined,
  }), [age, city, currentSavings, monthlyIncome, monthlyExpenses, spend, scenario, pensionIncome]);
  const insurance = useMemo(() => getInsurance(country, province, city), [country, province, city]);
  const defaultRetireDate = useMemo(
    () => getDefaultRetireDate(country as Parameters<typeof getDefaultRetireDate>[0], dob, gender, employmentType),
    [country, dob, gender, employmentType]
  );
  const defaultRetireAge = useMemo(() => {
    if (!defaultRetireDate) {
      return null;
    }
    const birthDate = new Date(dob);
    if (Number.isNaN(birthDate.getTime())) {
      return null;
    }
    const months = toMonthIndex(defaultRetireDate) - toMonthIndex(birthDate);
    return months / 12;
  }, [dob, defaultRetireDate]);
  const defaultRetireYear = useMemo(() => {
    if (!defaultRetireDate) {
      return "--";
    }
    return yearOnly(defaultRetireDate);
  }, [defaultRetireDate]);
  const yearsSaved = useMemo(() => {
    if (defaultRetireAge === null) {
      return 0;
    }
    const saved = defaultRetireAge - (age + plannerResult.yearsToGoal);
    return Math.max(0, Number(saved.toFixed(1)));
  }, [defaultRetireAge, age, plannerResult.yearsToGoal]);
  const currentCountry = getCountry(country);
  const currentProvince = getProvince(country, province);
  const currentCity = getCity(country, province, city);
  const cards = useMemo(() => summaryCards("en"), ["en"]);
  const tier = getTier(plannerResult.yearsToGoal);
  const rank = getRank(tier.percentile);
  const [shareUrl, setShareUrl] = useState("");
  const projectionVersion = useMemo(
    () => `${dob}|${country}|${province}|${city}|${currentSavings}|${monthlyIncome}|${monthlyExpenses}|${spend}|${scenario}|"en"|${hideSensitive ? "hide" : "show"}`,
    [dob, country, province, city, currentSavings, monthlyIncome, monthlyExpenses, spend, scenario, hideSensitive]
  );
  const shareText = buildShareText("en", {
    brand: copy.brand,
    date: yearOnly(new Date(plannerResult.horizonDay1)),
    countyLine: country === "cn"
      ? (false ? `${currentCountry.label.zh} · ${currentProvince.label.zh} · ${currentCity.label.zh}` : `${currentCountry.label.en} · ${currentProvince.label.en} · ${currentCity.label.en}`)
      : (false ? currentCountry.label.zh : currentCountry.label.en)
  });

  useEffect(() => {

    const storedTheme = window.localStorage.getItem("horizon-theme");
    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
    }

    const savedProfile = window.localStorage.getItem("horizon-local-profile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile) as {
          dob: string;
          country: string;
          province: string;
          city: string;
          gender?: GenderCategory;
          employmentType?: EmploymentType;
          currentSavings?: number;
          monthlyIncome?: number;
          monthlyExpenses?: number;
          spend: number;
          pensionIncome?: number;
          budgetMode: BudgetMode;
        };
        setDob(parsed.dob);
        if (COMING_SOON_COUNTRIES.has(parsed.country)) {
          const fallbackCountry = getCountry("cn");
          setCountry(fallbackCountry.value);
          setProvince(fallbackCountry.provinces[0].value);
          setCity(fallbackCountry.provinces[0].cities[0].value);
        } else {
          setCountry(parsed.country);
          setProvince(parsed.province);
          setCity(parsed.city);
        }
        if (parsed.gender) {
          setGender(parsed.gender);
        }
        if (parsed.employmentType) {
          setEmploymentType(parsed.employmentType);
        }
        if (parsed.currentSavings !== undefined) setCurrentSavings(parsed.currentSavings);
        if (parsed.monthlyIncome !== undefined) setMonthlyIncome(parsed.monthlyIncome);
        if (parsed.monthlyExpenses !== undefined) setMonthlyExpenses(parsed.monthlyExpenses);
        if (parsed.pensionIncome !== undefined) setPensionIncome(parsed.pensionIncome);
        setSpend(parsed.spend);
        setBudgetMode(parsed.budgetMode);
      } catch {
        // Ignore invalid local cache.
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("horizon-theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    setShareUrl(`${window.location.origin}${window.location.pathname}`);
  }, []);

  function saveLocal() {
    window.localStorage.setItem("horizon-local-profile", JSON.stringify({ dob, country, province, city, gender, employmentType, currentSavings, monthlyIncome, monthlyExpenses, spend, pensionIncome, budgetMode }));
    setSaveState(copy.localSaved);
  }

  async function saveCloud() {
    setSaveState(copy.saving);
    const response = await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: {
          dob, age, country, province, city, gender, employmentType,
          currentSavings, monthlyIncome, monthlyExpenses, spend, pensionIncome,
          budgetMode, language: "en", theme, insurance
        },
        projection: {
          horizonDay1: plannerResult.horizonDay1,
          years: plannerResult.yearsToGoal,
          year: new Date(plannerResult.horizonDay1).getFullYear(),
          requiredNestEgg: plannerResult.requiredNestEgg,
          monthlySurplus: plannerResult.monthlySurplus,
          monthlyGapToSave: plannerResult.monthlyGapToSave,
          rank: rank.rank,
          percentile: tier.percentile,
          retirementAge: Number((age + plannerResult.yearsToGoal).toFixed(1))
        }
      })
    });

    const payload = (await response.json()) as { message: string };
    if (response.status === 401) {
      setSaveState(copy.saveRequiresSignIn);
      return;
    }
    setSaveState(payload.message);
  }

  function applyBudgetMode(mode: BudgetMode) {
    setBudgetMode(mode);
    const preset = BUDGETS[mode];
    setMonthlyIncome(preset.monthlyIncome);
    setMonthlyExpenses(preset.monthlyExpenses);
    setSpend(preset.spend);
  }

  async function copyShareText() {
    await navigator.clipboard.writeText(`${shareText} ${shareUrl}`.trim());
    setShareState(false ? "已复制分享文案。" : "Share text copied.");
  }

  async function shareNative() {
    if (navigator.share) {
      await navigator.share({
        title: copy.brand,
        text: shareText,
        url: shareUrl
      });
      setShareState(false ? "已打开系统分享。" : "Native share opened.");
      return;
    }

    await copyShareText();
  }

  function socialShareLink(channel: string) {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);

    if (false) {
      if (channel === "Weibo") return `https://service.weibo.com/share/share.php?title=${encodedText}&url=${encodedUrl}`;
      if (channel === "Xiaohongshu") return `https://www.xiaohongshu.com/`;
      return `https://www.wechat.com/`;
    }

    if (channel === "X") return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    if (channel === "LinkedIn") return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    return `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
  }

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <a className="brand" href="#">
            <span className="dot"></span>
            {copy.brand}
            <small>{copy.since}</small>
          </a>

          <div className="nav-links">
            <a href="#summary">{copy.nav.summary}</a>
            <a href="#customize">{copy.nav.customize}</a>
            <a href="#budget">{copy.nav.budget}</a>
            <a href="#stories">{copy.nav.stories}</a>
          </div>

          <div className="nav-cta">
            <a className="lang-switch" href="https://cn.horizone.cc.cd">中文</a>
            <button type="button" className="icon-btn" onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>
              {theme === "light" ? "◐" : "◑"}
            </button>
            {hasClerk ? <AuthControls language="en" /> : null}
          </div>
        </div>
      </nav>

      <main>
        <header className="hero">
          <div className="hero-layout">
            <div className="hero-copy">
              <span className="eyebrow"><span className="ln"></span>{copy.goal}</span>
              <h1>{copy.brand}</h1>
              <p className="lede">{copy.slogan}</p>
              <p className="mode-copy">{copy.interest}</p>
              <div className="hero-callout" aria-live="polite">
                <div>
                  <span className="k">{copy.defaultRetireLabel}</span>
                  <strong>{copy.defaultRetireValue}: {defaultRetireAge ? defaultRetireAge.toFixed(1) : "--"} {false ? "岁" : "yrs"} · {defaultRetireYear}</strong>
                </div>
                <div>
                  <span className="k">{copy.yearsSavedLabel}</span>
                  <strong>5.7 yrs</strong>
                </div>
              </div>
              <p className="mode-copy">{copy.retirementDisclaimer}</p>
              <div className="hero-actions">
                <a className="btn" href="#customize">{false ? "开始规划" : "Start planning"}</a>
                <a className="btn ghost" href="#summary">{copy.nav.summary}</a>
              </div>
            </div>

            <aside className="hero-image-card">
              <Image src="/assets/Homepage_image_1.webp" alt="Early retirement lifestyle scene" fill priority className="hero-image" />
              <div className="hero-image-scrim" />
              <div className="hero-image-copy">
                <span>{copy.heroBadge}</span>
                <p>{copy.heroCaption}</p>
              </div>
            </aside>
          </div>
        </header>

        <section className="calc" id="summary">
          <div className="calc-head">
            <div>
              <div className="sect-label"><span className="num">01</span> — {copy.nav.summary}</div>
              <h2>{copy.summaryTitle}</h2>
            </div>
            <div className="desc">{copy.summaryLead}</div>
          </div>
          <p className="summary-lead">{copy.summaryIntro}</p>
          <div className="summary-grid summary-process four-col">
            {cards.map((card, index) => {
              const expanded = expandedSummary === card.key;
              return (
                <button
                  key={card.key}
                  type="button"
                  className={`summary-card summary-card-button ${expanded ? "is-open" : ""}`}
                  onClick={() => setExpandedSummary(expanded ? null : card.key)}
                  aria-expanded={expanded}
                >
                  <div className="summary-card-top">
                    <span className="summary-index">0{index + 1}</span>
                    <span className="summary-dot" style={{ background: card.accent }} />
                  </div>
                  <h3>{card.title}</h3>
                  <p className="summary-figure">{card.value}</p>
                  <div className={`summary-details ${expanded ? "open" : ""}`}>
                    {card.details.map((detail) => (
                      <p key={detail}>{detail}</p>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="calc" id="customize">
          <div className="calc-head">
            <div>
              <div className="sect-label"><span className="num">02</span> — {copy.nav.customize}</div>
              <h2>{copy.customizeTitle}</h2>
            </div>
            <div className="desc">{copy.customizeDesc}</div>
          </div>

          <div className="calc-grid">
            <div className="calc-form">
              <div className="profile-grid">
                <label className="field">
                  <div className="lbl"><span>{copy.dob}</span><span className="val">{age}</span></div>
                  <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                </label>

                <label className="field">
                  <div className="lbl"><span>{copy.country}</span><span className="val">{false ? currentCountry.label.zh : currentCountry.label.en}</span></div>
                  <select
                    value={country}
                    onChange={(e) => {
                      const nextCountry = e.target.value;
                      if (COMING_SOON_COUNTRIES.has(nextCountry)) {
                        return;
                      }
                      const nextCountryRecord = getCountry(nextCountry);
                      const nextProvince = nextCountryRecord.provinces[0];
                      const nextCity = nextProvince.cities[0];
                      setCountry(nextCountry);
                      setProvince(nextProvince.value);
                      setCity(nextCity.value);
                    }}
                  >
                    {REGIONS.map((item) => (
                      <option key={item.value} value={item.value} disabled={COMING_SOON_COUNTRIES.has(item.value)}>
                        {false ? item.label.zh : item.label.en}
                      </option>
                    ))}
                  </select>
                </label>

                {COMING_SOON_COUNTRIES.has(country) ? (
                  <p className="mode-copy">{false ? "美国与英国的规则即将上线。" : "US and UK rules are coming soon."}</p>
                ) : null}

                {country === "cn" || country === "sg" || country === "us" ? (
                  <>
                    <label className="field">
                      <div className="lbl"><span>{copy.province}</span><span className="val">{false ? currentProvince.label.zh : currentProvince.label.en}</span></div>
                      <select
                        value={province}
                        onChange={(e) => {
                          const nextProvince = getCountry(country).provinces.find((item) => item.value === e.target.value) ?? getCountry(country).provinces[0];
                          setProvince(nextProvince.value);
                          setCity(nextProvince.cities[0].value);
                        }}
                      >
                        {currentCountry.provinces.map((item) => (
                          <option key={item.value} value={item.value}>
                            {false ? item.label.zh : item.label.en}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="field">
                      <div className="lbl"><span>{copy.city}</span><span className="val">{false ? currentCity.label.zh : currentCity.label.en}</span></div>
                      <select value={city} onChange={(e) => setCity(e.target.value)}>
                        {currentProvince.cities.map((item) => (
                          <option key={item.value} value={item.value}>
                            {false ? item.label.zh : item.label.en}
                          </option>
                        ))}
                      </select>
                    </label>
                  </>
                ) : null}

                {country === "hk" ? (
                  <label className="field">
                    <div className="lbl"><span>{copy.employmentType}</span><span className="val">{employmentType === "government_disciplined" ? copy.employmentOptions.governmentDisciplined : employmentType === "government_civilian" ? copy.employmentOptions.governmentCivilian : copy.employmentOptions.private}</span></div>
                    <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}>
                      <option value="private">{copy.employmentOptions.private}</option>
                      <option value="government_civilian">{copy.employmentOptions.governmentCivilian}</option>
                      <option value="government_disciplined">{copy.employmentOptions.governmentDisciplined}</option>
                    </select>
                  </label>
                ) : null}

                {country === "cn" ? (
                  <label className="field">
                    <div className="lbl"><span>{copy.gender}</span><span className="val">{gender === "female_pro" ? copy.genderOptions.femalePro : gender === "female_worker" ? copy.genderOptions.femaleWorker : gender === "special_male" ? copy.genderOptions.specialMale : gender === "special_female" ? copy.genderOptions.specialFemale : copy.genderOptions.male}</span></div>
                    <select value={gender} onChange={(e) => setGender(e.target.value as GenderCategory)}>
                      <option value="male">{copy.genderOptions.male}</option>
                      <option value="female_pro">{copy.genderOptions.femalePro}</option>
                      <option value="female_worker">{copy.genderOptions.femaleWorker}</option>
                      <option value="special_male">{copy.genderOptions.specialMale}</option>
                      <option value="special_female">{copy.genderOptions.specialFemale}</option>
                    </select>
                  </label>
                ) : null}
              </div>

              <div className="field">
                <div className="lbl"><span>{copy.scenarioLabel}</span></div>
                <div className="scenario-toggle">
                  {(["base", "optimistic", "stress"] as const).map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={`scenario-btn ${scenario === key ? "scenario-btn-active" : ""}`}
                      onClick={() => setScenario(key)}
                    >
                      {key === "base" ? copy.scenarioBase : key === "optimistic" ? copy.scenarioOptimistic : copy.scenarioStress}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <div className="lbl"><span>{copy.currentSavings}</span><span className="val">{money(currentSavings, "en")}</span></div>
                <input type="range" min={0} max={3000000} step={10000} value={currentSavings} onChange={(e) => setCurrentSavings(Number(e.target.value))} />
              </div>

              <div className="field">
                <div className="lbl"><span>{copy.monthlyIncome}</span><span className="val">{money(monthlyIncome, "en")}</span></div>
                <input type="range" min={3000} max={80000} step={500} value={monthlyIncome} onChange={(e) => setMonthlyIncome(Number(e.target.value))} />
              </div>

              <div className="field">
                <div className="lbl"><span>{copy.monthlyExpenses}</span><span className="val">{money(monthlyExpenses, "en")}</span></div>
                <input type="range" min={1000} max={40000} step={500} value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(Number(e.target.value))} />
              </div>

              <div className="field">
                <div className="lbl">
                  <span>{copy.pensionIncome}</span>
                  <span className="val">{pensionIncome > 0 ? money(pensionIncome, "en") : "$0"}</span>
                </div>
                <input type="range" min={0} max={10000} step={100} value={pensionIncome} onChange={(e) => setPensionIncome(Number(e.target.value))} />
              </div>

              <div className="field">
                <div className="lbl"><span>{copy.spend}</span><span className="val">{money(spend, "en")}</span></div>
                <input type="range" min={800} max={6000} step={100} value={spend} onChange={(e) => setSpend(Number(e.target.value))} />
              </div>

              <div className="save-row">
                <button type="button" className="btn ghost" onClick={saveLocal}>{copy.localSave}</button>
                {hasClerk ? (
                  <>
                    <SignedIn>
                      <button type="button" className="btn" onClick={saveCloud}>{copy.cloudSave}</button>
                    </SignedIn>
                    <SignedOut>
                      <SignInButton mode="modal">
                        <button type="button" className="btn locked" aria-disabled="true">{copy.cloudSave}</button>
                      </SignInButton>
                    </SignedOut>
                  </>
                ) : (
                  <button type="button" className="btn" disabled>{copy.cloudSave}</button>
                )}
              </div>
              <p className="mode-copy">{copy.freeHint}</p>
              <p className="mode-copy">{copy.signInHint}</p>
              {!hasClerk ? <p className="mode-copy auth-warning">{copy.authMissing}</p> : null}
              {saveState ? <p className="mode-copy">{saveState}</p> : null}

              <details className="insurance-fold">
                <summary>
                  <div>
                    <span className="fold-label">{copy.insuranceTitle}</span>
                    <strong>{false ? currentCity.label.zh : currentCity.label.en}</strong>
                  </div>
                  <span className="fold-hint">{false ? "点击展开" : "Click to expand"}</span>
                </summary>
                <p>{copy.insuranceLead}</p>
                <div className="insurance-grid">
                  <div className="insurance-item"><span>{copy.insuranceFields.pension}</span><strong>{insurance.pension}</strong></div>
                  <div className="insurance-item"><span>{copy.insuranceFields.medical}</span><strong>{insurance.medical}</strong></div>
                  <div className="insurance-item"><span>{copy.insuranceFields.housing}</span><strong>{insurance.housing}</strong></div>
                  <div className="insurance-item"><span>{copy.insuranceFields.unemployment}</span><strong>{insurance.unemployment}</strong></div>
                  <div className="insurance-item full"><span>{copy.insuranceFields.workplace}</span><strong>{insurance.workplace}</strong></div>
                  <div className="insurance-item full"><span>{copy.insuranceFields.note}</span><strong>{insurance.note}</strong></div>
                </div>
              </details>
            </div>

            <div className="calc-out">
              <div className="projection-card" key={projectionVersion}>
                <div className="k">{copy.projectionTitle}</div>
                <div className="projection-topline">
                  <div className="projection-title-stack">
                    <a href="#budget" className={`tier-badge tier-${tier.key}`}>{false ? tier.zhLabel : tier.label}</a>
                    <span className="projection-years-mini">{plannerResult.yearsToGoal} {false ? "年" : "years"}</span>
                  </div>
                  <button type="button" className="ghost-toggle" onClick={() => setHideSensitive((value) => !value)}>
                    {hideSensitive ? (false ? "显示年龄和本金" : "Show age and capital") : (false ? "隐藏年龄和本金" : "Hide age and capital")}
                  </button>
                </div>
                {tier.fireworks ? (
                  <div className="fireworks" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : null}
                <div className="projection-year">
                  <span className="projection-year-label">{copy.projectionYear}</span>
                  <strong><span key={`${projectionVersion}-year`} className="flip-number">{yearOnly(new Date(plannerResult.horizonDay1))}</span></strong>
                </div>
                <div className="projection-grid">
                  <div className="metric-card">
                    <span className="metric-icon">⏳</span>
                    <div>
                      <small>{copy.projectionYears}</small>
                      <strong><span key={`${projectionVersion}-years`} className="flip-number">{plannerResult.yearsToGoal}</span></strong>
                    </div>
                  </div>
                  {hideSensitive ? null : (
                    <div className="metric-card">
                      <span className="metric-icon">🎂</span>
                      <div>
                        <small>{copy.projectionAge}</small>
                        <strong><span key={`${projectionVersion}-age`} className="flip-number">{(age + plannerResult.yearsToGoal).toFixed(1)}</span></strong>
                      </div>
                    </div>
                  )}
                  <div className="metric-card">
                    <span className="metric-icon">🏆</span>
                    <div>
                      <small>{copy.rankLabel}</small>
                      <strong><span key={`${projectionVersion}-rank`} className="flip-number">{false ? `第 ${rank.rank} / ${rank.outOf}` : `#${rank.rank} / ${rank.outOf}`}</span></strong>
                    </div>
                  </div>
                  {hideSensitive ? null : (
                    <>
                      <div className="metric-card">
                        <span className="metric-icon">💰</span>
                        <div>
                          <small>{copy.nestEgg}</small>
                          <strong><span key={`${projectionVersion}-capital`} className="flip-number">{money(plannerResult.requiredNestEgg, "en")}</span></strong>
                        </div>
                      </div>
                      {plannerResult.monthlyGapToSave > 0 ? (
                        <div className="metric-card">
                          <span className="metric-icon">⚠️</span>
                          <div>
                            <small>{copy.monthlyGap}</small>
                            <strong><span key={`${projectionVersion}-gap`} className="flip-number">{money(plannerResult.monthlyGapToSave, "en")}</span></strong>
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
                <div className="projection-footer">
                  <div>
                    <span className="footer-label">{copy.tierLabel}</span>
                    <strong>{false ? tier.zhLabel : tier.label}</strong>
                  </div>
                  <div>
                    <span className="footer-label">{copy.rankAmong}</span>
                    <strong>{false ? `前 ${tier.percentile}%` : `Top ${tier.percentile}%`}</strong>
                  </div>
                </div>
              </div>

              <div className="share-card">
                <div className="k">{copy.shareTitle}</div>
                <p>{copy.shareLead}</p>
                <div className="share-preview">{shareText} {shareUrl}</div>
                <div className="save-row">
                  <button type="button" className="btn ghost" onClick={copyShareText}>{copy.shareCopy}</button>
                  <button type="button" className="btn" onClick={shareNative}>{false ? "系统分享" : "Native share"}</button>
                </div>
                <div className="share-links">
                  {socialChannels("en").map((channel) => (
                    <a key={channel.key} className="share-link icon-only" href={socialShareLink(channel.key)} target="_blank" rel="noreferrer" aria-label={channel.label} title={channel.label}>
                      <span aria-hidden="true">{channel.icon}</span>
                    </a>
                  ))}
                </div>
                {shareState ? <p className="mode-copy">{shareState}</p> : null}
              </div>

              <div className="income-breakdown">
                <div className="k">Monthly income at retirement</div>
                <div className="breakdown-row">
                  <span>Portfolio withdrawal</span>
                  <strong>{money(Math.max(0, spend - pensionIncome), "en")}<span className="breakdown-freq">/mo</span></strong>
                </div>
                {pensionIncome > 0 ? (
                  <div className="breakdown-row">
                    <span>Gov pension / CPP</span>
                    <strong>{money(pensionIncome, "en")}<span className="breakdown-freq">/mo</span></strong>
                  </div>
                ) : null}
                <div className="breakdown-row breakdown-total">
                  <span>Total</span>
                  <strong>{money(spend, "en")}<span className="breakdown-freq">/mo</span></strong>
                </div>
              </div>

              <details className="assumptions-fold">
                <summary>
                  <span className="fold-label">{copy.assumptionsTitle}</span>
                  <span className="fold-hint">{"Click to expand"}</span>
                </summary>
                <div className="assumptions-grid">
                  <div className="assumption-item">
                    <span>{copy.returnRateLabel}</span>
                    <strong>{(SCENARIO_PRESETS[scenario].annualReturnRate * 100).toFixed(1)}%</strong>
                  </div>
                  <div className="assumption-item">
                    <span>{copy.inflationRateLabel}</span>
                    <strong>{(SCENARIO_PRESETS[scenario].annualInflationRate * 100).toFixed(1)}%</strong>
                  </div>
                  <div className="assumption-item">
                    <span>{copy.multiplierLabel}</span>
                    <strong>{SCENARIO_PRESETS[scenario].multiplier}×</strong>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </section>

        <section className="calc" id="budget">
          <div className="calc-head">
            <div>
              <div className="sect-label"><span className="num">03</span> — {copy.nav.budget}</div>
              <h2>{copy.budgetTitle}</h2>
            </div>
            <div className="desc">{copy.budgetLead}</div>
          </div>

          {hasClerk ? (
            <>
              <SignedIn>
                <div className="budget-grid">
                  {(
                    [
                      { key: "low", label: copy.lowBudgetLabel, text: copy.lowBudgetCopy },
                      { key: "balanced", label: copy.balancedBudgetLabel, text: copy.balancedBudgetCopy },
                      { key: "full", label: copy.fullBudgetLabel, text: copy.fullBudgetCopy }
                    ] as const
                  ).map((plan) => {
                    const active = budgetMode === plan.key;
                    return (
                      <button
                        key={plan.key}
                        type="button"
                        className={`budget-card ${active ? "budget-card-active" : ""}`}
                        onClick={() => applyBudgetMode(plan.key)}
                      >
                        <div className="budget-pill">{copy.selectedPlan}</div>
                        <h3>{plan.label}</h3>
                        <p>{plan.text}</p>
                      </button>
                    );
                  })}
                </div>
                <p className="mode-copy">{budgetMode === "low" ? copy.lowBudgetCopy : budgetMode === "balanced" ? copy.balancedBudgetCopy : copy.fullBudgetCopy}</p>
              </SignedIn>
              <SignedOut>
                <p className="mode-copy auth-warning">{copy.budgetLocked}</p>
                <div className="budget-grid">
                  {(
                    [
                      { key: "low", label: copy.lowBudgetLabel, text: copy.lowBudgetCopy },
                      { key: "balanced", label: copy.balancedBudgetLabel, text: copy.balancedBudgetCopy },
                      { key: "full", label: copy.fullBudgetLabel, text: copy.fullBudgetCopy }
                    ] as const
                  ).map((plan) => (
                    <SignInButton key={plan.key} mode="modal">
                      <button type="button" className="budget-card budget-card-locked" aria-disabled="true">
                        <div className="budget-pill">{copy.selectedPlan}</div>
                        <h3>{plan.label}</h3>
                        <p>{plan.text}</p>
                      </button>
                    </SignInButton>
                  ))}
                </div>
              </SignedOut>
            </>
          ) : (
            <>
              <p className="mode-copy auth-warning">{copy.authMissing}</p>
              <div className="budget-grid">
                {(
                  [
                    { key: "low", label: copy.lowBudgetLabel, text: copy.lowBudgetCopy },
                    { key: "balanced", label: copy.balancedBudgetLabel, text: copy.balancedBudgetCopy },
                    { key: "full", label: copy.fullBudgetLabel, text: copy.fullBudgetCopy }
                  ] as const
                ).map((plan) => (
                  <div key={plan.key} className="budget-card budget-card-disabled" aria-disabled="true">
                    <div className="budget-pill">{copy.selectedPlan}</div>
                    <h3>{plan.label}</h3>
                    <p>{plan.text}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="calc" id="stories">
          <div className="calc-head">
            <div>
              <div className="sect-label"><span className="num">04</span> — {copy.nav.stories}</div>
              <h2>{copy.storiesTitle}</h2>
            </div>
            <div className="desc">{copy.storiesLead}</div>
          </div>
          <div className="stories-grid">
            {copy.stories.map((story) => (
              <article key={story.name} className="story-card">
                <div className="story-media">
                  <Image src={story.image} alt={story.name} fill className="story-image" />
                </div>
                <p className="story-quote">&ldquo;{story.text}&rdquo;</p>
                <p className="story-name">{story.name}</p>
                <p className="story-role">{story.role}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}