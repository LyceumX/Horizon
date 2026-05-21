export type Copy = {
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

export const GLOBAL_COPY: Copy = {
  brand: "Meet Your Freedom Date.",
  since: "Since 2026",
  nav: { summary: "Summary", customize: "Customize", budget: "Budget Plans", stories: "Real-life Stories" },
  goal: "Retire with clarity, not spreadsheets.",
  slogan: "Enter your income and goals — see your retirement date instantly. Every adjustment brings freedom one step closer.",
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
    governmentDisciplined: "Government (disciplined)",
  },
  gender: "Retirement category",
  genderOptions: {
    male: "Male (general)",
    femalePro: "Female (cadre / professional)",
    femaleWorker: "Female (blue-collar)",
    specialMale: "Special work (male)",
    specialFemale: "Special work (female)",
  },
  defaultRetireLabel: "Local statutory retirement",
  defaultRetireValue: "Default retirement age",
  yearsSavedLabel: "Average users save",
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
    note: "Note",
  },
  currentSavings: "Current savings",
  monthlyIncome: "Monthly after-tax income",
  monthlyExpenses: "Monthly expenses",
  nestEgg: "Required nest egg",
  monthlySurplus: "Monthly surplus",
  monthlyGap: "Monthly savings gap",
  horizonDate: "Day 1 date",
  scenarioLabel: "Scenario",
  scenarioBase: "Base",
  scenarioOptimistic: "Optimistic",
  scenarioStress: "Stress",
  assumptionsTitle: "Assumptions",
  returnRateLabel: "Annual return rate",
  inflationRateLabel: "Annual inflation rate",
  multiplierLabel: "Safe withdrawal multiple",
  pensionIncome: "Expected monthly pension / social security (optional)",
  storiesTitle: "Best Practices",
  storiesLead: "Follow playbooks from people who saved years. Share your own and grow together (coming soon).",
  stories: [
    {
      name: "Lina W.",
      role: "Product Lead · Shanghai",
      image: "/assets/Stories_image_1.webp",
      text: "Horizon turned a vague goal into a date, then a plan I could actually follow.",
    },
    {
      name: "Jun K.",
      role: "Engineer · Shenzhen",
      image: "/assets/Stories_image_2.jpeg",
      text: "The plan showed me where I could save years without feeling deprived.",
    },
    {
      name: "Maya C.",
      role: "Designer · Hangzhou",
      image: "/assets/Stories_image_3.jpg",
      text: "Different strategy, same freedom date. The tracker kept me focused.",
    },
    {
      name: "Arun P.",
      role: "Founder · Singapore",
      image: "/assets/Stories_image_4.jpg",
      text: "I started local, then shared my playbook with others and refined it.",
    }
  ]
};
