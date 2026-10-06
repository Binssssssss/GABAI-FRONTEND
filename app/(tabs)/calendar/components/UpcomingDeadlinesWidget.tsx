import { Feather } from '@expo/vector-icons';
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
        {deadlines.slice(0, 3).map((evt) => {
          const badgeText = getDeadlineBadgeText(evt.date);
          const badgeColor = badgeText === 'Overdue'
            ? '#B85F61'
            : badgeText === 'Today'
              ? '#C0783C'
              : badgeText === 'Tomorrow'
                ? '#A8782E'
                : primaryAccent;

          return (
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
                  <View style={[styles.deadlineBadge, { backgroundColor: `${badgeColor}20` }]}>
                    <Text style={[styles.deadlineBadgeText, { color: badgeColor }]}>
                      {badgeText}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.deadlineDateText, { color: textSubTheme }]}>
                  Due: {new Date(`${evt.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
          );
        })}
      </View>
    </>
  );
}
