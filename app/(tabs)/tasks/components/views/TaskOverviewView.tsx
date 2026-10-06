import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import type { useTaskData } from '../../hooks/useTaskData';
import { taskStyles as styles } from '../../styles/task.styles';
import { TaskTheme } from '../../types';

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

      {/* Today's Focus (Pinned / Favorites) */}
      <View style={styles.focusBlock}>
        <View style={styles.sectionHeadingRow}>
          <Feather name="target" size={17} color={primaryBrown} />
          <Text style={[styles.sectionHeadingTitle, { color: textPrimary, marginBottom: 12 }]}>
            Today&apos;s Focus
          </Text>
        </View>
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
