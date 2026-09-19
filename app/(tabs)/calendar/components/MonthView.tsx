import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CalendarEvent } from '../types';
import {
  CATEGORY_COLORS,
  DAYS_IN_JULY_2026,
  START_OFFSET_JULY_2026,
  TOTAL_GRID_CELLS,
  WEEKDAYS,
} from '../constants/calendarConfig';
import { calendarStyles as styles } from '../styles/calendar.styles';

interface MonthViewProps {
  events: CalendarEvent[];
  selectedDate: string;
  rescheduleMode: boolean;
  onSelectDate: (date: string) => void;
  onCompleteRescheduling: (date: string) => void;
  cardTheme: string;
  borderTheme: string;
  textTheme: string;
  textSubTheme: string;
  primaryAccent: string;
}

export default function MonthView({
  events,
  selectedDate,
  rescheduleMode,
  onSelectDate,
  onCompleteRescheduling,
  cardTheme,
  borderTheme,
  textTheme,
  textSubTheme,
  primaryAccent,
}: MonthViewProps) {
  return (
    <View style={[styles.calendarCard, { backgroundColor: cardTheme, borderColor: borderTheme }]}>
      <View style={styles.calendarMonthHeader}>
        <Text style={[styles.monthLabel, { color: textTheme }]}>July 2026</Text>
        <View style={styles.monthHeaderActions}>
          <TouchableOpacity style={styles.arrowButton}>
            <Feather name="chevron-left" size={20} color={textTheme} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.arrowButton}>
            <Feather name="chevron-right" size={20} color={textTheme} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day, idx) => (
          <Text key={idx} style={[styles.weekdayLabel, { color: textSubTheme }]}>
            {day}
          </Text>
        ))}
      </View>

      {/* Grid days */}
      <View style={styles.calendarGrid}>
        {Array.from({ length: TOTAL_GRID_CELLS }).map((_, idx) => {
          const cellDay = idx - START_OFFSET_JULY_2026 + 1;
          const isValidDay = cellDay > 0 && cellDay <= DAYS_IN_JULY_2026;

          if (!isValidDay) {
            return <View key={idx} style={styles.emptyGridCell} />;
          }

          const dayString = `2026-07-${cellDay.toString().padStart(2, '0')}`;
          const isSelected = selectedDate === dayString;
          const isToday = dayString === '2026-07-24';

          // Get events for this specific date
          const dayEvents = events.filter((e) => e.date === dayString);

          return (
            <TouchableOpacity
              key={idx}
              onPress={() => {
                if (rescheduleMode) {
                  onCompleteRescheduling(dayString);
                } else {
                  onSelectDate(dayString);
                }
              }}
              style={[
                styles.gridCell,
                {
                  backgroundColor: isSelected ? primaryAccent : 'transparent',
                  borderColor: isToday ? primaryAccent : 'transparent',
                  borderWidth: isToday ? 1.5 : 0,
                },
              ]}
            >
              <Text
                style={[
                  styles.cellDayText,
                  { color: isSelected ? '#FFFFFF' : isToday ? primaryAccent : textTheme },
                ]}
              >
                {cellDay}
              </Text>
              {/* Event color indicators */}
              <View style={styles.indicatorRow}>
                {dayEvents.slice(0, 3).map((evt) => (
                  <View
                    key={evt.id}
                    style={[styles.indicatorDot, { backgroundColor: CATEGORY_COLORS[evt.category] }]}
                  />
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
