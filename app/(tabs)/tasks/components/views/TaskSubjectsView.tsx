
import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import type { useTaskData } from '../../hooks/useTaskData';
import { taskStyles as styles } from '../../styles/task.styles';
import { TaskTheme } from '../../types';

interface TaskSubjectsViewProps {
  taskData: ReturnType<typeof useTaskData>;
  theme: TaskTheme;
}

export default function TaskSubjectsView({
  taskData,
  theme,
}: TaskSubjectsViewProps) {
  const { tasks } = taskData;

  const {
    cardBg,
    borderCol,
    textPrimary,
    textSecondary,
    primaryBrown,
  } = theme;

  /**
   * Build subject list from the actual tasks.
   *
   * This prevents subjects from being limited to the
   * hard-coded SUBJECTS constant.
   */
  const subjects = useMemo(() => {
    const uniqueSubjects = new Set<string>();

    tasks.forEach((task) => {
      const subject = task.subject?.trim();

      if (subject) {
        uniqueSubjects.add(subject);
      }
    });

    return Array.from(uniqueSubjects).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [tasks]);

  /**
   * Calculate statistics for one subject.
   */
  const getSubjectBreakdown = (subjectName: string) => {
    const subjectTasks = tasks.filter(
      (task) => task.subject?.trim() === subjectName,
    );

    const total = subjectTasks.length;

    const completed = subjectTasks.filter(
      (task) => task.completed === true,
    ).length;

    const remainingTasks = Math.max(total - completed, 0);

    const completionPercent =
      total > 0
        ? Math.min(100, Math.round((completed / total) * 100))
        : 0;

    /**
     * Category breakdown
     *
     * Academic = Assignments
     * Projects = Projects
     * Exams = Quizzes
     */
    const assignments = subjectTasks.filter(
      (task) => task.category === 'Academic',
    ).length;

    const projects = subjectTasks.filter(
      (task) => task.category === 'Projects',
    ).length;

    const quizzes = subjectTasks.filter(
      (task) => task.category === 'Exams',
    ).length;

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

  /**
   * No tasks available.
   */
  if (subjects.length === 0) {
    return (
      <View
        style={[
          styles.subjectsContainer,
          {
            paddingVertical: 24,
            alignItems: 'center',
          },
        ]}
      >
        <Feather
          name="book-open"
          size={28}
          color={textSecondary}
          style={{ marginBottom: 8 }}
        />

        <Text
          style={{
            color: textPrimary,
            fontSize: 14,
            fontWeight: '700',
            textAlign: 'center',
          }}
        >
          No subjects yet
        </Text>

        <Text
          style={{
            color: textSecondary,
            fontSize: 12,
            textAlign: 'center',
            marginTop: 4,
          }}
        >
          Add a task with a subject to see your subject progress.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.subjectsContainer}>
      {subjects.map((subject) => {
        const stats = getSubjectBreakdown(subject);

        return (
          <View
            key={subject}
            style={[
              styles.subjectCard,
              {
                backgroundColor: cardBg,
                borderColor: borderCol,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.subjectCardHeader}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    styles.subjectCardTitle,
                    { color: textPrimary },
                  ]}
                >
                  {subject}
                </Text>

                <Text
                  style={[
                    styles.subjectCardSubtitle,
                    { color: textSecondary },
                  ]}
                >
                  {stats.remainingTasks} active task
                  {stats.remainingTasks === 1 ? '' : 's'} remaining
                </Text>
              </View>

              {/* Percentage */}
              <View
                style={[
                  styles.subjectPercentBadge,
                  {
                    backgroundColor: primaryBrown + '12',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.subjectPercentText,
                    { color: primaryBrown },
                  ]}
                >
                  {stats.completionPercent}%
                </Text>
              </View>
            </View>

            {/* Progress Line */}
            <View
              style={[
                styles.progressLineBg,
                {
                  backgroundColor: borderCol,
                  marginVertical: 12,
                  overflow: 'hidden',
                },
              ]}
            >
              <View
                style={[
                  styles.progressLineFill,
                  {
                    backgroundColor: primaryBrown,
                    width: `${stats.completionPercent}%`,
                  },
                ]}
              />
            </View>

            {/* Counts Grid */}
            <View style={styles.subjectMetricsRow}>
              {/* Assignments */}
              <View style={styles.metricItem}>
                <Feather
                  name="file-text"
                  size={13}
                  color={textSecondary}
                  style={{ marginBottom: 2 }}
                />

                <Text
                  style={[
                    styles.metricCount,
                    { color: textPrimary },
                  ]}
                >
                  {stats.assignments}
                </Text>

                <Text
                  style={[
                    styles.metricLabel,
                    { color: textSecondary },
                  ]}
                >
                  Assignments
                </Text>
              </View>

              {/* Divider */}
              <View
                style={[
                  styles.verticalDivider,
                  { backgroundColor: borderCol },
                ]}
              />

              {/* Projects */}
              <View style={styles.metricItem}>
                <Feather
                  name="clipboard"
                  size={13}
                  color={textSecondary}
                  style={{ marginBottom: 2 }}
                />

                <Text
                  style={[
                    styles.metricCount,
                    { color: textPrimary },
                  ]}
                >
                  {stats.projects}
                </Text>

                <Text
                  style={[
                    styles.metricLabel,
                    { color: textSecondary },
                  ]}
                >
                  Projects
                </Text>
              </View>

              {/* Divider */}
              <View
                style={[
                  styles.verticalDivider,
                  { backgroundColor: borderCol },
                ]}
              />

              {/* Quizzes */}
              <View style={styles.metricItem}>
                <Feather
                  name="edit-3"
                  size={13}
                  color={textSecondary}
                  style={{ marginBottom: 2 }}
                />

                <Text
                  style={[
                    styles.metricCount,
                    { color: textPrimary },
                  ]}
                >
                  {stats.quizzes}
                </Text>

                <Text
                  style={[
                    styles.metricLabel,
                    { color: textSecondary },
                  ]}
                >
                  Quizzes
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}
