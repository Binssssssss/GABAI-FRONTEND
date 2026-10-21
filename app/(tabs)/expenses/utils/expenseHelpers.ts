import { CATEGORY_STYLE, historyCategoryOf } from '../constants/expenseCategories';
import { TransactionType } from '../types';

/** Feather icon for a transaction's category. */
export const getTransactionIcon = (type: TransactionType, category: string): string =>
  CATEGORY_STYLE[historyCategoryOf({ type, category })].icon;

/** Color for a transaction's category. */
export const getCategoryColor = (type: TransactionType, category: string): string =>
  CATEGORY_STYLE[historyCategoryOf({ type, category })].color;

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** "5:14 PM" in the phone's local time. */
export const formatTransactionTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const hours = date.getHours();
  return `${hours % 12 || 12}:${String(date.getMinutes()).padStart(2, '0')} ${
    hours >= 12 ? 'PM' : 'AM'
  }`;
};

/**
 * "2026-10-13T17:14:00.331Z" -> "Today, 1:14 AM", "Yesterday, 5:14 PM"
 * or "Oct 12, 2026, 5:14 PM" (in the phone's local time).
 */
export const formatTransactionDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const time = formatTransactionTime(value);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return `Today, ${time}`;
  if (isSameDay(date, yesterday)) return `Yesterday, ${time}`;

  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}, ${time}`;
};

/** Day header for the History list: TODAY, YESTERDAY, OCT 13 (or OCT 13, 2025). */
export const formatDayHeader = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) return 'TODAY';
  if (isSameDay(date, yesterday)) return 'YESTERDAY';

  const label = `${MONTHS[date.getMonth()].toUpperCase()} ${date.getDate()}`;
  return date.getFullYear() === today.getFullYear()
    ? label
    : `${label}, ${date.getFullYear()}`;
};

/** Local calendar-day key, used to group the History list. */
export const dayKey = (value: string): string => {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};
