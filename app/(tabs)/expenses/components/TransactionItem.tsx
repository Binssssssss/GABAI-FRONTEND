import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Transaction } from '../types';
import {
  formatTransactionDate,
  formatTransactionTime,
  getCategoryColor,
  getTransactionIcon,
} from '../utils/expenseHelpers';
import { expenseStyles as styles } from '../styles/expenses.styles';

interface TransactionItemProps {
  item: Transaction;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  successGreen: string;
  errorRed?: string;
  primaryBrown: string;
  /** Show the full date (when the list isn't grouped by day). */
  showDate?: boolean;
}

export default function TransactionItem({
  item,
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  successGreen,
  errorRed = '#EF4444',
  primaryBrown,
  showDate = false,
}: TransactionItemProps) {
  const isIncome = item.type === 'income';
  const iconName = getTransactionIcon(item.type, item.category);
  const color = getCategoryColor(item.type, item.category);
  const when = showDate
    ? formatTransactionDate(item.date)
    : formatTransactionTime(item.date);

  return (
    <View
      style={[
        styles.transactionItem,
        {
          backgroundColor: cardBg,
          borderColor: item.isPending ? primaryBrown : borderCol,
        },
      ]}
    >
      <View style={[styles.itemIconContainer, { backgroundColor: color + '22' }]}>
        <Feather name={iconName as any} size={18} color={color} />
      </View>
      <View style={styles.itemDetails}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text
            numberOfLines={1}
            style={[styles.itemTitle, { color: textPrimary, flexShrink: 1 }]}
          >
            {item.title}
          </Text>

          {item.isPending && (
            <Text
              style={{
                fontSize: 10.5,
                fontWeight: '700',
                color: primaryBrown,
                backgroundColor: primaryBrown + '26',
                paddingHorizontal: 7,
                paddingVertical: 2,
                borderRadius: 6,
                overflow: 'hidden',
              }}
            >
              Saving…
            </Text>
          )}
        </View>
        <Text numberOfLines={1} style={[styles.itemSubtitle, { color: textSecondary }]}>
          {item.category} · {when}
        </Text>
      </View>
      <Text
        style={[
          styles.itemAmount,
          { color: isIncome ? successGreen : errorRed },
        ]}
      >
        {isIncome ? '+' : '−'}₱{item.amount.toFixed(2)}
      </Text>
    </View>
  );
}
