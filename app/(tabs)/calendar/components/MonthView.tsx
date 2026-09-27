import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CalendarEvent } from '../types';
import { CATEGORY_COLORS, WEEKDAYS } from '../constants/calendarConfig';
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
  const selected = new Date(`${selectedDate}T00:00:00`);

  const currentYear = selected.getFullYear();
  const currentMonth = selected.getMonth();

  const monthName = selected.toLocaleDateString('en-US', {
    month: 'long',
  });

  const firstDayOfMonth = new Date(
    currentYear,
    currentMonth,
    1,
  ).getDay();

  const daysInMonth = new Date(
    currentYear,
    currentMonth + 1,
    0,
  ).getDate();

  const totalCells = Math.ceil(
    (firstDayOfMonth + daysInMonth) / 7,
  ) * 7;

  const today = new Date();

  const isToday = (dateString: string) => {
    const date = new Date(`${dateString}T00:00:00`);

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const formatDate = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  return (
    <View
      style={[
        styles.calendarCard,
        {
          backgroundColor: cardTheme,
          borderColor: borderTheme,
        },
      ]}
    >
      {/* Month Header */}
      <View style={styles.calendarMonthHeader}>
        <Text style={[styles.monthLabel, { color: textTheme }]}>
          {monthName} {currentYear}
        </Text>

        <View style={styles.monthHeaderActions}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => {
              const previousMonth = new Date(
                currentYear,
                currentMonth - 1,
                1,
              );

              const previousDate = `${previousMonth.getFullYear()}-${String(
                previousMonth.getMonth() + 1,
              ).padStart(2, '0')}-01`;

              onSelectDate(previousDate);
            }}
          >
            <Feather
              name="chevron-left"
              size={20}
              color={textTheme}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => {
              const nextMonth = new Date(
                currentYear,
                currentMonth + 1,
                1,
              );

              const nextDate = `${nextMonth.getFullYear()}-${String(
                nextMonth.getMonth() + 1,
              ).padStart(2, '0')}-01`;

              onSelectDate(nextDate);
            }}
          >
            <Feather
              name="chevron-right"
              size={20}
              color={textTheme}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekday Headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day, index) => (
          <Text
            key={index}
            style={[
              styles.weekdayLabel,
              { color: textSubTheme },
            ]}
          >
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {Array.from({ length: totalCells }).map((_, index) => {
          const day = index - firstDayOfMonth + 1;

          if (day < 1 || day > daysInMonth) {
            return (
              <View
                key={index}
                style={styles.emptyGridCell}
              />
            );
          }

          const dayString = formatDate(day);

          const isSelected = selectedDate === dayString;
          const todayDate = isToday(dayString);

          const dayEvents = events.filter(
            (event) => event.date === dayString,
          );

          return (
            <TouchableOpacity
              key={index}
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
                  backgroundColor: isSelected
                    ? primaryAccent
                    : 'transparent',

                  borderColor: todayDate
                    ? primaryAccent
                    : 'transparent',

                  borderWidth: todayDate ? 1.5 : 0,
                },
              ]}
            >
              <Text
                style={[
                  styles.cellDayText,
                  {
                    color: isSelected
                      ? '#FFFFFF'
                      : todayDate
                        ? primaryAccent
                        : textTheme,
                  },
                ]}
              >
                {day}
              </Text>

              {/* Event Indicators */}
              <View style={styles.indicatorRow}>
                {dayEvents.slice(0, 3).map((event) => (
                  <View
                    key={event.id}
                    style={[
                      styles.indicatorDot,
                      {
                        backgroundColor:
                          CATEGORY_COLORS[event.category] ??
                          textSubTheme,
                      },
                    ]}
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