import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
  onStatPress?: (statId: string) => void;
}

export default function ProfileStatsRow({
  stats,
  cardTheme,
  borderTheme,
  textTheme,
  textSubTheme,
  primaryAccent,
  onStatPress,
}: ProfileStatsRowProps) {
  return (
    <View style={styles.statsRow}>
      {stats.map((stat) => (
        <TouchableOpacity
          key={stat.id}
          activeOpacity={0.7}
          disabled={!onStatPress}
          onPress={() => onStatPress?.(stat.id)}
          style={[styles.statCard, { backgroundColor: cardTheme, borderColor: borderTheme }]}
        >
          <Feather name={stat.icon as any} size={20} color={primaryAccent} />
          <Text
            style={[styles.statNumber, { color: textTheme }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {stat.value}
          </Text>
          <Text style={[styles.statLabel, { color: textSubTheme }]}>{stat.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}