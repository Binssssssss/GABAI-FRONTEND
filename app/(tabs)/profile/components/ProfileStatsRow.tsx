import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ProfileStatItem } from '../types';
import { profileStyles as styles } from '../styles/profile.styles';

interface ProfileStatsRowProps {
  stats: ProfileStatItem[];
  cardTheme: string;
  borderTheme: string;
  textTheme: string;
  textSubTheme: string;
  primaryAccent: string;
}

export default function ProfileStatsRow({
  stats,
  cardTheme,
  borderTheme,
  textTheme,
  textSubTheme,
  primaryAccent,
}: ProfileStatsRowProps) {
  return (
    <View style={styles.statsRow}>
      {stats.map((stat) => (
        <View
          key={stat.id}
          style={[styles.statCard, { backgroundColor: cardTheme, borderColor: borderTheme }]}
        >
          <Feather name={stat.icon as any} size={20} color={primaryAccent} />
          <Text style={[styles.statNumber, { color: textTheme }]}>{stat.value}</Text>
          <Text style={[styles.statLabel, { color: textSubTheme }]}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}
