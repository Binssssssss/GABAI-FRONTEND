import api from '@/app/services/api';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { AppAlert } from '@/components/AppAlert';
import {
  EXPENSE_CATEGORIES,
  HistoryCategory,
  HistoryFilter,
  HistorySort,
  INCOME_CATEGORIES,
  historyCategoryOf,
} from '../constants/expenseCategories';
import { Transaction, TransactionType } from '../types';
import { dayKey, formatDayHeader } from '../utils/expenseHelpers';
import { hasErrors, parseAmount, validateTransaction } from '../utils/transactionValidation';

interface TransactionResponse {
  id: string;
  title: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  userId: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface WalletBalanceResponse {
  netBalance: number;
  totalIncome: number;
  totalExpenses: number;
}

const EMPTY_WALLET_BALANCE: WalletBalanceResponse = {
  netBalance: 0,
  totalIncome: 0,
  totalExpenses: 0,
};

/** How many History rows are shown at first, and added by "Load More". */
export const WALLET_PAGE_SIZE = 6;

/** One row of the History list: a day header or a transaction. */
export type HistoryRow =
  | { kind: 'header'; key: string; label: string }
  | { kind: 'item'; key: string; item: Transaction; showDate: boolean };

export interface CategorySummary {
  category: HistoryCategory;
  total: number;
  count: number;
}

// =========================
// HELPERS
// =========================

const toTransaction = (item: TransactionResponse): Transaction => ({
  id: item.id,
  title: item.title,
  amount: Number(item.amount),
  category: item.category,
  date: item.date,
  type: item.type,
});

const timeOf = (item: Transaction) => new Date(item.date).getTime() || 0;

// Newest first, by the transaction's own date.
const sortByDate = (list: Transaction[]): Transaction[] =>
  [...list].sort((a, b) => timeOf(b) - timeOf(a));

const sortHistory = (list: Transaction[], sort: HistorySort): Transaction[] => {
  const sorted = [...list];
  switch (sort) {
    case 'oldest':
      return sorted.sort((a, b) => timeOf(a) - timeOf(b));
    case 'highest':
      return sorted.sort((a, b) => b.amount - a.amount || timeOf(b) - timeOf(a));
    case 'lowest':
      return sorted.sort((a, b) => a.amount - b.amount || timeOf(b) - timeOf(a));
    default:
      return sorted.sort((a, b) => timeOf(b) - timeOf(a));
  }
};

// Add (sign = 1) or undo (sign = -1) a transaction on the balance.
const applyToBalance = (
  balance: WalletBalanceResponse,
  type: TransactionType,
  amount: number,
  sign: 1 | -1,
): WalletBalanceResponse => {
  const change = amount * sign;

  return type === 'income'
    ? {
        ...balance,
        totalIncome: balance.totalIncome + change,
        netBalance: balance.netBalance + change,
      }
    : {
        ...balance,
        totalExpenses: balance.totalExpenses + change,
        netBalance: balance.netBalance - change,
      };
};

// Never show the same transaction twice.
const withoutDuplicates = (list: Transaction[]): Transaction[] => {
  const seen = new Set<string>();
  return list.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

// =========================
// REQUESTS
// =========================

/**
 * Every transaction of the user. The History needs all of them so the
 * category chips, sorting and monthly totals are correct; "Load More"
 * only decides how many rows are shown.
 */
const fetchAllTransactions = async (): Promise<Transaction[]> => {
  try {
    const response = await api.get('/transactions');

    if (!response.data?.success) {
      throw new Error(response.data?.message ?? 'Could not load transactions.');
    }

    const data: TransactionResponse[] = Array.isArray(response.data.data)
      ? response.data.data
      : [];

    return sortByDate(data.map(toTransaction));
  } catch (error: any) {
    // No transactions yet.
    if (error?.response?.status === 404) return [];
    throw error;
  }
};

const fetchWalletBalance =
  async (): Promise<WalletBalanceResponse | null> => {
    try {
      const response = await api.get('/transactions/balance');

      return response.data.success ? response.data.data : null;
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.error('Failed to load wallet balance:', error);
      }

      return EMPTY_WALLET_BALANCE;
    }
  };

export function useExpensesData() {
  // Every transaction (plus ones still saving).
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // History controls
  const [filter, setFilterState] = useState<HistoryFilter>('All');
  const [sort, setSortState] = useState<HistorySort>('newest');
  const [visibleCount, setVisibleCount] = useState(WALLET_PAGE_SIZE);

  // Bumped on every reload, so late answers from an old load are ignored.
  const generationRef = useRef(0);

  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDate, setNewDate] = useState<Date>(() => new Date());

