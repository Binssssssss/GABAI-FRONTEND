import { Text, View } from 'react-native';
import { calendarStyles as styles } from '../styles/calendar.styles';

interface AcademicPressure {
  level: string;
  label: string;
  score: number;
}

interface AcademicPressureIndicatorProps {
  pressure: AcademicPressure | null;
  /** Unfinished assignments and exams due in the next 7 days. */
  dueThisWeek?: number;
  cardTheme: string;
  borderTheme: string;
  textTheme: string;
  textSubTheme: string;
  primaryAccent: string;
}

/** One compact line: "Workload  Low · 2 due this week". */
export default function AcademicPressureIndicator({
  pressure,
  dueThisWeek,
  borderTheme,
  textTheme,
  textSubTheme,
}: AcademicPressureIndicatorProps) {
  if (!pressure) {
    return null;
  }

  const level = pressure.level.toUpperCase();

  const levelColor =
    level === 'HIGH'
      ? '#B85F61'
      : level === 'MEDIUM'
        ? '#C0783C'
        : '#56846F';

  const levelText =
    level.charAt(0) + level.slice(1).toLowerCase();

  return (
    <View
      style={[styles.workloadLine, { borderBottomColor: borderTheme }]}
      accessibilityLabel={`Workload ${levelText}`}
    >
      <Text style={[styles.workloadLineLabel, { color: textSubTheme }]}>
        Workload
      </Text>

      <View style={[styles.workloadLineDot, { backgroundColor: levelColor }]} />

      <Text style={[styles.workloadLineLevel, { color: textTheme }]}>
        {levelText}
      </Text>

      {typeof dueThisWeek === 'number' && (
        <Text style={[styles.workloadLineMeta, { color: textSubTheme }]}>
          {' · '}
          {dueThisWeek === 0
            ? 'Nothing due this week'
            : `${dueThisWeek} due this week`}
        </Text>
      )}
    </View>
  );
}
