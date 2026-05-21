export type BudgetMode = "low" | "balanced" | "full";

export const BUDGETS: Record<BudgetMode, {
  low: number;
  save: number;
  spend: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}> = {
  low:      { low: 1, save: 1800, spend: 2100, monthlyIncome: 8000,  monthlyExpenses: 6200  },
  balanced: { low: 0, save: 2400, spend: 2800, monthlyIncome: 12000, monthlyExpenses: 9600  },
  full:     { low: 0, save: 3400, spend: 3800, monthlyIncome: 18000, monthlyExpenses: 14600 },
};
