import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CalendarViewMode } from '../types';
import { calendarStyles as styles } from '../styles/calendar.styles';

interface CalendarViewToggleProps {
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  cardTheme: string;
  borderTheme: string;
  textTheme: string;
  textSubTheme: string;
}

const MODES: CalendarViewMode[] = ['month', 'week', 'day'];

export default function CalendarViewToggle({
  viewMode,
  onViewModeChange,
  cardTheme,
  borderTheme,
  textTheme,
  textSubTheme,
}: CalendarViewToggleProps) {
  return (
    <View style={styles.viewToggleContainer}>
      {MODES.map((mode) => (
        <TouchableOpacity
          key={mode}
          onPress={() => onViewModeChange(mode)}
          style={[
            styles.viewToggleButton,
            {
              backgroundColor: viewMode === mode ? cardTheme : 'transparent',
              borderColor: viewMode === mode ? borderTheme : 'transparent',
            },
          ]}
        >
          <Text
            style={[
              styles.viewToggleText,
              {
                color: viewMode === mode ? textTheme : textSubTheme,
                fontWeight: viewMode === mode ? 'bold' : 'normal',
              },
            ]}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
