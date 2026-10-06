
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDrawer } from '@/app/(tabs)/_layout';
import { useAppTheme } from '@/app/context/ThemeContext';

import {
    AddTransactionModal,
    TransactionItem,
    WalletBalanceCard,
    WalletHeader,
} from './components';

import { useExpensesData } from './hooks/useExpensesData';
import { expenseStyles as styles } from './styles/expenses.styles';

export default function WalletScreen() {
  const { colors } = useAppTheme();

  // Theme Colors
  const primaryBrown = '#A97C50';

  const textPrimary = colors.text;
  const textSecondary = colors.icon;
  const cardBg = colors.surface;
  const borderCol = colors.border;
  const inputBg = colors.surfaceStrong;
  const bgTheme = colors.background;
  const successGreen = colors.success;
  const errorRed = colors.danger;

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
    newDate,
    setNewDate,
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
        date={newDate}
        onDateChange={setNewDate}
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

