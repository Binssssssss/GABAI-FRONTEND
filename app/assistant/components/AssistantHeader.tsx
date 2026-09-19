import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { assistantStyles as styles } from '../styles';

interface AssistantHeaderProps {
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
  borderCol: string;
  onBack: () => void;
  onReset: () => void;
}

export function AssistantHeader({
  textPrimary,
  textSecondary,
  primaryBrown,
  borderCol,
  onBack,
  onReset,
}: AssistantHeaderProps) {
  return (
    <View style={[styles.header, { borderBottomColor: borderCol }]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Feather name="chevron-left" size={24} color={textPrimary} />
      </TouchableOpacity>
      <View style={styles.headerTitleContainer}>
        <View style={styles.headerLabelRow}>
          <Text style={[styles.headerTitle, { color: textPrimary }]}>GabAi Assistant</Text>
          <View style={[styles.offlineBadge, { backgroundColor: primaryBrown + '18' }]}>
            <Text style={[styles.offlineBadgeText, { color: primaryBrown }]}>Local AI</Text>
          </View>
        </View>
        <Text style={[styles.headerSubtitle, { color: textSecondary }]}>
          Offline Productivity Companion
        </Text>
      </View>
      <TouchableOpacity style={styles.headerReset} onPress={onReset}>
        <Feather name="trash-2" size={18} color={textSecondary} />
      </TouchableOpacity>
    </View>
  );
}
