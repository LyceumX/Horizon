"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateHorizonDay1, type PlannerInput, type PlannerResult } from "@/lib/planner";
import { AuthControls } from "@/components/auth-controls";

type FormState = PlannerInput & {
  sex: string;
  dependents: number;
};

type Language = "en" | "zh";

type Copy = {
  brand: string;
  slogan: string;
  intro: string;
  modeLabel: string;
  modeHelp: string;
  lowBudgetLabel: string;
  lowBudgetCopy: string;
  fullBudgetLabel: string;
  fullBudgetCopy: string;
  formTitle: string;
  formHint: string;
  authLabel: string;
  signIn: string;
  signUp: string;
  signOutHint: string;
  saveRequiresSignIn: string;
  calculate: string;
  save: string;
  saving: string;
  inputs: {
    age: string;
    city: string;
    sex: string;
    maritalStatus: string;
    dependents: string;
    currentSavings: string;
    monthlyIncome: string;
    monthlyExpenses: string;
    monthlyTargetSpendAtRetirement: string;
    annualReturnRate: string;
    annualInflationRate: string;
    multiplier: string;
  };
  results: {
    title: string;
    horizonDay1: string;
    yearsToGoal: string;
    requiredNestEgg: string;
    currentMonthlySurplus: string;
    additionalMonthlyGap: string;
    assumptions: string;
  };
  footnote: string;
};

const DEFAULTS: FormState = {
  age: 30,
  city: "Shanghai",
  sex: "Prefer not to say",
  maritalStatus: "Single",
  dependents: 0,
  currentSavings: 250000,
  monthlyIncome: 30000,
  monthlyExpenses: 16000,
  monthlyTargetSpendAtRetirement: 18000,
  annualReturnRate: 0.06,
  annualInflationRate: 0.025,
  multiplier: 25
};

const COPY: Record<Language, Copy> = {
  en: {
    brand: "Horizon Zero",
    slogan: "Plan the date, not the fantasy.",
    intro:
      "Horizon Zero helps you calculate a real Day1 for a sustainable life. Model your spending, savings, and scenario choices, then adjust the path until freedom becomes practical.",
    modeLabel: "Freedom mode",
    modeHelp: "Choose the path that fits your life strategy.",
    lowBudgetLabel: "Low-budget freedom",
    lowBudgetCopy: "Reduce desire, simplify spending, and reach Day1 sooner.",
    fullBudgetLabel: "Full-budget freedom",
    fullBudgetCopy: "Keep a higher lifestyle standard and close the gap with income plus savings.",
    formTitle: "Calculate your Horizon Day1",
    formHint: "Edit your inputs, then calculate a projected date and the savings gap.",
    authLabel: "Account",
    signIn: "Sign in",
    signUp: "Create account",
    signOutHint: "Signed in users can save scenarios to Supabase.",
    saveRequiresSignIn: "Sign in to save this scenario.",
    calculate: "Calculate Day1",
    save: "Save Scenario",
    saving: "Saving...",
    inputs: {
      age: "Age",
      city: "City",
      sex: "Sex",
      maritalStatus: "Marital status",
      dependents: "Dependents",
      currentSavings: "Current savings",
      monthlyIncome: "Monthly income",
      monthlyExpenses: "Monthly expenses",
      monthlyTargetSpendAtRetirement: "Monthly target spend at Day1",
      annualReturnRate: "Annual return rate (decimal)",
      annualInflationRate: "Annual inflation rate (decimal)",
      multiplier: "Safety multiplier (20-35)"
    },
    results: {
      title: "Plan summary",
      horizonDay1: "Horizon Day1",
      yearsToGoal: "Years to goal",
      requiredNestEgg: "Required nest egg",
      currentMonthlySurplus: "Current monthly surplus",
      additionalMonthlyGap: "Additional monthly gap",
      assumptions: "Assumptions"
    },
    footnote:
      "This tool is educational and planning-oriented only. It does not provide tax, legal, or investment advice."
  },
  zh: {
    brand: "Horizon Zero",
    slogan: "先定日期，再谈自由。",
    intro:
      "Horizon Zero 帮你计算一个真实可达的 Day1：当你的预算、储蓄和生活目标终于能稳定支持自由生活的那一天。",
    modeLabel: "自由模式",
    modeHelp: "选择最符合你人生策略的路径。",
    lowBudgetLabel: "低预算自由",
    lowBudgetCopy: "降低欲望、简化生活，更早抵达 Day1。",
    fullBudgetLabel: "全预算自由",
    fullBudgetCopy: "保留更高生活标准，用收入与储蓄去缩小缺口。",
    formTitle: "计算你的 Horizon Day1",
    formHint: "调整输入项，即可得到预计日期和储蓄缺口。",
    authLabel: "账户",
    signIn: "登录",
    signUp: "注册",
    signOutHint: "登录后即可将方案保存到 Supabase。",
    saveRequiresSignIn: "请先登录后再保存方案。",
    calculate: "计算 Day1",
    save: "保存方案",
    saving: "保存中...",
    inputs: {
      age: "年龄",
      city: "城市",
      sex: "性别",
      maritalStatus: "婚姻状态",
      dependents: "抚养人数",
      currentSavings: "当前储蓄",
      monthlyIncome: "月收入",
      monthlyExpenses: "月支出",
      monthlyTargetSpendAtRetirement: "Day1 目标月花费",
      annualReturnRate: "年化收益率（小数）",
      annualInflationRate: "年化通胀率（小数）",
      multiplier: "安全倍数（20-35）"
    },
    results: {
      title: "方案摘要",
      horizonDay1: "Horizon Day1",
      yearsToGoal: "距离目标年数",
      requiredNestEgg: "所需本金",
      currentMonthlySurplus: "当前每月结余",
      additionalMonthlyGap: "还需补足的月度缺口",
      assumptions: "假设条件"
    },
    footnote:
      "本工具仅用于教育与规划，不构成税务、法律或投资建议。"
  }
};

