import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TaskTheme } from '../../types';
import type { useTaskData } from '../../hooks/useTaskData';
import { SUBJECTS } from '../../constants/taskConfig';
import { taskStyles as styles } from '../../styles/task.styles';

interface TaskSubjectsViewProps {
  taskData: ReturnType<typeof useTaskData>;
  theme: TaskTheme;
}

export default function TaskSubjectsView({ taskData, theme }: TaskSubjectsViewProps) {
  const { tasks } = taskData;
  const { cardBg, borderCol, textPrimary, textSecondary, primaryBrown } = theme;

  const getSubjectBreakdown = (subjectName: string) => {
    const subjectTasks = tasks.filter((t) => t.subject === subjectName);
    const total = subjectTasks.length;
    const completed = subjectTasks.filter((t) => t.completed).length;
    const remainingTasks = total - completed;
    const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const assignments = subjectTasks.filter((t) => t.category === 'Academic').length;
    const projects = subjectTasks.filter((t) => t.category === 'Projects').length;
    const quizzes = subjectTasks.filter((t) => t.category === 'Exams').length;

    return {
      total,
      completed,
      remainingTasks,
      completionPercent,
      assignments,
      projects,
      quizzes,
    };
  };

  return (
    <View style={styles.subjectsContainer}>
      {SUBJECTS.map((sub) => {
        const stats = getSubjectBreakdown(sub);
        if (stats.total === 0) return null;

        return (
          <View
            key={sub}
            style={[styles.subjectCard, { backgroundColor: cardBg, borderColor: borderCol }]}
          >
            <View style={styles.subjectCardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.subjectCardTitle, { color: textPrimary }]}>{sub}</Text>
                <Text style={[styles.subjectCardSubtitle, { color: textSecondary }]}>
                  {stats.remainingTasks} active task{stats.remainingTasks === 1 ? '' : 's'} remaining
                </Text>
              </View>
              <View
                style={[
                  styles.subjectPercentBadge,
                  { backgroundColor: primaryBrown + '12' },
                ]}
              >
                <Text style={[styles.subjectPercentText, { color: primaryBrown }]}>
                  {stats.completionPercent}%
                </Text>
              </View>
            </View>

            {/* Progress Line */}
            <View
              style={[
                styles.progressLineBg,
                { backgroundColor: borderCol, marginVertical: 12 },
              ]}
            >
              <View
                style={[
                  styles.progressLineFill,
                  { backgroundColor: primaryBrown, width: `${stats.completionPercent}%` },
                ]}
              />
            </View>

            {/* Counts Grid */}
            <View style={styles.subjectMetricsRow}>
              <View style={styles.metricItem}>
                <Feather
                  name="file-text"
                  size={13}
                  color={textSecondary}
                  style={{ marginBottom: 2 }}
                />
                <Text style={[styles.metricCount, { color: textPrimary }]}>
                  {stats.assignments}
                </Text>
                <Text style={[styles.metricLabel, { color: textSecondary }]}>Assignments</Text>
              </View>
              <View style={[styles.verticalDivider, { backgroundColor: borderCol }]} />
              <View style={styles.metricItem}>
                <Feather
                  name="clipboard"
                  size={13}
                  color={textSecondary}
                  style={{ marginBottom: 2 }}
                />
                <Text style={[styles.metricCount, { color: textPrimary }]}>{stats.projects}</Text>
                <Text style={[styles.metricLabel, { color: textSecondary }]}>Projects</Text>
              </View>
              <View style={[styles.verticalDivider, { backgroundColor: borderCol }]} />
              <View style={styles.metricItem}>
                <Feather
                  name="edit-3"
                  size={13}
                  color={textSecondary}
                  style={{ marginBottom: 2 }}
                />
                <Text style={[styles.metricCount, { color: textPrimary }]}>{stats.quizzes}</Text>
                <Text style={[styles.metricLabel, { color: textSecondary }]}>Quizzes</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}
