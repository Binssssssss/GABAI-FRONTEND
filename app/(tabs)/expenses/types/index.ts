export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: TransactionType;
}

export type ExpenseCategory = 'Food' | 'Transport' | 'Academics' | 'Others' | string;
export type IncomeCategory = 'Allowance' | 'Job' | 'Scholarship' | 'Others' | string;
