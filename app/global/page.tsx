"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { AuthControls } from "@/components/auth-controls";
import { getDefaultRetireDate } from "@/lib/retirement";
import { calculateHorizonDay1, SCENARIO_PRESETS } from "@/lib/planner";
import { estimateSSBenefit } from "@/lib/social-security";
import { estimateCPFLife, estimateMPF, estimateSuper } from "@/lib/pension-estimators";
import { projectAccount, calcHealthcareBridge } from "@/lib/retirement-accounts";

type Theme = "light" | "dark";
type BudgetMode = "low" | "balanced" | "full";
type GenderCategory = "male" | "female_pro" | "female_worker" | "special_male" | "special_female" | "prefer_not_to_say";
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

import { GLOBAL_REGIONS } from "@/lib/data/regions-global";
import { GLOBAL_COPY } from "@/lib/copy/global";
import { BUDGETS } from "@/lib/data/budgets";

const COMING_SOON_COUNTRIES = new Set(["uk"]);

// Countries with a statutory government pension formula — auto-estimator being built.
// Manual slider is hidden for these; the calc defaults pensionIncome to 0 until estimator ships.
// Countries NOT in this set (ae, sa, tr, za, my) keep the manual slider — expat/variable pension.
const PENSION_ESTIMATOR_COUNTRIES = new Set([
  "us",                                              // ✅ SS estimator live
  "sg", "jp", "au", "kr", "ca", "nz",               // Asia-Pacific mandatory schemes
  "hk", "tw", "mo",                                  // Greater China region
  "de", "fr", "nl", "ch", "se", "no", "dk",          // Core Europe
  "es", "it", "pl", "il", "uk",                      // South/East Europe + UK (coming soon overall)
]);

const copy = GLOBAL_COPY;
// Mainland China is served by the dedicated CN site (cn.horizone.cc.cd)
const REGIONS: CountryOption[] = GLOBAL_REGIONS.filter(r => r.value !== "cn");

