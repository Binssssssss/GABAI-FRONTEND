import { TransactionType } from '../types';

export const TITLE_MIN = 2;
export const TITLE_MAX = 40;
export const AMOUNT_MAX = 1_000_000;

export interface TransactionInput {
  amount: string;
  title: string;
  date: Date;
  type: TransactionType;
  /** Current wallet balance (for Expenses). */
  balance: number;
}

export interface TransactionErrors {
  amount?: string;
  title?: string;
  date?: string;
}

/** "1,250.00" */
export const formatPeso = (value: number): string =>
  Math.abs(value)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/**
 * Keep only what an amount can hold: digits, one dot, up to 2 decimals,
 * and at most 7 whole digits.
 */
export const cleanAmountInput = (text: string): string => {
  let value = text.replace(/,/g, '.').replace(/[^0-9.]/g, '');

  const dot = value.indexOf('.');
  if (dot !== -1) {
    value =
      value.slice(0, dot + 1) +
      value.slice(dot + 1).replace(/\./g, '').slice(0, 2);
  }

  const [whole, decimals] = value.split('.');
  const trimmedWhole = whole.replace(/^0+(?=\d)/, '').slice(0, 7);
  return decimals !== undefined ? `${trimmedWhole || '0'}.${decimals}` : trimmedWhole;
};

export const parseAmount = (text: string): number => {
  const value = parseFloat(text);
  return Number.isFinite(value) ? value : 0;
};

const endOfToday = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

/** Errors per field; an empty object means the form can be saved. */
export const validateTransaction = ({
  amount,
  title,
  date,
  type,
  balance,
}: TransactionInput): TransactionErrors => {
  const errors: TransactionErrors = {};
  const value = parseAmount(amount);

  if (value <= 0) {
    errors.amount = 'Enter an amount greater than ₱0.';
  } else if (value > AMOUNT_MAX) {
    errors.amount = `Amount is too large (max ₱${formatPeso(AMOUNT_MAX)}).`;
  } else if (type === 'expense' && value > Math.max(0, balance)) {
    errors.amount = `Not enough balance. You only have ₱${formatPeso(Math.max(0, balance))}.`;
  }

  if (title.trim().length < TITLE_MIN) {
    errors.title = `Tell what it is for (at least ${TITLE_MIN} letters).`;
  } else if (title.trim().length > TITLE_MAX) {
    errors.title = `Keep it within ${TITLE_MAX} characters.`;
  }

  // Past dates are fine; only the future is blocked.
  if (Number.isNaN(date.getTime())) {
    errors.date = 'Pick a date.';
  } else if (date.getTime() > endOfToday().getTime()) {
    errors.date = "Date can't be in the future.";
  }

  return errors;
};

export const hasErrors = (errors: TransactionErrors): boolean =>
  Boolean(errors.amount || errors.title || errors.date);
