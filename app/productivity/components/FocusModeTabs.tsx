import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FocusMode, FocusPalette } from '../types';
import { FOCUS_MODES_CONFIG } from '../constants/focusConfig';
import { focusStyles as styles } from '../styles/focus.styles';

interface FocusModeTabsProps {
  currentMode: FocusMode;
  customMinutes: number;
  onSelectMode: (mode: FocusMode) => void;
  colors: FocusPalette;
}

export default function FocusModeTabs({
  currentMode,
  customMinutes,
  onSelectMode,
  colors,
}: FocusModeTabsProps) {
  const renderMode = (item: (typeof FOCUS_MODES_CONFIG)[number]) => {
    const isSelected = currentMode === item.mode;
    const minutes = item.mode === 'custom' ? customMinutes : item.durationMin;
    const accent = item.isBreak ? colors.success : colors.primary;

    return (
      <Pressable
        key={item.mode}
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={`${item.label}, ${minutes} minutes`}
        onPress={() => onSelectMode(item.mode)}
        style={({ pressed }) => [
          styles.modeCard,
          {
            backgroundColor: isSelected ? accent + '1F' : colors.card,
            borderColor: isSelected ? accent : colors.border,
          },
          pressed && styles.pressed,
        ]}
      >
        <Feather
          name={item.icon}
          size={18}
          color={isSelected ? accent : colors.subtext}
        />
        <Text
          numberOfLines={1}
          style={[styles.modeCardLabel, { color: colors.text }]}
        >
          {item.label}
        </Text>
        <Text style={[styles.modeCardMeta, { color: colors.subtext }]}>
          {minutes} min
        </Text>
      </Pressable>
    );
  };

  return (
    <View>
      <View style={styles.modeGrid}>
        {FOCUS_MODES_CONFIG.filter((item) => !item.isBreak).map(renderMode)}
      </View>

      <Text style={[styles.modeSubheading, { color: colors.subtext }]}>
        Breaks
      </Text>
      <View style={styles.modeGrid}>
        {FOCUS_MODES_CONFIG.filter((item) => item.isBreak).map(renderMode)}
      </View>
    </View>
  );
}
