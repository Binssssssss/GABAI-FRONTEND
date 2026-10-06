import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import type { useTaskData } from '../../hooks/useTaskData';
import { taskStyles as styles } from '../../styles/task.styles';
import { TaskTheme } from '../../types';

interface TaskAnalyticsViewProps {
  taskData: ReturnType<typeof useTaskData>;
  theme: TaskTheme;
}

export default function TaskAnalyticsView({ taskData, theme }: TaskAnalyticsViewProps) {
  const { totalTasks, completedTasks, activeTasks, completionRate } = taskData;
  const { cardBg, borderCol, textPrimary, textSecondary, primaryBrown, successGreen } = theme;

  return (
    <View style={styles.analyticsContainer}>
      <View style={styles.analyticsGrid}>
        <View style={[styles.analyticsCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <Feather name="layers" size={18} color={primaryBrown} />
          <Text style={[styles.analyticsNum, { color: textPrimary }]}>{totalTasks}</Text>
          <Text style={[styles.analyticsLabel, { color: textSecondary }]}>Total tasks</Text>
        </View>
        <View style={[styles.analyticsCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <Feather name="clock" size={18} color={primaryBrown} />
          <Text style={[styles.analyticsNum, { color: textPrimary }]}>{activeTasks.length}</Text>
          <Text style={[styles.analyticsLabel, { color: textSecondary }]}>Active tasks</Text>
        </View>
      </View>

      <View style={[styles.chartCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
        <View style={styles.completionHeader}>
          <View>
            <Text style={[styles.sectionHeadingTitle, { color: textPrimary, marginBottom: 3 }]}>
              Completion
            </Text>
            <Text style={[styles.analyticsLabel, { color: textSecondary }]}>
              {completedTasks} of {totalTasks} tasks completed
            </Text>
          </View>
          <Text style={[styles.completionValue, { color: primaryBrown }]}>
            {completionRate}%
          </Text>
        </View>
        <View style={[styles.progressLineBg, { backgroundColor: borderCol, marginTop: 16 }]}>
          <View
            style={[
              styles.progressLineFill,
              { width: `${completionRate}%`, backgroundColor: successGreen },
            ]}
          />
        </View>
      </View>
    </View>
  );
}
