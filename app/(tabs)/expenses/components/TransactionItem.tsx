import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Transaction } from '../types';
import { getTransactionIcon } from '../utils/expenseHelpers';
import { expenseStyles as styles } from '../styles/expenses.styles';

interface TransactionItemProps {
  item: Transaction;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  successGreen: string;
  primaryBrown: string;
}

export default function TransactionItem({
  item,
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  successGreen,
  primaryBrown,
}: TransactionItemProps) {
  const isIncome = item.type === 'income';
  const iconName = getTransactionIcon(item.type, item.category);

  return (
    <View style={[styles.transactionItem, { backgroundColor: cardBg, borderColor: borderCol }]}>
      <View
        style={[
          styles.itemIconContainer,
          { backgroundColor: isIncome ? successGreen + '15' : primaryBrown + '15' },
        ]}
      >
        <Feather
          name={iconName as any}
          size={20}
          color={isIncome ? successGreen : primaryBrown}
        />
      </View>
      <View style={styles.itemDetails}>
        <Text style={[styles.itemTitle, { color: textPrimary }]}>{item.title}</Text>
        <Text style={[styles.itemSubtitle, { color: textSecondary }]}>
          {item.category} • {item.date}
        </Text>
      </View>
      <Text
        style={[
          styles.itemAmount,
          { color: isIncome ? successGreen : textPrimary },
        ]}
      >
        {isIncome ? '+' : '-'} ₱{item.amount.toFixed(2)}
      </Text>
    </View>
  );
}
