import React from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FOCUS_MODE_DURATIONS, formatFocusMinutes } from '../constants/focusConfig';
import { BreakMode, FocusCompletion, FocusPalette } from '../types';
import { focusStyles as styles } from '../styles/focus.styles';

interface SessionCompletionModalProps {
  completion: FocusCompletion | null;
  todayMinutes: number;
  onStartBreak: (mode: BreakMode) => void;
  onDismiss: () => void;
  colors: FocusPalette;
}

export default function SessionCompletionModal({
  completion,
  todayMinutes,
  onStartBreak,
  onDismiss,
  colors,
}: SessionCompletionModalProps) {
  if (!completion) return null;

  const breakMinutes = FOCUS_MODE_DURATIONS[completion.suggestedBreak] / 60;
  const isLongBreak = completion.suggestedBreak === 'longBreak';

  return (
    <Modal
      visible
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.modalBadgeIcon, { backgroundColor: colors.primary + '20' }]}>
            <Feather name="award" size={30} color={colors.primary} />
          </View>

          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Session complete
          </Text>

          <Text style={[styles.modalSubtitle, { color: colors.subtext }]}>
            You focused on{' '}
            <Text style={{ fontWeight: '700', color: colors.text }}>
              {completion.taskTitle ?? completion.subject}
            </Text>
            {completion.taskTitle ? ` (${completion.subject})` : ''}. It has been saved to your history.
          </Text>

          <View
            style={[
              styles.modalStatsRow,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}
          >
            <View style={styles.modalStatItem}>
              <Text style={[styles.modalStatVal, { color: colors.primary }]}>
                {formatFocusMinutes(completion.durationMinutes)}
              </Text>
              <Text style={[styles.modalStatSub, { color: colors.subtext }]}>This session</Text>
            </View>
            <View style={styles.modalStatItem}>
              <Text style={[styles.modalStatVal, { color: colors.success }]}>
                {formatFocusMinutes(todayMinutes)}
              </Text>
              <Text style={[styles.modalStatSub, { color: colors.subtext }]}>Today</Text>
            </View>
            <View style={styles.modalStatItem}>
              <Text style={[styles.modalStatVal, { color: '#F59E0B' }]}>
                {completion.isStrict ? 'Strict' : 'Casual'}
              </Text>
              <Text style={[styles.modalStatSub, { color: colors.subtext }]}>Discipline</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => onStartBreak(completion.suggestedBreak)}
            style={({ pressed }) => [
              styles.modalPrimaryBtn,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
          >
            <Feather name="coffee" size={17} color={colors.onPrimary} />
            <Text style={[styles.modalBtnText, { color: colors.onPrimary }]}>
              Start {breakMinutes}-min {isLongBreak ? 'long break' : 'break'}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={onDismiss}
            style={({ pressed }) => [styles.modalSecondaryBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={[styles.modalBtnText, { color: colors.subtext }]}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