function formatMoney(value: number, language: Language) {
  return new Intl.NumberFormat(language === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency: language === "zh" ? "CNY" : "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function formatPercent(value: number, language: Language) {
  return `${Math.round(value * 1000) / 10}${language === "zh" ? "%" : "%"}`;
}

export default function HomePage() {
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [result, setResult] = useState<PlannerResult | null>(null);
  const [saveState, setSaveState] = useState<string>("");
  const [language, setLanguage] = useState<Language>("en");
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

  const monthlyFreedomGap = useMemo(() => form.monthlyIncome - form.monthlyTargetSpendAtRetirement, [form]);
  const copy = COPY[language];

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(calculateHorizonDay1(form));
    setSaveState("");
  }

  async function saveToSupabase() {
    if (!result) {
      return;
    }

    setSaveState(copy.saving);
    const response = await fetch("/api/profiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        profile: form,
        projection: result
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
    <main>
      <header className="topbar">
        <div>
          <span className="eyebrow">Horizon Zero</span>
          <h1>{copy.brand}</h1>
        </div>
        <div className="topbar-actions">
          {hasClerk ? <AuthControls copy={copy} /> : null}
          <button
            type="button"
            className="lang-toggle"
            onClick={() => setLanguage((current) => (current === "en" ? "zh" : "en"))}
            aria-label="Toggle language"
          >
            {language === "en" ? "EN / CN" : "CN / EN"}
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="hero-kicker">{copy.slogan}</p>
          <p>{copy.intro}</p>
        </div>
        <div className="hero-cards">
          <article className="stat-card stat-card-dark">
            <h2>{copy.modeLabel}</h2>
            <p>{copy.modeHelp}</p>
          </article>
          <article className="stat-card">
            <h2>{copy.lowBudgetLabel}</h2>
            <p>{copy.lowBudgetCopy}</p>
          </article>
          <article className="stat-card">
            <h2>{copy.fullBudgetLabel}</h2>
            <p>{copy.fullBudgetCopy}</p>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>{copy.formTitle}</h2>
            <p className="small">{copy.formHint}</p>
          </div>
          <div className="language-chip">{language === "en" ? "English" : "中文"}</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid">
            <div>
              <label htmlFor="age">{copy.inputs.age}</label>
              <input id="age" type="number" value={form.age} onChange={(e) => setField("age", Number(e.target.value))} />
            </div>
            <div>
              <label htmlFor="city">{copy.inputs.city}</label>
              <input id="city" value={form.city} onChange={(e) => setField("city", e.target.value)} />
            </div>
            <div>
              <label htmlFor="sex">{copy.inputs.sex}</label>
              <select id="sex" value={form.sex} onChange={(e) => setField("sex", e.target.value)}>
                <option>{language === "en" ? "Prefer not to say" : "不透露"}</option>
                <option>{language === "en" ? "Female" : "女性"}</option>
                <option>{language === "en" ? "Male" : "男性"}</option>
              </select>
            </div>
            <div>
              <label htmlFor="maritalStatus">{copy.inputs.maritalStatus}</label>
              <input id="maritalStatus" value={form.maritalStatus} onChange={(e) => setField("maritalStatus", e.target.value)} />
            </div>
            <div>
              <label htmlFor="dependents">{copy.inputs.dependents}</label>
              <input id="dependents" type="number" value={form.dependents} onChange={(e) => setField("dependents", Number(e.target.value))} />
            </div>
            <div>
              <label htmlFor="currentSavings">{copy.inputs.currentSavings}</label>
              <input id="currentSavings" type="number" value={form.currentSavings} onChange={(e) => setField("currentSavings", Number(e.target.value))} />
            </div>
            <div>
              <label htmlFor="monthlyIncome">{copy.inputs.monthlyIncome}</label>
              <input id="monthlyIncome" type="number" value={form.monthlyIncome} onChange={(e) => setField("monthlyIncome", Number(e.target.value))} />
            </div>
            <div>
              <label htmlFor="monthlyExpenses">{copy.inputs.monthlyExpenses}</label>
              <input id="monthlyExpenses" type="number" value={form.monthlyExpenses} onChange={(e) => setField("monthlyExpenses", Number(e.target.value))} />
            </div>
            <div>
              <label htmlFor="monthlyTarget">{copy.inputs.monthlyTargetSpendAtRetirement}</label>
              <input
                id="monthlyTarget"
                type="number"
                value={form.monthlyTargetSpendAtRetirement}
                onChange={(e) => setField("monthlyTargetSpendAtRetirement", Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="annualReturnRate">{copy.inputs.annualReturnRate}</label>
              <input
                id="annualReturnRate"
                type="number"
                step="0.001"
                value={form.annualReturnRate}
                onChange={(e) => setField("annualReturnRate", Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="annualInflationRate">{copy.inputs.annualInflationRate}</label>
              <input
                id="annualInflationRate"
                type="number"
                step="0.001"
                value={form.annualInflationRate}
                onChange={(e) => setField("annualInflationRate", Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="multiplier">{copy.inputs.multiplier}</label>
              <input id="multiplier" type="number" value={form.multiplier} onChange={(e) => setField("multiplier", Number(e.target.value))} />
            </div>
          </div>

          <p className="small">
            {language === "en"
              ? `Monthly freedom spread (income - Day1 lifestyle): ${formatMoney(monthlyFreedomGap, language)}`
              : `每月自由结余（收入 - Day1 生活方式）：${formatMoney(monthlyFreedomGap, language)}`}
          </p>
          <button type="submit">{copy.calculate}</button>
          <button type="button" onClick={saveToSupabase} disabled={!result}>
            {copy.save}
          </button>
          {saveState ? <p className="small">{saveState}</p> : null}
        </form>

        {result ? (
          <div className="results">
            <article className="metric">
              <h3>{copy.results.horizonDay1}</h3>
              <p>{result.horizonDay1}</p>
            </article>
            <article className="metric">
              <h3>{copy.results.yearsToGoal}</h3>
              <p>{result.yearsToGoal}</p>
            </article>
            <article className="metric">
              <h3>{copy.results.requiredNestEgg}</h3>
              <p>{formatMoney(result.requiredNestEgg, language)}</p>
            </article>
            <article className="metric">
              <h3>{copy.results.currentMonthlySurplus}</h3>
              <p>{formatMoney(result.monthlySurplus, language)}</p>
            </article>
            <article className="metric">
              <h3>{copy.results.additionalMonthlyGap}</h3>
              <p>{formatMoney(result.monthlyGapToSave, language)}</p>
            </article>
            <article className="metric">
              <h3>{copy.results.assumptions}</h3>
              <p className="small">
                {language === "en"
                  ? `Return ${formatPercent(result.assumptions.annualReturnRate, language)} | Inflation ${formatPercent(result.assumptions.annualInflationRate, language)} | Multiplier ${result.assumptions.multiplier}x`
                  : `收益率 ${formatPercent(result.assumptions.annualReturnRate, language)} | 通胀 ${formatPercent(result.assumptions.annualInflationRate, language)} | 倍数 ${result.assumptions.multiplier}x`}
              </p>
            </article>
          </div>
        ) : null}

        <p className="footnote">{copy.footnote}</p>
      </section>
    </main>
  );
}
