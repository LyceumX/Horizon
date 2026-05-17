"use client";

import { useEffect, useMemo, useState } from "react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { AuthControls } from "@/components/auth-controls";

type Language = "en" | "zh";
type Theme = "light" | "dark";
type BudgetMode = "low" | "full";

type Copy = {
  brand: string;
  brandAlt: string;
  since: string;
  nav: { summary: string; customize: string; advanced: string; stories: string };
  goal: string;
  slogan: string;
  interest: string;
  summaryTitle: string;
  summaryItems: { k: string; v: string }[];
  customizeTitle: string;
  customizeDesc: string;
  age: string;
  save: string;
  spend: string;
  projectionTitle: string;
  projectionYears: string;
  projectionDate: string;
  projectionCapital: string;
  localSave: string;
  localSaved: string;
  cloudSave: string;
  saving: string;
  saveRequiresSignIn: string;
  freeHint: string;
  signInHint: string;
  authMissing: string;
  advancedTitle: string;
  advancedDesc: string;
  lowBudgetLabel: string;
  lowBudgetCopy: string;
  fullBudgetLabel: string;
  fullBudgetCopy: string;
  advancedLocked: string;
  storiesTitle: string;
  stories: { name: string; role: string; text: string }[];
};

const COPY: Record<Language, Copy> = {
  en: {
    brand: "Horizon Day 1",
    brandAlt: "早日退休",
    since: "Since 2026",
    nav: { summary: "Summary", customize: "Customize", advanced: "Advanced", stories: "Stories" },
    goal: "Plan your retirement date and reach it wisely.",
    slogan:
      "To get what you want, you have to either increase sacrifice or reduce desire. Either way, I'll help you plan it wisely.",
    interest:
      "This site helps you turn abstract retirement goals into a concrete date, with practical monthly actions based on your current life.",
    summaryTitle: "What Horizon Day 1 gives you",
    summaryItems: [
      { k: "Target Date", v: "Your projected Day 1 month" },
      { k: "Capital Target", v: "Estimated nest egg based on your inputs" },
      { k: "Action Gap", v: "How far you are and how to close it" },
      { k: "Follow-up", v: "Save, revisit, and improve over time" }
    ],
    customizeTitle: "Customize your base parameters",
    customizeDesc: "No sign-up needed. Play freely and save to your browser locally.",
    age: "Your age today",
    save: "Monthly savings",
    spend: "Monthly cost of enough",
    projectionTitle: "Live projection",
    projectionYears: "Years until Day 1",
    projectionDate: "Estimated date",
    projectionCapital: "Estimated capital target",
    localSave: "Save locally",
    localSaved: "Saved locally on this device.",
    cloudSave: "Save to account",
    saving: "Saving...",
    saveRequiresSignIn: "Sign in to save this scenario.",
    freeHint: "Everyone can use the planner for free.",
    signInHint: "Sign up / sign in only when you want account sync and personalized follow-ups.",
    authMissing: "Clerk is not configured in env yet, so account sync is unavailable.",
    advancedTitle: "Budget plan toggle (advanced)",
    advancedDesc: "Advanced customization is available to registered users only.",
    lowBudgetLabel: "Low-budget freedom",
    lowBudgetCopy: "Reduce desire and reach Day 1 faster.",
    fullBudgetLabel: "Full-budget freedom",
    fullBudgetCopy: "Keep higher lifestyle and work/save harder.",
    advancedLocked: "Sign in to unlock advanced budget mode.",
    storiesTitle: "Real-life style stories (placeholder)",
    stories: [
      {
        name: "Lina W.",
        role: "Product Lead · Shanghai",
        text: "I used to chase a random number. Day 1 gave me a date, then I could finally plan life around it."
      },
      {
        name: "Jun K.",
        role: "Engineer · Shenzhen",
        text: "Switching to low-budget mode cut three years off my timeline, without feeling deprived."
      },
      {
        name: "Maya C.",
        role: "Designer · Hangzhou",
        text: "I stayed in full-budget mode and built side income. Same freedom, different strategy."
      }
    ]
  },
  zh: {
    brand: "早日退休",
    brandAlt: "Horizon Day 1",
    since: "日期：自2026",
    nav: { summary: "摘要", customize: "参数", advanced: "高级", stories: "故事" },
    goal: "规划你的退休日期，并更聪明地达成目标。",
    slogan: "想要得到你想要的，要么增加牺牲，要么减少欲望。无论哪条路，我都会帮你更明智地规划。",
    interest: "本网站把抽象的退休目标变成具体日期，并给出与现实生活匹配的月度行动路径。",
    summaryTitle: "Horizon Day 1 会提供什么",
    summaryItems: [
      { k: "目标日期", v: "你的 Day 1 预计月份" },
      { k: "本金目标", v: "基于当前输入的本金估算" },
      { k: "行动缺口", v: "还差多少、该怎么补" },
      { k: "持续优化", v: "可保存、可复盘、可迭代" }
    ],
    customizeTitle: "先自定义基础参数",
    customizeDesc: "无需注册，先免费体验，并可保存到本地浏览器。",
    age: "你当前年龄",
    save: "每月可储蓄",
    spend: "你认为“足够”的月花费",
    projectionTitle: "实时测算",
    projectionYears: "距离 Day 1 年数",
    projectionDate: "预计日期",
    projectionCapital: "预计本金目标",
    localSave: "保存到本地",
    localSaved: "已保存到本设备本地。",
    cloudSave: "保存到账户",
    saving: "保存中...",
    saveRequiresSignIn: "请先登录后再保存方案。",
    freeHint: "任何人都可免费使用测算器。",
    signInHint: "仅当你希望跨设备同步和获取个性化跟进时，再注册/登录即可。",
    authMissing: "当前环境未配置 Clerk，因此账户同步不可用。",
    advancedTitle: "预算模式切换（高级）",
    advancedDesc: "高级自定义仅对注册用户开放。",
    lowBudgetLabel: "低预算自由",
    lowBudgetCopy: "降低欲望，更快抵达 Day 1。",
    fullBudgetLabel: "全预算自由",
    fullBudgetCopy: "保持更高生活标准，同时增加努力与储蓄。",
    advancedLocked: "请先登录后解锁高级预算模式。",
    storiesTitle: "真实人生故事（占位示例）",
    stories: [
      {
        name: "林薇",
        role: "产品负责人 · 上海",
        text: "以前我追的是一个模糊数字，现在我有了明确日期，生活节奏一下子变清晰了。"
      },
      {
        name: "俊凯",
        role: "工程师 · 深圳",
        text: "切到低预算模式后，我的时间线直接提前了三年，而且并不痛苦。"
      },
      {
        name: "马娅",
        role: "设计师 · 杭州",
        text: "我选择全预算模式，同时做副业增收。自由同样能到，只是路线不同。"
      }
    ]
  }
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

function money(value: number, language: Language) {
  return new Intl.NumberFormat(language === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency: language === "zh" ? "CNY" : "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function monthLabel(date: Date, language: Language) {
  if (language === "zh") {
    return `${date.getFullYear()}年${date.getMonth() + 1}月`;
  }

  return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

export default function HomePage() {
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<Theme>("light");
  const [age, setAge] = useState(32);
  const [save, setSave] = useState(1800);
  const [spend, setSpend] = useState(2400);
  const [budgetMode, setBudgetMode] = useState<BudgetMode>("full");
  const [saveState, setSaveState] = useState("");

  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const copy = COPY[language];
  const projection = useMemo(() => calcProjection({ age, save, spend }), [age, save, spend]);

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
        const parsed = JSON.parse(savedProfile) as { age: number; save: number; spend: number; budgetMode: BudgetMode };
        setAge(parsed.age);
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

  function saveLocal() {
    window.localStorage.setItem("horizon-local-profile", JSON.stringify({ age, save, spend, budgetMode }));
    setSaveState(copy.localSaved);
  }

  async function saveCloud() {
    setSaveState(copy.saving);
    const response = await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: { age, save, spend, budgetMode, language, theme },
        projection: {
          years: projection.years,
          date: projection.date.toISOString(),
          target: projection.target
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
    if (mode === "low") {
      setSpend((v) => Math.max(800, Math.round(v * 0.85)));
    } else {
      setSpend((v) => Math.min(6000, Math.round(v * 1.2)));
    }
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
            <a href="#advanced">{copy.nav.advanced}</a>
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
          <div>
            <span className="eyebrow"><span className="ln"></span>{copy.goal}</span>
            <h1>{copy.brand}<br /><em>{copy.brandAlt}</em></h1>
            <p className="lede">{copy.slogan}</p>
            <p className="mode-copy">{copy.interest}</p>
          </div>
        </header>

        <section className="calc" id="summary">
          <div className="calc-head">
            <div>
              <div className="sect-label"><span className="num">01</span> — {copy.nav.summary}</div>
              <h2>{copy.summaryTitle}</h2>
            </div>
          </div>
          <div className="summary-grid">
            {copy.summaryItems.map((item) => (
              <article key={item.k} className="summary-card">
                <h3>{item.k}</h3>
                <p>{item.v}</p>
              </article>
            ))}
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
              <div className="field">
                <div className="lbl"><span>{copy.age}</span><span className="val">{age}</span></div>
                <input type="range" min={22} max={60} value={age} onChange={(e) => setAge(Number(e.target.value))} />
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
                <button type="button" className="btn" onClick={saveCloud}>{copy.cloudSave}</button>
              </div>
              <p className="mode-copy">{copy.freeHint}</p>
              <p className="mode-copy">{copy.signInHint}</p>
              {!hasClerk ? <p className="mode-copy auth-warning">{copy.authMissing}</p> : null}
              {saveState ? <p className="mode-copy">{saveState}</p> : null}
            </div>

            <div className="calc-out">
              <div className="k">{copy.projectionTitle}</div>
              <div className="row compact">
                <div className="cell">
                  <div className="k2">{copy.projectionYears}</div>
                  <div className="v2">{projection.years}</div>
                </div>
                <div className="cell">
                  <div className="k2">{copy.projectionDate}</div>
                  <div className="v2">{monthLabel(projection.date, language)}</div>
                </div>
                <div className="cell">
                  <div className="k2">{copy.projectionCapital}</div>
                  <div className="v2">{money(projection.target, language)}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="calc" id="advanced">
          <div className="calc-head">
            <div>
              <div className="sect-label"><span className="num">03</span> — {copy.nav.advanced}</div>
              <h2>{copy.advancedTitle}</h2>
            </div>
            <div className="desc">{copy.advancedDesc}</div>
          </div>

          {hasClerk ? (
            <>
              <SignedOut>
                <p className="mode-copy auth-warning">{copy.advancedLocked}</p>
              </SignedOut>
              <SignedIn>
                <div className="hero-actions">
                  <button
                    type="button"
                    className={`btn ghost ${budgetMode === "low" ? "mode-on" : ""}`}
                    onClick={() => applyBudgetMode("low")}
                  >
                    {copy.lowBudgetLabel}
                  </button>
                  <button
                    type="button"
                    className={`btn ghost ${budgetMode === "full" ? "mode-on" : ""}`}
                    onClick={() => applyBudgetMode("full")}
                  >
                    {copy.fullBudgetLabel}
                  </button>
                </div>
                <p className="mode-copy">{budgetMode === "low" ? copy.lowBudgetCopy : copy.fullBudgetCopy}</p>
              </SignedIn>
            </>
          ) : (
            <p className="mode-copy auth-warning">{copy.authMissing}</p>
          )}
        </section>

        <section className="calc" id="stories">
          <div className="calc-head">
            <div>
              <div className="sect-label"><span className="num">04</span> — {copy.nav.stories}</div>
              <h2>{copy.storiesTitle}</h2>
            </div>
          </div>
          <div className="stories-grid">
            {copy.stories.map((story) => (
              <article key={story.name} className="story-card">
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
