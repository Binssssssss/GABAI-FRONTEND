import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { assistantStyles as styles } from '../styles';
import { GabAvatar } from './GabAvatar';

interface AssistantHeaderProps {
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
  borderCol: string;
  onOpenMenu: () => void;
  onReset: () => void;
}

/* ☰ + Gab's face, name and "Your study buddy". */
export function AssistantHeader({
  textPrimary,
  textSecondary,
  primaryBrown,
  borderCol,
  onOpenMenu,
  onReset,
}: AssistantHeaderProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: borderCol,
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

        <GabAvatar size={40} />

        <View style={{ marginLeft: 10, flexShrink: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: textPrimary }}>Gab</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#22C55E' }} />
            <Text style={{ fontSize: 12, color: textSecondary }}>Your study buddy</Text>
          </View>
        </View>

        <View
          style={[
            styles.offlineBadge,
            { backgroundColor: primaryBrown + '18', flexDirection: 'row', alignItems: 'center', gap: 4 },
          ]}
        >
          <Feather name="zap" size={10} color={primaryBrown} />
          <Text style={[styles.offlineBadgeText, { color: primaryBrown }]}>Gemini</Text>
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
