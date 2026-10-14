import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { taskService } from '@/app/services/task.services';
import { FocusPalette, FocusTaskRef } from '../types';
import { focusStyles as styles } from '../styles/focus.styles';

const COLLAPSED_COUNT = 4;

interface TaskPickerProps {
  selectedTask: FocusTaskRef | null;
  onSelectTask: (task: FocusTaskRef | null) => void;
  colors: FocusPalette;
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; tasks: FocusTaskRef[] };

/** Lists the user's open tasks (read-only, existing GET /tasks). */
export default function TaskPicker({
  selectedTask,
  onSelectTask,
  colors,
}: TaskPickerProps) {
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' });
  const [showAll, setShowAll] = useState(false);

  // Bumped by "Try again" to refetch.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    taskService
      .getTasks()
      .then((tasks) => {
        if (cancelled) return;

        setLoadState({
          status: 'ready',
          tasks: tasks
            .filter((task) => task && typeof task.id === 'string' && !task.completed)
            .map((task) => ({
              id: task.id,
              title: String(task.title ?? 'Untitled task'),
              subject: String(task.subject ?? ''),
            })),
        });
      })
      .catch((error) => {
        console.warn('Unable to load tasks for focus timer:', error);
        if (!cancelled) setLoadState({ status: 'error' });
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const renderRow = (task: FocusTaskRef | null) => {
    const isSelected = task === null ? selectedTask === null : selectedTask?.id === task.id;

    return (
      <Pressable
        key={task?.id ?? 'none'}
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected }}
        onPress={() => onSelectTask(task)}
        style={({ pressed }) => [
          styles.taskRow,
          {
            backgroundColor: isSelected ? colors.primary + '14' : colors.card,
            borderColor: isSelected ? colors.primary : colors.border,
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
          <Text numberOfLines={1} style={[styles.taskMeta, { color: colors.subtext }]}>
            {task ? task.subject || 'No subject' : 'Just study the subject below'}
          </Text>
        </View>
      </Pressable>
    );
  };

  if (loadState.status === 'loading') {
    return (
      <View>
        {renderRow(null)}
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
        {selectedTask && renderRow(selectedTask)}
        {renderRow(null)}
        <View style={styles.taskStateBox}>
          <Text style={[styles.taskStateText, { color: colors.subtext }]}>
            Couldn&apos;t load your tasks.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setLoadState({ status: 'loading' });
              setReloadKey((key) => key + 1);
            }}
            hitSlop={10}
          >
            <Text style={[styles.sectionLink, { color: colors.primary }]}>Try again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Keep a previously chosen task visible even if it is no longer open.
  const tasks =
    selectedTask && !loadState.tasks.some((task) => task.id === selectedTask.id)
      ? [selectedTask, ...loadState.tasks]
      : loadState.tasks;

  const visibleTasks = showAll ? tasks : tasks.slice(0, COLLAPSED_COUNT);

  return (
    <View>
      {renderRow(null)}
      {visibleTasks.map(renderRow)}

      {tasks.length === 0 && (
        <Text style={[styles.taskStateText, { color: colors.subtext, paddingVertical: 6 }]}>
          No open tasks. Add tasks in the Tasks tab to focus on them here.
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
