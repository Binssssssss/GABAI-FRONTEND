import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { CalendarEvent } from '../types';
import { CATEGORY_COLORS, DAY_HOURS } from '../constants/calendarConfig';
import { getPriorityColors } from '../utils/calendarHelpers';
import { calendarStyles as styles } from '../styles/calendar.styles';

interface DayViewProps {
  events: CalendarEvent[];
  selectedDate: string;
  onSelectEvent: (event: CalendarEvent) => void;
  onStartRescheduling: (eventId: string) => void;
  cardTheme: string;
  borderTheme: string;
  textTheme: string;
  textSubTheme: string;
  bgTheme: string;
}

export default function DayView({
  events,
  selectedDate,
  onSelectEvent,
  onStartRescheduling,
  cardTheme,
  borderTheme,
  textTheme,
  textSubTheme,
  bgTheme,
}: DayViewProps) {
  return (
    <View style={[styles.calendarCard, { backgroundColor: cardTheme, borderColor: borderTheme }]}>
      <View style={styles.dayViewHeader}>
        <Text style={[styles.monthLabel, { color: textTheme }]}>
          {new Date(selectedDate).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
      </View>

      {/* Daily timeline grid */}
      <ScrollView scrollEnabled={false} style={styles.dailyTimelineList}>
        {DAY_HOURS.map((hour) => {
          // Check if any event starts in this hour slot
          const hourEvts = events.filter(
            (e) => e.date === selectedDate && e.time.startsWith(hour.substring(0, 3))
          );
          return (
            <View key={hour} style={[styles.timelineRow, { borderColor: borderTheme }]}>
              <View style={styles.timelineTimeCol}>
                <Text style={[styles.timelineTimeText, { color: textSubTheme }]}>{hour}</Text>
              </View>
              <View style={styles.timelineContentCol}>
                {hourEvts.map((evt) => {
                  const priorityColors = getPriorityColors(evt.priority);
                  return (
                    <TouchableOpacity
                      key={evt.id}
                      onPress={() => onSelectEvent(evt)}
                      onLongPress={() => onStartRescheduling(evt.id)}
                      style={[
                        styles.dailyEventCard,
                        {
                          borderColor: CATEGORY_COLORS[evt.category],
                          backgroundColor: bgTheme,
                        },
                      ]}
                    >
                      <View style={styles.dailyCardHeader}>
                        <Text style={[styles.dailyEventTitle, { color: textTheme }]}>{evt.title}</Text>
                        <View
                          style={[
                            styles.priorityBadge,
                            {
                              backgroundColor: priorityColors.bg,
                              paddingVertical: 2,
                              paddingHorizontal: 6,
                            },
                          ]}
                        >
                          <Text style={[styles.priorityBadgeText, { color: priorityColors.text, fontSize: 10 }]}>
                            {evt.priority}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.dailyEventDesc, { color: textSubTheme }]} numberOfLines={1}>
                        {evt.description || 'No description provided.'}
                      </Text>
                      {evt.checklist.length > 0 && (
                        <View style={styles.dailyProgressContainer}>
                          <Text style={[styles.dailyProgressText, { color: textSubTheme }]}>
                            Tasks ({evt.progress}%)
                          </Text>
                          <View style={[styles.dailyProgressBarBg, { backgroundColor: borderTheme }]}>
                            <View
                              style={[
                                styles.dailyProgressBarFill,
                                {
                                  backgroundColor: CATEGORY_COLORS[evt.category],
                                  width: `${evt.progress}%`,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
