"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { SignInButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { AuthControls } from "@/components/auth-controls";
import { getDefaultRetireDate } from "@/lib/retirement";

type Theme = "light" | "dark";
type BudgetMode = "low" | "balanced" | "full";
type GenderCategory = "male" | "female_pro" | "female_worker" | "special_male" | "special_female";
type EmploymentType = "private" | "government_civilian" | "government_disciplined";

type SummaryCard = {
  key: string;
  icon: string;
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
  storiesTitle: string;
  storiesLead: string;
  stories: { name: string; role: string; text: string; image: string }[];
};

import { CN_REGIONS } from "@/lib/data/regions-cn";

import { calculateHorizonDay1, SCENARIO_PRESETS } from "@/lib/planner";

import { CN_COPY } from "@/lib/copy/cn";
import { BUDGETS } from "@/lib/data/budgets";

const COMING_SOON_COUNTRIES = new Set(["us", "uk"]);

// Approximate 2024 province-level average monthly pension (CNY) — used for hero comparison line.
// Source: provincial human resources bureaus & public statistical reports. Values are estimates.
const PROVINCE_AVG_PENSION: Record<string, number> = {
  beijing:       4600,
  shanghai:      5100,
  tianjin:       3300,
  chongqing:     2900,
  guangdong:     3800,
  zhejiang:      3700,
  jiangsu:       3400,
  shandong:      2900,
  fujian:        3200,
  liaoning:      3200,
  sichuan:       2700,
  hubei:         2700,
  heilongjiang:  2700,
  jilin:         2700,
  hainan:        2700,
  xinjiang:      2800,
  innermongolia: 2900,
  hebei:         2600,
  qinghai:       2600,
  tibet:         2600,
  ningxia:       2600,
  hunan:         2500,
  anhui:         2500,
  shanxi:        2500,
  shaanxi:       2500,
  yunnan:        2500,
  henan:         2400,
  jiangxi:       2400,
  guizhou:       2300,
  gansu:         2300,
  guangxi:       2500,
};

// 2024 provincial monthly average wage (计发基数) — used for pension base calculation.
const PROVINCE_PENSION_BASE: Record<string, number> = {
  beijing: 12200, shanghai: 13500, tianjin: 7800,  chongqing: 7200,
  guangdong: 9800, zhejiang: 9500,  jiangsu: 8700,  shandong: 6800,
  fujian: 7800,  liaoning: 7200,  sichuan: 6500,  hubei: 6700,
  hunan: 6300,  henan: 6200,  hebei: 6100,  anhui: 6400,
  jiangxi: 6100,  heilongjiang: 6500,  jilin: 6400,  shanxi: 6300,
  shaanxi: 6500,  yunnan: 6200,  guizhou: 5800,  gansu: 5700,
  hainan: 6500,  qinghai: 6000,  guangxi: 6000,  innermongolia: 6800,
  tibet: 7000,  ningxia: 6200,  xinjiang: 6500,
};

// Retirement age by gender/category → official 计发月数 (monthly disbursement divisor)
const GENDER_RETIRE_AGE: Record<string, number> = {
  male: 60, female_pro: 55, female_worker: 50, special_male: 55, special_female: 45,
};
const DISBURSEMENT_MONTHS: Record<number, number> = {
  45: 216, 50: 195, 55: 170, 60: 139, 65: 101,
};

const copy = CN_COPY;
const REGIONS: CountryOption[] = CN_REGIONS;

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

function buildShareText(input: { year: string; pensionPercentile: number; provinceName: string; cityName: string }) {
  return `我在 ${input.year} 年退休，养老金排名全市${input.pensionPercentile}%。坐标：中国 · ${input.provinceName} · ${input.cityName}。你也来查查看：早早退休 https://cn.horizone.cc.cd/`;
}

