import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface QuickOverviewProps {
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  tasksCount?: number;
  deadlinesCount?: number;
  classesCount?: number;
  weeklySpend?: string;
}

export default function QuickOverview({
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  tasksCount = 4,
  deadlinesCount = 5,
  classesCount = 2,
  weeklySpend = '₱1,250',
}: QuickOverviewProps) {
  const stats = [
    { value: tasksCount, label: 'Tasks' },
    { value: deadlinesCount, label: 'Due' },
    { value: classesCount, label: 'Classes' },
    { value: weeklySpend, label: 'Spent' },
  ];

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
      {stats.map((item, index) => (
        <React.Fragment key={item.label}>
          <View style={styles.stat}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[
                styles.value,
                { color: textPrimary },
              ]}
            >
              {item.value}
            </Text>

            <Text
              style={[
                styles.label,
                { color: textSecondary },
              ]}
            >
              {item.label}
            </Text>
          </View>

          {index < stats.length - 1 && (
            <View
              style={[
                styles.divider,
                { backgroundColor: borderCol },
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 68,
    borderRadius: 16,
    borderWidth: 1,

    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 8,
    marginBottom: 16,
  },

  stat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  value: {
    fontSize: 17,
    fontWeight: '800',
  },

  label: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 2,
  },

  divider: {
    width: 1,
    height: 28,
    opacity: 0.5,
  },
});