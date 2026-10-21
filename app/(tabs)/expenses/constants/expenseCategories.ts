import { Transaction } from '../types';

/** Categories the user can pick when adding an expense or allowance. */
export const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Academics', 'Others'] as const;
export const INCOME_CATEGORIES = ['Allowance'] as const;

/** Chips above the History list. */
export const HISTORY_FILTERS = [
  'All',
  'Food',
  'Transport',
  'Academics',
  'Allowance',
  'Others',
] as const;

export type HistoryFilter = (typeof HISTORY_FILTERS)[number];
export type HistoryCategory = Exclude<HistoryFilter, 'All'>;

/** Icon (Feather) and color for each category. */
export const CATEGORY_STYLE: Record<HistoryCategory, { icon: string; color: string }> = {
  Food: { icon: 'coffee', color: '#F59E0B' },
  Transport: { icon: 'truck', color: '#38BDF8' },
  Academics: { icon: 'book-open', color: '#C084FC' },
  Allowance: { icon: 'gift', color: '#22C55E' },
  Others: { icon: 'more-horizontal', color: '#9BA1A6' },
};

/**
 * The History group a transaction belongs to.
 * Older categories (Job, Scholarship, ...) fall under Others.
 */
export const historyCategoryOf = (item: Pick<Transaction, 'type' | 'category'>): HistoryCategory => {
  if (item.type === 'income') {
    return item.category === 'Allowance' ? 'Allowance' : 'Others';
  }
  switch (item.category) {
    case 'Food':
    case 'Transport':
    case 'Academics':
      return item.category;
    default:
      return 'Others';
  }
};

export type HistorySort = 'newest' | 'oldest' | 'highest' | 'lowest';

export const HISTORY_SORTS: { value: HistorySort; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'highest', label: 'Highest amount' },
  { value: 'lowest', label: 'Lowest amount' },
];
