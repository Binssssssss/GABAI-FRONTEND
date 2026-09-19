import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FocusMode } from '../types';
import { FOCUS_MODES_CONFIG } from '../constants/focusConfig';
import { focusStyles as styles } from '../styles/focus.styles';

interface FocusModeTabsProps {
  currentMode: FocusMode;
  onSelectMode: (mode: FocusMode) => void;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  primaryAccent: string;
}

export default function FocusModeTabs({
  currentMode,
  onSelectMode,
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  primaryAccent,
}: FocusModeTabsProps) {
  return (
    <View style={[styles.modeTabsContainer, { backgroundColor: cardBg, borderColor: borderCol }]}>
      {FOCUS_MODES_CONFIG.map((item) => {
        const isSelected = currentMode === item.mode;
        return (
          <TouchableOpacity
            key={item.mode}
            onPress={() => onSelectMode(item.mode)}
            style={[
              styles.modeTabItem,
              {
                backgroundColor: isSelected ? primaryAccent : 'transparent',
              },
            ]}
          >
            <Text
              style={[
                styles.modeTabText,
                {
                  color: isSelected ? '#FFFFFF' : textSecondary,
                  fontWeight: isSelected ? '700' : '500',
                },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
