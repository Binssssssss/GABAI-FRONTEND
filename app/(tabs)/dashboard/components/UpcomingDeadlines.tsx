import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DashboardDeadline } from './types';

interface UpcomingDeadlinesProps {
  deadlines: DashboardDeadline[];
  getPriorityColor: (
    priority: DashboardDeadline['priority']
  ) => string;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
}

export default function UpcomingDeadlines({
  deadlines,
  getPriorityColor,
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  primaryBrown,
}: UpcomingDeadlinesProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() =>
        router.push('/(tabs)/tasks/task' as any)
      }
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor: borderCol,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            { color: textPrimary },
          ]}
        >
          Upcoming Deadlines
        </Text>

        <Feather
          name="chevron-right"
          size={17}
          color={textSecondary}
        />
      </View>

      {/* Deadlines */}
      {deadlines.slice(0, 4).map((dl) => (
        <View
          key={dl.id}
          style={styles.deadline}
        >
          <View style={styles.deadlineTop}>
            <View style={styles.nameContainer}>
              <View
                style={[
                  styles.priorityDot,
                  {
                    backgroundColor:
                      getPriorityColor(dl.priority),
                  },
                ]}
              />

              <Text
                numberOfLines={1}
                style={[
                  styles.assignment,
                  { color: textPrimary },
                ]}
              >
                {dl.assignment}
              </Text>
            </View>

            <Text
              style={[
                styles.countdown,
                { color: textSecondary },
              ]}
            >
              {dl.countdown}
            </Text>
          </View>

          {/* Progress */}
          <View style={styles.progressRow}>
            <View
              style={[
                styles.progressBackground,
                { backgroundColor: borderCol },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: primaryBrown,
                    width: `${dl.completion}%`,
                  },
                ]}
              />
            </View>

            <Text
              style={[
                styles.percent,
                { color: textSecondary },
              ]}
            >
              {dl.completion}%
            </Text>
          </View>
        </View>
      ))}

      {deadlines.length === 0 && (
        <View style={styles.empty}>
          <Feather
            name="check-circle"
            size={15}
            color={primaryBrown}
          />

          <Text
            style={[
              styles.emptyText,
              { color: textSecondary },
            ]}
          >
            No upcoming deadlines
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 15,
    marginBottom: 16,
  },

  header: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  title: {
    fontSize: 14,
    fontWeight: '700',
  },

  deadline: {
    paddingVertical: 10,
  },

  deadlineTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },

  priorityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 8,
  },

  assignment: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },

  countdown: {
    fontSize: 10,
    fontWeight: '500',
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  progressBackground: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  percent: {
    width: 34,
    marginLeft: 8,
    fontSize: 9,
    textAlign: 'right',
    fontWeight: '600',
  },

  empty: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 11,
    marginLeft: 7,
  },
});