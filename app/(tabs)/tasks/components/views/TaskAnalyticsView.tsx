import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TaskTheme } from '../../types';
import type { useTaskData } from '../../hooks/useTaskData';
import { taskStyles as styles } from '../../styles/task.styles';

interface TaskAnalyticsViewProps {
  taskData: ReturnType<typeof useTaskData>;
  theme: TaskTheme;
}

export default function TaskAnalyticsView({ taskData, theme }: TaskAnalyticsViewProps) {
  const { totalTasks, completedTasks } = taskData;
  const { cardBg, borderCol, textPrimary, textSecondary, primaryBrown, successGreen } = theme;

  const weeklyCompletion = [
    { day: 'Mon', count: 4, height: '60%' },
    { day: 'Tue', count: 6, height: '90%' },
    { day: 'Wed', count: 3, height: '45%' },
    { day: 'Thu', count: 5, height: '75%' },
    { day: 'Fri', count: 2, height: '30%' },
    { day: 'Sat', count: 7, height: '100%' },
    { day: 'Sun', count: 1, height: '15%' },
  ];

  return (
    <View style={styles.analyticsContainer}>
      {/* Metric widgets grid */}
      <View style={styles.analyticsGrid}>
        <View style={[styles.analyticsCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <Feather name="award" size={18} color={primaryBrown} />
          <Text style={[styles.analyticsNum, { color: textPrimary }]}>87%</Text>
          <Text style={[styles.analyticsLabel, { color: textSecondary }]}>On-Time Completion</Text>
        </View>
        <View style={[styles.analyticsCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <Feather name="clock" size={18} color={primaryBrown} />
          <Text style={[styles.analyticsNum, { color: textPrimary }]}>2.4 hrs</Text>
          <Text style={[styles.analyticsLabel, { color: textSecondary }]}>Avg Study Duration</Text>
        </View>
        <View style={[styles.analyticsCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <Feather name="zap" size={18} color={primaryBrown} />
          <Text style={[styles.analyticsNum, { color: textPrimary }]}>
            {completedTasks}/{totalTasks}
          </Text>
          <Text style={[styles.analyticsLabel, { color: textSecondary }]}>Completed Rate</Text>
        </View>
        <View style={[styles.analyticsCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <Feather name="trending-up" size={18} color={primaryBrown} />
          <Text style={[styles.analyticsNum, { color: textPrimary }]}>+14%</Text>
          <Text style={[styles.analyticsLabel, { color: textSecondary }]}>Weekly Productivity</Text>
        </View>
      </View>

      {/* Weekly Activity Bar Chart */}
      <View style={[styles.chartCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
        <Text style={[styles.sectionHeadingTitle, { color: textPrimary, marginBottom: 16 }]}>
          📊 Weekly Task Completion
        </Text>
        <View style={styles.chartContainer}>
          {weeklyCompletion.map((bar, idx) => (
            <View key={idx} style={styles.chartBarCol}>
              <View style={styles.chartBarWrapper}>
                <View
                  style={[
                    styles.chartBarFill,
                    { height: bar.height as any, backgroundColor: primaryBrown },
                  ]}
                />
              </View>
              <Text style={[styles.chartBarLabel, { color: textSecondary }]}>{bar.day}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Badges Section */}
      <View style={styles.badgesSection}>
        <Text style={[styles.sectionHeadingTitle, { color: textPrimary, marginBottom: 12 }]}>
          🏆 Academic Badges
        </Text>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.badgeItemCard,
              { backgroundColor: cardBg, borderColor: borderCol },
            ]}
          >
            <View
              style={[
                styles.badgeIconBg,
                { backgroundColor: primaryBrown + '15' },
              ]}
            >
              <Feather name="zap" size={18} color={primaryBrown} />
            </View>
            <Text style={[styles.badgeCardTitle, { color: textPrimary }]}>5-Day Streak</Text>
            <Text style={[styles.badgeCardSubtitle, { color: textSecondary }]}>
              Completed daily goals 5 days in a row!
            </Text>
          </View>

          <View
            style={[
              styles.badgeItemCard,
              { backgroundColor: cardBg, borderColor: borderCol },
            ]}
          >
            <View
              style={[
                styles.badgeIconBg,
                { backgroundColor: successGreen + '15' },
              ]}
            >
              <Feather name="check-circle" size={18} color={successGreen} />
            </View>
            <Text style={[styles.badgeCardTitle, { color: textPrimary }]}>Speed Demon</Text>
            <Text style={[styles.badgeCardSubtitle, { color: textSecondary }]}>
              Finished 3 high priority tasks ahead of deadline.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
