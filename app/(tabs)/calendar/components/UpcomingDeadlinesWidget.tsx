import { Text, TouchableOpacity, View } from 'react-native';
import { CATEGORY_COLORS } from '../constants/calendarConfig';
import { calendarStyles as styles } from '../styles/calendar.styles';
import { CalendarEvent } from '../types';
import { getDeadlineBadgeText } from '../utils/calendarHelpers';

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
  borderTheme,
  textTheme,
  textSubTheme,
}: UpcomingDeadlinesWidgetProps) {
  if (deadlines.length === 0) return null;

  const shown = deadlines.slice(0, 3);

  return (
    <>
      <View style={styles.deadlineHeader}>
        <Text style={[styles.sectionTitle, { color: textTheme }]}>Upcoming deadlines</Text>
      </View>

      <View style={styles.deadlinesList}>
        {shown.map((evt, index) => {
          const status = getDeadlineBadgeText(evt.date);
          const statusColor =
            status === 'Overdue'
              ? '#B85F61'
              : status === 'Today'
                ? '#C0783C'
                : status === 'Tomorrow'
                  ? '#A8782E'
                  : textSubTheme;
          const date = new Date(`${evt.date}T00:00:00`);

          return (
            <TouchableOpacity
              key={evt.id}
              accessibilityRole="button"
              onPress={() => onSelectEvent(evt)}
              style={[
                styles.deadlineRow,
                {
                  borderBottomColor: borderTheme,
                  borderBottomWidth: index === shown.length - 1 ? 0 : 1,
                },
              ]}
            >
              {/* Date block */}
              <View style={styles.deadlineDateCol}>
                <Text style={[styles.deadlineMonthText, { color: textSubTheme }]}>
                  {date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                </Text>
                <Text style={[styles.deadlineDayText, { color: textTheme }]}>
                  {date.getDate()}
                </Text>
              </View>

              <View style={styles.deadlineInfoCol}>
                <Text style={[styles.deadlineTitleText, { color: textTheme }]} numberOfLines={1}>
                  {evt.title}
                </Text>
                <View style={styles.deadlineMetaRow}>
                  <View
                    style={[
                      styles.deadlineCategoryDot,
                      { backgroundColor: CATEGORY_COLORS[evt.category] ?? textSubTheme },
                    ]}
                  />
                  <Text style={[styles.deadlineDateText, { color: textSubTheme }]}>
                    {evt.category}
                  </Text>
                </View>
              </View>

              <Text style={[styles.deadlineStatusText, { color: statusColor }]}>
                {status}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}
