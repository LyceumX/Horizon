"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { AuthControls } from "@/components/auth-controls";

type Language = "en" | "zh";
type Theme = "light" | "dark";
type BudgetMode = "low" | "balanced" | "full";

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
};

const REGIONS: CountryOption[] = [
  {
    value: "cn",
    label: { en: "China", zh: "中国" },
    provinces: [
      {
        value: "zhejiang",
        label: { en: "Zhejiang", zh: "浙江" },
        cities: [
          {
            value: "hangzhou",
            label: { en: "Hangzhou", zh: "杭州" },
            insurance: {
              pension: "Basic pension +5.5%",
              medical: "Medical insurance +2.0%",
              housing: "Housing fund +12%",
              unemployment: "Unemployment insurance +0.5%",
              workplace: "Enterprise annuity: available",
              note: "Fake preset for demonstration only."
            }
          },
          {
            value: "ningbo",
            label: { en: "Ningbo", zh: "宁波" },
            insurance: {
              pension: "Basic pension +5.3%",
              medical: "Medical insurance +1.9%",
              housing: "Housing fund +12%",
              unemployment: "Unemployment insurance +0.4%",
              workplace: "Enterprise annuity: available",
              note: "Fake preset for demonstration only."
            }
          }
        ]
      },
      {
        value: "guangdong",
        label: { en: "Guangdong", zh: "广东" },
        cities: [
          {
            value: "shenzhen",
            label: { en: "Shenzhen", zh: "深圳" },
            insurance: {
              pension: "Basic pension +6.0%",
              medical: "Medical insurance +2.2%",
              housing: "Housing fund +12%",
              unemployment: "Unemployment insurance +0.5%",
              workplace: "Enterprise annuity: popular",
              note: "Fake preset for demonstration only."
            }
          },
          {
            value: "guangzhou",
            label: { en: "Guangzhou", zh: "广州" },
            insurance: {
              pension: "Basic pension +5.8%",
              medical: "Medical insurance +2.1%",
              housing: "Housing fund +12%",
              unemployment: "Unemployment insurance +0.4%",
              workplace: "Enterprise annuity: available",
              note: "Fake preset for demonstration only."
            }
          }
        ]
      }
    ]
  },
  {
    value: "us",
    label: { en: "United States", zh: "美国" },
    provinces: [
      {
        value: "california",
        label: { en: "California", zh: "加利福尼亚" },
        cities: [
          {
            value: "san-francisco",
            label: { en: "San Francisco", zh: "旧金山" },
            insurance: {
              pension: "401(k) match: mock 6%",
              medical: "Medical premium: mock 8%",
              housing: "Housing support: none",
              unemployment: "Unemployment: mock 1.0%",
              workplace: "Roth IRA: available",
              note: "Illustrative preset only."
            }
          },
          {
            value: "los-angeles",
            label: { en: "Los Angeles", zh: "洛杉矶" },
            insurance: {
              pension: "401(k) match: mock 5%",
              medical: "Medical premium: mock 8.5%",
              housing: "Housing support: none",
              unemployment: "Unemployment: mock 1.0%",
              workplace: "Roth IRA: available",
              note: "Illustrative preset only."
            }
          }
        ]
      }
    ]
  },
  {
    value: "sg",
    label: { en: "Singapore", zh: "新加坡" },
    provinces: [
      {
        value: "central",
        label: { en: "Central Region", zh: "中区" },
        cities: [
          {
            value: "singapore-city",
            label: { en: "Singapore", zh: "新加坡" },
            insurance: {
              pension: "CPF-like pension: mock 17%",
              medical: "Medical protection: mock 3%",
              housing: "Housing support: mock 10%",
              unemployment: "Unemployment cover: low",
              workplace: "Private pension: optional",
              note: "Illustrative preset only."
            }
          }
        ]
      }
    ]
  }
];

