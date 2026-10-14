import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FocusModeTabs from './FocusModeTabs';
import SubjectSelector from './SubjectSelector';
import TaskPicker from './TaskPicker';
import {
  CUSTOM_DURATION_LIMITS,
  CUSTOM_DURATION_PRESETS,
  getModeDurationSeconds,
  isBreakMode,
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
  const [draft, setDraft] = useState<FocusSessionConfig>(initialConfig);

  const isBreak = isBreakMode(draft.mode);
  const durationMinutes =
    getModeDurationSeconds(draft.mode, draft.customMinutes) / 60;

  const update = (changes: Partial<FocusSessionConfig>) =>
    setDraft((previous) => ({ ...previous, ...changes }));

  const stepCustom = (direction: 1 | -1) =>
    update({
      customMinutes: Math.min(
        CUSTOM_DURATION_LIMITS.max,
        Math.max(
          CUSTOM_DURATION_LIMITS.min,
          draft.customMinutes + direction * CUSTOM_DURATION_LIMITS.step
        )
      ),
    });

  const selectTask = (task: FocusTaskRef | null) =>
    update(
      task?.subject && task.subject.toLowerCase() !== 'general'
        ? { task, subject: task.subject }
        : { task }
    );

  const sectionTitle = (title: string) => (
    <Text style={[styles.sectionTitle, { color: colors.subtext, marginBottom: 10 }]}>
      {title}
    </Text>
  );

  const stepperButton = (direction: 1 | -1) => {
    const atLimit =
      direction === 1
        ? draft.customMinutes >= CUSTOM_DURATION_LIMITS.max
        : draft.customMinutes <= CUSTOM_DURATION_LIMITS.min;

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={direction === 1 ? 'Add 5 minutes' : 'Remove 5 minutes'}
        accessibilityState={{ disabled: atLimit }}
        disabled={atLimit}
        onPress={() => stepCustom(direction)}
        style={({ pressed }) => [
          styles.stepperBtn,
          { backgroundColor: colors.cardStrong, opacity: atLimit ? 0.4 : 1 },
          pressed && styles.pressed,
        ]}
      >
        <Feather name={direction === 1 ? 'plus' : 'minus'} size={20} color={colors.text} />
      </Pressable>
    );
  };

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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                <Text style={[styles.sheetSubtitle, { color: colors.subtext }]}>
                  Changes apply when you save or start.
                </Text>
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
              <View style={styles.sheetSection}>
                {sectionTitle('Study mode')}
                <FocusModeTabs
                  currentMode={draft.mode}
                  customMinutes={draft.customMinutes}
                  onSelectMode={(mode) => update({ mode })}
                  colors={colors}
                />
              </View>

              <View style={styles.sheetSection}>
                {sectionTitle('Duration')}
                {draft.mode === 'custom' ? (
                  <>
                    <View
                      style={[
                        styles.durationRow,
                        { backgroundColor: colors.card, borderColor: colors.border },
                      ]}
                    >
                      {stepperButton(-1)}
                      <Text style={[styles.durationValue, { color: colors.text }]}>
                        {draft.customMinutes} min
                      </Text>
                      {stepperButton(1)}
                    </View>
                    <View style={styles.presetRow}>
                      {CUSTOM_DURATION_PRESETS.map((minutes) => {
                        const isSelected = draft.customMinutes === minutes;
                        return (
                          <Pressable
                            key={minutes}
                            accessibilityRole="radio"
                            accessibilityState={{ selected: isSelected }}
                            onPress={() => update({ customMinutes: minutes })}
                            style={({ pressed }) => [
                              styles.subjectPill,
                              {
                                backgroundColor: isSelected ? colors.primary : colors.card,
                                borderColor: isSelected ? colors.primary : colors.border,
                              },
                              pressed && styles.pressed,
                            ]}
                          >
                            <Text
                              style={[
                                styles.subjectPillText,
                                { color: isSelected ? colors.onPrimary : colors.text },
                              ]}
                            >
                              {minutes} min
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={[styles.durationValue, { color: colors.text }]}>
                      {durationMinutes} minutes
                    </Text>
                    <Text style={[styles.durationNote, { color: colors.subtext }]}>
                      {isBreak
                        ? 'Breaks do not count toward focus statistics.'
                        : 'Choose Custom to set your own length.'}
                    </Text>
                  </>
                )}
              </View>

              {!isBreak && (
                <>
                  <View style={styles.sheetSection}>
                    {sectionTitle('Task')}
                    <TaskPicker
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
                      colors={colors}
                    />
                  </View>

                  <View style={[styles.sheetSection, { marginBottom: 4 }]}>
                    {sectionTitle('Strict mode')}
                    <View
                      style={[
                        styles.strictToggleRow,
                        {
                          backgroundColor: draft.isStrict ? colors.primary + '14' : colors.card,
                          borderColor: draft.isStrict ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <View style={styles.strictToggleLeft}>
                        <Text style={[styles.strictToggleTitle, { color: colors.text }]}>
                          {draft.isStrict ? 'Strict Study Guard on' : 'Strict Study Guard off'}
                        </Text>
                        <Text style={[styles.strictToggleSub, { color: colors.subtext }]}>
                          Locks pausing, resetting, setup changes and leaving the timer until
                          the session ends. You can still end early after confirming.
                        </Text>
                      </View>
                      <Switch
                        value={draft.isStrict}
                        onValueChange={(isStrict) => update({ isStrict })}
                        accessibilityLabel="Strict Study Guard"
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
                  {isBreak ? 'Start break' : `Start ${durationMinutes}-min session`}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
