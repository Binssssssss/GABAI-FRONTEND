import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { formatFocusMinutes } from '../constants/focusConfig';
import { FocusPalette, FocusStats } from '../types';
import { focusStyles as styles } from '../styles/focus.styles';

interface FocusStatsOverviewProps {
  stats: FocusStats;
  isLoading: boolean;
  onOpenHistory: () => void;
  colors: FocusPalette;
}

export default function FocusStatsOverview({
  stats,
  isLoading,
  onOpenHistory,
  colors,
}: FocusStatsOverviewProps) {
  const items = [
    { icon: 'clock' as const, value: stats.todayMinutes > 0 ? formatFocusMinutes(stats.todayMinutes) : '0m', label: 'Focused today', color: colors.primary },
    { icon: 'target' as const, value: `${stats.todaySessions}`, label: 'Sessions', color: colors.text },
    { icon: 'zap' as const, value: `${stats.streakDays}d`, label: 'Streak', color: '#F59E0B' },
  ];

  return (
    <View>
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: colors.subtext }]}>Today</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open focus history and statistics"
          onPress={onOpenHistory}
          hitSlop={10}
        >
          <Text style={[styles.sectionLink, { color: colors.primary }]}>
            History & stats
          </Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open focus history and statistics"
        onPress={onOpenHistory}
        style={({ pressed }) => [styles.statsGrid, pressed && { opacity: 0.85 }]}
      >
        {items.map((item) => (
          <View
            key={item.label}
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name={item.icon} size={16} color={colors.subtext} />
            <Text style={[styles.statVal, { color: item.color }]}>
              {isLoading ? '–' : item.value}
            </Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>{item.label}</Text>
          </View>
        ))}
      </Pressable>
    </View>
  );
}