const COPY: Record<Language, Copy> = {
  en: {
    brand: "Horizon Day 1",
    since: "Since 2026",
    nav: { summary: "Summary", customize: "Customize", budget: "Budget Plans", stories: "Real-life Stories" },
    goal: "Plan your retirement date and reach it wisely.",
    slogan:
      "To get what you want, you have to either increase sacrifice or reduce desire. Either way, I'll help you plan it wisely.",
    interest:
      "Horizon Day 1 turns retirement from a vague goal into a concrete date, then shows the monthly choices that move you there.",
    heroBadge: "Early-retire vibe · date-first planning",
    heroCaption: "A calmer, more intentional path to the day your work becomes optional.",
    summaryTitle: "What Horizon Day 1 gives you",
    summaryLead: "Four folded cards that open into a deeper planning view.",
    summaryIntro: "Click any card to expand more details.",
    customizeTitle: "Customize your base parameters",
    customizeDesc: "No sign-up needed. Play freely and save to your browser locally.",
    dob: "Date of birth",
    country: "Country",
    province: "Province / state",
    city: "City",
    save: "Monthly savings",
    spend: "Monthly cost of enough",
    projectionTitle: "Live projection",
    projectionYears: "Years until Day 1",
    projectionAge: "Current age",
    projectionYear: "Projected year",
    projectionCapital: "Estimated capital target",
    tierLabel: "Tier",
    tierTop: "Top tier",
    tierElite: "Elite tier",
    tierStrong: "Strong tier",
    tierSteady: "Steady tier",
    rankLabel: "Ranking",
    rankAmong: "Among all users",
    shareTitle: "Share preview",
    shareLead: "Generate a post and send it to the right channel for your locale.",
    sharePost: "Generated post",
    shareCopy: "Copy post",
    shareLink: "Open share link",
    shareChannels: ["X", "LinkedIn", "WhatsApp"],
    localSave: "Save locally",
    localSaved: "Saved locally on this device.",
    cloudSave: "Save to account",
    saving: "Saving...",
    saveRequiresSignIn: "Sign in to save this scenario.",
    freeHint: "Everyone can use the planner for free.",
    signInHint: "Sign up / sign in only when you want account sync and personalized follow-ups.",
    authMissing: "Clerk is not configured yet, so account sync is unavailable.",
    budgetTitle: "Budget Plans",
    budgetLead: "Different freedom paths for different life strategies. Registered users can tap to apply them.",
    budgetLocked: "Sign in to unlock advanced budget plans.",
    lowBudgetLabel: "Low-budget freedom",
    lowBudgetCopy: "Reduce desire and reach Day 1 faster.",
    balancedBudgetLabel: "Balanced freedom",
    balancedBudgetCopy: "Keep a practical lifestyle while improving your savings rate.",
    fullBudgetLabel: "Full-budget freedom",
    fullBudgetCopy: "Protect a higher lifestyle standard and close the gap with stronger income or savings.",
    selectedPlan: "Selected plan",
    insuranceTitle: "Auto-filled social insurance",
    insuranceLead: "Fake data for now, but the UI shows how local context will flow into the plan.",
    insuranceFields: {
      pension: "Pension",
      medical: "Medical",
      housing: "Housing fund",
      unemployment: "Unemployment",
      workplace: "Workplace pension",
      note: "Note"
    },
    storiesTitle: "Real-life Stories",
    storiesLead: "Attractive placeholder stories showing the emotional payoff of planning earlier.",
    stories: [
      {
        name: "Lina W.",
        role: "Product Lead · Shanghai",
        image: "/assets/Stories_image_1.webp",
        text: "I used to chase a random number. Day 1 gave me a date, then I could finally plan life around it."
      },
      {
        name: "Jun K.",
        role: "Engineer · Shenzhen",
        image: "/assets/Stories_image_2.jpeg",
        text: "Switching to low-budget mode cut three years off my timeline, without feeling deprived."
      },
      {
        name: "Maya C.",
        role: "Designer · Hangzhou",
        image: "/assets/Stories_image_3.jpg",
        text: "I stayed in full-budget mode and built side income. Same freedom, different strategy."
      },
      {
        name: "Arun P.",
        role: "Founder · Singapore",
        image: "/assets/Stories_image_4.jpg",
        text: "Saving locally first made me start. Registering later gave me smarter follow-up across devices."
      }
    ]
  },
  zh: {
    brand: "早日退休",
    since: "日期：自2026",
    nav: { summary: "摘要", customize: "参数", budget: "预算方案", stories: "真实故事" },
    goal: "规划你的退休日期，并更聪明地达成目标。",
    slogan: "想要得到你想要的，要么增加牺牲，要么减少欲望。无论哪条路，我都会帮你更明智地规划。",
    interest: "Horizon Day 1 把退休从模糊目标变成明确日期，再告诉你哪些月度选择会把你带到那里。",
    heroBadge: "早退氛围 · 先定日期再规划",
    heroCaption: "让工作可选、让生活先行的更安静、更有意图的路径。",
    summaryTitle: "Horizon Day 1 会提供什么",
    summaryLead: "四张默认折叠的卡片，点击即可展开更深的信息。",
    summaryIntro: "点击任一卡片，查看更完整的规划逻辑。",
    customizeTitle: "先自定义基础参数",
    customizeDesc: "无需注册，先免费体验，并可保存到本地浏览器。",
    dob: "出生日期",
    country: "国家",
    province: "省 / 州",
    city: "城市",
    save: "每月可储蓄",
    spend: "你认为“足够”的月花费",
    projectionTitle: "实时测算",
    projectionYears: "距离 Day 1 年数",
    projectionAge: "当前年龄",
    projectionYear: "预计年份",
    projectionCapital: "预计本金目标",
    tierLabel: "层级",
    tierTop: "顶层",
    tierElite: "精英",
    tierStrong: "稳健",
    tierSteady: "稳步",
    rankLabel: "排名",
    rankAmong: "在全部用户中",
    shareTitle: "分享预览",
    shareLead: "生成一段帖子，并发送到你所在地区最合适的渠道。",
    sharePost: "生成的帖子",
    shareCopy: "复制文案",
    shareLink: "打开分享链接",
    shareChannels: ["微信", "微博", "小红书"],
    localSave: "保存到本地",
    localSaved: "已保存到本设备本地。",
    cloudSave: "保存到账户",
    saving: "保存中...",
    saveRequiresSignIn: "请先登录后再保存方案。",
    freeHint: "任何人都可免费使用测算器。",
    signInHint: "仅当你希望跨设备同步和获取个性化跟进时，再注册/登录即可。",
    authMissing: "当前环境未配置 Clerk，因此账户同步不可用。",
    budgetTitle: "预算方案",
    budgetLead: "不同的自由路径适合不同的人生策略。已注册用户可点击应用。",
    budgetLocked: "请先登录后解锁高级预算方案。",
    lowBudgetLabel: "低预算自由",
    lowBudgetCopy: "减少欲望，更快抵达 Day 1。",
    balancedBudgetLabel: "平衡自由",
    balancedBudgetCopy: "保持现实生活方式，同时提高储蓄率。",
    fullBudgetLabel: "全预算自由",
    fullBudgetCopy: "保护更高生活标准，并用更强收入或储蓄缩小缺口。",
    selectedPlan: "当前方案",
    insuranceTitle: "自动填充的社保信息",
    insuranceLead: "目前是模拟数据，但已经展示出本地条件如何进入规划流程。",
    insuranceFields: {
      pension: "养老",
      medical: "医疗",
      housing: "公积金",
      unemployment: "失业",
      workplace: "职业养老金",
      note: "备注"
    },
    storiesTitle: "真实人生故事",
    storiesLead: "更吸引人的占位故事，展示更早规划带来的真实感受。",
    stories: [
      {
        name: "林薇",
        role: "产品负责人 · 上海",
        image: "/assets/Stories_image_1.webp",
        text: "以前我追的是一个模糊数字，现在我有了明确日期，生活节奏一下子变清晰了。"
      },
      {
        name: "俊凯",
        role: "工程师 · 深圳",
        image: "/assets/Stories_image_2.jpeg",
        text: "切到低预算模式后，我的时间线直接提前了三年，而且并不痛苦。"
      },
      {
        name: "马娅",
        role: "设计师 · 杭州",
        image: "/assets/Stories_image_3.jpg",
        text: "我选择全预算模式，同时做副业增收。自由同样能到，只是路线不同。"
      },
      {
        name: "阿伦",
        role: "创业者 · 新加坡",
        image: "/assets/Stories_image_4.jpg",
        text: "先本地保存让我马上开始，后来注册账户后，我可以跨设备继续优化。"
      }
    ]
  }
};

