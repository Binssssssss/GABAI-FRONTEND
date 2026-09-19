import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TaskTheme, Task } from '../../types';
import type { useTaskData } from '../../hooks/useTaskData';
import { taskStyles as styles } from '../../styles/task.styles';

interface TaskOverviewViewProps {
  taskData: ReturnType<typeof useTaskData>;
  theme: TaskTheme;
}

export default function TaskOverviewView({ taskData, theme }: TaskOverviewViewProps) {
  const {
    tasks,
    totalTasks,
    completedTasks,
    activeTasks,
    completionRate,
    estimatedRemainingHours,
    getWorkloadLevel,
    handleFocusOnTask,
  } = taskData;

  const { cardBg, borderCol, textPrimary, textSecondary, primaryBrown } = theme;
  const workload = getWorkloadLevel();
  const pinnedTasks = tasks.filter((t) => t.isPinned && !t.completed);

  // Mock heatmap 14 days
  const heatmapDays = [
    { date: '12', full: '2026-07-12', load: 1 },
    { date: '13', full: '2026-07-13', load: 3 },
    { date: '14', full: '2026-07-14', load: 2 },
    { date: '15', full: '2026-07-15', load: 0 },
    { date: '16', full: '2026-07-16', load: 4 },
    { date: '17', full: '2026-07-17', load: 2 },
    { date: '18', full: '2026-07-18', load: 1 },
    { date: '19', full: '2026-07-19', load: 0 },
    { date: '20', full: '2026-07-20', load: 2 },
    { date: '21', full: '2026-07-21', load: 3 },
    { date: '22', full: '2026-07-22', load: 4 },
    { date: '23', full: '2026-07-23', load: 1 },
    { date: '24', full: '2026-07-24', load: 2 },
    { date: '25', full: '2026-07-25', load: 3 },
  ];

  return (
    <View style={styles.overviewContainer}>
      {/* Motivation Banner */}
      <View
        style={[
          styles.motivationBanner,
          { backgroundColor: primaryBrown + '12', borderColor: primaryBrown + '30' },
        ]}
      >
        <Feather name="award" size={24} color={primaryBrown} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.motivationTitle, { color: primaryBrown }]}>Academic Momentum</Text>
          <Text style={[styles.motivationQuote, { color: textSecondary }]}>
            &ldquo;Small daily improvements over time lead to stunning academic results.&rdquo;
          </Text>
        </View>
      </View>

      {/* Row 1: Workload Stress Meter & Completion Rate */}
      <View style={styles.overviewRow}>
        {/* Workload */}
        <View style={[styles.overviewCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.overviewCardLabel, { color: textSecondary }]}>WORKLOAD</Text>
            <Feather name="activity" size={16} color={workload.color} />
          </View>
          <Text style={[styles.workloadLabel, { color: workload.color }]}>{workload.level}</Text>
          <Text style={[styles.overviewCardSubText, { color: textSecondary }]}>
            {activeTasks.length} active tasks • {estimatedRemainingHours.toFixed(1)} hrs left
          </Text>
        </View>

        {/* Progress Rate */}
        <View style={[styles.overviewCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.overviewCardLabel, { color: textSecondary }]}>PROGRESS</Text>
            <Feather name="check-circle" size={16} color={primaryBrown} />
          </View>
          <Text style={[styles.completionPercentageText, { color: textPrimary }]}>
            {completionRate}%
          </Text>
          <View style={[styles.progressLineBg, { backgroundColor: borderCol }]}>
            <View
              style={[
                styles.progressLineFill,
                { backgroundColor: primaryBrown, width: `${completionRate}%` },
              ]}
            />
          </View>
          <Text style={[styles.overviewCardSubText, { color: textSecondary }]}>
            {completedTasks} of {totalTasks} tasks done
          </Text>
        </View>
      </View>

      {/* Workload Heatmap Card */}
      <View style={[styles.heatmapCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
        <Text style={[styles.sectionHeadingTitle, { color: textPrimary, marginBottom: 12 }]}>
          📅 Workload Heatmap
        </Text>
        <View style={styles.heatmapGrid}>
          {heatmapDays.map((day, idx) => {
            let cellColor = theme.isDark ? '#1A1A1A' : '#F3F4F6';
            if (day.load > 0) {
              if (day.load === 1) cellColor = primaryBrown + '20';
              else if (day.load === 2) cellColor = primaryBrown + '40';
              else if (day.load === 3) cellColor = primaryBrown + '70';
              else cellColor = primaryBrown;
            }
            const isToday = day.full === '2026-07-25';

            return (
              <View key={idx} style={styles.heatmapCellContainer}>
                <View
                  style={[
                    styles.heatmapCell,
                    {
                      backgroundColor: cellColor,
                      borderColor: isToday ? primaryBrown : 'transparent',
                      borderWidth: isToday ? 1.5 : 0,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.heatmapCellText,
                    { color: isToday ? primaryBrown : textSecondary },
                  ]}
                >
                  {day.date}
                </Text>
              </View>
            );
          })}
        </View>
        <View style={styles.heatmapLegend}>
          <Text style={[styles.legendText, { color: textSecondary }]}>Light</Text>
          <View style={[styles.legendBox, { backgroundColor: primaryBrown + '20' }]} />
          <View style={[styles.legendBox, { backgroundColor: primaryBrown + '40' }]} />
          <View style={[styles.legendBox, { backgroundColor: primaryBrown + '70' }]} />
          <View style={[styles.legendBox, { backgroundColor: primaryBrown }]} />
          <Text style={[styles.legendText, { color: textSecondary }]}>Heavy</Text>
        </View>
      </View>

      {/* Today's Focus (Pinned / Favorites) */}
      <View style={styles.focusBlock}>
        <Text style={[styles.sectionHeadingTitle, { color: textPrimary, marginBottom: 12 }]}>
          ⭐️ Today&apos;s Focus (Top Pinned)
        </Text>
        {pinnedTasks.slice(0, 3).map((task) => (
          <TouchableOpacity
            key={task.id}
            style={[styles.focusTaskCard, { backgroundColor: cardBg, borderColor: borderCol }]}
            onPress={() => handleFocusOnTask(task)}
          >
            <View style={styles.focusCardLeft}>
              <Feather name="target" size={16} color={primaryBrown} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.focusCardTitle, { color: textPrimary }]} numberOfLines={1}>
                  {task.title}
                </Text>
                <Text style={[styles.focusCardSub, { color: textSecondary }]}>
                  {task.subject} • {task.duration} hrs
                </Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color={textSecondary} />
          </TouchableOpacity>
        ))}
        {pinnedTasks.length === 0 && (
          <View style={[styles.emptyFocusCard, { borderColor: borderCol }]}>
            <Text style={[styles.emptyFocusText, { color: textSecondary }]}>
              No pinned tasks for today.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
