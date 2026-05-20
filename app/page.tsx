"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { SignInButton, SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { AuthControls } from "@/components/auth-controls";
import { getDefaultRetireDate } from "@/lib/retirement";

type Language = "en" | "zh";
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
    label: { en: "United States (Coming soon)", zh: "美国（即将上线）" },
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
    value: "hk",
    label: { en: "Hong Kong", zh: "中国香港" },
    provinces: [
      {
        value: "hk-island",
        label: { en: "Hong Kong", zh: "香港" },
        cities: [
          {
            value: "hong-kong",
            label: { en: "Hong Kong", zh: "香港" },
            insurance: {
              pension: "MPF withdrawal age 65",
              medical: "Public + private mix",
              housing: "Housing support varies",
              unemployment: "Low unemployment aid",
              workplace: "Employer MPF match",
              note: "Mock data for Hong Kong." 
            }
          }
        ]
      }
    ]
  },
  {
    value: "mo",
    label: { en: "Macao", zh: "中国澳门" },
    provinces: [
      {
        value: "macau",
        label: { en: "Macao", zh: "澳门" },
        cities: [
          {
            value: "macau",
            label: { en: "Macao", zh: "澳门" },
            insurance: {
              pension: "Pension age 60/65",
              medical: "Public health system",
              housing: "Housing support varies",
              unemployment: "Limited coverage",
              workplace: "Mandatory fund",
              note: "Mock data for Macao." 
            }
          }
        ]
      }
    ]
  },
  {
    value: "tw",
    label: { en: "Taiwan", zh: "中国台湾" },
    provinces: [
      {
        value: "taiwan",
        label: { en: "Taiwan", zh: "台湾" },
        cities: [
          {
            value: "taipei",
            label: { en: "Taipei", zh: "台北" },
            insurance: {
              pension: "Labor insurance pension",
              medical: "National health insurance",
              housing: "Housing support varies",
              unemployment: "Labor insurance coverage",
              workplace: "Labor pension",
              note: "Mock data for Taiwan." 
            }
          }
        ]
      }
    ]
  },
  {
    value: "sg",
    label: { en: "Singapore", zh: "新加坡" },
      {
        value: "uk",
        label: { en: "United Kingdom (Coming soon)", zh: "英国（即将上线）" },
        provinces: [
          {
            value: "uk",
            label: { en: "United Kingdom", zh: "英国" },
            cities: [
              {
                value: "london",
                label: { en: "London", zh: "伦敦" },
                insurance: {
                  pension: "State pension (coming soon)",
                  medical: "NHS (coming soon)",
                  housing: "Housing support (coming soon)",
                  unemployment: "Benefits (coming soon)",
                  workplace: "Workplace pension (coming soon)",
                  note: "Coming soon for the UK."
                }
              }
            ]
          }
        ]
      }
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

const COMING_SOON_COUNTRIES = new Set(["us", "uk"]);

const COPY: Record<Language, Copy> = {
  en: {
    brand: "Meet Your Freedom Date.",
    since: "Since 2026",
    nav: { summary: "Summary", customize: "Customize", budget: "Budget Plans", stories: "Real-life Stories" },
    goal: "Retire with clarity, not spreadsheets.",
    slogan:
      "Horizon turns complex regional rules into a simple plan, updated in real time. See your freedom date, then shorten it with intentional monthly choices.",
    interest:
      "Discard Excel. Follow proven playbooks, compare years saved with Horizon, and stay accountable with people on the same timeline.",
    heroBadge: "Date-first planning · community-driven",
    heroCaption: "Plan faster, follow proven paths, and reach your freedom date sooner.",
    summaryTitle: "Why Horizon Day 1 works",
    summaryLead: "Simplify the math, localize the rules, and build momentum with others.",
    summaryIntro: "Discard spreadsheets. Get a clear retirement date, a plan, and a community to improve it.",
    customizeTitle: "Customize your base parameters",
    customizeDesc: "No sign-up needed. Play freely and save to your browser locally.",
    dob: "Date of birth",
    country: "Country",
    province: "Province / state",
    city: "City",
    employmentType: "Employment type (HK)",
    employmentOptions: {
      private: "Private sector",
      governmentCivilian: "Government (civilian)",
      governmentDisciplined: "Government (disciplined)"
    },
    gender: "Retirement category",
    genderOptions: {
      male: "Male (general)",
      femalePro: "Female (cadre / professional)",
      femaleWorker: "Female (blue-collar)",
      specialMale: "Special work (male)",
      specialFemale: "Special work (female)"
    },
    defaultRetireLabel: "Local statutory retirement",
    defaultRetireValue: "Default retirement age",
    yearsSavedLabel: "Years saved with Horizon",
    retirementDisclaimer: "Informational estimates only. Policies vary by region.",
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
    authMissing: "Clerk is not configured in this workspace, so sign-in and account sync are unavailable.",
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
    storiesTitle: "Best Practices",
    storiesLead: "Follow playbooks from people who saved years. Share your own and grow together (coming soon).",
    stories: [
      {
        name: "Lina W.",
        role: "Product Lead · Shanghai",
        image: "/assets/Stories_image_1.webp",
        text: "Horizon turned a vague goal into a date, then a plan I could actually follow."
      },
      {
        name: "Jun K.",
        role: "Engineer · Shenzhen",
        image: "/assets/Stories_image_2.jpeg",
        text: "The plan showed me where I could save years without feeling deprived."
      },
      {
        name: "Maya C.",
        role: "Designer · Hangzhou",
        image: "/assets/Stories_image_3.jpg",
        text: "Different strategy, same freedom date. The tracker kept me focused."
      },
      {
        name: "Arun P.",
        role: "Founder · Singapore",
        image: "/assets/Stories_image_4.jpg",
        text: "I started local, then shared my playbook with others and refined it." 
      }
    ]
  },
  zh: {
    brand: "锁定你的自由之日。",
    since: "自2026",
    nav: { summary: "摘要", customize: "参数", budget: "预算方案", stories: "真实故事" },
    goal: "退休规划，不再靠表格。",
    slogan: "Horizon 把复杂的地区规则变成极简方案，并实时更新。先看自由日期，再用每月选择把它提前。",
    interest: "丢掉 Excel，参考最佳实践，看到使用 Horizon 节省的年数，与同路人一起坚持。",
    heroBadge: "先定日期 · 共同规划",
    heroCaption: "更快制定计划，跟随成功路径，加速自由之日。",
    summaryTitle: "为什么选择 Horizon Day 1",
    summaryLead: "把复杂计算变简单，把规则本地化，与同路人一起迭代。",
    summaryIntro: "丢掉表格，得到清晰日期、可执行方案和成长社群。",
    customizeTitle: "先自定义基础参数",
    customizeDesc: "无需注册，先免费体验，并可保存到本地浏览器。",
    dob: "出生日期",
    country: "国家",
    province: "省 / 州",
    city: "城市",
    employmentType: "雇佣类型（香港）",
    employmentOptions: {
      private: "私营部门",
      governmentCivilian: "政府文职",
      governmentDisciplined: "纪律部队"
    },
    gender: "退休类别",
    genderOptions: {
      male: "男性（通用）",
      femalePro: "女性（干部 / 管理 / 专业）",
      femaleWorker: "女性（工人 / 蓝领）",
      specialMale: "特殊工种（男）",
      specialFemale: "特殊工种（女）"
    },
    defaultRetireLabel: "法定退休基准",
    defaultRetireValue: "默认退休年龄",
    yearsSavedLabel: "使用 Horizon 节省年数",
    retirementDisclaimer: "仅供参考，具体政策以当地规定为准。",
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
    authMissing: "当前工作区未配置 Clerk，因此登录和账户同步不可用。",
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
    storiesTitle: "最佳实践",
    storiesLead: "跟随那些节省多年的人，分享你的方法并一起成长（即将上线）。",
    stories: [
      {
        name: "林薇",
        role: "产品负责人 · 上海",
        image: "/assets/Stories_image_1.webp",
        text: "Horizon 把模糊目标变成了日期，再变成了我能坚持的计划。"
      },
      {
        name: "俊凯",
        role: "工程师 · 深圳",
        image: "/assets/Stories_image_2.jpeg",
        text: "方案让我看到哪里能省下几年，而且不牺牲生活感。"
      },
      {
        name: "马娅",
        role: "设计师 · 杭州",
        image: "/assets/Stories_image_3.jpg",
        text: "路线不同，但自由日期一样清晰。持续跟踪让我稳住节奏。"
      },
      {
        name: "阿伦",
        role: "创业者 · 新加坡",
        image: "/assets/Stories_image_4.jpg",
        text: "我从本地开始，后来把方法分享给更多人，一起优化。"
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

function PreferenceSync({ language, setLanguage }: { language: Language; setLanguage: (value: Language) => void }) {
  const { isSignedIn } = useUser();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      setLoaded(false);
      return;
    }

    let cancelled = false;
    fetch("/api/preferences")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) {
          return;
        }
        if (data.language === "en" || data.language === "zh") {
          setLanguage(data.language);
        }
      })
      .catch(() => {
        // Ignore preference fetch errors.
      })
      .finally(() => {
        if (!cancelled) {
          setLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, setLanguage]);

  useEffect(() => {
    if (!isSignedIn || !loaded) {
      return;
    }

    fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language })
    }).catch(() => {
      // Ignore preference save errors.
    });
  }, [language, isSignedIn, loaded]);

  return null;
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

