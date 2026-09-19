import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface AcademicPressureProps {
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  errorRed: string;
  primaryBrown: string;
}

export default function AcademicPressure({
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  errorRed,
  primaryBrown,
}: AcademicPressureProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push('/(tabs)/tasks/task' as any)}
      style={[
        styles.container,
        {
          backgroundColor: cardBg,
          borderColor: borderCol,
        },
      ]}
    >
      <View style={styles.left}>
        <Text style={[styles.title, { color: textPrimary }]}>
          Academic Pressure
        </Text>

        <View style={styles.status}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor: errorRed,
              },
            ]}
          />

          <Text
            style={[
              styles.statusText,
              {
                color: errorRed,
              },
            ]}
          >
            High Pressure
          </Text>
        </View>
      </View>

      <Feather
        name="chevron-right"
        size={18}
        color={textSecondary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  title: {
    fontSize: 13,
    fontWeight: '700',
    marginRight: 12,
  },

  status: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
});