function socialChannels(lang: string) {
  return true
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
  return true
    ? [
        { key: "policy",    icon: "🗺️", title: "政策同步", value: "扫描地区规则，锁定你的法定基准",   details: ["覆盖内地、港澳台及海外主要地区。", "政策更新自动反映到你的规划。"],     accent: "#c97a3a" },
        { key: "templates", icon: "⚡", title: "丰富模版", value: "一键套用模版，即刻生成退休路线",   details: ["内置多条退休路径模版供选择。", "完全可定制，适配你的具体情况。"],       accent: "#4b6f5a" },
        { key: "finance",   icon: "📊", title: "金融计划", value: "AI 分析，输出可执行的财务行动",   details: ["AI 算法分析最优储蓄与投资策略。", "每月生成可执行的财务行动清单。"],   accent: "#2f4a6b" },
        { key: "community", icon: "🤝", title: "最佳实践", value: "互相学习、分享、变现（即将上线）", details: ["跟随同类人群的成功路径。", "分享你的方案，一起提升。"],               accent: "#8b5cf6" }
      ]
    : [
        { key: "simplify",  icon: "🗺️", title: "Simplified Plan",  value: "Complex math reduced to a few inputs",   details: ["We compress dense rules into a clean workflow.", "Real-time updates keep it current."],                accent: "#c97a3a" },
        { key: "local",     icon: "⚡", title: "Regional Rules",   value: "Built for your retirement policy",        details: ["Mainland rules are embedded.", "HK/MO/TW/SG covered, more coming."],                        accent: "#4b6f5a" },
        { key: "save",      icon: "📊", title: "Years Saved",      value: "See years saved with Horizon",            details: ["Compare default retirement vs your plan.", "Every adjustment updates the savings."],          accent: "#2f4a6b" },
        { key: "community", icon: "🤝", title: "Best Practices",   value: "Learn, share, earn (coming soon)",        details: ["Follow playbooks from people like you.", "Share your plan and improve together."],            accent: "#8b5cf6" }
      ];
}

