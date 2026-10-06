import { Feather } from '@expo/vector-icons';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { CATEGORY_COLORS } from '../constants/calendarConfig';
import { calendarStyles as styles } from '../styles/calendar.styles';
import { CalendarEvent } from '../types';
import {
  getDayWorkload,
  getEventConflicts,
  getLocalDateKey,
  getPriorityColors,
  getRecommendedEvents,
} from '../utils/calendarHelpers';

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

export default function AgendaSection({
  events,
  allEvents,
  academicPressure,
  isLoadingEvents,
  eventsLoadFailed,
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
  const selectedDayEvents = allEvents.filter((event) => event.date === selectedDate);
  const workload = getDayWorkload(selectedDayEvents);
  const conflicts = getEventConflicts(selectedDayEvents);
  const recommendation = getRecommendedEvents(allEvents)[0];
  const recommendations = getRecommendedEvents(allEvents).slice(0, 4);
  const today = getLocalDateKey();
  const tomorrowDate = new Date(`${today}T00:00:00`);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = getLocalDateKey(tomorrowDate);
  const formattedDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  const getEventStatus = (event: CalendarEvent) => {
    if (event.completed) return { label: 'Completed', color: '#56846F', icon: 'check' as const };
    const isDeadline = event.category === 'Assignment' || event.category === 'Exam';
    if (isDeadline && event.date < today) return { label: 'Overdue', color: '#B85F61', icon: 'alert-circle' as const };
    if (isDeadline && event.date === today) return { label: 'Due today', color: '#C0783C', icon: 'clock' as const };
    if (isDeadline && event.date === tomorrow) return { label: 'Due tomorrow', color: '#A8782E', icon: 'clock' as const };
    if (isDeadline) return { label: 'Upcoming', color: textSubTheme, icon: 'calendar' as const };
    return null;
  };

  const isOverdueDeadline = (event: CalendarEvent) =>
    !event.completed && event.date < today &&
    (event.category === 'Assignment' || event.category === 'Exam');

  return (
    <>
      <View style={[styles.workloadSummary, { backgroundColor: cardTheme, borderColor: borderTheme }]}>
        <View style={styles.workloadSummaryHeader}>
          <Text style={[styles.workloadSummaryTitle, { color: textSubTheme }]}>Academic load</Text>
          {isLoadingEvents ? (
            <Text style={[styles.workloadLevel, { color: textSubTheme }]}>Loading</Text>
          ) : (
            <Text style={[styles.workloadLevel, { color: workload.color }]}>{workload.level}</Text>
          )}
        </View>
        {!isLoadingEvents && (
          <Text style={[styles.workloadSummaryMeta, { color: textSubTheme }]}>
            {workload.pendingCount} pending | {workload.deadlineCount} deadlines | {workload.overdueCount} overdue
          </Text>
        )}
        {!isLoadingEvents && academicPressure && (
          <Text style={[styles.pressureSummaryText, { color: textSubTheme }]}>
            Overall academic pressure: {academicPressure.label} ({academicPressure.score})
          </Text>
        )}
        {!isLoadingEvents && (workload.level === 'HIGH' || workload.level === 'VERY HIGH') && (
          <View style={styles.workloadAlert}>
            <Feather name="alert-triangle" size={14} color={workload.color} />
            <Text style={[styles.workloadAlertText, { color: workload.color }]}>
              High academic workload on this date
            </Text>
          </View>
        )}
        {!isLoadingEvents && recommendation && (
          <>
            <Text style={[styles.recommendationText, { color: textTheme }]}>
              GabAi Recommendation: Start with {recommendation.title}
              {isOverdueDeadline(recommendation) ? ' (overdue)' : ''}.
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.smartPlanButton}
              onPress={() => Alert.alert(
                'GabAi Recommendation',
                recommendations.map((event, index) =>
                  `${index + 1}. ${event.title} - ${event.date} - ${event.priority} priority${isOverdueDeadline(event) ? ' - overdue' : ''}`
                ).join('\n'),
              )}
            >
              <Feather name="list" size={14} color={textTheme} />
              <Text style={[styles.smartPlanButtonText, { color: textTheme }]}>Review smart plan</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.agendaHeader}>
        <Text style={[styles.sectionTitle, { color: textTheme }]}>
          {formattedDate}
        </Text>
        <Text style={[styles.eventsCountText, { color: textSubTheme }]}>
          {isLoadingEvents ? 'Loading' : `${dayEvents.length} items`}
        </Text>
      </View>

      <View style={styles.agendaList}>
        {dayEvents.length > 0 ? (
          dayEvents.map((evt) => {
            const priorityColors = getPriorityColors(evt.priority);
            const eventStatus = getEventStatus(evt);
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
                    <Text
                      style={[styles.agendaEventTitle, {
                        color: textTheme,
                        textDecorationLine: evt.completed ? 'line-through' : 'none',
                      }]}
                      numberOfLines={1}
                    >
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
                      {evt.isAllDay ? 'All Day' : evt.time ? `${evt.time}${evt.duration ? ` (${evt.duration} mins)` : ''}` : 'Time not set'}
                    </Text>

                    <View style={{ width: 12 }} />

                    <Feather name="tag" size={14} color={textSubTheme} style={{ marginRight: 4 }} />
                    <Text style={[styles.agendaDetailText, { color: textSubTheme }]}>{evt.subject || evt.category}</Text>
                  </View>

                  {(eventStatus || conflicts.has(evt.id)) && (
                    <View style={styles.agendaStatusRow}>
                      {eventStatus && (
                        <>
                          <Feather name={eventStatus.icon} size={12} color={eventStatus.color} />
                          <Text style={[styles.agendaStatusText, { color: eventStatus.color }]}>
                            {eventStatus.label}
                          </Text>
                        </>
                      )}
                      {conflicts.has(evt.id) && (
                        <>
                          <Feather name="alert-triangle" size={12} color="#B85F61" />
                          <Text style={[styles.agendaStatusText, { color: '#B85F61' }]}>Schedule conflict</Text>
                        </>
                      )}
                    </View>
                  )}

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
                            {
                              backgroundColor: CATEGORY_COLORS[evt.category],
                              width: `${evt.progress}%`,
                            },
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
              {isLoadingEvents
                ? 'Loading your academic schedule...'
                : eventsLoadFailed && allEvents.length === 0
                  ? 'Calendar items could not be loaded.'
                  : selectedDayEvents.length > 0
                    ? 'No items match the current filters.'
                    : 'Your schedule is clear. No academic tasks scheduled for this day.'}
            </Text>
          </View>
        )}
      </View>
    </>
  );
}
