import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

interface QuickOverviewProps {
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  successGreen: string;
  errorRed: string;
  balance: number;
  income: number;
  expenses: number;
  isLoading: boolean;
}

export default function QuickOverview({
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  successGreen,
  errorRed,
  balance,
  income,
  expenses,
  isLoading,
}: QuickOverviewProps) {
  const formatAmount = (amount: number) =>
    `₱${Math.abs(Number.isFinite(amount) ? amount : 0).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formattedBalance = `${balance < 0 ? '-' : ''}${formatAmount(balance)}`;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: cardBg,
          borderColor: borderCol,
        },
      ]}
    >
      <View style={styles.heading}>
        <Feather name="credit-card" size={17} color={textSecondary} />
        <Text style={[styles.title, { color: textPrimary }]}>Money tracker</Text>
      </View>

      <Text style={[styles.label, { color: textSecondary }]}>Available balance</Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[
          styles.balance,
          { color: balance < 0 ? errorRed : textPrimary },
        ]}
      >
        {isLoading ? 'Loading...' : formattedBalance}
      </Text>

      <View style={[styles.divider, { backgroundColor: borderCol }]} />

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <View style={styles.statHeading}>
            <Feather name="arrow-down-left" size={14} color={successGreen} />
            <Text style={[styles.label, { color: textSecondary }]}>Income</Text>
          </View>
          <Text numberOfLines={1} style={[styles.value, { color: successGreen }]}>
            {isLoading ? '—' : formatAmount(income)}
          </Text>
        </View>

        <View style={[styles.verticalDivider, { backgroundColor: borderCol }]} />

        <View style={styles.stat}>
          <View style={styles.statHeading}>
            <Feather name="arrow-up-right" size={14} color={errorRed} />
            <Text style={[styles.label, { color: textSecondary }]}>Expenses</Text>
          </View>
          <Text numberOfLines={1} style={[styles.value, { color: errorRed }]}>
            {isLoading ? '—' : formatAmount(expenses)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  balance: {
    fontSize: 25,
    fontWeight: '800',
    marginTop: 3,
  },
  divider: {
    height: 1,
    opacity: 0.7,
    marginVertical: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    gap: 5,
  },
  statHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
  verticalDivider: {
    width: 1,
    height: 34,
    opacity: 0.5,
    marginHorizontal: 12,
  },
});