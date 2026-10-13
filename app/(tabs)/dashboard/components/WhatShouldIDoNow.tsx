
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import {
  taskService,
  TaskRecommendation,
} from '@/app/services/task.services';

interface WhatShouldIDoNowProps {
  primaryBrown?: string;
  textColor?: string;
  secondaryText?: string;
  cardColor?: string;
  borderColor?: string;
  onPress?: (taskId: string) => void;
}


const getDaysDifference = (
  dueDate?: string,
): number => {
  if (!dueDate) return 999;

  const today = new Date();
  const due = new Date(dueDate);
  

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  return Math.ceil(
    (due.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24),
  );
};

const formatDeadline = (
  dueDate?: string,
): string => {
  if (!dueDate) {
    return 'No deadline';
  }

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

const getPriorityLabel = (
  priority?: string,
): string => {
  if (!priority) {
    return 'Normal priority';
  }

  return `${priority} priority`;
};

export default function WhatShouldIDoNow({
  primaryBrown = '#A97C50',
  textColor = '#ECEDEE',
  secondaryText = '#9BA1A6',
  cardColor = '#1E1E1E',
  borderColor = '#2E2E2E',
  onPress,
}: WhatShouldIDoNowProps) {
    const router = useRouter();
  const [
    recommendation,
    setRecommendation,
  ] = useState<TaskRecommendation | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

 

  // ===============================
  // LOAD RECOMMENDATION
  // ===============================

  // State is only set once the request settles (in the
  // .then callbacks), so the effect below can start it.
  const handleRecommendation =
    useCallback((result: TaskRecommendation | null) => {
      setRecommendation(result);
      setError(false);
      setLoading(false);
    }, []);

  const handleRecommendationError =
    useCallback((err: unknown) => {
      console.error(
        'Failed to load task recommendation:',
        err,
      );

      setError(true);
      setRecommendation(null);
      setLoading(false);
    }, []);

  // Retry button: show the spinner again, then reload.
  const loadRecommendation =
    useCallback(() => {
      setLoading(true);
      setError(false);

      return taskService
        .getTaskRecommendation()
        .then(handleRecommendation, handleRecommendationError);
    }, [handleRecommendation, handleRecommendationError]);

  // Initial load (loading already starts as true).
  useEffect(() => {
    taskService
      .getTaskRecommendation()
      .then(handleRecommendation, handleRecommendationError);
  }, [handleRecommendation, handleRecommendationError]);

  // ===============================
  // LOADING STATE
  // ===============================

  if (loading) {
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

        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={primaryBrown}
          />

          <Text
            style={[
              styles.loadingText,
              {
                color: secondaryText,
              },
            ]}
          >
            Analyzing your tasks...
          </Text>
        </View>
      </View>
    );
  }

  // ===============================
  // ERROR STATE
  // ===============================

  if (error) {
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

        <View style={styles.emptyContainer}>
          <Feather
            name="alert-circle"
            size={30}
            color={secondaryText}
          />

          <Text
            style={[
              styles.emptyTitle,
              {
                color: textColor,
              },
            ]}
          >
            Unable to load recommendation
          </Text>

          <Text
            style={[
              styles.emptyDescription,
              {
                color: secondaryText,
              },
            ]}
          >
            We couldn&apos;t analyze your tasks right now.
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={loadRecommendation}
            style={[
              styles.retryButton,
              {
                borderColor: primaryBrown,
              },
            ]}
          >
            <Text
              style={[
                styles.retryText,
                {
                  color: primaryBrown,
                },
              ]}
            >
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ===============================
  // NO RECOMMENDATION
  // ===============================

  if (
    !recommendation?.hasRecommendation
  ) {
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
  {recommendation?.message ?? "You're all caught up!"}
</Text>

          <Text
            style={[
              styles.completedDescription,
              {
                color: secondaryText,
              },
            ]}
          >
            You have no unfinished academic
            tasks right now.
          </Text>
        </View>
      </View>
    );
  }

  // ===============================
  // RECOMMENDATION
  // ===============================

  const taskId =
    recommendation.taskId;

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

      <View style={styles.recommendation}>
        <View style={styles.urgencyRow}>
          <View
            style={[
              styles.urgencyBadge,
              {
                backgroundColor: `${primaryBrown}20`,
              },
            ]}
          >
            <Text
              style={[
                styles.urgencyText,
                {
                  color: primaryBrown,
                },
              ]}
            >
              {recommendation.urgency ||
                'RECOMMENDED'}
            </Text>
          </View>
        </View>

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
                recommendation.dueDate,
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
                recommendation.priority,
              )}
            </Text>
          </View>
        </View>

        {recommendation.reason ? (
          <Text
            style={[
              styles.reason,
              {
                color: secondaryText,
              },
            ]}
          >
            {recommendation.reason}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity
  activeOpacity={0.8}
  disabled={!taskId}
  onPress={() => {
    if (!taskId) {
      return;
    }

    console.log(
      "START TASK PRESSED:",
      taskId,
    );

    router.push({
      pathname: "/(tabs)/tasks/task",
      params: {
        taskId,
      },
    });
  }}
  style={[
    styles.actionButton,
    {
      backgroundColor: primaryBrown,
      opacity: taskId ? 1 : 0.5,
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

  urgencyRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },

  urgencyBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  urgencyText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
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

  reason: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
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
    textAlign: 'center',
  },

  completedDescription: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },

  loadingText: {
    fontSize: 13,
    marginTop: 10,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },

  emptyDescription: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 14,
  },

  retryButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },

  retryText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
