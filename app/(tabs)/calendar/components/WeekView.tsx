import { Text, TouchableOpacity, View } from 'react-native';
import { CATEGORY_COLORS } from '../constants/calendarConfig';
import { calendarStyles as styles } from '../styles/calendar.styles';
import { CalendarEvent } from '../types';
import {
  getDayWorkload,
  getEventConflicts,
  getDeadlineRisk,
  getLocalDateKey,
  getPriorityColors,
  getWeekDateKeys,
} from '../utils/calendarHelpers';
import { formatTime12 } from '@/utils/time';

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
  const weekDates = getWeekDateKeys(selectedDate);
  const conflictingEventIds = getEventConflicts(events);

  const weeklyWorkload = weekDates.reduce((total, dateKey) => {
    const dayEvents = events.filter((event) => event.date === dateKey);

    return total + getDayWorkload(dayEvents).weight;
  }, 0);

  const weeklyWorkloadLevel =
    weeklyWorkload >= 50
      ? 'VERY HIGH'
      : weeklyWorkload >= 35
        ? 'HIGH'
        : weeklyWorkload >= 20
          ? 'MEDIUM'
          : 'LOW';

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
      {/* Week row navigation headers */}
      <View style={styles.weekRowContainer}>
        {weekDates.map((dateKey) => {
          const dayDate = new Date(`${dateKey}T00:00:00`);
          const dayEvents = events.filter(
            (event) => event.date === dateKey,
          );
          const workload = getDayWorkload(dayEvents);
          const isSelected = selectedDate === dateKey;
          const isToday = dateKey === getLocalDateKey();

          return (
            <TouchableOpacity
              key={dateKey}
              onPress={() => {
                if (rescheduleMode) {
                  onCompleteRescheduling(dateKey);
                } else {
                  onSelectDate(dateKey);
                }
              }}
              style={[
                styles.weekDayHeaderCell,
                {
                  backgroundColor: isSelected
                    ? primaryAccent
                    : 'transparent',
                },
              ]}
            >
              <Text
                style={[
                  styles.weekDayLabel,
                  {
                    color: isSelected
                      ? '#FFFFFF'
                      : textSubTheme,
                  },
                ]}
              >
                {dayDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                })}
              </Text>

              <Text
                style={[
                  styles.weekDayNum,
                  {
                    color: isSelected
                      ? '#FFFFFF'
                      : isToday
                        ? primaryAccent
                        : textTheme,
                  },
                ]}
              >
                {dayDate.getDate()}
              </Text>

              {dayEvents.length > 0 && (
                <View
                  style={[
                    styles.workloadDot,
                    {
                      backgroundColor: workload.color,
                    },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Weekly agenda timeline summary */}
      <Text
        style={[
          styles.sectionSubtitle,
          {
            color: textSubTheme,
            marginTop: 16,
          },
        ]}
      >
        Events in selected week
      </Text>

      <View style={styles.weeklyTimelineContainer}>
        {weekDates.map((dateKey) => {
          const dayEvents = events.filter(
            (event) => event.date === dateKey,
          );

          if (dayEvents.length === 0) {
            return null;
          }

          const dayLabel = new Date(
            `${dateKey}T00:00:00`,
          ).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });

          return (
            <View
              key={dateKey}
              style={styles.weekTimelineDayBlock}
            >
              <Text
                style={[
                  styles.weekTimelineDayTitle,
                  {
                    color: primaryAccent,
                  },
                ]}
              >
                {dayLabel}
              </Text>

              {dayEvents.map((event) => {
                const priorityColors = getPriorityColors(
                  event.priority,
                );

                const deadlineRisk = getDeadlineRisk(event);

                return (
                  <TouchableOpacity
                    key={event.id}
                    onPress={() => onSelectEvent(event)}
                    onLongPress={() =>
                      onStartRescheduling(event.id)
                    }
                    style={[
                      styles.weekEventCard,
                      {
                        borderColor: conflictingEventIds.has(event.id)
                          ? '#EF4444'
                          : CATEGORY_COLORS[event.category],
                        backgroundColor: bgTheme,
                        borderWidth: conflictingEventIds.has(event.id) ? 2 : 1,
                      },
                    ]}
                  >
                    <View style={styles.weekCardLeft}>
                      <Text
                        style={[
                          styles.eventTimeText,
                          {
                            color: textSubTheme,
                          },
                        ]}
                      >
                        {event.isAllDay
                          ? 'All Day'
                          : formatTime12(event.time)}
                      </Text>

                      <Text
                        style={[
                          styles.eventTitleText,
                          {
                            color: textTheme,
                          },
                        ]}
                      >
                        {event.title}
                      </Text>


                      {(deadlineRisk === 'OVERDUE' || deadlineRisk === 'AT RISK') && (
                        <Text
                          style={{
                            color: deadlineRisk === 'OVERDUE' ? '#EF4444' : '#F59E0B',
                            fontSize: 11,
                            fontWeight: '700',
                            marginTop: 3,
                          }}
                        >
                          {deadlineRisk === 'OVERDUE'
                            ? 'OVERDUE DEADLINE'
                            : 'DEADLINE AT RISK'}
                        </Text>
                      )}
                    </View>

                    <View
                      style={[
                        styles.priorityBadge,
                        {
                          backgroundColor:
                            priorityColors.bg,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityBadgeText,
                          {
                            color: priorityColors.text,
                          },
                        ]}
                      >
                        {event.priority}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </View>

      {/* Weekly Workload Overview */}
      <View
        style={{
          marginTop: 14,
          padding: 12,
          borderRadius: 12,
          backgroundColor: bgTheme,
          borderWidth: 1,
          borderColor: borderTheme,
        }}
      >
        <Text
          style={{
            color: textSubTheme,
            fontSize: 12,
            marginBottom: 4,
          }}
        >
          Weekly Workload
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              color: textTheme,
              fontSize: 20,
              fontWeight: '700',
            }}
          >
            {weeklyWorkload}
          </Text>

          <Text
            style={{
              color: primaryAccent,
              fontSize: 13,
              fontWeight: '600',
            }}
          >
            {weeklyWorkloadLevel}
          </Text>
        </View>
      </View>
    </View>
  );
}