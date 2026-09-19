import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface RecentActivityProps {
  cardBg: string;
  borderCol: string;
  textSecondary: string;
  primaryBrown: string;
}

export default function RecentActivity({
  cardBg,
  borderCol,
  textSecondary,
  primaryBrown,
}: RecentActivityProps) {
  const activities = [
    { icon: 'check-square' as const, text: 'Completed Capstone Database design schema.' },
    { icon: 'dollar-sign' as const, text: 'Added expense for bus fare (₱35.00).' },
    { icon: 'calendar' as const, text: 'Created event study group meetup at Library.' },
  ];

  return (
    <>
      <Text style={[styles.sectionHeading, { color: textSecondary }]}>Recent Activity</Text>
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
        {activities.map((act, idx) => (
          <View key={idx} style={[styles.activityRow, idx > 0 && { marginTop: 10 }]}>
            <Feather name={act.icon} size={14} color={primaryBrown} style={{ marginRight: 8 }} />
            <Text style={[styles.activityText, { color: textSecondary }]}>{act.text}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 4,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityText: {
    fontSize: 12,
    flex: 1,
  },
});
