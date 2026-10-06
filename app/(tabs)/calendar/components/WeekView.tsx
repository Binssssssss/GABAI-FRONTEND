import { Text, TouchableOpacity, View } from 'react-native';
import { CATEGORY_COLORS } from '../constants/calendarConfig';
import { calendarStyles as styles } from '../styles/calendar.styles';
import { CalendarEvent } from '../types';
import { getDayWorkload, getLocalDateKey, getPriorityColors, getWeekDateKeys } from '../utils/calendarHelpers';

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

  return (
    <View style={[styles.calendarCard, { backgroundColor: cardTheme, borderColor: borderTheme }]}>
      {/* Week row navigation headers */}
      <View style={styles.weekRowContainer}>
        {weekDates.map((dateKey) => {
          const dayDate = new Date(`${dateKey}T00:00:00`);
          const dayEvents = events.filter((event) => event.date === dateKey);
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
                { backgroundColor: isSelected ? primaryAccent : 'transparent' },
              ]}
            >
                <Text style={[styles.weekDayLabel, { color: isSelected ? '#FFFFFF' : textSubTheme }]}>
                  {dayDate.toLocaleDateString('en-US', { weekday: 'short' })}
              </Text>
              <Text
                style={[
                  styles.weekDayNum,
                  { color: isSelected ? '#FFFFFF' : isToday ? primaryAccent : textTheme },
                ]}
              >
                {dayDate.getDate()}
              </Text>
              {dayEvents.length > 0 && (
                <View style={[styles.workloadDot, { backgroundColor: workload.color }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Weekly agenda timeline summary */}
      <Text style={[styles.sectionSubtitle, { color: textSubTheme, marginTop: 16 }]}>
        Events in selected week
      </Text>
      <View style={styles.weeklyTimelineContainer}>
        {weekDates.map((dateKey) => {
          const dayEvts = events.filter((e) => e.date === dateKey);
          if (dayEvts.length === 0) return null;
          const dayLabel = new Date(`${dateKey}T00:00:00`).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });
          return (
            <View key={dateKey} style={styles.weekTimelineDayBlock}>
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