const BUDGETS: Record<BudgetMode, { low: number; save: number; spend: number }> = {
  low: { low: 1, save: 1800, spend: 2100 },
  balanced: { low: 0, save: 2400, spend: 2800 },
  full: { low: 0, save: 3400, spend: 3800 }
};

function calcProjection(input: { age: number; save: number; spend: number }) {
  const target = input.spend * 12 * 25;
  const monthlyRate = 0.05 / 12;
  let balance = 0;
  let months = 0;

  while (balance < target && months < 12 * 80) {
    balance = balance * (1 + monthlyRate) + input.save;
    months += 1;
  }

  const years = Number((months / 12).toFixed(1));
  const date = new Date();
  date.setMonth(date.getMonth() + months);

  return { years, date, target: Math.round(target) };
}

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

function buildShareText(language: Language, input: { brand: string; years: number; date: string; rank: string; tier: string; currency: string; countyLine: string }) {
  if (language === "zh") {
    return `${input.brand}｜我预测的自由日是 ${input.date}，还要 ${input.years} 年。${input.tier}，${input.rank}。${input.countyLine} ${input.currency}`;
  }

  return `${input.brand} | My projected Day 1 is ${input.date}, about ${input.years} years away. ${input.tier}, ${input.rank}. ${input.countyLine} ${input.currency}`;
}

