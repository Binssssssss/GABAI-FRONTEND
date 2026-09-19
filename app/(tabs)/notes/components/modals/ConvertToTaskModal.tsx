import React from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { localDb, Note, Task } from '@/app/services/localDb';
import { triggerHaptic } from '../../utils/noteHelpers';
import { noteStyles as styles } from '../../styles/notes.styles';

interface ConvertToTaskModalProps {
  visible: boolean;
  onClose: () => void;
  note: Note | null;
  subjectInput: string;
  onSubjectChange: (val: string) => void;
  priorityInput: Task['priority'];
  onPriorityChange: (p: Task['priority']) => void;
  categoryInput: Task['category'];
  onCategoryChange: (c: Task['category']) => void;
  cardBg: string;
  borderCol: string;
  inputBg: string;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
}

export default function ConvertToTaskModal({
  visible,
  onClose,
  note,
  subjectInput,
  onSubjectChange,
  priorityInput,
  onPriorityChange,
  categoryInput,
  onCategoryChange,
  cardBg,
  borderCol,
  inputBg,
  textPrimary,
  textSecondary,
  primaryBrown,
}: ConvertToTaskModalProps) {
  if (!visible || !note) return null;

  const priorities: Task['priority'][] = ['Low', 'Medium', 'High'];

  const handleConfirm = () => {
    triggerHaptic();
    localDb.addTask({
      title: `Review Note: ${note.title}`,
      description: note.content.slice(0, 200),
      subject: subjectInput.trim() || note.category,
      priority: priorityInput,
      category: categoryInput,
      difficulty: 'Medium',
      duration: 1.0,
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      dueTime: '18:00',
      completed: false,
      hasReminder: false,
      repeat: 'None',
      isPinned: false,
      isFavorite: false,
      attachments: 0,
      subTasks: [],
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <View style={styles.modalCardHeader}>
            <View style={styles.modalCardHeaderLeft}>
              <Feather name="check-circle" size={18} color="#10B981" style={{ marginRight: 8 }} />
              <Text style={[styles.modalTitle, { color: textPrimary }]}>Convert to Task</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={18} color={textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalSubtitle, { color: textSecondary }]}>
            Create an actionable task item in your Tasks todo list from this note.
          </Text>

          {/* Note Summary Card */}
          <View style={[styles.convertNoteSummary, { backgroundColor: inputBg, borderColor: borderCol }]}>
            <Text style={[styles.convertNoteTitle, { color: textPrimary }]}>{note.title}</Text>
            <Text style={[styles.convertNoteSnippet, { color: textSecondary }]} numberOfLines={2}>
              {note.content}
            </Text>
          </View>

          {/* Subject Field */}
          <Text style={[styles.inputLabel, { color: textSecondary }]}>SUBJECT / COURSE</Text>
          <TextInput
            style={[styles.modalTextInput, { backgroundColor: inputBg, borderColor: borderCol, color: textPrimary }]}
            value={subjectInput}
            onChangeText={onSubjectChange}
            placeholder="e.g. CS101, Algorithms"
            placeholderTextColor={textSecondary}
          />

          {/* Priority Picker */}
          <Text style={[styles.inputLabel, { color: textSecondary }]}>PRIORITY</Text>
          <View style={styles.priorityRow}>
            {priorities.map((p) => {
              const isSelected = priorityInput === p;
              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => onPriorityChange(p)}
                  style={[
                    styles.priorityChip,
                    {
                      backgroundColor: isSelected ? primaryBrown : inputBg,
                      borderColor: isSelected ? primaryBrown : borderCol,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityChipText,
                      { color: isSelected ? '#FFFFFF' : textPrimary, fontWeight: isSelected ? '700' : '500' },
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

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
              style={[styles.modalConfirmBtn, { backgroundColor: primaryBrown }]}
            >
              <Feather name="plus" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.modalConfirmBtnText}>Create Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
