import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/app/services/api';
import { Transaction, TransactionType } from '../types';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '../constants/expenseCategories';

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

export function useExpensesData() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [transactionType, setTransactionType] =
    useState<TransactionType>('expense');
  const [newCategory, setNewCategory] = useState<string>(
    EXPENSE_CATEGORIES[0],
  );
  const [isAdding, setIsAdding] = useState(false);

  const [walletBalance, setWalletBalance] =
    useState<WalletBalanceResponse>({
      netBalance: 0,
      totalIncome: 0,
      totalExpenses: 0,
    });

  const loadTransactions = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await api.get('/api/transactions');

      if (response.data.success) {
        const data: TransactionResponse[] = response.data.data;

        const mappedTransactions: Transaction[] = data.map((item) => ({
          id: item.id,
          title: item.title,
          amount: Number(item.amount),
          category: item.category,
          date: item.date,
          type: item.type,
        }));

        setTransactions(mappedTransactions);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadWalletBalance = useCallback(async () => {
    try {
      const response = await api.get('/api/transactions/balance');

      if (response.data.success) {
        setWalletBalance(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
    }
  }, []);

  const refreshWallet = useCallback(async () => {
    await Promise.all([
      loadTransactions(),
      loadWalletBalance(),
    ]);
  }, [loadTransactions, loadWalletBalance]);

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      void refreshWallet();
    }, 0);

    return () => clearTimeout(loadTimer);
  }, [refreshWallet]);

  const totalIncome = useMemo(
    () => walletBalance.totalIncome,
    [walletBalance.totalIncome],
  );

  const totalExpenses = useMemo(
    () => walletBalance.totalExpenses,
    [walletBalance.totalExpenses],
  );

  const netBalance = useMemo(
    () => walletBalance.netBalance,
    [walletBalance.netBalance],
  );

  const handleTypeChange = useCallback((type: TransactionType) => {
    setTransactionType(type);

    setNewCategory(
      type === 'expense'
        ? EXPENSE_CATEGORIES[0]
        : INCOME_CATEGORIES[0],
    );
  }, []);

  const openAddModal = useCallback(() => {
    setNewTitle('');
    setNewAmount('');
    setTransactionType('expense');
    setNewCategory(EXPENSE_CATEGORIES[0]);
    setIsAdding(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setIsAdding(false);
  }, []);

  const handleAddTransaction = useCallback(async () => {
    if (!newTitle.trim() || !newAmount) {
      return;
    }

    const amount = parseFloat(newAmount);

    if (Number.isNaN(amount) || amount <= 0) {
      return;
    }

    try {
      const response = await api.post('/api/transactions', {
        title: newTitle.trim(),
        amount,
        type: transactionType,
        category: newCategory,
      });

      if (response.data.success) {
        setNewTitle('');
        setNewAmount('');
        setIsAdding(false);

        await refreshWallet();
      }
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  }, [
    newTitle,
    newAmount,
    newCategory,
    transactionType,
    refreshWallet,
  ]);

  return {
    transactions,

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

    transactionType,

    newCategory,
    setNewCategory,

    handleTypeChange,
    handleAddTransaction,

    refreshWallet,
  };
}