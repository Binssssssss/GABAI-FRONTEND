import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CalendarEvent } from '../types';
import { CATEGORY_COLORS } from '../constants/calendarConfig';
import { getPriorityColors } from '../utils/calendarHelpers';
import { calendarStyles as styles } from '../styles/calendar.styles';

interface AgendaSectionProps {
  events: CalendarEvent[];
  selectedDate: string;
  rescheduleMode: boolean;
  activeReschedulingId: string | null;
  onSelectEvent: (event: CalendarEvent) => void;
  onStartRescheduling: (eventId: string) => void;
  cardTheme: string;
  borderTheme: string;
  textTheme: string;
  textSubTheme: string;
}

export default function AgendaSection({
  events,
  selectedDate,
  rescheduleMode,
  activeReschedulingId,
  onSelectEvent,
  onStartRescheduling,
  cardTheme,
  borderTheme,
  textTheme,
  textSubTheme,
}: AgendaSectionProps) {
  const dayEvents = events.filter((e) => e.date === selectedDate);

  return (
    <>
      <View style={styles.agendaHeader}>
        <Text style={[styles.sectionTitle, { color: textTheme }]}>
          Agenda for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Text>
        <Text style={[styles.eventsCountText, { color: textSubTheme }]}>
          {dayEvents.length} events
        </Text>
      </View>

      <View style={styles.agendaList}>
        {dayEvents.length > 0 ? (
          dayEvents.map((evt) => {
            const priorityColors = getPriorityColors(evt.priority);
            const isTargetReschedule = rescheduleMode && activeReschedulingId === evt.id;

            return (
              <TouchableOpacity
                key={evt.id}
                onPress={() => onSelectEvent(evt)}
                onLongPress={() => onStartRescheduling(evt.id)}
                style={[
                  styles.agendaCard,
                  {
                    backgroundColor: cardTheme,
                    borderColor: borderTheme,
                    opacity: isTargetReschedule ? 0.6 : 1,
                    borderWidth: isTargetReschedule ? 2 : 1,
                  },
                ]}
              >
                <View style={[styles.categoryColorRibbon, { backgroundColor: CATEGORY_COLORS[evt.category] }]} />
                <View style={styles.agendaCardContent}>
                  <View style={styles.agendaTitleRow}>
                    <Text style={[styles.agendaEventTitle, { color: textTheme }]} numberOfLines={1}>
                      {evt.title}
                    </Text>
                    <View style={[styles.priorityBadge, { backgroundColor: priorityColors.bg }]}>
                      <Text style={[styles.priorityBadgeText, { color: priorityColors.text }]}>
                        {evt.priority}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.agendaDetailsRow}>
                    <Feather name="clock" size={14} color={textSubTheme} style={{ marginRight: 4 }} />
                    <Text style={[styles.agendaDetailText, { color: textSubTheme }]}>
                      {evt.isAllDay ? 'All Day' : `${evt.time} (${evt.duration} mins)`}
                    </Text>

                    <View style={{ width: 12 }} />

                    <Feather name="tag" size={14} color={textSubTheme} style={{ marginRight: 4 }} />
                    <Text style={[styles.agendaDetailText, { color: textSubTheme }]}>{evt.category}</Text>
                  </View>

                  {evt.checklist.length > 0 && (
                    <View style={styles.agendaProgressContainer}>
                      <View style={styles.progressLabelRow}>
                        <Text style={[styles.progressTextLabel, { color: textSubTheme }]}>Checklist progress</Text>
                        <Text style={[styles.progressValLabel, { color: textTheme }]}>{evt.progress}%</Text>
                      </View>
                      <View style={[styles.progressBarBg, { backgroundColor: borderTheme }]}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { backgroundColor: CATEGORY_COLORS[evt.category], width: `${evt.progress}%` },
                          ]}
                        />
                      </View>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={[styles.noEventsCard, { backgroundColor: cardTheme, borderColor: borderTheme }]}>
            <Feather name="calendar" size={32} color={textSubTheme} style={{ marginBottom: 8 }} />
            <Text style={[styles.noEventsText, { color: textSubTheme }]}>
              No academic schedules or events today.
            </Text>
          </View>
        )}
      </View>
    </>
  );
}
