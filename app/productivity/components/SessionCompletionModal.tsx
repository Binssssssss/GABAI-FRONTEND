import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { focusStyles as styles } from '../styles/focus.styles';

interface SessionCompletionModalProps {
  visible: boolean;
  subject: string;
  durationMinutes: number;
  isStrict: boolean;
  onDismiss: () => void;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  primaryAccent: string;
}

export default function SessionCompletionModal({
  visible,
  subject,
  durationMinutes,
  isStrict,
  onDismiss,
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  primaryAccent,
}: SessionCompletionModalProps) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onDismiss}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          {/* Badge Icon */}
          <View style={[styles.modalBadgeIcon, { backgroundColor: primaryAccent + '20' }]}>
            <Feather name="award" size={32} color={primaryAccent} />
          </View>

          <Text style={[styles.modalTitle, { color: textPrimary }]}>
            Focus Session Completed!
          </Text>

          <Text style={[styles.modalSubtitle, { color: textSecondary }]}>
            Great job! You maintained unbroken concentration on <Text style={{ fontWeight: 'bold', color: textPrimary }}>{subject.trim() || 'General Study'}</Text>.
          </Text>

          {/* Stat Summary Box */}
          <View style={[styles.modalStatsRow, { backgroundColor: borderCol + '30', borderColor: borderCol }]}>
            <View style={styles.modalStatItem}>
              <Text style={[styles.modalStatVal, { color: primaryAccent }]}>{durationMinutes} mins</Text>
              <Text style={[styles.modalStatSub, { color: textSecondary }]}>Duration</Text>
            </View>
            <View style={styles.modalStatItem}>
              <Text style={[styles.modalStatVal, { color: '#10B981' }]}>+25 XP</Text>
              <Text style={[styles.modalStatSub, { color: textSecondary }]}>Productivity</Text>
            </View>
            <View style={styles.modalStatItem}>
              <Text style={[styles.modalStatVal, { color: '#F59E0B' }]}>{isStrict ? 'Strict' : 'Casual'}</Text>
              <Text style={[styles.modalStatSub, { color: textSecondary }]}>Discipline</Text>
            </View>
          </View>

          {/* Dismiss button */}
          <TouchableOpacity
            style={[styles.modalDismissBtn, { backgroundColor: primaryAccent }]}
            onPress={onDismiss}
          >
            <Text style={styles.modalDismissBtnText}>Log & Take a Break</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
