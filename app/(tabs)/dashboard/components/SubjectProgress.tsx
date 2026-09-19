import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { DashboardSubject } from './types';

interface SubjectProgressProps {
  subjects: DashboardSubject[];
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
}

export default function SubjectProgress({
  subjects,
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  primaryBrown,
}: SubjectProgressProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() =>
        router.push('/(tabs)/tasks/task' as any)
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
        <Text
          style={[
            styles.title,
            { color: textPrimary },
          ]}
        >
          Subject Progress
        </Text>

        <Feather
          name="chevron-right"
          size={17}
          color={textSecondary}
        />
      </View>

      {/* Subjects */}
      {subjects.slice(0, 4).map((sub, index) => (
        <View
          key={index}
          style={styles.subject}
        >
          <View style={styles.subjectTop}>
            <Text
              numberOfLines={1}
              style={[
                styles.subjectName,
                { color: textPrimary },
              ]}
            >
              {sub.name}
            </Text>

            <Text
              style={[
                styles.percent,
                { color: primaryBrown },
              ]}
            >
              {sub.completion}%
            </Text>
          </View>

          <View
            style={[
              styles.progressBg,
              { backgroundColor: borderCol },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: primaryBrown,
                  width: `${sub.completion}%`,
                },
              ]}
            />
          </View>
        </View>
      ))}

      {subjects.length === 0 && (
        <View style={styles.empty}>
          <Feather
            name="book-open"
            size={15}
            color={primaryBrown}
          />

          <Text
            style={[
              styles.emptyText,
              { color: textSecondary },
            ]}
          >
            No subject progress yet
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 15,
    marginBottom: 16,
  },

  header: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  title: {
    fontSize: 14,
    fontWeight: '700',
  },

  subject: {
    paddingVertical: 9,
  },

  subjectTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  subjectName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 10,
  },

  percent: {
    fontSize: 10,
    fontWeight: '700',
  },

  progressBg: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  empty: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 11,
    marginLeft: 7,
  },
});