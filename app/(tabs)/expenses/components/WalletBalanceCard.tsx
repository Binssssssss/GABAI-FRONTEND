import React from 'react';
import { View, Text } from 'react-native';
import { expenseStyles as styles } from '../styles/expenses.styles';

interface WalletBalanceCardProps {
  netBalance: number;
  textPrimary?: string;
  cardBg: string;
  borderCol: string;
  textSecondary: string;
}

export default function WalletBalanceCard({
  netBalance,
  textPrimary = '#ECEDEE',
  cardBg,
  borderCol,
  textSecondary,
}: WalletBalanceCardProps) {
  return (
    <View style={[styles.dashboardCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
      <Text style={[styles.dashboardLabel, { color: textSecondary }]}>Current Balance</Text>
      <Text style={[styles.dashboardValue, { color: textPrimary, marginBottom: 0 }]}>
        ₱{Math.max(0, netBalance).toFixed(2)}
      </Text>
    </View>
  );
}