function calcAgeFromDob(dob: string) {
  if (!dob) return 32;
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return 32;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age -= 1;
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

function getTier(years: number) {
  if (years <= 6)  return { key: "top",    label: "Top",    zhLabel: "顶层", percentile: 95, fireworks: true  };
  if (years <= 10) return { key: "elite",  label: "Elite",  zhLabel: "精英", percentile: 85, fireworks: false };
  if (years <= 15) return { key: "strong", label: "Strong", zhLabel: "稳健", percentile: 65, fireworks: false };
  return             { key: "steady", label: "Steady", zhLabel: "稳步", percentile: 40, fireworks: false };
}

function getRank(percentile: number) {
  const rank = Math.max(1, Math.round((100 - percentile) * 10));
  return { rank, outOf: 1000 };
}

function yearOnly(date: Date) {
  return `${date.getFullYear()}`;
}

function buildShareText(lang: string, input: { brand: string; date: string; countyLine: string }) {
  if (lang === "zh") {
    return `我将在 ${input.date} 年退休。${input.brand} ${input.countyLine}`;
  }
  return `I'm going to retire in the year ${input.date}. ${input.brand} ${input.countyLine}`;
}

function socialChannels(lang: string) {
  return lang === "zh"
    ? [
        { key: "wechat",   label: "微信",   icon: "W"  },
        { key: "weibo",    label: "微博",   icon: "WB" },
        { key: "rednote",  label: "小红书", icon: "RD" },
      ]
    : [
        { key: "x",        label: "X",         icon: "X"  },
        { key: "linkedin", label: "LinkedIn",   icon: "in" },
        { key: "whatsapp", label: "WhatsApp",   icon: "WA" },
      ];
}

function summaryCards(lang: string): SummaryCard[] {
  return lang === "zh"
    ? [
        { key: "policy",    icon: "🗺️", title: "政策同步", value: "扫描地区规则，锁定你的法定基准",   details: ["覆盖主要地区，政策更新自动反映到你的规划。", "算法实时更新保持最新。"],       accent: "#c97a3a" },
        { key: "templates", icon: "⚡", title: "丰富模版", value: "一键套用模版，即刻生成退休路线",   details: ["内置多条退休路径模版供选择。", "完全可定制，适配你的具体情况。"],             accent: "#4b6f5a" },
        { key: "finance",   icon: "📊", title: "金融计划", value: "AI 分析，输出可执行的财务行动",   details: ["AI 算法分析最优储蓄与投资策略。", "每月生成可执行的财务行动清单。"],         accent: "#2f4a6b" },
        { key: "community", icon: "🤝", title: "最佳实践", value: "互相学习、分享、变现（即将上线）", details: ["跟随同类人群的成功路径。", "分享你的方案，一起提升。"],                     accent: "#8b5cf6" },
      ]
    : [
        { key: "policy",    icon: "🗺️", title: "Policy Sync",      value: "Regional rules scanned and locked to your baseline",    details: ["Major regions covered, policy updates flow into your plan automatically.", "Algorithm refreshes in real time."],  accent: "#c97a3a" },
        { key: "templates", icon: "⚡", title: "Rich Templates",    value: "Apply a template and get your plan instantly",           details: ["Multiple retirement-path templates built in.", "Fully customisable to your situation."],                       accent: "#4b6f5a" },
        { key: "finance",   icon: "📊", title: "Financial Plan",    value: "AI analysis delivers an actionable roadmap",             details: ["AI algorithm finds optimal savings and investment strategies.", "Monthly actionable financial task list."],      accent: "#2f4a6b" },
        { key: "community", icon: "🤝", title: "Best Practices",    value: "Learn, share, and earn (coming soon)",                   details: ["Follow playbooks from people like you.", "Share your plan and improve together."],                            accent: "#8b5cf6" },
      ];
}

function money(value: number, lang: string) {
  return new Intl.NumberFormat(lang === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency: lang === "zh" ? "CNY" : "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

const COUNTRY_CURRENCY: Record<string, { currency: string; locale: string }> = {
  sg: { currency: "SGD", locale: "en-SG" },
  hk: { currency: "HKD", locale: "zh-HK" },
  au: { currency: "AUD", locale: "en-AU" },
  jp: { currency: "JPY", locale: "ja-JP" },
  kr: { currency: "KRW", locale: "ko-KR" },
  ca: { currency: "CAD", locale: "en-CA" },
  nz: { currency: "NZD", locale: "en-NZ" },
  gb: { currency: "GBP", locale: "en-GB" },
  uk: { currency: "GBP", locale: "en-GB" },
  de: { currency: "EUR", locale: "de-DE" },
  fr: { currency: "EUR", locale: "fr-FR" },
  nl: { currency: "EUR", locale: "nl-NL" },
  ch: { currency: "CHF", locale: "de-CH" },
  se: { currency: "SEK", locale: "sv-SE" },
  no: { currency: "NOK", locale: "nb-NO" },
  dk: { currency: "DKK", locale: "da-DK" },
  tw: { currency: "TWD", locale: "zh-TW" },
};

function localMoney(value: number, countryCode: string): string {
  const cfg = COUNTRY_CURRENCY[countryCode] ?? { currency: "USD", locale: "en-US" };
  return new Intl.NumberFormat(cfg.locale, {
    style: "currency",
    currency: cfg.currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function HomePage() {
  const [theme, setTheme] = useState<Theme>("light");
  const [dob, setDob] = useState("1990-01-01");
  const [country, setCountry] = useState("sg");
  const [province, setProvince] = useState("sg");
  const [city, setCity] = useState("singapore");
  const [gender, setGender] = useState<GenderCategory>("male");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("private");
  const [currentSavings, setCurrentSavings] = useState(150000);
  const [monthlyIncome, setMonthlyIncome] = useState(12000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(9600);
  const [spend, setSpend] = useState(2800);
  const [scenario, setScenario] = useState<"base" | "optimistic" | "stress">("base");
  const [pensionIncome, setPensionIncome] = useState(0);
  const [annualSalary, setAnnualSalary] = useState(80000);
  const [yearsWorked, setYearsWorked] = useState(10);
  const [ssClaimAge, setSsClaimAge] = useState<62 | 67 | 70>(67);
  const [budgetMode, setBudgetMode] = useState<BudgetMode>("balanced");
  const [budgetSelected, setBudgetSelected] = useState(false);
  const [expandedBudget, setExpandedBudget] = useState<BudgetMode | null>(null);
  const [saveState, setSaveState] = useState("");
  const [expandedSummary, setExpandedSummary] = useState<string | null>(null);
  const [shareState, setShareState] = useState("");
  const [hideCapital, setHideCapital] = useState(false);
  const [lang, setLang] = useState<"en" | "zh">("en");
  const [locationStatus, setLocationStatus] = useState<"idle" | "detecting" | "done" | "denied">("idle");
  const [accountBalance, setAccountBalance] = useState(50000);
  const [annualContribution401k, setAnnualContribution401k] = useState(6000);
  const [employerMatchRate, setEmployerMatchRate] = useState(0.04);
  const [show401k, setShow401k] = useState(false);

  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const age = useMemo(() => calcAgeFromDob(dob), [dob]);

  const ssBenefit = useMemo(
    () => estimateSSBenefit(annualSalary, yearsWorked),
    [annualSalary, yearsWorked]
  );
  const ssMonthly = ssClaimAge === 62 ? ssBenefit.at62 : ssClaimAge === 70 ? ssBenefit.at70 : ssBenefit.atFRA;

  // Years until statutory pension age (65 for SG / HK / AU).
  // Computed independently of plannerResult to avoid circular dependency.
  const yearsToStatutoryPension = useMemo(
    () => Math.max(0, 65 - age),
    [age]
  );

  const sgPension = useMemo(
    () => estimateCPFLife(monthlyIncome, yearsWorked, yearsToStatutoryPension),
    [monthlyIncome, yearsWorked, yearsToStatutoryPension]
  );

  const hkPension = useMemo(
    () => estimateMPF(monthlyIncome, yearsWorked, yearsToStatutoryPension),
    [monthlyIncome, yearsWorked, yearsToStatutoryPension]
  );

  const auPension = useMemo(
    () => estimateSuper(monthlyIncome * 12, yearsWorked, yearsToStatutoryPension),
    [monthlyIncome, yearsWorked, yearsToStatutoryPension]
  );

  // Route to the right pension value per country.
  // SG / HK / AU: auto-estimated; US: SS estimator; other covered: 0 (estimator pending);
  // remaining (ae/sa/tr/za/my): manual slider.
  const effectivePensionIncome =
    country === "us" ? ssMonthly :
    country === "sg" ? sgPension :
    country === "hk" ? hkPension :
    country === "au" ? auPension :
    PENSION_ESTIMATOR_COUNTRIES.has(country) ? 0 :
    pensionIncome;

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
    pensionIncome: effectivePensionIncome,
  }), [age, city, currentSavings, monthlyIncome, monthlyExpenses, spend, scenario, effectivePensionIncome]);

  const retirementAge = useMemo(
    () => age + plannerResult.yearsToGoal,
    [age, plannerResult.yearsToGoal]
  );

  const accountProjection = useMemo(
    () => projectAccount(
      accountBalance,
      annualContribution401k,
      employerMatchRate,
      monthlyIncome * 12,   // annual salary approximation
      Math.max(0, plannerResult.yearsToGoal),
      0.07                  // standard 7% real return for equities
    ),
    [accountBalance, annualContribution401k, employerMatchRate, monthlyIncome, plannerResult.yearsToGoal]
  );

  const healthcareBridge = useMemo(
    () => calcHealthcareBridge(retirementAge, age),
    [retirementAge, age]
  );

  const insurance = useMemo(() => getInsurance(country, province, city), [country, province, city]);
  const defaultRetireDate = useMemo(
    () => getDefaultRetireDate(country as Parameters<typeof getDefaultRetireDate>[0], dob, gender, employmentType),
    [country, dob, gender, employmentType]
  );
  const defaultRetireAge = useMemo(() => {
    if (!defaultRetireDate) return null;
    const birthDate = new Date(dob);
    if (Number.isNaN(birthDate.getTime())) return null;
    const months = toMonthIndex(defaultRetireDate) - toMonthIndex(birthDate);
    return months / 12;
  }, [dob, defaultRetireDate]);
  const defaultRetireYear = useMemo(() => {
    if (!defaultRetireDate) return "--";
    return yearOnly(defaultRetireDate);
  }, [defaultRetireDate]);
  const yearsSaved = useMemo(() => {
    if (defaultRetireAge === null) return 0;
    const saved = defaultRetireAge - (age + plannerResult.yearsToGoal);
    return Math.max(0, Number(saved.toFixed(1)));
  }, [defaultRetireAge, age, plannerResult.yearsToGoal]);

  const currentCountry = getCountry(country);
  const currentProvince = getProvince(country, province);
  const currentCity = getCity(country, province, city);
  const cards = useMemo(() => summaryCards(lang), [lang]);
  const tier = getTier(plannerResult.yearsToGoal);
  const rank = getRank(tier.percentile);
  const [shareUrl, setShareUrl] = useState("");
  const projectionVersion = useMemo(
    () => `${dob}|${country}|${province}|${city}|${currentSavings}|${monthlyIncome}|${monthlyExpenses}|${spend}|${scenario}|${lang}|${annualSalary}|${yearsWorked}|${ssClaimAge}|${sgPension}|${hkPension}|${auPension}`,
    [dob, country, province, city, currentSavings, monthlyIncome, monthlyExpenses, spend, scenario, lang, annualSalary, yearsWorked, ssClaimAge, sgPension, hkPension, auPension]
  );
  const shareText = buildShareText(lang, {
    brand: copy.brand,
    date: yearOnly(new Date(plannerResult.horizonDay1)),
    countyLine: country === "cn"
      ? (lang === "zh" ? `${currentCountry.label.zh} · ${currentProvince.label.zh} · ${currentCity.label.zh}` : `${currentCountry.label.en} · ${currentProvince.label.en} · ${currentCity.label.en}`)
      : (lang === "zh" ? currentCountry.label.zh : currentCountry.label.en),
  });

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("horizon-theme");
    if (storedTheme === "light" || storedTheme === "dark") setTheme(storedTheme);

    const savedProfile = window.localStorage.getItem("horizon-local-profile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile) as {
          dob: string; country: string; province: string; city: string;
          gender?: GenderCategory; employmentType?: EmploymentType;
          currentSavings?: number; monthlyIncome?: number; monthlyExpenses?: number;
          spend: number; pensionIncome?: number; budgetMode: BudgetMode;
        };
        setDob(parsed.dob);
        // "cn" was removed from the global site; "uk" is still coming-soon — both fall back to first available region
        if (COMING_SOON_COUNTRIES.has(parsed.country) || parsed.country === "cn") {
          const fallback = REGIONS[0];
          setCountry(fallback.value);
          setProvince(fallback.provinces[0].value);
          setCity(fallback.provinces[0].cities[0].value);
        } else {
          setCountry(parsed.country);
          setProvince(parsed.province);
          setCity(parsed.city);
        }
        if (parsed.gender) setGender(parsed.gender);
        if (parsed.employmentType) setEmploymentType(parsed.employmentType);
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
    } else {
      // No saved profile — silently detect location from IP as a warm default
      detectFromIP();
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("horizon-theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    setShareUrl(`${window.location.origin}${window.location.pathname}`);
  }, []);

  // ── Location helpers ──────────────────────────────────────────────────────
  function applyGeoLocation(rawCode: string, regionName: string | null, cityName: string | null) {
    // Map ISO 3166-1 alpha-2 codes that differ from our region keys
    const CODE_MAP: Record<string, string> = { gb: "uk" };
    const code = CODE_MAP[rawCode.toLowerCase()] ?? rawCode.toLowerCase();

    // This site doesn't show Mainland China (served by cn.horizone.cc.cd)
    if (code === "cn") return;

    const matched = REGIONS.find(r => r.value === code);
    if (!matched) return;

    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

    const matchedProvince = (regionName
      ? matched.provinces.find(p =>
          p.value === regionName.toLowerCase().replace(/\s+/g, "-") ||
          norm(p.label.en) === norm(regionName)
        )
      : null) ?? matched.provinces[0];

    const matchedCity = (cityName
      ? matchedProvince.cities.find(c =>
          c.value === cityName.toLowerCase().replace(/\s+/g, "-") ||
          norm(c.label.en) === norm(cityName)
        )
      : null) ?? matchedProvince.cities[0];

    setCountry(matched.value);
    setProvince(matchedProvince.value);
    setCity(matchedCity.value);
  }

  async function detectFromIP() {
    try {
      const res = await fetch("https://ipwho.is/");
      const d = await res.json() as { success?: boolean; country_code?: string; region?: string; city?: string };
      if (d.success && d.country_code) {
        applyGeoLocation(d.country_code, d.region ?? null, d.city ?? null);
      }
    } catch { /* silent fail — user stays on default */ }
  }

  function requestGPSLocation() {
    if (!navigator.geolocation) { setLocationStatus("denied"); return; }
    setLocationStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "User-Agent": "HorizonRetirementPlanner/1.0 (contact@horizone.cc.cd)" } }
          );
          const d = await res.json() as { address?: { country_code?: string; state?: string; city?: string; town?: string } };
          const addr = d.address ?? {};
          applyGeoLocation(
            addr.country_code ?? "",
            addr.state ?? null,
            addr.city ?? addr.town ?? null
          );
          setLocationStatus("done");
        } catch { setLocationStatus("idle"); }
      },
      () => setLocationStatus("denied")
    );
  }
  // ─────────────────────────────────────────────────────────────────────────

  function saveLocal() {
    window.localStorage.setItem("horizon-local-profile", JSON.stringify({
      dob, country, province, city, gender, employmentType,
      currentSavings, monthlyIncome, monthlyExpenses, spend, pensionIncome, budgetMode,
    }));
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
          budgetMode, language: lang, theme, insurance,
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
          retirementAge: Number((age + plannerResult.yearsToGoal).toFixed(1)),
        },
      }),
    });
    const payload = (await response.json()) as { message: string };
    if (response.status === 401) { setSaveState(copy.saveRequiresSignIn); return; }
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
    setShareState(lang === "zh" ? "已复制分享文案。" : "Share text copied.");
  }

  async function shareNative() {
    if (navigator.share) {
      await navigator.share({ title: copy.brand, text: shareText, url: shareUrl });
      setShareState(lang === "zh" ? "已打开系统分享。" : "Native share opened.");
      return;
    }
    await copyShareText();
  }

  function socialShareLink(channel: string) {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);
    if (lang === "zh") {
      if (channel === "weibo")   return `https://service.weibo.com/share/share.php?title=${encodedText}&url=${encodedUrl}`;
      if (channel === "rednote") return `https://www.xiaohongshu.com/`;
      return `https://www.wechat.com/`;
    }
    if (channel === "x")        return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
    if (channel === "linkedin") return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
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
            <div className="lang-region">
              <span className="lang-toggle">
                <button type="button" className={`lang-opt${lang === "en" ? " lang-active" : ""}`} onClick={() => setLang("en")}>EN</button>
                <span className="lang-sep" aria-hidden="true">|</span>
                <button type="button" className={`lang-opt${lang === "zh" ? " lang-active" : ""}`} onClick={() => setLang("zh")}>中文</button>
              </span>
              <a className="icon-btn" href="https://cn.horizone.cc.cd" title="China site" aria-label="Switch to China site">C</a>
            </div>
            <button type="button" className="icon-btn" onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>
              {theme === "light" ? "◐" : "◑"}
            </button>
            {hasClerk ? <AuthControls language={lang === "zh" ? "zh" : "en"} /> : null}
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
                <div className="callout-line">
                  {lang === "zh" ? copy.defaultRetireLabel : copy.defaultRetireLabel}：<span className="hl">{defaultRetireAge ? defaultRetireAge.toFixed(1) : "--"}</span> {lang === "zh" ? "岁" : "yrs"} · <span className="hl">{defaultRetireYear}</span>，{lang === "zh" ? "Horizon 用户平均节省" : "Horizon users save an average of"} <span className="hl callout-years">{yearsSaved > 0.5 ? yearsSaved.toFixed(1) : "5.7"} {lang === "zh" ? "年" : "yrs"}</span>
                </div>
              </div>
              <p className="mode-copy">{copy.retirementDisclaimer}</p>
              <div className="hero-actions">
                <a className="btn" href="#customize">
                  {lang === "zh" ? "退休规划器" : "Retirement Planner"}
                </a>
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

        {/* ── 01 Summary ── */}
        <section className="calc" id="summary">
          <div className="calc-head">
            <div>
              <div className="sect-label"><span className="num">01</span> — {copy.nav.summary}</div>
              <h2>{lang === "zh" ? "为什么选择 Horizon" : copy.summaryTitle}</h2>
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

        {/* ── 02 Retirement Planner ── */}
        <section className="calc" id="customize">
          <div className="calc-head">
            <div>
              <div className="sect-label"><span className="num">02</span> — {copy.nav.customize}</div>
              <h2>{lang === "zh" ? "输入基础参数" : copy.customizeTitle}</h2>
            </div>
            <div className="desc">{copy.customizeDesc}</div>
          </div>

          {lang === "en" && (
            <div className="region-coverage-note">
              <strong>📍 Currently covers:</strong> United States, Hong Kong, Macau, Taiwan, Singapore, Malaysia, Australia, Japan, Korea, Canada, New Zealand, and 15 European / Middle East / Africa markets. Mainland China is served at <a href="https://cn.horizone.cc.cd" target="_blank" rel="noopener noreferrer">cn.horizone.cc.cd</a>.<br />
              <strong>United Kingdom</strong> — pension integration coming soon.
            </div>
          )}

          <div className="calc-grid">
            <div className="calc-form">

              {/* ── Row 1: DOB + Retirement category ── */}
              <div className="form-row-2col">
                <label className="field">
                  <div className="lbl"><span>{copy.dob}</span></div>
                  <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                </label>

                {country === "cn" ? (
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
                ) : country === "hk" ? (
                  <label className="field">
                    <div className="lbl"><span>{copy.employmentType}</span></div>
                    <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}>
                      <option value="private">{copy.employmentOptions.private}</option>
                      <option value="government_civilian">{copy.employmentOptions.governmentCivilian}</option>
                      <option value="government_disciplined">{copy.employmentOptions.governmentDisciplined}</option>
                    </select>
                  </label>
                ) : (
                  <label className="field">
                    <div className="lbl"><span>{copy.gender}</span></div>
                    <select value={gender} onChange={(e) => setGender(e.target.value as GenderCategory)}>
                      <option value="male">{copy.genderSimple.male}</option>
                      <option value="female_pro">{copy.genderSimple.female}</option>
                      <option value="prefer_not_to_say">{copy.genderSimple.preferNotToSay}</option>
                    </select>
                  </label>
                )}
              </div>

              <div className="form-divider" />

              {/* ── Row 2: Country ── */}
              <label className="field">
                <div className="lbl"><span>{copy.country}</span></div>
                <select
                  value={country}
                  onChange={(e) => {
                    const next = e.target.value;
                    if (COMING_SOON_COUNTRIES.has(next)) return;
                    const nextCountry = getCountry(next);
                    const nextProvince = nextCountry.provinces[0];
                    setCountry(next);
                    setProvince(nextProvince.value);
                    setCity(nextProvince.cities[0].value);
                  }}
                >
                  {REGIONS.map((item) => (
                    <option key={item.value} value={item.value} disabled={COMING_SOON_COUNTRIES.has(item.value)}>
                      {lang === "zh" ? item.label.zh : item.label.en}
                    </option>
                  ))}
                </select>
                {COMING_SOON_COUNTRIES.has(country) && (
                  <small className="field-hint">{lang === "zh" ? "英国的规则即将上线。" : "UK rules are coming soon."}</small>
                )}
              </label>

              {/* ── Location auto-fill button ── */}
              <div className="location-row">
                <button
                  type="button"
                  className="location-detect-btn"
                  onClick={requestGPSLocation}
                  disabled={locationStatus === "detecting"}
                >
                  {locationStatus === "detecting"
                    ? (lang === "zh" ? "📍 定位中…" : "📍 Detecting…")
                    : locationStatus === "done"
                    ? (lang === "zh" ? "✓ 已自动填写" : "✓ Location filled")
                    : locationStatus === "denied"
                    ? (lang === "zh" ? "📍 无法获取位置" : "📍 Location unavailable")
                    : (lang === "zh" ? "📍 自动填写我的位置" : "📍 Auto-fill my location")}
                </button>
              </div>

              {/* ── Row 3: Province + City (where applicable) ── */}
              {(currentCountry.provinces.length > 1 || (currentCountry.provinces[0]?.cities.length ?? 0) > 1) && (
                <>
                  <div className="form-divider" />
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
                          <option key={item.value} value={item.value}>
                            {lang === "zh" ? item.label.zh : item.label.en}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <div className="lbl"><span>{copy.city}</span></div>
                      <select value={city} onChange={(e) => setCity(e.target.value)}>
                        {currentProvince.cities.map((item) => (
                          <option key={item.value} value={item.value}>
                            {lang === "zh" ? item.label.zh : item.label.en}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </>
              )}

              <div className="form-divider" />

              {/* ── Social Security / Pension income ── */}
              {country === "us" ? (
                /* US: full SS estimator */
                <div className="ss-estimator-card">
                  <div className="ss-card-header">
                    <span className="fold-label">
                      {lang === "zh" ? "社会保障估算（美国）" : "Social Security Estimator"}
                    </span>
                    <span className="ss-badge">US</span>
                  </div>
                  <div className="field">
                    <div className="lbl">
                      <span>{lang === "zh" ? "年收入（税前）" : "Annual pre-tax salary"}</span>
                      <span className="val">{money(annualSalary, lang)}</span>
                    </div>
                    <input type="range" min={20000} max={200000} step={5000} value={annualSalary}
                      onChange={(e) => setAnnualSalary(Number(e.target.value))} />
                  </div>
                  <div className="field">
                    <div className="lbl">
                      <span>{lang === "zh" ? "已工作年限" : "Years worked (career to date)"}</span>
                      <span className="val">{yearsWorked} {lang === "zh" ? "年" : "yrs"}</span>
                    </div>
                    <input type="range" min={0} max={35} step={1} value={yearsWorked}
                      onChange={(e) => setYearsWorked(Number(e.target.value))} />
                  </div>
                  <div className="ss-benefit-row">
                    {([62, 67, 70] as const).map((claimAge) => {
                      const benefit = claimAge === 62 ? ssBenefit.at62 : claimAge === 67 ? ssBenefit.atFRA : ssBenefit.at70;
                      return (
                        <button
                          key={claimAge}
                          type="button"
                          className={`ss-claim-opt ${ssClaimAge === claimAge ? "ss-claim-active" : ""}`}
                          onClick={() => setSsClaimAge(claimAge)}
                        >
                          <span className="ss-claim-age">{lang === "zh" ? `${claimAge}岁` : `Age ${claimAge}`}</span>
                          <span className="ss-claim-amt">{money(benefit, lang)}{lang === "zh" ? "/月" : "/mo"}</span>
                          {claimAge === 67 && <span className="ss-claim-tag">{lang === "zh" ? "标准" : "FRA"}</span>}
                        </button>
                      );
                    })}
                  </div>
                  <small className="field-hint">
                    {lang === "zh"
                      ? `选择领取年龄：每月 ${money(ssMonthly, lang)} 已计入所需本金计算。`
                      : `Selected benefit: ${money(ssMonthly, lang)}/mo — this reduces your required nest egg.`}
                  </small>
                </div>
              ) : country === "sg" ? (
                /* Singapore: CPF Life */
                <div className="ss-estimator-card">
                  <div className="ss-card-header">
                    <span className="fold-label">{lang === "zh" ? "公积金寿险估算（CPF Life）" : "CPF Life Estimator"}</span>
                    <span className="ss-badge">SG</span>
                  </div>
                  <div className="field">
                    <div className="lbl">
                      <span>{lang === "zh" ? "已工作年限" : "Years worked (career to date)"}</span>
                      <span className="val">{yearsWorked} {lang === "zh" ? "年" : "yrs"}</span>
                    </div>
                    <input type="range" min={0} max={40} step={1} value={yearsWorked}
                      onChange={(e) => setYearsWorked(Number(e.target.value))} />
                  </div>
                  <div className="pension-output-row">
                    <div className="pension-output-card">
                      <span className="pension-output-label">{lang === "zh" ? "65岁起每月领取" : "Monthly from age 65"}</span>
                      <span className="pension-output-amt">{localMoney(sgPension, "sg")}<span className="pension-output-mo">/mo</span></span>
                    </div>
                  </div>
                  <small className="field-hint">
                    {lang === "zh"
                      ? `基于月收入 ${localMoney(monthlyIncome, "sg")} 及 ${yearsWorked} 年贡献，特别账户4%利息，标准计划。此金额已计入所需本金计算。`
                      : `Based on ${localMoney(monthlyIncome, "sg")}/mo income and ${yearsWorked} yrs worked. Special Account at 4% p.a., Standard Plan. This reduces your required nest egg.`}
                  </small>
                </div>

              ) : country === "hk" ? (
                /* Hong Kong: MPF */
                <div className="ss-estimator-card">
                  <div className="ss-card-header">
                    <span className="fold-label">{lang === "zh" ? "强积金估算（MPF）" : "MPF Estimator"}</span>
                    <span className="ss-badge">HK</span>
                  </div>
                  <div className="field">
                    <div className="lbl">
                      <span>{lang === "zh" ? "已工作年限" : "Years worked (career to date)"}</span>
                      <span className="val">{yearsWorked} {lang === "zh" ? "年" : "yrs"}</span>
                    </div>
                    <input type="range" min={0} max={40} step={1} value={yearsWorked}
                      onChange={(e) => setYearsWorked(Number(e.target.value))} />
                  </div>
                  <div className="pension-output-row">
                    <div className="pension-output-card">
                      <span className="pension-output-label">{lang === "zh" ? "65岁起每月提取（20年分摊）" : "Monthly drawdown from 65 (20-yr spread)"}</span>
                      <span className="pension-output-amt">{localMoney(hkPension, "hk")}<span className="pension-output-mo">/mo</span></span>
                    </div>
                  </div>
                  <small className="field-hint">
                    {lang === "zh"
                      ? `基于月收入 ${localMoney(monthlyIncome, "hk")}，雇主+雇员各5%，5%年回报率。此金额已计入所需本金计算。`
                      : `Based on ${localMoney(monthlyIncome, "hk")}/mo income. Employer + employee 5% each, 5% annual return. This reduces your required nest egg.`}
                  </small>
                </div>

              ) : country === "au" ? (
                /* Australia: Superannuation */
                <div className="ss-estimator-card">
                  <div className="ss-card-header">
                    <span className="fold-label">{lang === "zh" ? "超级年金估算（Superannuation）" : "Superannuation Estimator"}</span>
                    <span className="ss-badge">AU</span>
                  </div>
                  <div className="field">
                    <div className="lbl">
                      <span>{lang === "zh" ? "已工作年限" : "Years worked (career to date)"}</span>
                      <span className="val">{yearsWorked} {lang === "zh" ? "年" : "yrs"}</span>
                    </div>
                    <input type="range" min={0} max={40} step={1} value={yearsWorked}
                      onChange={(e) => setYearsWorked(Number(e.target.value))} />
                  </div>
                  <div className="pension-output-row">
                    <div className="pension-output-card">
                      <span className="pension-output-label">{lang === "zh" ? "退休后每月提取（4%提款率）" : "Monthly drawdown at retirement (4% SWR)"}</span>
                      <span className="pension-output-amt">{localMoney(auPension, "au")}<span className="pension-output-mo">/mo</span></span>
                    </div>
                  </div>
                  <small className="field-hint">
                    {lang === "zh"
                      ? `基于年收入 ${localMoney(monthlyIncome * 12, "au")}，雇主强积金11.5%，平衡型基金7%年回报率，4%提款率。此金额已计入所需本金计算。`
                      : `Based on ${localMoney(monthlyIncome * 12, "au")}/yr income. Employer SG 11.5%, balanced fund at 7% p.a., 4% SWR. This reduces your required nest egg.`}
                  </small>
                </div>

              ) : PENSION_ESTIMATOR_COUNTRIES.has(country) ? (
                /* Statutory pension country — estimator coming, hide manual slider */
                <div className="pension-coming-card">
                  <span className="pension-coming-icon">🏛️</span>
                  <span className="pension-coming-text">
                    {lang === "zh"
                      ? `${currentCountry.label.zh}政府养老金估算即将上线。届时将自动计入所需本金。`
                      : `Government pension estimator for ${currentCountry.label.en} is coming soon — it will automatically reduce your required nest egg.`}
                  </span>
                </div>
              ) : (
                /* Variable / expat-heavy countries — manual slider */
                <div className="field">
                  <div className="lbl">
                    <span>{lang === "zh" ? "预计每月养老金/社保（可选）" : copy.pensionIncome}</span>
                    <span className="val">{pensionIncome > 0 ? money(pensionIncome, lang) : (lang === "zh" ? "¥0" : "$0")}</span>
                  </div>
                  <input type="range" min={0} max={10000} step={100} value={pensionIncome}
                    onChange={(e) => setPensionIncome(Number(e.target.value))} />
                  <small className="field-hint">
                    {lang === "zh"
                      ? "退休后预计领取的政府养老金或社保金额（直接减少所需本金目标）"
                      : "Expected government pension / social security — this offsets your required nest egg."}
                  </small>
                </div>
              )}

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
                    <strong>{lang === "zh" ? currentCity.label.zh : currentCity.label.en}</strong>
                  </div>
                  <span className="fold-hint">{lang === "zh" ? "点击展开" : "Click to expand"}</span>
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

            {/* ── Right panel ── */}
            <div className="calc-out">
              <div className="pension-summary-card" key={projectionVersion}>
                {/* Row 1: retirement year */}
                <div className="psc-row">
                  <span className="psc-label">{lang === "zh" ? "预计退休年份" : "Projected Day 1 year"}</span>
                  <div className="psc-value">
                    <span className="hl"><span key={`${projectionVersion}-year`} className="flip-number">{yearOnly(new Date(plannerResult.horizonDay1))}</span></span>
                    <span className="psc-sub">
                      {lang === "zh" ? "还有" : ""} <strong>{plannerResult.yearsToGoal}</strong> {lang === "zh" ? "年" : "yrs away"}
                    </span>
                  </div>
                </div>
                <div className="psc-divider" />
                {/* Row 2: required nest egg */}
                <div className="psc-row">
                  <span className="psc-label">{copy.nestEgg}</span>
                  <div className="psc-value">
                    {hideCapital
                      ? <span className="hl psc-hidden">· · ·</span>
                      : <span className="hl"><span key={`${projectionVersion}-capital`} className="flip-number">{money(plannerResult.requiredNestEgg, lang)}</span></span>}
                    <span className="psc-sub">
                      {effectivePensionIncome > 0
                        ? (lang === "zh"
                            ? `养老金抵消 ${money(effectivePensionIncome, lang)}/月`
                            : `${money(effectivePensionIncome, lang)}/mo offset by pension`)
                        : (lang === "zh"
                            ? `基于 ${SCENARIO_PRESETS[scenario].multiplier}× 安全倍数`
                            : `${SCENARIO_PRESETS[scenario].multiplier}× safe withdrawal`)}
                      <button type="button" className="eye-btn"
                        onClick={() => setHideCapital(v => !v)}
                        aria-label={hideCapital ? (lang === "zh" ? "显示本金" : "Show nest egg") : (lang === "zh" ? "隐藏本金" : "Hide nest egg")}>
                        {hideCapital ? "○" : "●"}
                      </button>
                    </span>
                  </div>
                </div>
                <div className="psc-divider" />
                {/* Row 3: years saved */}
                <div className="psc-row">
                  <span className="psc-label">{lang === "zh" ? "使用 Horizon 规划" : "With Horizon planning"}</span>
                  <div className="psc-value">
                    {lang === "zh"
                      ? <>有望早 <span className="hl">{yearsSaved > 0.5 ? yearsSaved.toFixed(1) : "5.7"} 年</span> 退休</>
                      : <><span className="hl">{yearsSaved > 0.5 ? yearsSaved.toFixed(1) : "5.7"} yrs</span> earlier</>}
                  </div>
                </div>
              </div>

              <div className="share-card">
                <div className="k">{copy.shareTitle}</div>
                <p>{copy.shareLead}</p>
                <div className="share-preview">{shareText} {shareUrl}</div>
                <div className="save-row">
                  <button type="button" className="btn ghost" onClick={copyShareText}>{copy.shareCopy}</button>
                  <button type="button" className="btn" onClick={shareNative}>{lang === "zh" ? "系统分享" : "Native share"}</button>
                </div>
                <div className="share-links">
                  {socialChannels(lang).map((channel) => (
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

        {/* ── 03 Budget Templates ── */}
        <section className="calc" id="budget">
          <div className="calc-head">
            <div>
              <div className="sect-label"><span className="num">03</span> — {copy.nav.budget}</div>
              <h2>{lang === "zh" ? "预算模版" : copy.budgetTitle}</h2>
            </div>
            <div className="desc">{copy.budgetLead}</div>
          </div>

          {!budgetSelected && (
            <p className="budget-prompt">
              {lang === "zh"
                ? "选择一个模版，查看详情并调整参数。"
                : "Select a template to load its parameters and see how each path affects your Day 1 date."}
            </p>
          )}

          <div className="budget-grid">
            {(
              [
                { key: "low",      label: copy.lowBudgetLabel,      text: copy.lowBudgetCopy      },
                { key: "balanced", label: copy.balancedBudgetLabel, text: copy.balancedBudgetCopy },
                { key: "full",     label: copy.fullBudgetLabel,     text: copy.fullBudgetCopy     },
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
                          { label: lang === "zh" ? "月收入" : "Income",   value: BUDGETS[plan.key].monthlyIncome },
                          { label: lang === "zh" ? "月支出" : "Expenses", value: BUDGETS[plan.key].monthlyExpenses },
                          { label: lang === "zh" ? "月「足够」" : "Enough", value: BUDGETS[plan.key].spend },
                        ].map((row) => (
                          <div key={row.label} className="budget-preview-row">
                            <span className="budget-preview-label">{row.label}</span>
                            <span className="budget-preview-val">{money(row.value, lang)}<span className="budget-preview-mo">/mo</span></span>
                          </div>
                        ))}
                      </div>
                    )}
                  </button>

                  {open && (
                    <div className="budget-params">
                      <div className="field">
                        <div className="lbl"><span>{copy.currentSavings}</span><span className="val">{money(currentSavings, lang)}</span></div>
                        <input type="range" min={0} max={3000000} step={10000} value={currentSavings} onChange={(e) => setCurrentSavings(Number(e.target.value))} />
                      </div>
                      <div className="field">
                        <div className="lbl"><span>{copy.monthlyIncome}</span><span className="val">{money(monthlyIncome, lang)}</span></div>
                        <input type="range" min={2000} max={80000} step={500} value={monthlyIncome} onChange={(e) => setMonthlyIncome(Number(e.target.value))} />
                      </div>
                      <div className="field">
                        <div className="lbl"><span>{copy.monthlyExpenses}</span><span className="val">{money(monthlyExpenses, lang)}</span></div>
                        <input type="range" min={800} max={40000} step={500} value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(Number(e.target.value))} />
                      </div>
                      <div className="field">
                        <div className="lbl"><span>{lang === "zh" ? "你认为「足够」的月花费" : copy.spend}</span><span className="val">{money(spend, lang)}</span></div>
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

          {/* ── 401(k) / IRA Projection (US only) ── */}
          {country === "us" && <div className="accounts-section">
            <button
              type="button"
              className={`accounts-toggle ${show401k ? "accounts-toggle-open" : ""}`}
              onClick={() => setShow401k(v => !v)}
              aria-expanded={show401k}
            >
              <span>{lang === "zh" ? "401(k) / IRA 账户测算" : "401(k) / IRA Projection"}</span>
              <span className="budget-chevron" aria-hidden="true">{show401k ? "▲" : "▼"}</span>
            </button>

            {show401k && (
              <div className="accounts-panel">
                <div className="field">
                  <div className="lbl">
                    <span>{lang === "zh" ? "当前账户余额" : "Current account balance"}</span>
                    <span className="val">{money(accountBalance, lang)}</span>
                  </div>
                  <input type="range" min={0} max={500000} step={5000} value={accountBalance}
                    onChange={(e) => setAccountBalance(Number(e.target.value))} />
                </div>
                <div className="field">
                  <div className="lbl">
                    <span>{lang === "zh" ? "年缴纳金额（个人）" : "Annual employee contribution"}</span>
                    <span className="val">{money(annualContribution401k, lang)}</span>
                  </div>
                  <input type="range" min={0} max={23000} step={500} value={annualContribution401k}
                    onChange={(e) => setAnnualContribution401k(Number(e.target.value))} />
                  <small className="field-hint">{lang === "zh" ? "2026年401(k)上限为$23,000" : "2026 401(k) limit: $23,000/yr"}</small>
                </div>
                <div className="field">
                  <div className="lbl">
                    <span>{lang === "zh" ? "雇主匹配比例" : "Employer match rate"}</span>
                    <span className="val">{(employerMatchRate * 100).toFixed(0)}%</span>
                  </div>
                  <input type="range" min={0} max={0.1} step={0.01} value={employerMatchRate}
                    onChange={(e) => setEmployerMatchRate(Number(e.target.value))} />
                  <small className="field-hint">{lang === "zh" ? "雇主匹配你薪资的一定比例，例如4%" : "Typical: 3–6% of salary"}</small>
                </div>

                <div className="accounts-projection">
                  <div className="accounts-proj-row">
                    <span>{lang === "zh" ? "退休时预计账户价值" : "Projected value at retirement"}</span>
                    <strong>{money(accountProjection.projectedValue, lang)}</strong>
                  </div>
                  <div className="accounts-proj-row">
                    <span>{lang === "zh" ? "累计缴纳（含雇主匹配）" : "Total contributions (incl. match)"}</span>
                    <strong>{money(accountProjection.totalContributions, lang)}</strong>
                  </div>
                  <div className="accounts-proj-row accounts-proj-highlight">
                    <span>{lang === "zh" ? "复利增长" : "Compound growth"}</span>
                    <strong>{money(accountProjection.totalGrowth, lang)}</strong>
                  </div>
                  <small className="field-hint">
                    {lang === "zh"
                      ? "假设年化收益率 7%（实际波动因市场而异）"
                      : "Assumes 7% annual return. Actual returns vary."}
                  </small>
                </div>
              </div>
            )}
          </div>}

          {/* ── Healthcare Bridge ── */}
          {country === "us" && healthcareBridge.yearsToMedicare > 0 && (
            <div className="healthcare-bridge">
              <div className="k">
                {lang === "zh" ? "医保过渡期（退休 → Medicare）" : "Healthcare bridge to Medicare"}
              </div>
              <div className="breakdown-row">
                <span>{lang === "zh" ? "距 Medicare 年数" : "Years until Medicare (age 65)"}</span>
                <strong>{healthcareBridge.yearsToMedicare} {lang === "zh" ? "年" : "yrs"}</strong>
              </div>
              <div className="breakdown-row">
                <span>{lang === "zh" ? "ACA 保险估算（月）" : "Est. ACA marketplace premium"}</span>
                <strong>{money(healthcareBridge.estimatedMonthlyPremium, lang)}<span className="breakdown-freq">{lang === "zh" ? "/月" : "/mo"}</span></strong>
              </div>
              <div className="breakdown-row breakdown-total">
                <span>{lang === "zh" ? "过渡期医保总成本" : "Total bridge cost"}</span>
                <strong>{money(healthcareBridge.totalBridgeCost, lang)}</strong>
              </div>
              <small className="field-hint">
                {lang === "zh"
                  ? "ACA 保费因州、年龄和收入而异。该估算基于全国均值，仅供参考。"
                  : "ACA premiums vary by state, age, and income. This is a rough national average — check healthcare.gov for your actual options."}
              </small>
            </div>
          )}

          {/* Income breakdown */}
          <div className="income-breakdown">
            <div className="k">{lang === "zh" ? "退休后月收入来源" : "Monthly income at retirement"}</div>
            <div className="breakdown-row">
              <span>{lang === "zh" ? "投资组合提现" : "Portfolio withdrawal"}</span>
              <strong>{money(Math.max(0, spend - pensionIncome), lang)}<span className="breakdown-freq">{lang === "zh" ? "/月" : "/mo"}</span></strong>
            </div>
            {pensionIncome > 0 && (
              <div className="breakdown-row">
                <span>{lang === "zh" ? "养老金 / 社保" : "Gov pension / social security"}</span>
                <strong>{money(pensionIncome, lang)}<span className="breakdown-freq">{lang === "zh" ? "/月" : "/mo"}</span></strong>
              </div>
            )}
            <div className="breakdown-row breakdown-total">
              <span>{lang === "zh" ? "合计" : "Total"}</span>
              <strong>{money(spend, lang)}<span className="breakdown-freq">{lang === "zh" ? "/月" : "/mo"}</span></strong>
            </div>
          </div>

          {/* Assumptions */}
          <details className="assumptions-fold">
            <summary>
              <span className="fold-label">{copy.assumptionsTitle}</span>
              <span className="fold-hint">{lang === "zh" ? "点击展开" : "Click to expand"}</span>
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

        {/* ── 04 Best Practices ── */}
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
                  {lang === "zh"
                    ? <>节省 <span className="hl story-years">{story.yearsSaved} 年</span>，基于「{story.plan}」</>
                    : <>Saved <span className="hl story-years">{story.yearsSaved} yrs</span> — <em>{story.plan}</em></>}
                </div>
                <p className="story-quote">&ldquo;{story.text}&rdquo;</p>
                <p className="story-name">{story.name}</p>
                <p className="story-role">{story.role}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="freedom-strip" aria-live="polite">
          <span className="freedom-strip-label">
            {lang === "zh" ? "自由日" : "Day 1"}
          </span>
          <span className="freedom-strip-date">
            {yearOnly(new Date(plannerResult.horizonDay1))}
          </span>
          <span className="freedom-strip-sep" aria-hidden="true">·</span>
          <span className="freedom-strip-away">
            {lang === "zh"
              ? <><strong>{plannerResult.yearsToGoal}</strong> 年</>
              : <><strong>{plannerResult.yearsToGoal}</strong> yrs away</>}
          </span>
        </div>
      </main>
    </>
  );
}
