import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface RecommendationTask {
  id: string;
  title: string;
  subject?: string;
  priority?: string;
  dueDate?: string;
  dueTime?: string;
  completed?: boolean;
}

interface WhatShouldIDoNowProps {
  tasks?: RecommendationTask[];
  primaryBrown?: string;
  textColor?: string;
  secondaryText?: string;
  cardColor?: string;
  borderColor?: string;
  onPress?: (taskId: string) => void;
}

const getDaysDifference = (dueDate?: string): number => {
  if (!dueDate) return 999;

  const today = new Date();
  const due = new Date(dueDate);

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  return Math.ceil(
    (due.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );
};

const getPriorityWeight = (priority?: string): number => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 3;

    case 'medium':
      return 2;

    case 'low':
      return 1;

    default:
      return 0;
  }
};

export default function WhatShouldIDoNow({
  tasks = [],
  primaryBrown = '#A97C50',
  textColor = '#ECEDEE',
  secondaryText = '#9BA1A6',
  cardColor = '#1E1E1E',
  borderColor = '#2E2E2E',
  onPress,
}: WhatShouldIDoNowProps) {
  const recommendation = useMemo(() => {
    const activeTasks = tasks.filter(
      task => !task.completed
    );

    if (activeTasks.length === 0) {
      return null;
    }

    const sortedTasks = [...activeTasks].sort((a, b) => {
      const aDays = getDaysDifference(a.dueDate);
      const bDays = getDaysDifference(b.dueDate);

      // Overdue tasks first
      const aOverdue = aDays < 0;
      const bOverdue = bDays < 0;

      if (aOverdue !== bOverdue) {
        return aOverdue ? -1 : 1;
      }

      // Earlier deadline first
      if (aDays !== bDays) {
        return aDays - bDays;
      }

      // Higher priority first
      return (
        getPriorityWeight(b.priority) -
        getPriorityWeight(a.priority)
      );
    });

    return sortedTasks[0];
  }, [tasks]);

  const formatDeadline = (dueDate?: string) => {
    const days = getDaysDifference(dueDate);

    if (days < 0) {
      const overdueDays = Math.abs(days);

      return `${overdueDays} day${
        overdueDays === 1 ? '' : 's'
      } overdue`;
    }

    if (days === 0) {
      return 'Due today';
    }

    if (days === 1) {
      return 'Due tomorrow';
    }

    return `Due in ${days} days`;
  };

  const getPriorityLabel = (priority?: string) => {
    if (!priority) return 'Normal priority';

    return `${priority} priority`;
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cardColor,
          borderColor,
        },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: `${primaryBrown}20`,
            },
          ]}
        >
          <Feather
            name="compass"
            size={20}
            color={primaryBrown}
          />
        </View>

        <View style={styles.headerText}>
          <Text
            style={[
              styles.label,
              {
                color: secondaryText,
              },
            ]}
          >
            SMART RECOMMENDATION
          </Text>

          <Text
            style={[
              styles.title,
              {
                color: textColor,
              },
            ]}
          >
            What should I do now?
          </Text>
        </View>
      </View>

      {!recommendation ? (
        <View style={styles.completedContainer}>
          <Feather
            name="check-circle"
            size={32}
            color={primaryBrown}
          />

          <Text
            style={[
              styles.completedTitle,
              {
                color: textColor,
              },
            ]}
          >
            You're all caught up!
          </Text>

          <Text
            style={[
              styles.completedDescription,
              {
                color: secondaryText,
              },
            ]}
          >
            You have no unfinished academic tasks right now.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.recommendation}>
            <Text
              style={[
                styles.taskTitle,
                {
                  color: textColor,
                },
              ]}
              numberOfLines={2}
            >
              {recommendation.title}
            </Text>

            {recommendation.subject ? (
              <Text
                style={[
                  styles.subject,
                  {
                    color: secondaryText,
                  },
                ]}
              >
                {recommendation.subject}
              </Text>
            ) : null}

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Feather
                  name="clock"
                  size={14}
                  color={primaryBrown}
                />

                <Text
                  style={[
                    styles.metaText,
                    {
                      color: secondaryText,
                    },
                  ]}
                >
                  {formatDeadline(
                    recommendation.dueDate
                  )}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Feather
                  name="flag"
                  size={14}
                  color={primaryBrown}
                />

                <Text
                  style={[
                    styles.metaText,
                    {
                      color: secondaryText,
                    },
                  ]}
                >
                  {getPriorityLabel(
                    recommendation.priority
                  )}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              onPress?.(recommendation.id)
            }
            style={[
              styles.actionButton,
              {
                backgroundColor: primaryBrown,
              },
            ]}
          >
            <Text style={styles.actionText}>
              Start Task
            </Text>

            <Feather
              name="arrow-right"
              size={16}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 3,
  },

  title: {
    fontSize: 17,
    fontWeight: '700',
  },

  recommendation: {
    marginBottom: 16,
  },

  taskTitle: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: 5,
  },

  subject: {
    fontSize: 13,
    marginBottom: 14,
  },

  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  metaText: {
    fontSize: 12,
  },

  actionButton: {
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  completedContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },

  completedTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 5,
  },

  completedDescription: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});