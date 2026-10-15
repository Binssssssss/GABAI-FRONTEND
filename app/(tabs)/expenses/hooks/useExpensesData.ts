import api from '@/app/services/api';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { AppAlert } from '@/components/AppAlert';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '../constants/expenseCategories';
import { Transaction, TransactionType } from '../types';

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

// =========================
// REQUESTS
// =========================
// These only fetch and return data; the hook sets state once
// they settle. `null` means "keep the current value".

const toTransaction = (item: TransactionResponse): Transaction => ({
  id: item.id,
  title: item.title,
  amount: Number(item.amount),
  category: item.category,
  date: item.date,
  type: item.type,
});

// Newest first, by the transaction's own date.
const sortByDate = (list: Transaction[]): Transaction[] =>
  [...list].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

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

/** How many transactions the Wallet shows per page. */
export const WALLET_PAGE_SIZE = 6;

interface TransactionPageResult {
  items: Transaction[];
  hasMore: boolean;
  /** false when the backend is older and sent every transaction at once. */
  paged: boolean;
}

// Never show the same transaction twice.
const withoutDuplicates = (list: Transaction[]): Transaction[] => {
  const seen = new Set<string>();
  return list.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

/**
 * One page of transactions, newest first. The backend sorts and pages
 * them in the database (GET /transactions?limit=6&offset=…).
 */
const fetchTransactionPage = async (
  offset: number,
): Promise<TransactionPageResult> => {
  try {
    const response = await api.get('/transactions', {
      params: { limit: WALLET_PAGE_SIZE, offset },
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message ?? 'Could not load transactions.');
    }

    const data: TransactionResponse[] = Array.isArray(response.data.data)
      ? response.data.data
      : [];
    const pagination = response.data.pagination;

    if (pagination && typeof pagination.hasMore === 'boolean') {
      return {
        items: data.map(toTransaction),
        hasMore: pagination.hasMore,
        paged: true,
      };
    }

    // Older backend without paging: it sent everything at once.
    return {
      items: sortByDate(data.map(toTransaction)),
      hasMore: false,
      paged: false,
    };
  } catch (error: any) {
    // No transactions yet.
    if (error?.response?.status === 404) {
      return { items: [], hasMore: false, paged: true };
    }
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
  // Every transaction loaded so far (plus ones still saving).
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Paging
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  // Only used with an older backend that sends everything at once.
  const [visibleCount, setVisibleCount] = useState(WALLET_PAGE_SIZE);

  const isPagedRef = useRef(true);
  // How many saved transactions are loaded = offset of the next page.
  const serverCountRef = useRef(0);
  const loadingMoreRef = useRef(false);
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
  // LOAD THE NEWEST PAGE
  // =========================
  // Also used for refresh: it starts paging over from the top.
  const loadFirstPage = useCallback(async () => {
    const generation = ++generationRef.current;

    try {
      const [page, balance] = await Promise.all([
        fetchTransactionPage(0),
        fetchWalletBalance(),
      ]);

      if (generation !== generationRef.current) return;

      isPagedRef.current = page.paged;
      serverCountRef.current = page.items.length;

      // Keep items that are still saving, so they don't flicker away.
      setTransactions((prev) =>
        withoutDuplicates([
          ...prev.filter((item) => item.isPending),
          ...page.items,
        ]),
      );
      setHasMore(page.hasMore);
      setVisibleCount(WALLET_PAGE_SIZE);
      setLoadMoreError(null);

      if (balance) setWalletBalance(balance);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      if (generation === generationRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  // =========================
  // REFRESH (pull down)
  // =========================
  const refreshWallet = useCallback(async () => {
    setIsRefreshing(true);
    await loadFirstPage();
  }, [loadFirstPage]);

  // Load when the Wallet opens, and again every time the user comes
  // back to it, so changes made elsewhere show up right away.
  useFocusEffect(
    useCallback(() => {
      void loadFirstPage();
    }, [loadFirstPage]),
  );

  // =========================
  // LOAD MORE (next 6)
  // =========================
  const loadMore = useCallback(async () => {
    // One request at a time, however often the button is tapped.
    if (loadingMoreRef.current) return;

    if (!isPagedRef.current) {
      setVisibleCount((count) => count + WALLET_PAGE_SIZE);
      return;
    }

    if (!hasMore) return;

    loadingMoreRef.current = true;
    setIsLoadingMore(true);
    setLoadMoreError(null);

    const generation = generationRef.current;

    try {
      const page = await fetchTransactionPage(serverCountRef.current);

      // A refresh started meanwhile; its result wins.
      if (generation !== generationRef.current) return;

      serverCountRef.current += page.items.length;

      // Add to the end; never replace what is already shown.
      setTransactions((prev) => withoutDuplicates([...prev, ...page.items]));
      setHasMore(page.hasMore);
    } catch (error) {
      console.error('Failed to load more transactions:', error);
      setLoadMoreError('Could not load more transactions.');
    } finally {
      loadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [hasMore]);

  // What the list shows.
  const visibleTransactions = useMemo(
    () =>
      isPagedRef.current
        ? transactions
        : transactions.slice(0, visibleCount),
    // isPagedRef only changes together with `transactions`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transactions, visibleCount],
  );

  const canLoadMore = isPagedRef.current
    ? hasMore
    : transactions.length > visibleCount;

  // =========================
  // WALLET VALUES
  // =========================
  const totalIncome = useMemo(
    () => walletBalance.totalIncome,
    [walletBalance.totalIncome],
  );

  const totalExpenses = useMemo(
    () => walletBalance.totalExpenses,
    [walletBalance.totalExpenses],
  );

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
  // OPEN ADD MODAL
  // =========================
  const openAddModal = useCallback(() => {
    setNewTitle('');
    setNewAmount('');
    setNewDate(new Date());
    setTransactionType('expense');
    setNewCategory(EXPENSE_CATEGORIES[0]);
    setIsAdding(true);
  }, []);

  // =========================
  // CLOSE ADD MODAL
  // =========================
  const closeAddModal = useCallback(() => {
    setIsAdding(false);
  }, []);

  // =========================
  // ADD TRANSACTION
  // =========================
  const handleAddTransaction = useCallback(async () => {
    if (!newTitle.trim() || !newAmount) {
      return;
    }

    const amount = parseFloat(newAmount);

    if (Number.isNaN(amount) || amount <= 0) {
      return;
    }

    // Stop an expense that is bigger than the wallet balance.
    if (transactionType === 'expense' && amount > netBalance) {
      AppAlert.alert(
        'Insufficient balance',
        `You only have ₱${netBalance.toFixed(2)} left. Add income first or lower the amount.`,
      );
      return;
    }

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

        const savedItem = toTransaction(saved);
        const savedRows = rest.filter((item) => !item.isPending);
        const oldestLoaded = savedRows[savedRows.length - 1];

        // An older date that belongs to a page not loaded yet:
        // it will come with "Load more" instead.
        if (
          isPagedRef.current &&
          hasMore &&
          oldestLoaded &&
          new Date(savedItem.date).getTime() <
            new Date(oldestLoaded.date).getTime()
        ) {
          return rest;
        }

        // It now sits inside the loaded pages, so the next page starts one later.
        if (isPagedRef.current) serverCountRef.current += 1;

        return withoutDuplicates(sortByDate([savedItem, ...rest]));
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

      console.error(
        'Status:',
        error?.response?.status,
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
    hasMore,
  ]);

  return {
    transactions: visibleTransactions,
    hasMore: canLoadMore,
    isLoadingMore,
    loadMoreError,
    loadMore,
    isRefreshing,

    totalIncome,
    totalExpenses,
    netBalance,

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

    refreshWallet,
  };
}