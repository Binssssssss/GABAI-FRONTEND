import { useState, useEffect, useCallback, useMemo } from 'react';
import { localDb } from '@/app/services/localDb';
import { Transaction, TransactionType } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/expenseCategories';

export function useExpensesData() {
  const [transactions, setTransactionsState] = useState<Transaction[]>(() => localDb.getTransactions());

  const setTransactions = useCallback(
    (newTransactions: Transaction[] | ((prev: Transaction[]) => Transaction[])) => {
      const updated = typeof newTransactions === 'function' ? newTransactions(localDb.getTransactions()) : newTransactions;
      localDb.setTransactions(updated);
      setTransactionsState(updated);
    },
    []
  );

  useEffect(() => {
    const unsubscribe = localDb.subscribe(() => {
      setTransactionsState(localDb.getTransactions());
    });
    return unsubscribe;
  }, []);

  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [newCategory, setNewCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [isAdding, setIsAdding] = useState(false);

  // Computations
  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, item) => sum + item.amount, 0),
    [transactions]
  );

  const totalExpenses = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, item) => sum + item.amount, 0),
    [transactions]
  );

  const netBalance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);

  const handleTypeChange = useCallback((type: TransactionType) => {
    setTransactionType(type);
    setNewCategory(type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
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

  const handleAddTransaction = useCallback(() => {
    if (!newTitle.trim() || !newAmount) return;

    const transactionItem: Transaction = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      amount: parseFloat(newAmount) || 0,
      category: newCategory,
      date: 'Today',
      type: transactionType,
    };

    setTransactions((prev) => [transactionItem, ...prev]);
    setNewTitle('');
    setNewAmount('');
    setIsAdding(false);
  }, [newTitle, newAmount, newCategory, transactionType, setTransactions]);

  return {
    transactions,
    totalIncome,
    totalExpenses,
    netBalance,
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
  };
}