function money(value: number, lang: string) {
  return new Intl.NumberFormat(true ? "zh-CN" : "en-US", {
    style: "currency",
    currency: true ? "CNY" : "USD",
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
  const [budgetSelected, setBudgetSelected] = useState(false);
  const [saveState, setSaveState] = useState("");
  const [expandedSummary, setExpandedSummary] = useState<string | null>(null);
  const [shareState, setShareState] = useState("");
  const [hideAge, setHideAge] = useState(false);
  const [hideCapital, setHideCapital] = useState(false);
  const [hideCityAvg, setHideCityAvg] = useState(true);
  const [hidePension, setHidePension] = useState(false);
  // Pension calculator inputs
  const [contributionYears, setContributionYears] = useState(25);
  const [contributionTier, setContributionTier] = useState<"60" | "100" | "300">("100");
  const [personalAccountBalance, setPersonalAccountBalance] = useState(80000);
  // Budget template expansion
  const [expandedBudget, setExpandedBudget] = useState<BudgetMode | null>(null);

  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const age = useMemo(() => calcAgeFromDob(dob), [dob]);
  // Pension calculator — must be before plannerResult
  const pensionCalcEarly = useMemo(() => {
    const retireAge = GENDER_RETIRE_AGE[gender] ?? 60;
    const months = DISBURSEMENT_MONTHS[retireAge] ?? 139;
    const index = contributionTier === "60" ? 0.6 : contributionTier === "300" ? 3.0 : 1.0;
    const base = PROVINCE_PENSION_BASE[province] ?? 6000;
    const basic = base * (1 + index) / 2 * contributionYears * 0.01;
    const personal = personalAccountBalance / months;
    return { total: Math.round(basic + personal), basic: Math.round(basic), personal: Math.round(personal), retireAge, months };
  }, [gender, contributionYears, contributionTier, personalAccountBalance, province]);
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
    // Pension income is NOT fed into the planner — it only starts at legal retirement age,
    // not today. The planner calculates pure portfolio FIRE date; pension is shown
    // separately in the income breakdown as a supplement at retirement.
  }), [age, city, currentSavings, monthlyIncome, monthlyExpenses, spend, scenario]);
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
  // Years from today until statutory retirement date
  const yearsToStatutory = defaultRetireAge !== null ? Math.max(0, defaultRetireAge - age) : null;
  const yearsSaved = useMemo(() => {
    if (defaultRetireAge === null) {
      return 0;
    }
    const saved = defaultRetireAge - (age + plannerResult.yearsToGoal);
    return Math.max(0, Number(saved.toFixed(1)));
  }, [defaultRetireAge, age, plannerResult.yearsToGoal]);
  const pensionCalc = pensionCalcEarly; // alias for use in JSX
  const currentCountry = getCountry(country);
  const currentProvince = getProvince(country, province);
  const currentCity = getCity(country, province, city);
  const avgPensionForProvince = PROVINCE_AVG_PENSION[province] ?? 2500;
  const pensionPercentile = useMemo(() => {
    if (pensionCalc.total <= 0) return 50;
    const ratio = pensionCalc.total / (avgPensionForProvince || 2500);
    return Math.min(98, Math.max(2, Math.round(50 + 40 * Math.tanh((ratio - 1) * 1.5))));
  }, [pensionCalc.total, avgPensionForProvince]);
  const pensionPct = pensionCalc.total > 0
    ? Math.round((pensionCalc.total - avgPensionForProvince) / avgPensionForProvince * 100)
    : null;
  const cards = useMemo(() => summaryCards("zh"), ["zh"]);
  const tier = getTier(plannerResult.yearsToGoal);
  const rank = getRank(tier.percentile);
  const [shareUrl, setShareUrl] = useState("");
  const projectionVersion = useMemo(
    () => `${dob}|${country}|${province}|${city}|${currentSavings}|${monthlyIncome}|${monthlyExpenses}|${spend}|${scenario}|${contributionYears}|${contributionTier}|${personalAccountBalance}`,
    [dob, country, province, city, currentSavings, monthlyIncome, monthlyExpenses, spend, scenario, contributionYears, contributionTier, personalAccountBalance]
  );
  const shareText = buildShareText({
    year: yearOnly(new Date(plannerResult.horizonDay1)),
    pensionPercentile,
    provinceName: currentProvince.label.zh,
    cityName: currentCity.label.zh,
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
        setBudgetSelected(true);
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
          budgetMode, language: "zh", theme, insurance
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
    setBudgetSelected(true);
    const preset = BUDGETS[mode];
    setCurrentSavings(preset.currentSavings);
    setMonthlyIncome(preset.monthlyIncome);
    setMonthlyExpenses(preset.monthlyExpenses);
    setSpend(preset.spend);
  }

  async function copyShareText() {
    await navigator.clipboard.writeText(`${shareText} ${shareUrl}`.trim());
    setShareState(true ? "已复制分享文案。" : "Share text copied.");
  }

  async function shareNative() {
    if (navigator.share) {
      await navigator.share({
        title: copy.brand,
        text: shareText,
        url: shareUrl
      });
      setShareState(true ? "已打开系统分享。" : "Native share opened.");
      return;
    }

    await copyShareText();
  }

  function socialShareLink(channel: string) {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);

    if (true) {
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
          <a className="brand brand-zh" href="#">
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
            <a className="icon-btn" href="https://horizone.cc.cd" title="International site" aria-label="Switch to international site">I</a>
            <button type="button" className="icon-btn" onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>
              {theme === "light" ? "◐" : "◑"}
            </button>
            {hasClerk ? <AuthControls language="zh" /> : null}
          </div>
        </div>
      </nav>

      <main>
        <header className="hero">
          <div className="hero-layout">
            <div className="hero-copy">
              <span className="eyebrow"><span className="ln"></span>{copy.goal}</span>
              <h1 className="brand-zh">{copy.brand}</h1>
              <p className="lede">{copy.slogan}</p>
              <p className="mode-copy">{copy.interest}</p>
              <div className="hero-callout" aria-live="polite">
                <div className="callout-line">
                  {copy.defaultRetireLabel}：<span className="hl">{defaultRetireAge ? defaultRetireAge.toFixed(1) : "--"}</span> 岁 · <span className="hl">{defaultRetireYear}</span>，早早退休 用户平均节省 <span className="hl callout-years">5.7 年</span>
                </div>
                {pensionCalc.total > 0 && pensionPct !== null && (
                  <div className="callout-line callout-pension">
                    届时您将领取每月 <span className="hl">¥{pensionCalc.total.toLocaleString("zh-CN")}</span> 养老金，{pensionPct >= 0 ? "高于" : "低于"}当地均值（¥{avgPensionForProvince.toLocaleString("zh-CN")}）<span className="hl">{Math.abs(pensionPct)}%</span>
                  </div>
                )}
              </div>
              <p className="mode-copy">{copy.retirementDisclaimer}</p>
              <div className="hero-actions">
                <a className="btn" href="#customize">养老金计算器</a>
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
                    <span className="summary-icon" aria-hidden="true">{card.icon}</span>
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

              {/* ── Row 1: DOB + 退休类别 ── */}
              <div className="form-row-2col">
                <label className="field">
                  <div className="lbl"><span>{copy.dob}</span></div>
                  <input
                    type="date"
                    value={dob}
                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 75)).toISOString().split("T")[0]}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split("T")[0]}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </label>
                <label className="field">
                  <div className="lbl"><span>{copy.gender}</span></div>
                  <select value={gender} onChange={(e) => setGender(e.target.value as GenderCategory)}>
                    <option value="male">{copy.genderOptions.male}</option>
                    <option value="female_pro">{copy.genderOptions.femalePro}</option>
                    <option value="female_worker">{copy.genderOptions.femaleWorker}</option>
                    <option value="special_male">{copy.genderOptions.specialMale}</option>
                    <option value="special_female">{copy.genderOptions.specialFemale}</option>
                  </select>
                </label>
              </div>

              <div className="form-divider" />

              {/* ── Row 2: 省/直辖市 + 城市 ── */}
              <div className="form-row-2col">
                <label className="field">
                  <div className="lbl"><span>{copy.province}</span></div>
                  <select
                    value={province}
                    onChange={(e) => {
                      const nextProvince = getCountry(country).provinces.find((item) => item.value === e.target.value) ?? getCountry(country).provinces[0];
                      setProvince(nextProvince.value);
                      setCity(nextProvince.cities[0].value);
                    }}
                  >
                    {currentCountry.provinces.map((item) => (
                      <option key={item.value} value={item.value}>{item.label.zh}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <div className="lbl"><span>{copy.city}</span></div>
                  <select value={city} onChange={(e) => setCity(e.target.value)}>
                    {currentProvince.cities.map((item) => (
                      <option key={item.value} value={item.value}>{item.label.zh}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="form-divider" />

              {/* ── Row 3: 缴费年限 + 缴费档次 ── */}
              <div className="form-row-2col">
                <div className="field">
                  <div className="lbl"><span>缴费年限</span><span className="val">{contributionYears} 年</span></div>
                  <input type="range" min={1} max={40} step={0.5} value={contributionYears} onChange={(e) => setContributionYears(Number(e.target.value))} />
                </div>
                <label className="field">
                  <div className="lbl"><span>缴费档次</span></div>
                  <select value={contributionTier} onChange={(e) => setContributionTier(e.target.value as "60" | "100" | "300")}>
                    <option value="60">60%（基本档）</option>
                    <option value="100">100%（标准档）</option>
                    <option value="300">300%（高档）</option>
                  </select>
                </label>
              </div>

              {/* ── Row 4: 个人账户余额 ── */}
              <div className="field">
                <div className="lbl"><span>个人社保账户余额</span><span className="val">{money(personalAccountBalance, "zh")}</span></div>
                <input type="range" min={0} max={600000} step={5000} value={personalAccountBalance} onChange={(e) => setPersonalAccountBalance(Number(e.target.value))} />
                <small className="field-hint">可在社保 APP 或账单查询</small>
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
                    <strong>{true ? currentCity.label.zh : currentCity.label.en}</strong>
                  </div>
                  <span className="fold-hint">{true ? "点击展开" : "Click to expand"}</span>
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
              <div className="pension-summary-card" key={projectionVersion}>
                {/* Row 1: statutory retirement year (driven by DOB + retire type) */}
                <div className="psc-row">
                  <span className="psc-label">预计退休年份</span>
                  <div className="psc-value">
                    <span className="hl"><span key={`${projectionVersion}-year`} className="flip-number">{defaultRetireYear}</span></span>
                    <span className="psc-sub">还有 <strong>{yearsToStatutory !== null ? yearsToStatutory.toFixed(1) : "--"}</strong> 年</span>
                  </div>
                </div>
                <div className="psc-divider" />

                {/* Pension estimate — between retirement year and city-average rows */}
                <div className="pension-result">
                  <div className="pension-result-header">
                    <div className="pension-result-label">预计每月养老金</div>
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setHidePension((v) => !v)}
                      aria-label={hidePension ? "显示养老金" : "隐藏养老金"}
                    >
                      {hidePension ? "○" : "●"}
                    </button>
                  </div>
                  {hidePension ? (
                    <div className="pension-result-amount">
                      <span className="psc-hidden">· · ·</span>
                    </div>
                  ) : (
                    <>
                      <div className="pension-result-amount">
                        <span className="hl">{money(pensionCalc.total, "zh")}</span>
                        <span className="pension-freq">/月</span>
                      </div>
                      <div className="pension-result-breakdown">
                        <span>基础 <strong>{money(pensionCalc.basic, "zh")}</strong></span>
                        <span>个人账户 <strong>{money(pensionCalc.personal, "zh")}</strong></span>
                        <span>计发月数 <strong>{pensionCalc.months}</strong></span>
                      </div>
                    </>
                  )}
                </div>
                <div className="psc-divider" />

                {/* Row 2: pension vs city average */}
                <div className="psc-row">
                  <span className="psc-label">养老金超过本市人口</span>
                  <div className="psc-value">
                    <span className="hl">{pensionPercentile}%</span>
                    <span className="psc-sub">
                      市平均&nbsp;
                      {hideCityAvg
                        ? <span className="psc-hidden">· · ·</span>
                        : <strong>¥{avgPensionForProvince.toLocaleString("zh-CN")}</strong>}
                      <button type="button" className="eye-btn" onClick={() => setHideCityAvg(v => !v)} aria-label={hideCityAvg ? "显示市均养老金" : "隐藏市均养老金"}>{hideCityAvg ? "○" : "●"}</button>
                    </span>
                  </div>
                </div>
                <div className="psc-divider" />
                {/* Row 3: years saved with Horizon */}
                <div className="psc-row">
                  <span className="psc-label">使用「早早退休」规划</span>
                  <div className="psc-value">
                    有望早 <span className="hl">{(yearsSaved > 0.5 && yearsSaved <= 12) ? yearsSaved.toFixed(1) : "5.7"} 年</span> 退休
                  </div>
                </div>
              </div>

              <div className="share-card">
                <div className="k">{copy.shareTitle}</div>
                <p>{copy.shareLead}</p>

                <div className="share-preview">{shareText}</div>
                <div className="save-row">
                  <button type="button" className="btn" onClick={shareNative}>系统分享</button>
                </div>
                <div className="share-links">
                  {socialChannels("zh").map((channel) => (
                    <a key={channel.key} className="share-link icon-only" href={socialShareLink(channel.key)} target="_blank" rel="noreferrer" aria-label={channel.label} title={channel.label}>
                      <span aria-hidden="true">{channel.icon}</span>
                    </a>
                  ))}
                </div>
                {shareState ? <p className="mode-copy">{shareState}</p> : null}
              </div>
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

          {!budgetSelected && (
            <p className="budget-prompt">选择一个模版，查看详情并调整参数。</p>
          )}

          <div className="budget-grid">
            {(
              [
                { key: "low",      label: copy.lowBudgetLabel,      text: copy.lowBudgetCopy      },
                { key: "balanced", label: copy.balancedBudgetLabel, text: copy.balancedBudgetCopy },
                { key: "full",     label: copy.fullBudgetLabel,     text: copy.fullBudgetCopy     }
              ] as const
            ).map((plan) => {
              const active = budgetSelected && budgetMode === plan.key;
              const open = expandedBudget === plan.key;
              return (
                <div key={plan.key} className={`budget-card ${active ? "budget-card-active" : ""} ${open ? "budget-card-open" : ""}`}>
                  <button
                    type="button"
                    className="budget-card-header"
                    onClick={() => {
                      applyBudgetMode(plan.key);
                      setExpandedBudget(open ? null : plan.key);
                    }}
                    aria-expanded={open}
                  >
                    {active && <div className="budget-pill">{copy.selectedPlan}</div>}
                    <h3>{plan.label}</h3>
                    <p>{plan.text}</p>
                    <span className="budget-chevron" aria-hidden="true">{open ? "▲" : "▼"}</span>

                    {!open && (
                      <div className="budget-preview">
                        {[
                          { label: "月收入", value: BUDGETS[plan.key].monthlyIncome },
                          { label: "月支出", value: BUDGETS[plan.key].monthlyExpenses },
                          { label: "月「足够」", value: BUDGETS[plan.key].spend },
                        ].map((row) => (
                          <div key={row.label} className="budget-preview-row">
                            <span className="budget-preview-label">{row.label}</span>
                            <span className="budget-preview-val">{money(row.value, "zh")}<span className="budget-preview-mo">/月</span></span>
                          </div>
                        ))}
                      </div>
                    )}
                  </button>

                  {open && (
                    <div className="budget-params">
                      <div className="field">
                        <div className="lbl"><span>{copy.currentSavings}</span><span className="val">{money(currentSavings, "zh")}</span></div>
                        <input type="range" min={0} max={3000000} step={10000} value={currentSavings} onChange={(e) => setCurrentSavings(Number(e.target.value))} />
                      </div>
                      <div className="field">
                        <div className="lbl"><span>{copy.monthlyIncome}</span><span className="val">{money(monthlyIncome, "zh")}</span></div>
                        <input type="range" min={2000} max={80000} step={500} value={monthlyIncome} onChange={(e) => setMonthlyIncome(Number(e.target.value))} />
                      </div>
                      <div className="field">
                        <div className="lbl"><span>{copy.monthlyExpenses}</span><span className="val">{money(monthlyExpenses, "zh")}</span></div>
                        <input type="range" min={800} max={40000} step={500} value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(Number(e.target.value))} />
                      </div>
                      <div className="field">
                        <div className="lbl"><span>{copy.spend}</span><span className="val">{money(spend, "zh")}</span></div>
                        <input type="range" min={800} max={8000} step={100} value={spend} onChange={(e) => setSpend(Number(e.target.value))} />
                      </div>
                      <div className="field">
                        <div className="lbl"><span>{copy.scenarioLabel}</span></div>
                        <div className="scenario-toggle">
                          {(["base", "optimistic", "stress"] as const).map((key) => (
                            <button key={key} type="button"
                              className={`scenario-btn ${scenario === key ? "scenario-btn-active" : ""}`}
                              onClick={() => setScenario(key)}>
                              {key === "base" ? copy.scenarioBase : key === "optimistic" ? copy.scenarioOptimistic : copy.scenarioStress}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="income-breakdown">
            <div className="k">退休后月收入来源</div>
            <div className="breakdown-row">
              <span>投资组合提现</span>
              <strong>{money(Math.max(0, spend - pensionCalc.total), "zh")}<span className="breakdown-freq">/月</span></strong>
            </div>
            {pensionCalc.total > 0 ? (
              <div className="breakdown-row">
                <span>养老金 / 社保</span>
                <strong>{money(pensionCalc.total, "zh")}<span className="breakdown-freq">/月</span></strong>
              </div>
            ) : null}
            <div className="breakdown-row breakdown-total">
              <span>合计</span>
              <strong>{money(spend, "zh")}<span className="breakdown-freq">/月</span></strong>
            </div>
          </div>

          <details className="assumptions-fold">
            <summary>
              <span className="fold-label">{copy.assumptionsTitle}</span>
              <span className="fold-hint">{"点击展开"}</span>
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
                <div className="story-savings-badge">
                  节省 <span className="hl story-years">{story.yearsSaved} 年</span>，基于「{story.plan}」
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