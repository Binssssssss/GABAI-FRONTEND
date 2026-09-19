import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { calendarStyles as styles } from '../styles/calendar.styles';

export interface CalendarHeaderProps {
  textTheme: string;
  rescheduleMode?: boolean;
  onOpenDrawer: () => void;
  onCancelReschedule?: () => void;
}

export default function CalendarHeader({
  textTheme,
  rescheduleMode = false,
  onOpenDrawer,
  onCancelReschedule,
}: CalendarHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={onOpenDrawer} style={{ marginRight: 10, padding: 4 }}>
          <Feather name="menu" size={24} color={textTheme} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textTheme }]}>Calendar</Text>
      </View>

      {/* Reschedule Banner Indicator */}
      {rescheduleMode && onCancelReschedule && (
        <View style={styles.rescheduleBanner}>
          <Feather name="info" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.rescheduleText}>Reschedule Mode Active: Tap a day to move event</Text>
          <TouchableOpacity onPress={onCancelReschedule} style={styles.cancelRescheduleButton}>
            <Text style={styles.cancelRescheduleText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
