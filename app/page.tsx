"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthControls } from "@/components/auth-controls";

type Language = "en" | "zh";
type Theme = "light" | "dark";
type BudgetMode = "low" | "full";

type Copy = {
  brand: string;
  nav: { philosophy: string; dayZero: string; method: string; voices: string };
  slogan: string;
  title: string[];
  lede: string;
  modeLabel: string;
  modeApplied: string;
  lowBudgetLabel: string;
  lowBudgetCopy: string;
  fullBudgetLabel: string;
  fullBudgetCopy: string;
  estimateLabel: string;
  estimateUnit: string;
  estimateCaption: string;
  ticker: string[];
  calcTitle: string;
  calcDesc: string;
  age: string;
  save: string;
  spend: string;
  yearsToZero: string;
  dateLabel: string;
  reclaimedYears: string;
  reclaimedHours: string;
  freePlayHint: string;
  authMissing: string;
  saveRequiresSignIn: string;
  saveCta: string;
  saving: string;
  themeLight: string;
  themeDark: string;
};

const COPY: Record<Language, Copy> = {
  en: {
    brand: "Horizon Zero",
    nav: { philosophy: "Philosophy", dayZero: "Day Zero", method: "Method", voices: "Voices" },
    slogan: "A life-design platform · since 2024",
    title: ["The day", "you have", "enough."],
    lede:
      "True retirement is not a dollar amount. It is a date on your calendar, when your savings and lifestyle become sustainably aligned.",
    modeLabel: "Freedom mode presets",
    modeApplied: "Preset applied. You can still edit all inputs manually.",
    lowBudgetLabel: "Low-budget freedom",
    lowBudgetCopy: "Reduce desire, simplify spending, and reach Day1 sooner.",
    fullBudgetLabel: "Full-budget freedom",
    fullBudgetCopy: "Keep a higher lifestyle standard and close the gap with income plus savings.",
    estimateLabel: "Your Day Zero arrives in",
    estimateUnit: "years",
    estimateCaption: "A directional estimate, built from your live inputs.",
    ticker: ["Time over wealth", "Enough is a date", "Design the next chapter", "Reclaim the calendar"],
    calcTitle: "Find your Day Zero",
    calcDesc: "Move three honest sliders and watch your freedom date shift.",
    age: "Your age today",
    save: "Monthly savings",
    spend: "Monthly cost of enough",
    yearsToZero: "in years",
    dateLabel: "Date",
    reclaimedYears: "Years reclaimed before 65",
    reclaimedHours: "Hours of life",
    freePlayHint: "Free to play for everyone. Sign in is only required to save and personalize.",
    authMissing: "Clerk is not configured yet in environment variables.",
    saveRequiresSignIn: "Sign in to save this scenario.",
    saveCta: "Save scenario",
    saving: "Saving...",
    themeLight: "Light",
    themeDark: "Dark",
  },
  zh: {
    brand: "Horizon Zero",
    nav: { philosophy: "理念", dayZero: "自由日", method: "方法", voices: "故事" },
    slogan: "人生设计平台 · 自 2024",
    title: ["你拥有", "自由日", "的那一天"],
    lede:
      "退休从来不是一个数字，而是日历上的一个日期：当你的预算、积蓄与所爱之事终于稳定交汇。",
    modeLabel: "自由模式预设",
    modeApplied: "已应用预设，你仍可手动编辑所有参数。",
    lowBudgetLabel: "低预算自由",
    lowBudgetCopy: "降低欲望、简化生活，更早抵达 Day1。",
    fullBudgetLabel: "全预算自由",
    fullBudgetCopy: "保留更高生活标准，用收入与储蓄去缩小缺口。",
    estimateLabel: "你的自由日还有",
    estimateUnit: "年",
    estimateCaption: "基于当前输入的方向性估算。",
    ticker: ["时间优于财富", "足够是一个日期", "设计下一章节", "把日历夺回来"],
    calcTitle: "测算你的自由日",
    calcDesc: "拖动三个诚实的滑块，观察自由日期如何改变。",
    age: "你今年的年龄",
    save: "每月可储蓄",
    spend: "足够生活的月开销",
    yearsToZero: "年后",
    dateLabel: "日期",
    reclaimedYears: "比 65 岁提前的年数",
    reclaimedHours: "可重新拥有的小时",
    freePlayHint: "所有人都可免费体验；仅在保存和个性化时需要登录。",
    authMissing: "环境变量中尚未配置 Clerk。",
    saveRequiresSignIn: "请先登录后再保存方案。",
    saveCta: "保存方案",
    saving: "保存中...",
    themeLight: "浅色",
    themeDark: "深色",
  }
};

