import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { isRealSubject } from '../constants/focusConfig';
import { FocusPalette, FocusTaskRef } from '../types';
import { focusStyles as styles } from '../styles/focus.styles';

const COLLAPSED_COUNT = 4;

/** An open task (or calendar event) the user can focus on. */
export interface PickerTask extends FocusTaskRef {
  dueDate?: string;
}

export type TaskLoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; tasks: PickerTask[] };

interface TaskPickerProps {
  loadState: TaskLoadState;
  onRetry: () => void;
  selectedTask: FocusTaskRef | null;
  onSelectTask: (task: FocusTaskRef | null) => void;
  colors: FocusPalette;
}

const startOfDay = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();

/* "2026-10-15" -> "due today" / "due tomorrow" / "due Fri" / "due Oct 30" / "overdue" */
function describeDue(dueDate?: string): string | null {
  if (!dueDate) return null;

  const due = new Date(`${dueDate.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(due.getTime())) return null;

  const days = Math.round((startOfDay(due) - startOfDay(new Date())) / 86400000);

  if (days < 0) return 'overdue';
  if (days === 0) return 'due today';
  if (days === 1) return 'due tomorrow';
  if (days < 7) return `due ${due.toLocaleDateString('en-US', { weekday: 'short' })}`;

  return `due ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

/* "Database Systems · due today", or "Calendar · Personal" for events. */
function describeTask(task: PickerTask): string {
  const due = describeDue(task.dueDate);
  const first = isRealSubject(task.subject)
    ? task.subject
    : task.subject
      ? `Calendar · ${task.subject}`
      : 'No subject';

  return due ? `${first} · ${due}` : first;
}

/** Lists the user's open tasks. Data is loaded by FocusSetupModal. */
export default function TaskPicker({
  loadState,
  onRetry,
  selectedTask,
  onSelectTask,
  colors,
}: TaskPickerProps) {
  const [showAll, setShowAll] = useState(false);

  const renderRow = (task: PickerTask | null) => {
    const isSelected = task === null ? selectedTask === null : selectedTask?.id === task.id;

    return (
      <Pressable
        key={task?.id ?? 'none'}
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected }}
        onPress={() =>
          onSelectTask(task ? { id: task.id, title: task.title, subject: task.subject } : null)
        }
        style={({ pressed }) => [
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 12,
            paddingHorizontal: 14,
            backgroundColor: isSelected ? colors.primary + '14' : 'transparent',
          },
          pressed && { opacity: 0.85 },
        ]}
      >
        <Feather
          name={isSelected ? 'check-circle' : 'circle'}
          size={18}
          color={isSelected ? colors.primary : colors.subtext}
        />
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={[styles.taskTitle, { color: colors.text }]}>
            {task ? task.title : 'No specific task'}
          </Text>
          {task && (
            <Text numberOfLines={1} style={[styles.taskMeta, { color: colors.subtext }]}>
              {describeTask(task)}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  /* Rows grouped in one rounded box with thin dividers. */
  const group = (rows: React.ReactNode[]) => (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: colors.card,
      }}
    >
      {rows.map((row, index) => (
        <View
          key={index}
          style={index > 0 ? { borderTopWidth: 1, borderTopColor: colors.border } : undefined}
        >
          {row}
        </View>
      ))}
    </View>
  );

  if (loadState.status === 'loading') {
    return (
      <View>
        {group([renderRow(null)])}
        <View style={styles.taskStateBox}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.taskStateText, { color: colors.subtext }]}>Loading your tasks…</Text>
        </View>
      </View>
    );
  }

  if (loadState.status === 'error') {
    return (
      <View>
        {group(selectedTask ? [renderRow(selectedTask), renderRow(null)] : [renderRow(null)])}
        <View style={styles.taskStateBox}>
          <Text style={[styles.taskStateText, { color: colors.subtext }]}>
            Couldn&apos;t load your tasks.
          </Text>
          <Pressable accessibilityRole="button" onPress={onRetry} hitSlop={10}>
            <Text style={[styles.sectionLink, { color: colors.primary }]}>Try again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Keep a previously chosen task visible even if it is no longer open.
  const tasks: PickerTask[] =
    selectedTask && !loadState.tasks.some((task) => task.id === selectedTask.id)
      ? [selectedTask, ...loadState.tasks]
      : loadState.tasks;

  const visibleTasks = showAll ? tasks : tasks.slice(0, COLLAPSED_COUNT);

  return (
    <View>
      {group([renderRow(null), ...visibleTasks.map(renderRow)])}

      {tasks.length === 0 && (
        <Text style={{ fontSize: 12, color: colors.subtext, marginTop: 8, marginLeft: 2 }}>
          No open tasks yet. Add one in Task Manager.
        </Text>
      )}

      {tasks.length > COLLAPSED_COUNT && (
        <Pressable
          accessibilityRole="button"
          onPress={() => setShowAll((previous) => !previous)}
          hitSlop={10}
          style={{ alignSelf: 'center', paddingVertical: 6 }}
        >
          <Text style={[styles.sectionLink, { color: colors.primary }]}>
            {showAll ? 'Show fewer' : `Show all ${tasks.length} tasks`}
          </Text>
        </Pressable>
      )}
    </View>
  );
}