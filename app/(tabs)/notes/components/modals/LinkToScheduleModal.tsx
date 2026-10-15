import React from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { AppAlert } from '@/components/AppAlert';
import { Feather } from '@expo/vector-icons';
import api from '@/app/services/api';
import { Note } from '@/app/services/localDb';
import { getNotePreview, triggerHaptic } from '../../utils/noteHelpers';
import { noteStyles as styles } from '../../styles/notes.styles';
import { toTime24 } from '@/utils/time';

interface LinkToScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  note: Note | null;
  dateInput: string;
  onDateChange: (val: string) => void;
  timeInput: string;
  onTimeChange: (val: string) => void;
  cardBg: string;
  borderCol: string;
  inputBg: string;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
}

export default function LinkToScheduleModal({
  visible,
  onClose,
  note,
  dateInput,
  onDateChange,
  timeInput,
  onTimeChange,
  cardBg,
  borderCol,
  inputBg,
  textPrimary,
  textSecondary,
  primaryBrown,
}: LinkToScheduleModalProps) {
  if (!visible || !note) return null;

  const handleConfirm = async () => {
  if (!note) return;

  // Users type 12-hour time ("2:00 PM"); the task is saved as "14:00".
  const dueTime = toTime24(timeInput);
  if (!dueTime) {
    AppAlert.alert('Check the time', 'Type a time like 2:00 PM.');
    return;
  }

  try {
    triggerHaptic();

    await api.post('/tasks', {
      title: `Review: ${note.title}`,
      description: `Study notes from ${note.category}:\n\n${getNotePreview(note.content, 150)}`,
      date: dateInput,
      time: dueTime,
      category: 'Exam',
      duration: 60,
      priority: 'Medium',
      dueDate: dateInput,
      dueTime,
      hasReminder: true,
      subTasks: [],
    });

    onClose();
  } catch (error) {
    console.error('Failed to schedule note:', error);
  }
};

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {/* Lift the card above the keyboard while typing. */}
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <View style={styles.modalCardHeader}>
            <View style={styles.modalCardHeaderLeft}>
              <Feather name="calendar" size={18} color="#6366F1" style={{ marginRight: 8 }} />
              <Text style={[styles.modalTitle, { color: textPrimary }]}>Link to Calendar</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={18} color={textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalSubtitle, { color: textSecondary }]}>
            Schedule an academic review or study block for this note on your planner.
          </Text>

          {/* Date Input */}
          <Text style={[styles.inputLabel, { color: textSecondary }]}>DATE (YYYY-MM-DD)</Text>
          <TextInput
            style={[styles.modalTextInput, { backgroundColor: inputBg, borderColor: borderCol, color: textPrimary }]}
            value={dateInput}
            onChangeText={onDateChange}
            placeholder="2026-08-15"
            placeholderTextColor={textSecondary}
          />

          {/* Time Input */}
          <Text style={[styles.inputLabel, { color: textSecondary }]}>TIME (e.g. 2:00 PM)</Text>
          <TextInput
            style={[styles.modalTextInput, { backgroundColor: inputBg, borderColor: borderCol, color: textPrimary }]}
            value={timeInput}
            onChangeText={onTimeChange}
            placeholder="2:00 PM"
            autoCapitalize="characters"
            placeholderTextColor={textSecondary}
          />

          {/* Action Buttons */}
          <View style={styles.modalActionsRow}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.modalCancelBtn, { borderColor: borderCol, backgroundColor: inputBg }]}
            >
              <Text style={[styles.modalCancelBtnText, { color: textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              style={[styles.modalConfirmBtn, { backgroundColor: '#6366F1' }]}
            >
              <Feather name="calendar" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.modalConfirmBtnText}>Schedule Event</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