function dayZero(input: { age: number; save: number; spend: number }) {
  const target = input.spend * 12 * 25;
  const monthlyRate = 0.05 / 12;
  let balance = 0;
  let months = 0;

  while (balance < target && months < 12 * 80) {
    balance = balance * (1 + monthlyRate) + input.save;
    months += 1;
  }

  const years = months / 12;
  const dzAge = input.age + years;
  const dzDate = new Date();
  dzDate.setMonth(dzDate.getMonth() + months);
  const hours = Math.round((85 - dzAge) * 365 * 16);

  return { years, dzAge, dzDate, hours, target };
}

function money(value: number, lang: Language) {
  return new Intl.NumberFormat(lang === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency: lang === "zh" ? "CNY" : "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function monthLabel(date: Date, lang: Language) {
  if (lang === "zh") {
    return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月`;
  }

  return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

export default function HomePage() {
  const [saveState, setSaveState] = useState<string>("");
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<Theme>("light");
  const [budgetMode, setBudgetMode] = useState<BudgetMode>("low");
  const [age, setAge] = useState(32);
  const [save, setSave] = useState(1800);
  const [spend, setSpend] = useState(2400);
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem("horizon-language");
    if (storedLanguage === "en" || storedLanguage === "zh") {
      setLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("horizon-language", language);
  }, [language]);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("horizon-theme");
    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("horizon-theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    document.body.className = language === "zh" ? "ch-on" : "en-on";
  }, [language]);

  const output = useMemo(() => dayZero({ age, save, spend }), [age, save, spend]);
  const copy = COPY[language];

  function applyModePreset(mode: BudgetMode) {
    setBudgetMode(mode);
    setSaveState(copy.modeApplied);
    if (mode === "low") {
      setSpend((current) => Math.max(800, Math.round(current * 0.82)));
    } else {
      setSpend((current) => Math.min(6000, Math.round(current * 1.18)));
    }
  }

  async function saveToSupabase() {
    setSaveState(copy.saving);
    const response = await fetch("/api/profiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        profile: {
          age,
          save,
          spend,
          budgetMode,
          language,
          theme
        },
        projection: {
          years: Number(output.years.toFixed(1)),
          dayZeroAge: Number(output.dzAge.toFixed(1)),
          dayZeroDate: output.dzDate.toISOString(),
          target: Math.round(output.target),
          reclaimedHours: Math.max(0, output.hours)
        }
      })
    });

    const payload = (await response.json()) as { saved: boolean; message: string };

    if (response.status === 401) {
      setSaveState(copy.saveRequiresSignIn);
      return;
    }

    setSaveState(payload.message);
  }

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <a className="brand" href="#">
            <span className="dot"></span>
            {copy.brand}
            <small>{language === "zh" ? "自由日" : "Zero"}</small>
          </a>

          <div className="nav-links">
            <a href="#philosophy">{copy.nav.philosophy}</a>
            <a href="#calc">{copy.nav.dayZero}</a>
            <a href="#method">{copy.nav.method}</a>
            <a href="#voices">{copy.nav.voices}</a>
          </div>

          <div className="nav-cta">
            <div className="langtog" role="tablist" aria-label="Language">
              <button className={language === "zh" ? "on" : ""} onClick={() => setLanguage("zh")}>中</button>
              <button className={language === "en" ? "on" : ""} onClick={() => setLanguage("en")}>EN</button>
            </div>

            <button
              type="button"
              className="icon-btn"
              aria-label="Toggle theme"
              onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
            >
              {theme === "light" ? "◐" : "◑"}
            </button>

            {hasClerk ? <AuthControls language={language} /> : null}
          </div>
        </div>
      </nav>

      <main>
        <header className="hero" id="philosophy">
          <div>
            <span className="eyebrow"><span className="ln"></span>{copy.slogan}</span>
            <h1>
              {copy.title[0]}<br />
              {copy.title[1]}<br />
              <em>{copy.title[2]}</em>
            </h1>
            <p className="lede">{copy.lede}</p>

            <div className="hero-actions">
              <button
                type="button"
                className={`btn ghost ${budgetMode === "low" ? "mode-on" : ""}`}
                onClick={() => applyModePreset("low")}
              >
                {copy.lowBudgetLabel}
              </button>
              <button
                type="button"
                className={`btn ghost ${budgetMode === "full" ? "mode-on" : ""}`}
                onClick={() => applyModePreset("full")}
              >
                {copy.fullBudgetLabel}
              </button>
            </div>

            <p className="mode-copy">{budgetMode === "low" ? copy.lowBudgetCopy : copy.fullBudgetCopy}</p>
            <p className="mode-copy">{copy.freePlayHint}</p>
            {!hasClerk ? <p className="mode-copy auth-warning">{copy.authMissing}</p> : null}
          </div>

          <div className="dz-card">
            <div className="meta">
              <span>{copy.estimateLabel}</span>
            </div>
            <div className="foot">
              <div className="ct">
                <span className="n">{output.years.toFixed(1)}</span>
                <span className="u">{copy.estimateUnit}</span>
              </div>
              <div className="cap">{copy.estimateCaption}</div>
            </div>
          </div>
        </header>

        <div className="ticker">
          <div className="ticker-track">
            <span>{copy.ticker.join(" ✦ ")} ✦ {copy.ticker.join(" ✦ ")}</span>
          </div>
        </div>

        <section className="calc" id="calc">
          <div className="calc-head">
            <div>
              <div className="sect-label"><span className="num">02</span> — {copy.nav.dayZero}</div>
              <h2>{copy.calcTitle}</h2>
            </div>
            <div className="desc">{copy.calcDesc}</div>
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

              <button type="button" className="btn" onClick={saveToSupabase}>{copy.saveCta}</button>
              {saveState ? <p className="mode-copy">{saveState}</p> : null}
            </div>

            <div className="calc-out">
              <div className="k">{copy.estimateLabel}</div>
              <div className="age"><span className="n">{Math.round(output.dzAge)}</span><span className="u">{copy.estimateUnit}</span></div>
              <div className="yr">{copy.yearsToZero} {output.years.toFixed(1)}</div>

              <div className="row">
                <div className="cell">
                  <div className="k2">{copy.dateLabel}</div>
                  <div className="v2">{monthLabel(output.dzDate, language)}</div>
                </div>
                <div className="cell">
                  <div className="k2">{copy.reclaimedYears}</div>
                  <div className="v2">{Math.max(0, 65 - Math.round(output.dzAge))}</div>
                </div>
                <div className="cell">
                  <div className="k2">{copy.reclaimedHours}</div>
                  <div className="v2">{Math.max(0, output.hours).toLocaleString()}</div>
                </div>
                <div className="cell">
                  <div className="k2">Target</div>
                  <div className="v2">{money(Math.round(output.target), language)}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="manifesto" id="method">
          <div>
            <div className="sect-label"><span className="num">03</span> — {copy.nav.method}</div>
            <p>
              {language === "zh"
                ? "预算不是束缚，而是把时间从焦虑里解放出来的方法。Horizon 让你先确定自由的日期，再反推每个月要做的选择。"
                : "Budgeting is not constraint. It is how you reclaim time from anxiety. Horizon starts from your freedom date, then works backward into practical monthly choices."}
            </p>
          </div>
          <div>
            <div className="sect-label"><span className="num">05</span> — {copy.nav.voices}</div>
            <p>
              {language === "zh"
                ? "你可以先匿名体验整个测算流程。想保存输入和结果、获得后续个性化建议时，再登录即可。"
                : "Anyone can use the planner free. Sign-up and sign-in are only required when saving your scenarios and unlocking personalized follow-up."}
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
