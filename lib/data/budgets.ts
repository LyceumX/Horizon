export type BudgetMode = "low" | "balanced" | "full";

export const BUDGETS: Record<BudgetMode, {
  low: number;
  save: number;
  spend: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  currentSavings: number;
}> = {
  low:      { low: 1, save: 1800, spend: 2000, monthlyIncome: 7000,  monthlyExpenses: 5000,  currentSavings: 50000  },
  balanced: { low: 0, save: 2400, spend: 2800, monthlyIncome: 12000, monthlyExpenses: 9600,  currentSavings: 150000 },
  full:     { low: 0, save: 3400, spend: 4500, monthlyIncome: 22000, monthlyExpenses: 17500, currentSavings: 500000 },
};
