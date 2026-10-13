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

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * "2026-10-13T17:14:00.331Z" -> "Today, 1:14 AM", "Yesterday, 5:14 PM"
 * or "Oct 12, 2026, 5:14 PM" (in the phone's local time).
 */
export const formatTransactionDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const hours = date.getHours();
  const time = `${hours % 12 || 12}:${String(date.getMinutes()).padStart(2, '0')} ${
    hours >= 12 ? 'PM' : 'AM'
  }`;

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return `Today, ${time}`;
  if (isSameDay(date, yesterday)) return `Yesterday, ${time}`;

  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}, ${time}`;
};
