import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { calendarStyles as styles } from '../styles/calendar.styles';
import { CalendarViewMode } from '../types';
import { getCalendarRangeLabel } from '../utils/calendarHelpers';

interface CalendarRangeNavigationProps {
  date: string;
  viewMode: CalendarViewMode;
  textTheme: string;
  textSubTheme: string;
  borderTheme: string;
  onNavigate: (direction: -1 | 1) => void;
  onToday: () => void;
}

export default function CalendarRangeNavigation({
  date,
  viewMode,
  textTheme,
  textSubTheme,
  borderTheme,
  onNavigate,
  onToday,
}: CalendarRangeNavigationProps) {
  return (
    <View style={styles.rangeNavigation}>
      <TouchableOpacity
        accessibilityLabel="Previous period"
        onPress={() => onNavigate(-1)}
        style={[styles.rangeArrow, { borderColor: borderTheme }]}
      >
        <Feather name="chevron-left" size={18} color={textTheme} />
      </TouchableOpacity>

      <Text style={[styles.rangeLabel, { color: textTheme }]} numberOfLines={1}>
        {getCalendarRangeLabel(date, viewMode)}
      </Text>

      <TouchableOpacity
        accessibilityLabel="Next period"
        onPress={() => onNavigate(1)}
        style={[styles.rangeArrow, { borderColor: borderTheme }]}
      >
        <Feather name="chevron-right" size={18} color={textTheme} />
      </TouchableOpacity>

      <TouchableOpacity onPress={onToday} style={styles.todayButton}>
        <Text style={[styles.todayButtonText, { color: textSubTheme }]}>Today</Text>
      </TouchableOpacity>
    </View>
  );
}