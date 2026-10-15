export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: TransactionType;
  /** Shown right away while the server is still saving it. */
  isPending?: boolean;
}

export type ExpenseCategory = 'Food' | 'Transport' | 'Academics' | 'Others' | string;
export type IncomeCategory = 'Allowance' | 'Job' | 'Scholarship' | 'Others' | string;
