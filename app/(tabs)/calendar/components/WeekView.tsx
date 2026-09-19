import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CalendarEvent } from '../types';
import { CATEGORY_COLORS, WEEK_DAYS_DATA } from '../constants/calendarConfig';
import { getPriorityColors } from '../utils/calendarHelpers';
import { calendarStyles as styles } from '../styles/calendar.styles';

interface WeekViewProps {
  events: CalendarEvent[];
  selectedDate: string;
  rescheduleMode: boolean;
  onSelectDate: (date: string) => void;
  onCompleteRescheduling: (date: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onStartRescheduling: (eventId: string) => void;
  cardTheme: string;
  borderTheme: string;
  textTheme: string;
  textSubTheme: string;
  bgTheme: string;
  primaryAccent: string;
}

export default function WeekView({
  events,
  selectedDate,
  rescheduleMode,
  onSelectDate,
  onCompleteRescheduling,
  onSelectEvent,
  onStartRescheduling,
  cardTheme,
  borderTheme,
  textTheme,
  textSubTheme,
  bgTheme,
  primaryAccent,
}: WeekViewProps) {
  return (
    <View style={[styles.calendarCard, { backgroundColor: cardTheme, borderColor: borderTheme }]}>
      <Text style={[styles.monthLabel, { color: textTheme, marginBottom: 12 }]}>July 19 - 25, 2026</Text>

      {/* Week row navigation headers */}
      <View style={styles.weekRowContainer}>
        {WEEK_DAYS_DATA.map((day) => {
          const isSelected = selectedDate === day.full;
          const isToday = day.full === '2026-07-24';
          return (
            <TouchableOpacity
              key={day.full}
              onPress={() => {
                if (rescheduleMode) {
                  onCompleteRescheduling(day.full);
                } else {
                  onSelectDate(day.full);
                }
              }}
              style={[
                styles.weekDayHeaderCell,
                { backgroundColor: isSelected ? primaryAccent : 'transparent' },
              ]}
            >
              <Text style={[styles.weekDayLabel, { color: isSelected ? '#FFFFFF' : textSubTheme }]}>
                {day.label}
              </Text>
              <Text
                style={[
                  styles.weekDayNum,
                  { color: isSelected ? '#FFFFFF' : isToday ? primaryAccent : textTheme },
                ]}
              >
                {day.date}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Weekly agenda timeline summary */}
      <Text style={[styles.sectionSubtitle, { color: textSubTheme, marginTop: 16 }]}>
        Events in selected week
      </Text>
      <View style={styles.weeklyTimelineContainer}>
        {WEEK_DAYS_DATA.map((d) => {
          const dayEvts = events.filter((e) => e.date === d.full);
          if (dayEvts.length === 0) return null;
          const dayLabel = new Date(d.full).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });
          return (
            <View key={d.full} style={styles.weekTimelineDayBlock}>
              <Text style={[styles.weekTimelineDayTitle, { color: primaryAccent }]}>{dayLabel}</Text>
              {dayEvts.map((evt) => {
                const priorityColors = getPriorityColors(evt.priority);
                return (
                  <TouchableOpacity
                    key={evt.id}
                    onPress={() => onSelectEvent(evt)}
                    onLongPress={() => onStartRescheduling(evt.id)}
                    style={[
                      styles.weekEventCard,
                      { borderColor: CATEGORY_COLORS[evt.category], backgroundColor: bgTheme },
                    ]}
                  >
                    <View style={styles.weekCardLeft}>
                      <Text style={[styles.eventTimeText, { color: textSubTheme }]}>
                        {evt.isAllDay ? 'All Day' : evt.time}
                      </Text>
                      <Text style={[styles.eventTitleText, { color: textTheme }]}>{evt.title}</Text>
                    </View>
                    <View style={[styles.priorityBadge, { backgroundColor: priorityColors.bg }]}>
                      <Text style={[styles.priorityBadgeText, { color: priorityColors.text }]}>
                        {evt.priority}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </View>
    </View>
  );
}
