import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { taskStyles as styles } from '../../styles/task.styles';

interface BulkActionBarProps {
  visible: boolean;
  selectedCount: number;
  onBulkComplete: () => void;
  onBulkDelete: () => void;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  successGreen: string;
  errorRed: string;
}

export default function BulkActionBar({
  visible,
  selectedCount,
  onBulkComplete,
  onBulkDelete,
  cardBg,
  borderCol,
  textPrimary,
  successGreen,
  errorRed,
}: BulkActionBarProps) {
  if (!visible || selectedCount === 0) return null;

  return (
    <View style={[styles.bulkActionBar, { backgroundColor: cardBg, borderColor: borderCol }]}>
      <Text style={[styles.bulkActionText, { color: textPrimary }]}>
        {selectedCount} Tasks Selected
      </Text>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          style={[styles.bulkBtn, { backgroundColor: successGreen }]}
          onPress={onBulkComplete}
        >
          <Text style={styles.bulkBtnText}>Complete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bulkBtn, { backgroundColor: errorRed }]}
          onPress={onBulkDelete}
        >
          <Text style={styles.bulkBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
