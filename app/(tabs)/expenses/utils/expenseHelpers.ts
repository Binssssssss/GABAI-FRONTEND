import { TransactionType } from '../types';

export const getTransactionIcon = (type: TransactionType, category: string): string => {
  if (type === 'income') {
    if (category === 'Allowance') return 'gift';
    if (category === 'Job') return 'briefcase';
    if (category === 'Scholarship') return 'award';
    return 'arrow-down-left';
  } else {
    if (category === 'Food') return 'coffee';
    if (category === 'Transport') return 'truck';
    if (category === 'Academics') return 'book-open';
    return 'arrow-up-right';
  }
};
