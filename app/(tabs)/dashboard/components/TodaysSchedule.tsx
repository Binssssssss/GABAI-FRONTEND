import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DashboardTimelineItem } from './types';

interface TodaysScheduleProps {
  items: DashboardTimelineItem[];
  getTimelineIcon: (type: DashboardTimelineItem['type']) => string;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
}

export default function TodaysSchedule({
  items,
  getTimelineIcon,
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  primaryBrown,
}: TodaysScheduleProps) {
  const router = useRouter();

  const today = new Date();

  const day = today.getDate();

  const weekday = today.toLocaleDateString('en-US', {
    weekday: 'short',
  });

  const month = today.toLocaleDateString('en-US', {
    month: 'long',
  });

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() =>
        router.push('/(tabs)/calendar/calendar' as any)
      }
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor: borderCol,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>
            Today's Schedule
          </Text>

          <Text style={[styles.subtitle, { color: textSecondary }]}>
            Your upcoming activities
          </Text>
        </View>

        <Feather
          name="chevron-right"
          size={18}
          color={textSecondary}
        />
      </View>

      {/* Mini Calendar Header */}
      <View style={styles.dateContainer}>
        <View
          style={[
            styles.dateBox,
            {
              backgroundColor: `${primaryBrown}12`,
            },
          ]}
        >
          <Text
            style={[
              styles.weekday,
              { color: primaryBrown },
            ]}
          >
            {weekday.toUpperCase()}
          </Text>

          <Text
            style={[
              styles.day,
              { color: primaryBrown },
            ]}
          >
            {day}
          </Text>
        </View>

        <View style={styles.monthContainer}>
          <Text
            style={[
              styles.month,
              { color: textPrimary },
            ]}
          >
            {month}
          </Text>

          <Text
            style={[
              styles.todayText,
              { color: primaryBrown },
            ]}
          >
            Today
          </Text>
        </View>
      </View>

      {/* Schedule */}
      <View style={styles.schedule}>
        {items.slice(0, 3).map((item, index) => (
          <View
            key={index}
            style={[
              styles.scheduleRow,
              index === Math.min(items.length, 3) - 1 &&
                styles.lastRow,
            ]}
          >
            <Text
              style={[
                styles.time,
                { color: textSecondary },
              ]}
            >
              {item.time
                .replace(' AM', '')
                .replace(' PM', '')}
            </Text>

            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: `${primaryBrown}12`,
                },
              ]}
            >
              <Feather
                name={getTimelineIcon(item.type) as any}
                size={13}
                color={primaryBrown}
              />
            </View>

            <Text
              style={[
                styles.eventTitle,
                { color: textPrimary },
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>

            <View
              style={[
                styles.dot,
                { backgroundColor: primaryBrown },
              ]}
            />
          </View>
        ))}
      </View>

      {/* Empty State */}
      {items.length === 0 && (
        <Text
          style={[
            styles.emptyText,
            { color: textSecondary },
          ]}
        >
          No events scheduled for today.
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },

  subtitle: {
    fontSize: 10,
    marginTop: 2,
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 12,
  },

  dateBox: {
    width: 48,
    height: 52,
    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',
  },

  weekday: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  day: {
    fontSize: 21,
    fontWeight: '800',
    marginTop: 1,
  },

  monthContainer: {
    marginLeft: 10,
  },

  month: {
    fontSize: 14,
    fontWeight: '700',
  },

  todayText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },

  schedule: {
    borderTopWidth: 1,
    borderTopColor: '#ECEDEE30',
  },

  scheduleRow: {
    minHeight: 43,

    flexDirection: 'row',
    alignItems: 'center',

    borderBottomWidth: 1,
    borderBottomColor: '#ECEDEE20',
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  time: {
    width: 43,
    fontSize: 10,
    fontWeight: '600',
  },

  iconContainer: {
    width: 27,
    height: 27,
    borderRadius: 8,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 9,
  },

  eventTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 8,
  },

  emptyText: {
    fontSize: 11,
    marginTop: 10,
  },
});