  const [transactionType, setTransactionType] =
    useState<TransactionType>('expense');

  const [newCategory, setNewCategory] = useState<string>(
    EXPENSE_CATEGORIES[0],
  );

  const [isAdding, setIsAdding] = useState(false);

  const [walletBalance, setWalletBalance] =
    useState<WalletBalanceResponse>(EMPTY_WALLET_BALANCE);

  // =========================
  // LOAD
  // =========================
  const loadWallet = useCallback(async () => {
    const generation = ++generationRef.current;

    try {
      const [list, balance] = await Promise.all([
        fetchAllTransactions(),
        fetchWalletBalance(),
      ]);

      if (generation !== generationRef.current) return;

      // Keep items that are still saving, so they don't flicker away.
      setTransactions((prev) =>
        withoutDuplicates(
          sortByDate([...prev.filter((item) => item.isPending), ...list]),
        ),
      );
      setLoadError(null);

      if (balance) setWalletBalance(balance);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      if (generation === generationRef.current) {
        setLoadError('Could not load your history.');
      }
    } finally {
      if (generation === generationRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  // Pull down to refresh.
  const refreshWallet = useCallback(async () => {
    setIsRefreshing(true);
    await loadWallet();
  }, [loadWallet]);

  // Load when the Wallet opens, and again every time the user comes
  // back to it, so changes made elsewhere show up right away.
  useFocusEffect(
    useCallback(() => {
      void loadWallet();
    }, [loadWallet]),
  );

  // =========================
  // HISTORY: FILTER, SORT, LOAD MORE
  // =========================
  const setFilter = useCallback((value: HistoryFilter) => {
    setFilterState(value);
    setVisibleCount(WALLET_PAGE_SIZE);
  }, []);

  const setSort = useCallback((value: HistorySort) => {
    setSortState(value);
    setVisibleCount(WALLET_PAGE_SIZE);
  }, []);

  const loadMore = useCallback(() => {
    setVisibleCount((count) => count + WALLET_PAGE_SIZE);
  }, []);

  const filtered = useMemo(
    () =>
      filter === 'All'
        ? transactions
        : transactions.filter((item) => historyCategoryOf(item) === filter),
    [transactions, filter],
  );

  const sorted = useMemo(() => sortHistory(filtered, sort), [filtered, sort]);

  const shownCount = Math.min(visibleCount, sorted.length);
  const hasMore = sorted.length > visibleCount;

  // Rows for the list. Date sorts are grouped by day; amount sorts are
  // one list (each row then shows its full date).
  const historyRows = useMemo<HistoryRow[]>(() => {
    const visible = sorted.slice(0, visibleCount);
    const byDate = sort === 'newest' || sort === 'oldest';

    if (!byDate) {
      return visible.map((item) => ({
        kind: 'item',
        key: item.id,
        item,
        showDate: true,
      }));
    }

    const rows: HistoryRow[] = [];
    let lastDay = '';
    for (const item of visible) {
      const day = dayKey(item.date);
      if (day !== lastDay) {
        rows.push({ kind: 'header', key: `day-${day}`, label: formatDayHeader(item.date) });
        lastDay = day;
      }
      rows.push({ kind: 'item', key: item.id, item, showDate: false });
    }
    return rows;
  }, [sorted, sort, visibleCount]);

  // "Food this month": total and count for the chosen category.
  const categorySummary = useMemo<CategorySummary | null>(() => {
    if (filter === 'All') return null;

    const now = new Date();
    let total = 0;
    let count = 0;
    for (const item of filtered) {
      const date = new Date(item.date);
      if (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      ) {
        total += item.amount;
        count += 1;
      }
    }
    return { category: filter, total, count };
  }, [filter, filtered]);

  // =========================
  // WALLET VALUES
  // =========================
  // Used by the Dashboard's money card.
  const totalIncome = walletBalance.totalIncome;
  const totalExpenses = walletBalance.totalExpenses;

  // Never show a negative balance.
  const netBalance = useMemo(
    () => Math.max(0, walletBalance.netBalance),
    [walletBalance.netBalance],
  );

  // =========================
  // TRANSACTION TYPE
  // =========================
  const handleTypeChange = useCallback(
    (type: TransactionType) => {
      setTransactionType(type);

      setNewCategory(
        type === 'expense'
          ? EXPENSE_CATEGORIES[0]
          : INCOME_CATEGORIES[0],
      );
    },
    [],
  );

  // =========================
  // ADD MODAL
  // =========================
  const openAddModal = useCallback(() => {
    setNewTitle('');
    setNewAmount('');
    setNewDate(new Date());
    setTransactionType('expense');
    setNewCategory(EXPENSE_CATEGORIES[0]);
    setIsAdding(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setIsAdding(false);
  }, []);

  // =========================
  // ADD TRANSACTION
  // =========================
  const handleAddTransaction = useCallback(async () => {
    // Same rules the form shows inline (amount, balance, title, date).
    const errors = validateTransaction({
      amount: newAmount,
      title: newTitle,
      date: newDate,
      type: transactionType,
      balance: netBalance,
    });
    if (hasErrors(errors)) return;

    const amount = Math.round(parseAmount(newAmount) * 100) / 100;

    // Show it right away (real-time); the server confirms it after.
    const title = newTitle.trim();
    const type = transactionType;
    const category = newCategory;
    const date = newDate;
    const tempId = `pending-${Date.now()}`;

    setTransactions((prev) =>
      sortByDate([
        {
          id: tempId,
          title,
          amount,
          category,
          date: date.toISOString(),
          type,
          isPending: true,
        },
        ...prev,
      ]),
    );
    setWalletBalance((prev) => applyToBalance(prev, type, amount, 1));

    setNewTitle('');
    setNewAmount('');
    setNewDate(new Date());
    setIsAdding(false);

    try {
      const response = await api.post('/transactions', {
        title,
        amount,
        type,
        category,

        // Send the selected transaction date
        date: date.toISOString(),
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message ?? 'Not saved');
      }

      const saved: TransactionResponse | undefined = response.data.data;

      // Swap the "Saving…" row for the saved one.
      setTransactions((prev) => {
        const rest = prev.filter((item) => item.id !== tempId);
        if (!saved?.id) return rest;
        return withoutDuplicates(sortByDate([toTransaction(saved), ...rest]));
      });

      // Quietly sync the exact totals from the server.
      fetchWalletBalance().then((balance) => {
        if (balance) setWalletBalance(balance);
      });
    } catch (error: any) {
      console.error(
        'Failed to create transaction:',
        error?.response?.data ||
          error?.message ||
          error,
      );

      // Undo the instant update.
      setTransactions((prev) => prev.filter((item) => item.id !== tempId));
      setWalletBalance((prev) => applyToBalance(prev, type, amount, -1));

      // Put the form back so the user can try again.
      setNewTitle(title);
      setNewAmount(String(amount));
      setNewDate(date);
      setTransactionType(type);
      setNewCategory(category);
      setIsAdding(true);

      // Show the backend's message (e.g. "Insufficient balance...")
      AppAlert.alert(
        'Unable to save',
        error?.response?.data?.message ?? 'Please try again.',
      );
    }
  }, [
    newTitle,
    newAmount,
    newDate,
    newCategory,
    transactionType,
    netBalance,
  ]);

  return {
    // History
    historyRows,
    filter,
    setFilter,
    sort,
    setSort,
    categorySummary,
    shownCount,
    totalCount: sorted.length,
    hasMore,
    loadMore,
    loadError,

    isRefreshing,
    refreshWallet,
    netBalance,
    totalIncome,
    totalExpenses,

    isLoading,
    isAdding,

    openAddModal,
    closeAddModal,

    newTitle,
    setNewTitle,

    newAmount,
    setNewAmount,

    newDate,
    setNewDate,

    transactionType,

    newCategory,
    setNewCategory,

    handleTypeChange,
    handleAddTransaction,
  };
}
