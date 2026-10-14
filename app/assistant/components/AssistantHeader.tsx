import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { assistantStyles as styles } from '../styles';

interface AssistantHeaderProps {
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
  borderCol: string;
  onOpenMenu: () => void;
  onReset: () => void;
}

/* Same layout as the Calendar header: ☰ + big title on the left. */
export function AssistantHeader({
  textPrimary,
  textSecondary,
  primaryBrown,
  onOpenMenu,
  onReset,
}: AssistantHeaderProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}>
        <TouchableOpacity
          onPress={onOpenMenu}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          style={{ marginRight: 10, padding: 4 }}
        >
          <Feather name="menu" size={24} color={textPrimary} />
        </TouchableOpacity>

        <Text style={{ fontSize: 28, fontWeight: 'bold', color: textPrimary }}>GabAi</Text>

        <View style={[styles.offlineBadge, { backgroundColor: primaryBrown + '18' }]}>
          <Text style={[styles.offlineBadgeText, { color: primaryBrown }]}>Local AI</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onReset}
        accessibilityRole="button"
        accessibilityLabel="Clear chat"
        style={styles.headerReset}
      >
        <Feather name="trash-2" size={20} color={textSecondary} />
      </TouchableOpacity>
    </View>
  );
}
