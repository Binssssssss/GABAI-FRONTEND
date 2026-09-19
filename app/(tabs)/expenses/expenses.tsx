
import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/app/context/ThemeContext';
import { useDrawer } from '@/app/(tabs)/_layout';

import {
  WalletHeader,
  WalletBalanceCard,
  TransactionItem,
  AddTransactionModal,
} from './components';

import { useExpensesData } from './hooks/useExpensesData';
import { expenseStyles as styles } from './styles/expenses.styles';

export default function WalletScreen() {
  const { colorScheme } = useAppTheme();

  const isDark = colorScheme === 'dark';

  // Theme Colors
  const primaryBrown = '#A97C50';

  const textPrimary = isDark
    ? '#ECEDEE'
    : '#11181C';

  const textSecondary = isDark
    ? '#9BA1A6'
    : '#666666';

  const cardBg = isDark
    ? '#1E1E1E'
    : '#F8FAFC';

  const borderCol = isDark
    ? '#2E2E2E'
    : '#E2E8F0';

  const inputBg = isDark
    ? '#121212'
    : '#FFFFFF';

  const bgTheme = isDark
    ? '#121212'
    : '#FFFFFF';

  const successGreen = '#10B981';
  const errorRed = '#EF4444';

  const { openDrawer } = useDrawer();

  const {
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
  } = useExpensesData();

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: bgTheme,
        },
      ]}
      edges={['top']}
    >
      {/* Header Section */}
      <WalletHeader
        onOpenDrawer={openDrawer}
        onOpenAddModal={openAddModal}
        textPrimary={textPrimary}
        primaryBrown={primaryBrown}
      />

      {/* Dashboard Balance Card */}
      <WalletBalanceCard
        netBalance={netBalance}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        cardBg={cardBg}
        borderCol={borderCol}
        textSecondary={textSecondary}
        successGreen={successGreen}
        errorRed={errorRed}
      />

      {/* Transactions List */}
      <Text
        style={[
          styles.sectionTitle,
          {
            color: textSecondary,
          },
        ]}
      >
        Recent Transactions
      </Text>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItem
            item={item}
            cardBg={cardBg}
            borderCol={borderCol}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            successGreen={successGreen}
            primaryBrown={primaryBrown}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text
              style={[
                styles.emptyText,
                {
                  color: textSecondary,
                },
              ]}
            >
              No transactions tracked yet.
            </Text>
          </View>
        }
      />

      {/* Transaction Add Modal */}
      <AddTransactionModal
        visible={isAdding}
        onClose={closeAddModal}
        title={newTitle}
        onTitleChange={setNewTitle}
        amount={newAmount}
        onAmountChange={setNewAmount}
        transactionType={transactionType}
        onTypeChange={handleTypeChange}
        category={newCategory}
        onCategoryChange={setNewCategory}
        onSubmit={handleAddTransaction}
        cardBg={cardBg}
        borderCol={borderCol}
        inputBg={inputBg}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        primaryBrown={primaryBrown}
        successGreen={successGreen}
        errorRed={errorRed}
      />
    </SafeAreaView>
  );
}

