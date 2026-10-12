import { Text, View } from 'react-native';

interface AcademicPressure {
  level: string;
  label: string;
  score: number;
}

interface AcademicPressureIndicatorProps {
  pressure: AcademicPressure | null;
  cardTheme: string;
  borderTheme: string;
  textTheme: string;
  textSubTheme: string;
  primaryAccent: string;
}

export default function AcademicPressureIndicator({
  pressure,
  cardTheme,
  borderTheme,
  textTheme,
  textSubTheme,
  primaryAccent,
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

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 14,
        padding: 14,
        borderRadius: 14,
        backgroundColor: cardTheme,
        borderWidth: 1,
        borderColor: borderTheme,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: textSubTheme,
              fontSize: 12,
              fontWeight: '600',
              marginBottom: 4,
            }}
          >
            ACADEMIC PRESSURE
          </Text>

          <Text
            style={{
              color: textTheme,
              fontSize: 17,
              fontWeight: '700',
            }}
          >
            {pressure.label}
          </Text>
        </View>

        <View
          style={{
            alignItems: 'flex-end',
          }}
        >
          <Text
            style={{
              color: levelColor,
              fontSize: 14,
              fontWeight: '700',
            }}
          >
            {level}
          </Text>

          <Text
            style={{
              color: textSubTheme,
              fontSize: 11,
              marginTop: 2,
            }}
          >
            Score {pressure.score}
          </Text>
        </View>
      </View>

      <View
        style={{
          height: 6,
          marginTop: 12,
          borderRadius: 999,
          backgroundColor: borderTheme,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${Math.min(Math.max(pressure.score, 0), 100)}%`,
            borderRadius: 999,
            backgroundColor: levelColor,
          }}
        />
      </View>

      <Text
        style={{
          color: textSubTheme,
          fontSize: 11,
          marginTop: 7,
        }}
      >
        Based on your current academic workload and deadlines.
      </Text>
    </View>
  );
}