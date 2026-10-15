import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SubjectSelector, { SubjectOption } from './SubjectSelector';
import TaskPicker, { TaskLoadState } from './TaskPicker';
import { taskService } from '@/app/services/task.services';
import {
  isBreakMode,
  isRealSubject,
} from '../constants/focusConfig';
import { FocusPalette, FocusSessionConfig, FocusTaskRef } from '../types';
import { focusStyles as styles } from '../styles/focus.styles';

interface FocusSetupModalProps {
  initialConfig: FocusSessionConfig;
  onClose: () => void;
  onSave: (config: FocusSessionConfig) => void;
  onStart: (config: FocusSessionConfig) => void;
  colors: FocusPalette;
}

/**
 * Session setup sheet. Edits a draft; nothing reaches the timer until
 * Save or Start is pressed, so closing never changes the session.
 * Mount it only while open so each opening starts from the current setup.
 */
export default function FocusSetupModal({
  initialConfig,
  onClose,
  onSave,
  onStart,
  colors,
}: FocusSetupModalProps) {
  const insets = useSafeAreaInsets();
  // Setup is for focus sessions; breaks start from the completion screen.
  const [draft, setDraft] = useState<FocusSessionConfig>(() =>
    isBreakMode(initialConfig.mode)
      ? { ...initialConfig, mode: 'pomodoro' }
      : initialConfig,
  );

  const isBreak = isBreakMode(draft.mode);

  /* ---------- the user's tasks (for Task and Subject) ---------- */

  const [taskLoad, setTaskLoad] = useState<TaskLoadState>({ status: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    taskService
      .getTasks()
      .then((tasks) => {
        if (cancelled) return;

        setTaskLoad({
          status: 'ready',
          tasks: tasks
            .filter((task) => task && typeof task.id === 'string' && !task.completed)
            .map((task) => ({
              id: task.id,
              title: String(task.title ?? 'Untitled task'),
              subject: String(task.subject ?? '').trim(),
              dueDate: task.dueDate ? String(task.dueDate) : undefined,
            }))
            // Soonest due first; tasks without a date last.
            .sort((a, b) =>
              (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999')
            ),
        });
      })
      .catch((error) => {
        console.warn('Unable to load tasks for focus timer:', error);
        if (!cancelled) setTaskLoad({ status: 'error' });
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Subjects the user typed in their tasks, most used first.
  const subjects = useMemo<SubjectOption[]>(() => {
    if (taskLoad.status !== 'ready') return [];

    const counts = new Map<string, SubjectOption>();

    for (const task of taskLoad.tasks) {
      if (!isRealSubject(task.subject)) continue;

      const key = task.subject.toLowerCase();
      const existing = counts.get(key);

      if (existing) existing.count += 1;
      else counts.set(key, { name: task.subject, count: 1 });
    }

    return [...counts.values()].sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name)
    );
  }, [taskLoad]);

  const update = (changes: Partial<FocusSessionConfig>) =>
    setDraft((previous) => ({ ...previous, ...changes }));

  // Picking a task fills in its subject (calendar categories are skipped).
  const selectTask = (task: FocusTaskRef | null) =>
    update(
      task && isRealSubject(task.subject)
        ? { task, subject: task.subject }
        : { task }
    );

  const isSubjectFromTask =
    !!draft.task &&
    isRealSubject(draft.task.subject) &&
    draft.task.subject.trim().toLowerCase() === draft.subject.trim().toLowerCase();

  const sectionTitle = (title: string, right?: string) => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
      }}
    >
      <Text style={[styles.sectionTitle, { color: colors.subtext }]}>{title}</Text>
      {!!right && (
        <Text style={{ fontSize: 12, color: colors.subtext }}>{right}</Text>
      )}
    </View>
  );

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
      >
        <View style={styles.sheetOverlay}>
          {/* Tapping the backdrop closes without applying changes. */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close session setup"
            style={{ flex: 1 }}
            onPress={onClose}
          />

          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                marginTop: insets.top + 12,
                flexShrink: 1,
              },
            ]}
          >
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>Session setup</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close without saving"
                onPress={onClose}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.iconButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  pressed && styles.pressed,
                ]}
              >
                <Feather name="x" size={18} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView
              style={{ flexGrow: 0, flexShrink: 1 }}
              contentContainerStyle={styles.sheetBody}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
            >
              {!isBreak && (
                <>
                  <View style={styles.sheetSection}>
                    {sectionTitle('Task', 'Optional')}
                    <TaskPicker
                      loadState={taskLoad}
                      onRetry={() => {
                        setTaskLoad({ status: 'loading' });
                        setReloadKey((key) => key + 1);
                      }}
                      selectedTask={draft.task}
                      onSelectTask={selectTask}
                      colors={colors}
                    />
                  </View>

                  <View style={styles.sheetSection}>
                    {sectionTitle('Subject')}
                    <SubjectSelector
                      selectedSubject={draft.subject}
                      onSelectSubject={(subject) => update({ subject })}
                      subjects={subjects}
                      isLoading={taskLoad.status === 'loading'}
                      isFromTask={isSubjectFromTask}
                      colors={colors}
                    />
                  </View>

                  <View style={[styles.sheetSection, { marginBottom: 4 }]}>
                    {sectionTitle('Strict mode')}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                        borderRadius: 14,
                        borderWidth: 1,
                        backgroundColor: colors.card,
                        borderColor: draft.isStrict ? colors.primary : colors.border,
                      }}
                    >
                      <Feather name="shield" size={18} color={colors.primary} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
                          Strict mode
                        </Text>
                        <Text style={{ fontSize: 11.5, marginTop: 2, color: colors.subtext }}>
                          Locks pause, reset and leaving until the session ends.
                        </Text>
                      </View>
                      <Switch
                        value={draft.isStrict}
                        onValueChange={(isStrict) => update({ isStrict })}
                        accessibilityLabel="Strict mode"
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor="#FFFFFF"
                      />
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            <View
              style={[
                styles.sheetFooter,
                {
                  borderTopColor: colors.border,
                  paddingBottom: Math.max(insets.bottom, 12) + 4,
                },
              ]}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Save setup"
                onPress={() => onSave(draft)}
                style={({ pressed }) => [
                  styles.footerBtn,
                  {
                    flex: 1,
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.footerBtnText, { color: colors.text }]}>Save</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isBreak ? 'Start break' : 'Start focus session'}
                onPress={() => onStart(draft)}
                style={({ pressed }) => [
                  styles.footerBtn,
                  { flex: 2, backgroundColor: isBreak ? colors.success : colors.primary },
                  pressed && styles.pressed,
                ]}
              >
                <Feather name="play" size={17} color={colors.onPrimary} />
                <Text style={[styles.footerBtnText, { color: colors.onPrimary }]}>
                  {isBreak ? 'Start break' : 'Start session'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}