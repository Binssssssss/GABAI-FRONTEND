import { Text, TouchableOpacity, View } from 'react-native';
import { CATEGORY_COLORS, WEEKDAYS } from '../constants/calendarConfig';
import { calendarStyles as styles } from '../styles/calendar.styles';
import { CalendarEvent } from '../types';

interface MonthViewProps {
  events: CalendarEvent[];
  selectedDate: string;
  rescheduleMode: boolean;
  onSelectDate: (date: string) => void;
  onCompleteRescheduling: (date: string) => void;
  cardTheme: string;
  borderTheme: string;
  textTheme: string;
  textSubTheme: string;
  primaryAccent: string;
}

export default function MonthView({
  events,
  selectedDate,
  rescheduleMode,
  onSelectDate,
  onCompleteRescheduling,
  borderTheme,
  textTheme,
  textSubTheme,
  primaryAccent,
}: MonthViewProps) {
  const selected = new Date(`${selectedDate}T00:00:00`);

  const currentYear = selected.getFullYear();
  const currentMonth = selected.getMonth();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

  const today = new Date();

  const isToday = (dateString: string) => {
    const date = new Date(`${dateString}T00:00:00`);

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const formatDate = (day: number) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return (
    <View style={[styles.monthContainer, { borderBottomColor: borderTheme }]}>
      {/* Weekday headers */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day, index) => (
          <Text
            key={index}
            style={[styles.weekdayLabel, { color: textSubTheme }]}
          >
            {day}
          </Text>
        ))}
      </View>

      {/* Date grid */}
      <View style={styles.calendarGrid}>
        {Array.from({ length: totalCells }).map((_, index) => {
          const day = index - firstDayOfMonth + 1;

          if (day < 1 || day > daysInMonth) {
            return <View key={index} style={styles.emptyGridCell} />;
          }

          const dayString = formatDate(day);
          const isSelected = selectedDate === dayString;
          const todayDate = isToday(dayString);

          // One dot per category on this day (max 3).
          const dayCategories = Array.from(
            new Set(
              events
                .filter((event) => event.date === dayString && !event.completed)
                .map((event) => event.category),
            ),
          ).slice(0, 3);

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityLabel={`${dayString}${dayCategories.length ? ', has events' : ''}`}
              accessibilityState={{ selected: isSelected }}
              onPress={() => {
                if (rescheduleMode) {
                  onCompleteRescheduling(dayString);
                } else {
                  onSelectDate(dayString);
                }
              }}
              style={styles.gridCell}
            >
              <View
                style={[
                  styles.dayNumberWrap,
                  {
                    backgroundColor: isSelected ? primaryAccent : 'transparent',
                    borderColor:
                      todayDate && !isSelected ? primaryAccent : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cellDayText,
                    {
                      color: isSelected
                        ? '#FFFFFF'
                        : todayDate
                          ? primaryAccent
                          : textTheme,
                      fontWeight: isSelected || todayDate ? '700' : '500',
                    },
                  ]}
                >
                  {day}
                </Text>
              </View>

              {/* Category dots */}
              <View style={styles.indicatorRow}>
                {dayCategories.map((category) => (
                  <View
                    key={category}
                    style={[
                      styles.indicatorDot,
                      {
                        backgroundColor:
                          CATEGORY_COLORS[category] ?? textSubTheme,
                      },
                    ]}
                  />
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}