function socialChannels(language: Language) {
  return language === "zh"
    ? ["WeChat", "Weibo", "Xiaohongshu"]
    : ["X", "LinkedIn", "WhatsApp"];
}

function summaryCards(language: Language): SummaryCard[] {
  return language === "zh"
    ? [
        { key: "target", title: "目标日期", value: "看见你真正开始自由的年份", details: ["把退休从目标变成日期。", "默认折叠，点击后查看路径逻辑。"], accent: "#c97a3a" },
        { key: "capital", title: "本金目标", value: "看见你大概要准备多少", details: ["基于月支出与安全倍数。", "支持后续按城市和生活方式调整。"], accent: "#4b6f5a" },
        { key: "gap", title: "行动缺口", value: "看见你还差多少", details: ["每月要存多少、每年要做什么。", "帮助你把抽象问题拆成小行动。"], accent: "#2f4a6b" },
        { key: "follow", title: "持续优化", value: "看见你下一次该怎么升级", details: ["本地保存、账户同步、后续跟进。", "适合每月回看与迭代。"], accent: "#8b5cf6" }
      ]
    : [
        { key: "target", title: "Target Date", value: "See the year you can become free", details: ["Turn retirement into a date on the calendar.", "Folded by default, expanded on click."], accent: "#c97a3a" },
        { key: "capital", title: "Capital Target", value: "See the nest egg you likely need", details: ["Based on monthly spend and safety multiples.", "Can be localized by city and lifestyle."], accent: "#4b6f5a" },
        { key: "gap", title: "Action Gap", value: "See how much remains", details: ["Monthly savings target and yearly action steps.", "Turns a vague question into a concrete plan."], accent: "#2f4a6b" },
        { key: "follow", title: "Follow-up", value: "See what to do next", details: ["Local save, account sync, and reminders.", "Built for monthly revisits and improvement."], accent: "#8b5cf6" }
      ];
}

