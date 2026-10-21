import {
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
  WalletHistoryControls,
} from './components';

import { HistoryRow, useExpensesData } from './hooks/useExpensesData';
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
    historyRows,
    filter,
    setFilter,
    sort,
    setSort,
    categorySummary,
    shownCount,
    totalCount,
    hasMore,
    loadMore,
    loadError,
    isLoading,
    isRefreshing,
    refreshWallet,
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

  const renderRow = ({ item: row }: { item: HistoryRow }) =>
    row.kind === 'header' ? (
      <Text style={[styles.dayHeader, { color: textSecondary }]}>{row.label}</Text>
    ) : (
      <TransactionItem
        item={row.item}
        showDate={row.showDate}
        cardBg={cardBg}
        borderCol={borderCol}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        successGreen={successGreen}
        errorRed={errorRed}
        primaryBrown={primaryBrown}
      />
    );

  const emptyText = loadError
    ? loadError
    : isLoading
      ? 'Loading…'
      : filter === 'All'
        ? 'No activity yet. Tap + to add money in or out.'
        : `No ${filter} transactions yet.`;

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

      <FlatList
        data={historyRows}
        keyExtractor={(row) => row.key}
        renderItem={renderRow}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshWallet}
            tintColor={primaryBrown}
            colors={[primaryBrown]}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Balance only */}
            <WalletBalanceCard
              netBalance={netBalance}
              textPrimary={textPrimary}
              cardBg={cardBg}
              borderCol={borderCol}
              textSecondary={textSecondary}
            />

            {/* History: sort, category chips, monthly total */}
            <WalletHistoryControls
              filter={filter}
              onFilterChange={setFilter}
              sort={sort}
              onSortChange={setSort}
              summary={categorySummary}
              cardBg={cardBg}
              borderCol={borderCol}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              primaryBrown={primaryBrown}
            />
          </View>
        }
        ListFooterComponent={
          totalCount > 0 ? (
            <View style={styles.loadMoreContainer}>
              {hasMore && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={loadMore}
                  style={[styles.loadMoreButton, { borderColor: primaryBrown }]}
                  accessibilityRole="button"
                >
                  <Text style={[styles.loadMoreText, { color: primaryBrown }]}>
                    Load More
                  </Text>
                </TouchableOpacity>
              )}
              <Text style={[styles.loadMoreCount, { color: textSecondary }]}>
                Showing {shownCount} of {totalCount}
                {filter !== 'All' ? ` · ${filter}` : ''}
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text
              style={[
                styles.emptyText,
                {
                  color: loadError ? errorRed : textSecondary,
                },
              ]}
            >
              {emptyText}
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
