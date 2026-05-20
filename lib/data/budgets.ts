export type BudgetMode = "low" | "balanced" | "full";

export const BUDGETS: Record<BudgetMode, { low: number; save: number; spend: number }> = {
  low: { low: 1, save: 1800, spend: 2100 },
  balanced: { low: 0, save: 2400, spend: 2800 },
  full: { low: 0, save: 3400, spend: 3800 },
};
