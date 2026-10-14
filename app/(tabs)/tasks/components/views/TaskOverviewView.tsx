import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { TaskTheme, Task } from '../../types';
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
  const pinnedTasks = tasks.filter((t) => t.isPinned && !t.completed);

  // Re-render every minute so the time left stays accurate.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  /*
   * Next deadline among unfinished tasks, e.g.
   * "Next due 3:00 PM today · 2h 15m left".
   */
  const deadlineSummary = (() => {
    const toTimestamp = (task: Task) => {
      if (!task.dueDate) return null;
      const time = /^\d{1,2}:\d{2}/.test(task.dueTime || '')
        ? task.dueTime.slice(0, 5).padStart(5, '0')
        : '23:59';
      const value = new Date(`${task.dueDate}T${time}:00`).getTime();
      return Number.isNaN(value) ? null : value;
    };

    const dated = activeTasks
      .map((task) => ({ task, at: toTimestamp(task) }))
      .filter((item): item is { task: Task; at: number } => item.at !== null);

    const overdueCount = dated.filter((item) => item.at <= now).length;
    const upcoming = dated
      .filter((item) => item.at > now)
      .sort((a, b) => a.at - b.at)[0];

    if (!upcoming) {
      return overdueCount > 0
        ? `${overdueCount} overdue · no upcoming deadline`
        : 'No upcoming deadline';
    }

    const minutesLeft = Math.max(1, Math.round((upcoming.at - now) / 60_000));
    const days = Math.floor(minutesLeft / 1440);
    const hours = Math.floor((minutesLeft % 1440) / 60);
    const minutes = minutesLeft % 60;

    const left =
      days > 0
        ? `${days}d ${hours}h left`
        : hours > 0
          ? `${hours}h ${minutes}m left`
          : `${minutes}m left`;

    const due = new Date(upcoming.at);
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const dayDiff = Math.round(
      (new Date(due).setHours(0, 0, 0, 0) - startOfToday.getTime()) / 86_400_000,
    );

    const dayLabel =
      dayDiff === 0
        ? 'today'
        : dayDiff === 1
          ? 'tomorrow'
          : due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const timeLabel = due.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

    return `Next due ${timeLabel} ${dayLabel} · ${left}`;
  })();

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
            {activeTasks.length} active{' '}
            {activeTasks.length === 1 ? 'task' : 'tasks'}
          </Text>

          <Text
            style={[
              styles.overviewCardSubText,
              { color: textSecondary, marginTop: 2 },
            ]}
          >
            {deadlineSummary}
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

      {/* Today's Focus */}
      <View style={styles.focusBlock}>
        <Text style={[styles.sectionHeadingTitle, { color: textPrimary, marginBottom: 12 }]}>
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