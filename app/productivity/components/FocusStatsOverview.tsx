import React from 'react';
import { View, Text } from 'react-native';
import { FocusStats } from '../types';
import { focusStyles as styles } from '../styles/focus.styles';

interface FocusStatsOverviewProps {
  stats: FocusStats;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  primaryAccent: string;
}

export default function FocusStatsOverview({
  stats,
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  primaryAccent,
}: FocusStatsOverviewProps) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[styles.sectionTitle, { color: textSecondary }]}>Today&apos;s Focus Metrics</Text>
      <View style={styles.statsGrid}>
        {/* Today Focus Minutes */}
        <View style={[styles.statCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <Text style={{ fontSize: 18 }}>⏱️</Text>
          <Text style={[styles.statVal, { color: primaryAccent }]}>{stats.todayMinutes}m</Text>
          <Text style={[styles.statLabel, { color: textSecondary }]}>Focused</Text>
        </View>

        {/* Sessions Completed */}
        <View style={[styles.statCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <Text style={{ fontSize: 18 }}>🎯</Text>
          <Text style={[styles.statVal, { color: textPrimary }]}>{stats.todaySessions}</Text>
          <Text style={[styles.statLabel, { color: textSecondary }]}>Sessions</Text>
        </View>

        {/* Daily Streak */}
        <View style={[styles.statCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <Text style={{ fontSize: 18 }}>🔥</Text>
          <Text style={[styles.statVal, { color: '#F59E0B' }]}>{stats.streakDays} Days</Text>
          <Text style={[styles.statLabel, { color: textSecondary }]}>Streak</Text>
        </View>
      </View>
    </View>
  );
}
