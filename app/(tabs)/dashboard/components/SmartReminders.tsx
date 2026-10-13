import React, { useMemo } from 'react';
import {
  View,
  Text,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ReminderTask {
  id: string;
  title: string;
  subject?: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate?: string;
  dueTime?: string;
  completed: boolean;
}

interface SmartRemindersProps {
  tasks?: ReminderTask[];
  primaryBrown?: string;
  textColor?: string;
  secondaryText?: string;
  cardColor?: string;
  borderColor?: string;
}

const getToday = () => {
  const date = new Date();

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export default function SmartReminders({
  tasks = [],
  primaryBrown = '#A97C50',
  textColor = '#ECEDEE',
  secondaryText = '#9BA1A6',
  cardColor = '#1E1E1E',
  borderColor = '#2E2E2E',
}: SmartRemindersProps) {
  const reminder = useMemo(() => {
    const today = getToday();

    const activeTasks = tasks.filter(
      (task): task is ReminderTask & { dueDate: string } =>
        !task.completed && typeof task.dueDate === 'string' && task.dueDate.length > 0,
    );

    if (activeTasks.length === 0) {
      return null;
    }

    /**
     * 1. Overdue tasks
     */
    const overdue = activeTasks
      .filter((task) => task.dueDate < today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    if (overdue.length > 0) {
      const task =
        overdue[0];

      return {
        icon: 'alert-circle',
        title: 'Overdue Task',
        message: `"${task.title}" is overdue.`,
        detail:
          task.subject ||
          'Academic task',
      };
    }

    /**
     * 2. Tasks due today
     */
    const todayTasks = activeTasks.filter((task) => task.dueDate === today);

    if (todayTasks.length > 0) {
      const task = todayTasks.sort((a, b) => {
        const priorityOrder = {
          High: 0,
          Medium: 1,
          Low: 2,
        };

        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })[0];

      return {
        icon: 'clock',
        title: 'Due Today',
        message: `"${task.title}" is due today.`,
        detail:
          task.dueTime
            ? `Due at ${task.dueTime}`
            : task.subject ||
              'Academic task',
      };
    }

    /**
     * 3. High-priority upcoming tasks
     */
    const highPriority = activeTasks
      .filter((task) => task.priority === 'High' && task.dueDate > today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    if (
      highPriority.length > 0
    ) {
      const task =
        highPriority[0];

      return {
        icon: 'flag',
        title: 'High Priority',
        message: `"${task.title}" needs your attention.`,
        detail:
          task.subject ||
          'Academic task',
      };
    }

    return null;
  }, [tasks]);

  /**
   * Don't render anything if
   * there is nothing important
   * to remind the student about.
   */
  if (!reminder) {
    return null;
  }

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
        borderRadius: 18,
        backgroundColor: cardColor,
        borderWidth: 1,
        borderColor,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {/* Icon */}
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor:
              `${primaryBrown}20`,
          }}
        >
          <Feather
            name={
              reminder.icon as any
            }
            size={18}
            color={primaryBrown}
          />
        </View>

        {/* Text */}
        <View
          style={{
            flex: 1,
            marginLeft: 12,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: primaryBrown,
              marginBottom: 3,
            }}
          >
            Smart Reminder
          </Text>

          <Text
            style={{
              fontSize: 15,
              fontWeight: '700',
              color: textColor,
            }}
          >
            {reminder.title}
          </Text>

          <Text
            style={{
              marginTop: 3,
              fontSize: 12,
              lineHeight: 17,
              color: secondaryText,
            }}
          >
            {reminder.message}
          </Text>

          <Text
            style={{
              marginTop: 3,
              fontSize: 11,
              color: secondaryText,
            }}
          >
            {reminder.detail}
          </Text>
        </View>
      </View>
    </View>
  );
}