function buildShareText(language: Language, input: { brand: string; date: string; countyLine: string }) {
  if (language === "zh") {
    return `我将在 ${input.date} 年退休。${input.brand} ${input.countyLine}`;
  }

  return `I'm going to retire in the year of ${input.date}. ${input.brand} ${input.countyLine}`;
}

function socialChannels(language: Language) {
  return language === "zh"
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

function summaryCards(language: Language): SummaryCard[] {
  return language === "zh"
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
  const [gender, setGender] = useState<GenderCategory>("male");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("private");
  const [save, setSave] = useState(1800);
  const [spend, setSpend] = useState(2400);
  const [budgetMode, setBudgetMode] = useState<BudgetMode>("balanced");
  const [saveState, setSaveState] = useState("");
  const [expandedSummary, setExpandedSummary] = useState<string | null>(null);
  const [shareState, setShareState] = useState("");
  const [hideSensitive, setHideSensitive] = useState(false);

  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const copy = COPY[language];
  const age = useMemo(() => calcAgeFromDob(dob), [dob]);
  const projection = useMemo(() => calcProjection({ age, save, spend }), [age, save, spend]);
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
    const saved = defaultRetireAge - (age + projection.years);
    return Math.max(0, Number(saved.toFixed(1)));
  }, [defaultRetireAge, age, projection.years]);
  const currentCountry = getCountry(country);
  const currentProvince = getProvince(country, province);
  const currentCity = getCity(country, province, city);
  const cards = useMemo(() => summaryCards(language), [language]);
  const tier = getTier(projection.years);
  const rank = getRank(tier.percentile);
  const [shareUrl, setShareUrl] = useState("");
  const projectionVersion = useMemo(
    () => `${dob}|${country}|${province}|${city}|${save}|${spend}|${language}|${hideSensitive ? "hide" : "show"}`,
    [dob, country, province, city, save, spend, language, hideSensitive]
  );
  const shareText = buildShareText(language, {
    brand: copy.brand,
    date: yearOnly(projection.date),
    countyLine: country === "cn"
      ? (language === "zh" ? `${currentCountry.label.zh} · ${currentProvince.label.zh} · ${currentCity.label.zh}` : `${currentCountry.label.en} · ${currentProvince.label.en} · ${currentCity.label.en}`)
      : (language === "zh" ? currentCountry.label.zh : currentCountry.label.en)
  });

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem("horizon-language");
    let resolvedLanguage: Language | null = null;
    if (storedLanguage === "en" || storedLanguage === "zh") {
      resolvedLanguage = storedLanguage;
    }

    if (!resolvedLanguage) {
      const cookieMatch = document.cookie.match(/(?:^|; )horizon-lang=([^;]+)/);
      if (cookieMatch) {
        const cookieLang = decodeURIComponent(cookieMatch[1]);
        if (cookieLang === "en" || cookieLang === "zh") {
          resolvedLanguage = cookieLang;
        }
      }
    }

    if (resolvedLanguage) {
      setLanguage(resolvedLanguage);
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
          gender?: GenderCategory;
          employmentType?: EmploymentType;
          save: number;
          spend: number;
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
    window.localStorage.setItem("horizon-local-profile", JSON.stringify({ dob, country, province, city, gender, employmentType, save, spend, budgetMode }));
    setSaveState(copy.localSaved);
  }

  async function saveCloud() {
    setSaveState(copy.saving);
    const response = await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: { dob, age, country, province, city, gender, employmentType, save, spend, budgetMode, language, theme, insurance },
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
      {hasClerk ? <PreferenceSync language={language} setLanguage={setLanguage} /> : null}
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
              <div className="hero-callout" aria-live="polite">
                <div>
                  <span className="k">{copy.defaultRetireLabel}</span>
                  <strong>{copy.defaultRetireValue}: {defaultRetireAge ? defaultRetireAge.toFixed(1) : "--"} {language === "zh" ? "岁" : "yrs"} · {defaultRetireYear}</strong>
                </div>
                <div>
                  <span className="k">{copy.yearsSavedLabel}</span>
                  <strong>{yearsSaved.toFixed(1)} {language === "zh" ? "年" : "yrs"}</strong>
                </div>
              </div>
              <p className="mode-copy">{copy.retirementDisclaimer}</p>
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
                  <div className="lbl"><span>{copy.country}</span><span className="val">{language === "zh" ? currentCountry.label.zh : currentCountry.label.en}</span></div>
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
                        {language === "zh" ? item.label.zh : item.label.en}
                      </option>
                    ))}
                  </select>
                </label>

                {COMING_SOON_COUNTRIES.has(country) ? (
                  <p className="mode-copy">{language === "zh" ? "美国与英国的规则即将上线。" : "US and UK rules are coming soon."}</p>
                ) : null}

                {country === "cn" || country === "sg" || country === "us" ? (
                  <>
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
                    <strong>{language === "zh" ? currentCity.label.zh : currentCity.label.en}</strong>
                  </div>
                  <span className="fold-hint">{language === "zh" ? "点击展开" : "Click to expand"}</span>
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
                    <span className={`tier-badge tier-${tier.key}`}>{language === "zh" ? tier.zhLabel : tier.label}</span>
                    <span className="projection-years-mini">{projection.years} {language === "zh" ? "年" : "years"}</span>
                  </div>
                  <button type="button" className="ghost-toggle" onClick={() => setHideSensitive((value) => !value)}>
                    {hideSensitive ? (language === "zh" ? "显示年龄和本金" : "Show age and capital") : (language === "zh" ? "隐藏年龄和本金" : "Hide age and capital")}
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
                  <strong><span key={`${projectionVersion}-year`} className="flip-number">{yearOnly(projection.date)}</span></strong>
                </div>
                <div className="projection-grid">
                  <div className="metric-card">
                    <span className="metric-icon">⏳</span>
                    <div>
                      <small>{copy.projectionYears}</small>
                      <strong><span key={`${projectionVersion}-years`} className="flip-number">{projection.years}</span></strong>
                    </div>
                  </div>
                  {hideSensitive ? null : (
                    <div className="metric-card">
                      <span className="metric-icon">🎂</span>
                      <div>
                        <small>{copy.projectionAge}</small>
                        <strong><span key={`${projectionVersion}-age`} className="flip-number">{(age + projection.years).toFixed(1)}</span></strong>
                      </div>
                    </div>
                  )}
                  <div className="metric-card">
                    <span className="metric-icon">🏆</span>
                    <div>
                      <small>{copy.rankLabel}</small>
                      <strong><span key={`${projectionVersion}-rank`} className="flip-number">{language === "zh" ? `第 ${rank.rank} / ${rank.outOf}` : `#${rank.rank} / ${rank.outOf}`}</span></strong>
                    </div>
                  </div>
                  {hideSensitive ? null : (
                    <div className="metric-card">
                      <span className="metric-icon">💰</span>
                      <div>
                        <small>{copy.projectionCapital}</small>
                        <strong><span key={`${projectionVersion}-capital`} className="flip-number">{money(projection.target, language)}</span></strong>
                      </div>
                    </div>
                  )}
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
                <div className="share-preview">{shareText} {shareUrl}</div>
                <div className="save-row">
                  <button type="button" className="btn ghost" onClick={copyShareText}>{copy.shareCopy}</button>
                  <button type="button" className="btn" onClick={shareNative}>{language === "zh" ? "系统分享" : "Native share"}</button>
                </div>
                <div className="share-links">
                  {socialChannels(language).map((channel) => (
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
