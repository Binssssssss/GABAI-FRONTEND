import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CalendarEvent } from '../types';
import { CATEGORY_COLORS } from '../constants/calendarConfig';
import { getDeadlineBadgeText } from '../utils/calendarHelpers';
import { calendarStyles as styles } from '../styles/calendar.styles';

interface UpcomingDeadlinesWidgetProps {
  deadlines: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  cardTheme: string;
  borderTheme: string;
  textTheme: string;
  textSubTheme: string;
  primaryAccent: string;
}

export default function UpcomingDeadlinesWidget({
  deadlines,
  onSelectEvent,
  cardTheme,
  borderTheme,
  textTheme,
  textSubTheme,
  primaryAccent,
}: UpcomingDeadlinesWidgetProps) {
  if (deadlines.length === 0) return null;

  return (
    <>
      <View style={styles.deadlineHeader}>
        <Text style={[styles.sectionTitle, { color: textTheme }]}>Upcoming Deadlines</Text>
        <Feather name="clock" size={18} color={primaryAccent} />
      </View>

      <View style={styles.deadlinesList}>
        {deadlines.slice(0, 3).map((evt) => (
          <TouchableOpacity
            key={evt.id}
            onPress={() => onSelectEvent(evt)}
            style={[styles.deadlineCard, { backgroundColor: cardTheme, borderColor: borderTheme }]}
          >
            <View style={styles.deadlineInfoCol}>
              <View style={styles.deadlineHeadingRow}>
                <Text style={[styles.deadlineTitleText, { color: textTheme }]} numberOfLines={1}>
                  {evt.title}
                </Text>
                <View style={[styles.deadlineBadge, { backgroundColor: '#7F1D1D' }]}>
                  <Text style={[styles.deadlineBadgeText, { color: '#FCA5A5' }]}>
                    {getDeadlineBadgeText(evt.date)}
                  </Text>
                </View>
              </View>
              <Text style={[styles.deadlineDateText, { color: textSubTheme }]}>
                Due: {new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
              {evt.checklist.length > 0 && (
                <View style={[styles.progressBarBg, { backgroundColor: borderTheme, marginTop: 10 }]}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { backgroundColor: CATEGORY_COLORS[evt.category], width: `${evt.progress}%` },
                    ]}
                  />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}