function money(value: number, language: Language) {
  return new Intl.NumberFormat(language === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency: language === "zh" ? "CNY" : "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export default function HomePage() {
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<Theme>("light");
  const [dob, setDob] = useState("1990-01-01");
  const [country, setCountry] = useState("cn");
  const [province, setProvince] = useState("zhejiang");
  const [city, setCity] = useState("hangzhou");
  const [save, setSave] = useState(1800);
  const [spend, setSpend] = useState(2400);
  const [budgetMode, setBudgetMode] = useState<BudgetMode>("balanced");
  const [saveState, setSaveState] = useState("");
  const [expandedSummary, setExpandedSummary] = useState<string | null>(null);
  const [shareState, setShareState] = useState("");

  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const copy = COPY[language];
  const age = useMemo(() => calcAgeFromDob(dob), [dob]);
  const projection = useMemo(() => calcProjection({ age, save, spend }), [age, save, spend]);
  const insurance = useMemo(() => getInsurance(country, province, city), [country, province, city]);
  const currentCountry = getCountry(country);
  const currentProvince = getProvince(country, province);
  const currentCity = getCity(country, province, city);
  const cards = useMemo(() => summaryCards(language), [language]);
  const tier = getTier(projection.years);
  const rank = getRank(tier.percentile);
  const [shareUrl, setShareUrl] = useState("");
  const shareText = buildShareText(language, {
    brand: copy.brand,
    years: projection.years,
    date: yearOnly(projection.date),
    rank: language === "zh" ? `全站排名第 ${rank.rank} / ${rank.outOf}` : `ranked #${rank.rank}/${rank.outOf}`,
    tier: language === "zh" ? `层级：${tier.zhLabel}` : `Tier: ${tier.label}`,
    currency: money(projection.target, language),
    countyLine: language === "zh" ? `${currentCountry.label.zh} · ${currentProvince.label.zh} · ${currentCity.label.zh}` : `${currentCountry.label.en} · ${currentProvince.label.en} · ${currentCity.label.en}`
  });

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem("horizon-language");
    if (storedLanguage === "en" || storedLanguage === "zh") {
      setLanguage(storedLanguage);
    }

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
          save: number;
          spend: number;
          budgetMode: BudgetMode;
        };
        setDob(parsed.dob);
        setCountry(parsed.country);
        setProvince(parsed.province);
        setCity(parsed.city);
        setSave(parsed.save);
        setSpend(parsed.spend);
        setBudgetMode(parsed.budgetMode);
      } catch {
        // Ignore invalid local cache.
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("horizon-language", language);
    document.body.className = language === "zh" ? "ch-on" : "en-on";
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem("horizon-theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    setShareUrl(`${window.location.origin}${window.location.pathname}`);
  }, []);

  function saveLocal() {
    window.localStorage.setItem("horizon-local-profile", JSON.stringify({ dob, country, province, city, save, spend, budgetMode }));
    setSaveState(copy.localSaved);
  }

  async function saveCloud() {
    setSaveState(copy.saving);
    const response = await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: { dob, age, country, province, city, save, spend, budgetMode, language, theme, insurance },
        projection: {
          years: projection.years,
          year: projection.date.getFullYear(),
          target: projection.target,
          rank: rank.rank,
          percentile: tier.percentile,
          retirementAge: Number((age + projection.years).toFixed(1))
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
    setSave(preset.save);
    setSpend(preset.spend);
  }

  async function copyShareText() {
    await navigator.clipboard.writeText(`${shareText} ${shareUrl}`.trim());
    setShareState(language === "zh" ? "已复制分享文案。" : "Share text copied.");
  }

  async function shareNative() {
    if (navigator.share) {
      await navigator.share({
        title: copy.brand,
        text: shareText,
        url: shareUrl
      });
      setShareState(language === "zh" ? "已打开系统分享。" : "Native share opened.");
      return;
    }

    await copyShareText();
  }

  function socialShareLink(channel: string) {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(shareUrl);

    if (language === "zh") {
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
            <div className="langtog" role="tablist" aria-label="Language">
              <button className={language === "zh" ? "on" : ""} onClick={() => setLanguage("zh")}>中</button>
              <button className={language === "en" ? "on" : ""} onClick={() => setLanguage("en")}>EN</button>
            </div>
            <button type="button" className="icon-btn" onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>
              {theme === "light" ? "◐" : "◑"}
            </button>
            {hasClerk ? <AuthControls language={language} /> : null}
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
              <div className="hero-actions">
                <a className="btn" href="#customize">{language === "zh" ? "开始规划" : "Start planning"}</a>
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
          <div className="summary-grid four-col">
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
                  <div className="lbl"><span>{copy.country}</span><span className="val">{language === "zh" ? currentCountry.label.zh : currentCountry.label.en}</span></div>
                  <select
                    value={country}
                    onChange={(e) => {
                      const nextCountry = e.target.value;
                      const nextCountryRecord = getCountry(nextCountry);
                      const nextProvince = nextCountryRecord.provinces[0];
                      const nextCity = nextProvince.cities[0];
                      setCountry(nextCountry);
                      setProvince(nextProvince.value);
                      setCity(nextCity.value);
                    }}
                  >
                    {REGIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {language === "zh" ? item.label.zh : item.label.en}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <div className="lbl"><span>{copy.province}</span><span className="val">{language === "zh" ? currentProvince.label.zh : currentProvince.label.en}</span></div>
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
                        {language === "zh" ? item.label.zh : item.label.en}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <div className="lbl"><span>{copy.city}</span><span className="val">{language === "zh" ? currentCity.label.zh : currentCity.label.en}</span></div>
                  <select value={city} onChange={(e) => setCity(e.target.value)}>
                    {currentProvince.cities.map((item) => (
                      <option key={item.value} value={item.value}>
                        {language === "zh" ? item.label.zh : item.label.en}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="field">
                <div className="lbl"><span>{copy.save}</span><span className="val">{money(save, language)}</span></div>
                <input type="range" min={200} max={8000} step={100} value={save} onChange={(e) => setSave(Number(e.target.value))} />
              </div>

              <div className="field">
                <div className="lbl"><span>{copy.spend}</span><span className="val">{money(spend, language)}</span></div>
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
                      <button type="button" className="btn" disabled>{copy.cloudSave}</button>
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
            </div>

            <div className="calc-out">
              <div className="projection-card">
                <div className="k">{copy.projectionTitle}</div>
                <div className="projection-topline">
                  <span className={`tier-badge tier-${tier.key}`}>{language === "zh" ? tier.zhLabel : tier.label}</span>
                  <span className="projection-years-mini">{projection.years} {language === "zh" ? "年" : "years"}</span>
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
                  <strong>{yearOnly(projection.date)}</strong>
                </div>
                <div className="projection-grid">
                  <div className="metric-card">
                    <span className="metric-icon">⏳</span>
                    <div>
                      <small>{copy.projectionYears}</small>
                      <strong>{projection.years}</strong>
                    </div>
                  </div>
                  <div className="metric-card">
                    <span className="metric-icon">🎂</span>
                    <div>
                      <small>{copy.projectionAge}</small>
                      <strong>{(age + projection.years).toFixed(1)}</strong>
                    </div>
                  </div>
                  <div className="metric-card">
                    <span className="metric-icon">🏆</span>
                    <div>
                      <small>{copy.rankLabel}</small>
                      <strong>{language === "zh" ? `第 ${rank.rank} / ${rank.outOf}` : `#${rank.rank} / ${rank.outOf}`}</strong>
                    </div>
                  </div>
                  <div className="metric-card">
                    <span className="metric-icon">💰</span>
                    <div>
                      <small>{copy.projectionCapital}</small>
                      <strong>{money(projection.target, language)}</strong>
                    </div>
                  </div>
                </div>
                <div className="projection-footer">
                  <div>
                    <span className="footer-label">{copy.tierLabel}</span>
                    <strong>{language === "zh" ? tier.zhLabel : tier.label}</strong>
                  </div>
                  <div>
                    <span className="footer-label">{copy.rankAmong}</span>
                    <strong>{language === "zh" ? `前 ${tier.percentile}%` : `Top ${tier.percentile}%`}</strong>
                  </div>
                </div>
              </div>

              <div className="share-card">
                <div className="k">{copy.shareTitle}</div>
                <p>{copy.shareLead}</p>
                <textarea readOnly value={`${shareText}\n${shareUrl}`} />
                <div className="save-row">
                  <button type="button" className="btn ghost" onClick={copyShareText}>{copy.shareCopy}</button>
                  <button type="button" className="btn" onClick={shareNative}>{language === "zh" ? "系统分享" : "Native share"}</button>
                </div>
                <div className="share-links">
                  {socialChannels(language).map((channel) => (
                    <a key={channel} className="share-link" href={socialShareLink(channel)} target="_blank" rel="noreferrer">
                      {copy.shareLink} · {channel}
                    </a>
                  ))}
                </div>
                {shareState ? <p className="mode-copy">{shareState}</p> : null}
              </div>

              <div className="insurance-card">
                <div className="k">{copy.insuranceTitle}</div>
                <p>{copy.insuranceLead}</p>
                <div className="insurance-grid">
                  <div className="insurance-item"><span>{copy.insuranceFields.pension}</span><strong>{insurance.pension}</strong></div>
                  <div className="insurance-item"><span>{copy.insuranceFields.medical}</span><strong>{insurance.medical}</strong></div>
                  <div className="insurance-item"><span>{copy.insuranceFields.housing}</span><strong>{insurance.housing}</strong></div>
                  <div className="insurance-item"><span>{copy.insuranceFields.unemployment}</span><strong>{insurance.unemployment}</strong></div>
                  <div className="insurance-item full"><span>{copy.insuranceFields.workplace}</span><strong>{insurance.workplace}</strong></div>
                  <div className="insurance-item full"><span>{copy.insuranceFields.note}</span><strong>{insurance.note}</strong></div>
                </div>
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
                    <div key={plan.key} className="budget-card budget-card-disabled" aria-disabled="true">
                      <div className="budget-pill">{copy.selectedPlan}</div>
                      <h3>{plan.label}</h3>
                      <p>{plan.text}</p>
                    </div>
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
