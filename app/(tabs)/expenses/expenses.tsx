import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDrawer } from '@/app/(tabs)/_layout';
import { useAppTheme } from '@/app/context/ThemeContext';

import {
    AddTransactionModal,
    TransactionItem,
    WalletBalanceCard,
    WalletHeader,
} from './components';

import { useExpensesData, WALLET_PAGE_SIZE } from './hooks/useExpensesData';
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
    hasMore,
    isLoadingMore,
    loadMoreError,
    loadMore,
    isRefreshing,
    refreshWallet,
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
        textPrimary={textPrimary}
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
        Recent Activity
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
            errorRed={errorRed}
            primaryBrown={primaryBrown}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshWallet}
            tintColor={primaryBrown}
            colors={[primaryBrown]}
          />
        }
        ListFooterComponent={
          loadMoreError ? (
            // Keep what is shown; let the user try again.
            <View style={styles.loadMoreContainer}>
              <Text style={[styles.loadMoreCount, { color: errorRed, marginBottom: 8 }]}>
                {loadMoreError}
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={loadMore}
                style={[styles.loadMoreButton, { borderColor: primaryBrown }]}
                accessibilityRole="button"
              >
                <Text style={[styles.loadMoreText, { color: primaryBrown }]}>
                  Try again
                </Text>
              </TouchableOpacity>
            </View>
          ) : hasMore ? (
            <View style={styles.loadMoreContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={loadMore}
                disabled={isLoadingMore}
                style={[styles.loadMoreButton, { borderColor: primaryBrown }]}
                accessibilityRole="button"
                accessibilityState={{ busy: isLoadingMore }}
              >
                {isLoadingMore ? (
                  <ActivityIndicator size="small" color={primaryBrown} />
                ) : (
                  <Text style={[styles.loadMoreText, { color: primaryBrown }]}>
                    Load More
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : transactions.length > WALLET_PAGE_SIZE ? (
            <Text style={[styles.loadMoreCount, { color: textSecondary }]}>
              You've reached the end
            </Text>
          ) : null
        }
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
              No activity yet. Tap + to add money in or out.
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