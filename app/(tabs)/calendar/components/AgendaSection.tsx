import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { CATEGORY_COLORS } from '../constants/calendarConfig';
import { calendarStyles as styles } from '../styles/calendar.styles';
import { CalendarEvent } from '../types';
import {
  getEventConflicts,
  getLocalDateKey,
  getPriorityColors,
  sortByPriority,
} from '../utils/calendarHelpers';

/* "HIGH PRIORITY  2" header above each priority group. */
const priorityHeaderStyle = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 7,
  paddingTop: 12,
  paddingBottom: 2,
};
const priorityDotStyle = { width: 7, height: 7, borderRadius: 4 };
const priorityHeaderTextStyle = { fontSize: 11, fontWeight: '800' as const, letterSpacing: 0.6 };
const priorityCountStyle = { marginLeft: 'auto' as const, fontSize: 11, fontWeight: '600' as const };

interface AgendaSectionProps {
  events: CalendarEvent[];
  allEvents: CalendarEvent[];
  academicPressure: { label: string; score: number } | null;
  isLoadingEvents: boolean;
  eventsLoadFailed: boolean;
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

/** "09:05" -> "9:05 AM" */
const formatTime = (time: string) => {
  const match = time?.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '';

  const hours = Number(match[1]);
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;

  return `${hour12}:${match[2]} ${hours >= 12 ? 'PM' : 'AM'}`;
};

export default function AgendaSection({
  events,
  allEvents,
  isLoadingEvents,
  eventsLoadFailed,
  selectedDate,
  rescheduleMode,
  activeReschedulingId,
  onSelectEvent,
  onStartRescheduling,
  borderTheme,
  textTheme,
  textSubTheme,
}: AgendaSectionProps) {
  // High -> Medium -> Low, then by time.
  const dayEvents = sortByPriority(events.filter((e) => e.date === selectedDate));
  const selectedDayEvents = allEvents.filter((event) => event.date === selectedDate);
  const conflicts = getEventConflicts(allEvents);

  const today = getLocalDateKey();
  const tomorrowDate = new Date(`${today}T00:00:00`);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = getLocalDateKey(tomorrowDate);

  const formattedDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const getEventStatus = (event: CalendarEvent) => {
    if (event.completed) return { label: 'Completed', color: '#56846F' };
    const isDeadline = event.category === 'Assignment' || event.category === 'Exam';
    if (isDeadline && event.date < today) return { label: 'Overdue', color: '#B85F61' };
    if (isDeadline && event.date === today) return { label: 'Due today', color: '#C0783C' };
    if (isDeadline && event.date === tomorrow) return { label: 'Due tomorrow', color: '#A8782E' };
    return null;
  };

  const countLabel = isLoadingEvents
    ? 'Loading'
    : `${dayEvents.length} ${dayEvents.length === 1 ? 'item' : 'items'}`;

  return (
    <>
      <View style={styles.agendaHeader}>
        <Text style={[styles.sectionTitle, { color: textTheme }]}>
          {formattedDate}
        </Text>
        <Text style={[styles.eventsCountText, { color: textSubTheme }]}>
          {countLabel}
        </Text>
      </View>

      <View style={styles.agendaList}>
        {dayEvents.length > 0 ? (
          dayEvents.map((evt, index) => {
            const eventStatus = getEventStatus(evt);
            const hasConflict = conflicts.has(evt.id);
            const isTargetReschedule = rescheduleMode && activeReschedulingId === evt.id;
            const next = dayEvents[index + 1];
            const isLast = !next || next.priority !== evt.priority;
            const startsGroup = index === 0 || dayEvents[index - 1].priority !== evt.priority;
            const groupColors = getPriorityColors(evt.priority);
            const groupCount = dayEvents.filter((item) => item.priority === evt.priority).length;

            return (
              <React.Fragment key={evt.id}>
              {startsGroup && (
                <View style={priorityHeaderStyle}>
                  <View style={[priorityDotStyle, { backgroundColor: groupColors.dot }]} />
                  <Text style={[priorityHeaderTextStyle, { color: groupColors.text }]}>
                    {evt.priority.toUpperCase()} PRIORITY
                  </Text>
                  <Text style={[priorityCountStyle, { color: textSubTheme }]}>{groupCount}</Text>
                </View>
              )}
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => onSelectEvent(evt)}
                onLongPress={() => onStartRescheduling(evt.id)}
                style={[
                  styles.agendaRow,
                  {
                    borderBottomColor: borderTheme,
                    borderBottomWidth: isLast ? 0 : 1,
                    opacity: isTargetReschedule ? 0.5 : 1,
                  },
                ]}
              >
                {/* Time */}
                <View style={styles.agendaTimeCol}>
                  <Text style={[styles.agendaTimeText, { color: textTheme }]}>
                    {evt.isAllDay ? 'All day' : formatTime(evt.time) || '—'}
                  </Text>
                  {!evt.isAllDay && evt.duration > 0 && (
                    <Text style={[styles.agendaDurationText, { color: textSubTheme }]}>
                      {evt.duration} min
                    </Text>
                  )}
                </View>

                {/* Category bar */}
                <View
                  style={[
                    styles.agendaCategoryBar,
                    { backgroundColor: CATEGORY_COLORS[evt.category] ?? textSubTheme },
                  ]}
                />

                {/* Details */}
                <View style={styles.agendaBody}>
                  <Text
                    style={[
                      styles.agendaEventTitle,
                      {
                        color: textTheme,
                        textDecorationLine: evt.completed ? 'line-through' : 'none',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {evt.title}
                  </Text>

                  <Text style={[styles.agendaDetailText, { color: textSubTheme }]} numberOfLines={1}>
                    {evt.subject && evt.subject !== evt.category
                      ? `${evt.category} · ${evt.subject}`
                      : evt.category}
                    {' · '}
                    {evt.priority} priority
                  </Text>

                  {(eventStatus || hasConflict) && (
                    <Text style={styles.agendaStatusText}>
                      {eventStatus && (
                        <Text style={{ color: eventStatus.color }}>{eventStatus.label}</Text>
                      )}
                      {eventStatus && hasConflict && (
                        <Text style={{ color: textSubTheme }}>{' · '}</Text>
                      )}
                      {hasConflict && (
                        <Text style={{ color: '#B85F61' }}>Time conflict</Text>
                      )}
                    </Text>
                  )}

                  {evt.checklist.length > 0 && (
                    <View style={styles.agendaProgressRow}>
                      <View style={[styles.progressBarBg, { backgroundColor: borderTheme }]}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              backgroundColor: textSubTheme,
                              width: `${evt.progress}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.progressValLabel, { color: textSubTheme }]}>
                        {evt.progress}%
                      </Text>
                    </View>
                  )}
                </View>

                <Feather name="chevron-right" size={16} color={textSubTheme} />
              </TouchableOpacity>
              </React.Fragment>
            );
          })
        ) : (
          <View style={styles.agendaEmpty}>
            <Text style={[styles.noEventsText, { color: textSubTheme }]}>
              {isLoadingEvents
                ? 'Loading your schedule…'
                : eventsLoadFailed && allEvents.length === 0
                  ? 'Calendar items could not be loaded.'
                  : selectedDayEvents.length > 0
                    ? 'No items match the current filters.'
                    : 'Nothing scheduled for this day.'}
            </Text>
          </View>
        )}
      </View>
    </>
  );
}
