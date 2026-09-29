import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TaskTheme } from '../../types';
import type { useTaskData } from '../../hooks/useTaskData';
import { taskStyles as styles } from '../../styles/task.styles';

interface TaskOverviewViewProps {
  taskData: ReturnType<typeof useTaskData>;
  theme: TaskTheme;
}

export default function TaskOverviewView({
  taskData,
  theme,
}: TaskOverviewViewProps) {
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

  const {
    cardBg,
    borderCol,
    textPrimary,
    textSecondary,
    primaryBrown,
  } = theme;

  const workload = getWorkloadLevel();

  /*
   * Pinned tasks are currently frontend-only because
   * isPinned is not stored in the backend Task model yet.
   */
  const pinnedTasks = tasks.filter(
    (task) => task.isPinned && !task.completed,
  );

  /*
   * Generate the last 14 days dynamically.
   *
   * The heatmap load is based on the number of actual tasks
   * scheduled/due on each date.
   */
  const heatmapDays = useMemo(() => {
    const days: {
      date: string;
      full: string;
      load: number;
    }[] = [];

    const today = new Date();

    // Remove the time portion so date comparison is consistent.
    today.setHours(0, 0, 0, 0);

    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      const fullDate = `${year}-${month}-${day}`;

      const taskCount = tasks.filter((task) => {
        return task.dueDate === fullDate;
      }).length;

      days.push({
        date: String(date.getDate()),
        full: fullDate,
        load: taskCount,
      });
    }

    return days;
  }, [tasks]);

  /*
   * Get the highest task count so the heatmap can
   * calculate its intensity dynamically.
   */
  const maxHeatmapLoad = useMemo(() => {
    return Math.max(
      ...heatmapDays.map((day) => day.load),
      1,
    );
  }, [heatmapDays]);

  const getHeatmapColor = (load: number) => {
    if (load === 0) {
      return theme.isDark ? '#1A1A1A' : '#F3F4F6';
    }

    const intensity = load / maxHeatmapLoad;

    if (intensity <= 0.25) {
      return primaryBrown + '20';
    }

    if (intensity <= 0.5) {
      return primaryBrown + '40';
    }

    if (intensity <= 0.75) {
      return primaryBrown + '70';
    }

    return primaryBrown;
  };

  return (
    <View style={styles.overviewContainer}>
      {/* Motivation Banner */}
      <View
        style={[
          styles.motivationBanner,
          {
            backgroundColor: primaryBrown + '12',
            borderColor: primaryBrown + '30',
          },
        ]}
      >
        <Feather
          name="award"
          size={24}
          color={primaryBrown}
          style={{ marginRight: 12 }}
        />

        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.motivationTitle,
              { color: primaryBrown },
            ]}
          >
            Academic Momentum
          </Text>

          <Text
            style={[
              styles.motivationQuote,
              { color: textSecondary },
            ]}
          >
            &ldquo;Small daily improvements over time lead to stunning
            academic results.&rdquo;
          </Text>
        </View>
      </View>

      {/* Row 1: Workload & Progress */}
      <View style={styles.overviewRow}>
        {/* Workload */}
        <View
          style={[
            styles.overviewCard,
            {
              backgroundColor: cardBg,
              borderColor: borderCol,
            },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Text
              style={[
                styles.overviewCardLabel,
                { color: textSecondary },
              ]}
            >
              WORKLOAD
            </Text>

            <Feather
              name="activity"
              size={16}
              color={workload.color}
            />
          </View>

          <Text
            style={[
              styles.workloadLabel,
              { color: workload.color },
            ]}
          >
            {workload.level}
          </Text>

          <Text
            style={[
              styles.overviewCardSubText,
              { color: textSecondary },
            ]}
          >
            {activeTasks.length} active tasks •{' '}
            {estimatedRemainingHours.toFixed(1)} hrs left
          </Text>
        </View>

        {/* Progress */}
        <View
          style={[
            styles.overviewCard,
            {
              backgroundColor: cardBg,
              borderColor: borderCol,
            },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Text
              style={[
                styles.overviewCardLabel,
                { color: textSecondary },
              ]}
            >
              PROGRESS
            </Text>

            <Feather
              name="check-circle"
              size={16}
              color={primaryBrown}
            />
          </View>

          <Text
            style={[
              styles.completionPercentageText,
              { color: textPrimary },
            ]}
          >
            {completionRate}%
          </Text>

          <View
            style={[
              styles.progressLineBg,
              { backgroundColor: borderCol },
            ]}
          >
            <View
              style={[
                styles.progressLineFill,
                {
                  backgroundColor: primaryBrown,
                  width: `${Math.min(
                    Math.max(completionRate, 0),
                    100,
                  )}%`,
                },
              ]}
            />
          </View>

          <Text
            style={[
              styles.overviewCardSubText,
              { color: textSecondary },
            ]}
          >
            {completedTasks} of {totalTasks} tasks done
          </Text>
        </View>
      </View>

      {/* Workload Heatmap */}
      <View
        style={[
          styles.heatmapCard,
          {
            backgroundColor: cardBg,
            borderColor: borderCol,
          },
        ]}
      >
        <Text
          style={[
            styles.sectionHeadingTitle,
            {
              color: textPrimary,
              marginBottom: 12,
            },
          ]}
        >
          📅 Workload Heatmap
        </Text>

        <View style={styles.heatmapGrid}>
          {heatmapDays.map((day) => {
            const isToday =
              day.full ===
              new Date().toISOString().split('T')[0];

            const cellColor = getHeatmapColor(day.load);

            return (
              <View
                key={day.full}
                style={styles.heatmapCellContainer}
              >
                <View
                  style={[
                    styles.heatmapCell,
                    {
                      backgroundColor: cellColor,
                      borderColor: isToday
                        ? primaryBrown
                        : 'transparent',
                      borderWidth: isToday ? 1.5 : 0,
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.heatmapCellText,
                    {
                      color: isToday
                        ? primaryBrown
                        : textSecondary,
                    },
                  ]}
                >
                  {day.date}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.heatmapLegend}>
          <Text
            style={[
              styles.legendText,
              { color: textSecondary },
            ]}
          >
            Light
          </Text>

          <View
            style={[
              styles.legendBox,
              { backgroundColor: primaryBrown + '20' },
            ]}
          />

          <View
            style={[
              styles.legendBox,
              { backgroundColor: primaryBrown + '40' },
            ]}
          />

          <View
            style={[
              styles.legendBox,
              { backgroundColor: primaryBrown + '70' },
            ]}
          />

          <View
            style={[
              styles.legendBox,
              { backgroundColor: primaryBrown },
            ]}
          />

          <Text
            style={[
              styles.legendText,
              { color: textSecondary },
            ]}
          >
            Heavy
          </Text>
        </View>
      </View>

      {/* Today's Focus */}
      <View style={styles.focusBlock}>
        <Text
          style={[
            styles.sectionHeadingTitle,
            {
              color: textPrimary,
              marginBottom: 12,
            },
          ]}
        >
          ⭐️ Today&apos;s Focus (Top Pinned)
        </Text>

        {pinnedTasks.slice(0, 3).map((task) => (
          <TouchableOpacity
            key={task.id}
            style={[
              styles.focusTaskCard,
              {
                backgroundColor: cardBg,
                borderColor: borderCol,
              },
            ]}
            onPress={() => handleFocusOnTask(task)}
          >
            <View style={styles.focusCardLeft}>
              <Feather
                name="target"
                size={16}
                color={primaryBrown}
                style={{ marginRight: 10 }}
              />

              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.focusCardTitle,
                    { color: textPrimary },
                  ]}
                  numberOfLines={1}
                >
                  {task.title}
                </Text>

                <Text
                  style={[
                    styles.focusCardSub,
                    { color: textSecondary },
                  ]}
                >
                  {task.subject} • {task.duration} hrs
                </Text>
              </View>
            </View>

            <Feather
              name="chevron-right"
              size={18}
              color={textSecondary}
            />
          </TouchableOpacity>
        ))}

        {pinnedTasks.length === 0 && (
          <View
            style={[
              styles.emptyFocusCard,
              { borderColor: borderCol },
            ]}
          >
            <Text
              style={[
                styles.emptyFocusText,
                { color: textSecondary },
              ]}
            >
              No pinned tasks for today.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}