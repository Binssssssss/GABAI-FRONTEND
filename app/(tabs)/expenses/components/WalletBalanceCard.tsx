import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { expenseStyles as styles } from '../styles/expenses.styles';

interface WalletBalanceCardProps {
  netBalance: number;
  totalIncome: number;
  totalExpenses: number;
  cardBg: string;
  borderCol: string;
  textSecondary: string;
  successGreen: string;
  errorRed: string;
}

export default function WalletBalanceCard({
  netBalance,
  totalIncome,
  totalExpenses,
  cardBg,
  borderCol,
  textSecondary,
  successGreen,
  errorRed,
}: WalletBalanceCardProps) {
  return (
    <View style={[styles.dashboardCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
      <Text style={[styles.dashboardLabel, { color: textSecondary }]}>Wallet Balance</Text>
      <Text style={[styles.dashboardValue, { color: netBalance >= 0 ? successGreen : errorRed }]}>
        ₱{netBalance.toFixed(2)}
      </Text>

      <View style={[styles.dashboardDivider, { backgroundColor: borderCol }]} />

      <View style={styles.dashboardStats}>
        <View style={styles.statColumn}>
          <View style={styles.statHeaderRow}>
            <Feather name="arrow-down-left" size={14} color={successGreen} style={{ marginRight: 4 }} />
            <Text style={[styles.statLabelText, { color: textSecondary }]}>Income</Text>
          </View>
          <Text style={[styles.statValueText, { color: successGreen }]}>₱{totalIncome.toFixed(2)}</Text>
        </View>

        <View style={[styles.verticalDivider, { backgroundColor: borderCol }]} />

        <View style={styles.statColumn}>
          <View style={styles.statHeaderRow}>
            <Feather name="arrow-up-right" size={14} color={errorRed} style={{ marginRight: 4 }} />
            <Text style={[styles.statLabelText, { color: textSecondary }]}>Expenses</Text>
          </View>
          <Text style={[styles.statValueText, { color: errorRed }]}>₱{totalExpenses.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}
