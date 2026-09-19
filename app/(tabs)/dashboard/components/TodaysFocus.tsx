import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DashboardTask } from './types';

interface TodaysFocusProps {
  tasks: DashboardTask[];
  onToggleComplete: (id: string) => void;
  getPriorityColor: (priority: DashboardTask['priority']) => string;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
}

export default function TodaysFocus({
  tasks,
  onToggleComplete,
  getPriorityColor,
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  primaryBrown,
}: TodaysFocusProps) {
  const router = useRouter();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: cardBg,
          borderColor: borderCol,
        },
      ]}
    >
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.7}
        onPress={() =>
          router.push('/(tabs)/tasks/task' as any)
        }
      >
        <Text style={[styles.title, { color: textPrimary }]}>
          Today's Focus
        </Text>

        <Feather
          name="chevron-right"
          size={17}
          color={textSecondary}
        />
      </TouchableOpacity>

      {/* Tasks */}
      {tasks.length > 0 ? (
        tasks.slice(0, 3).map((task) => (
          <View
            key={task.id}
            style={styles.taskRow}
          >
            {/* Checkbox */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onToggleComplete(task.id)}
              style={[
                styles.checkbox,
                {
                  borderColor: task.completed
                    ? primaryBrown
                    : borderCol,
                  backgroundColor: task.completed
                    ? `${primaryBrown}15`
                    : 'transparent',
                },
              ]}
            >
              {task.completed && (
                <Feather
                  name="check"
                  size={11}
                  color={primaryBrown}
                />
              )}
            </TouchableOpacity>

            {/* Task */}
            <TouchableOpacity
              style={styles.taskInfo}
              activeOpacity={0.7}
              onPress={() =>
                router.push('/(tabs)/tasks/task' as any)
              }
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.taskTitle,
                  {
                    color: textPrimary,
                    textDecorationLine: task.completed
                      ? 'line-through'
                      : 'none',
                  },
                ]}
              >
                {task.title}
              </Text>

              <Text
                numberOfLines={1}
                style={[
                  styles.taskTime,
                  { color: textSecondary },
                ]}
              >
                {task.dueTime} · {task.countdown}
              </Text>
            </TouchableOpacity>

            {/* Priority */}
            <View
              style={[
                styles.priorityDot,
                {
                  backgroundColor: getPriorityColor(
                    task.priority
                  ),
                },
              ]}
            />
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Feather
            name="check-circle"
            size={16}
            color={primaryBrown}
          />

          <Text
            style={[
              styles.emptyText,
              { color: textSecondary },
            ]}
          >
            You're all caught up
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },

  header: {
    height: 46,
    paddingHorizontal: 15,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 14,
    fontWeight: '700',
  },

  taskRow: {
    minHeight: 56,
    paddingHorizontal: 15,

    flexDirection: 'row',
    alignItems: 'center',
  },

  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 6,
    borderWidth: 1.5,

    alignItems: 'center',
    justifyContent: 'center',
  },

  taskInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },

  taskTitle: {
    fontSize: 13,
    fontWeight: '600',
  },

  taskTime: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 3,
  },

  priorityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  emptyState: {
    height: 50,
    paddingHorizontal: 15,

    flexDirection: 'row',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 8,
  },
});