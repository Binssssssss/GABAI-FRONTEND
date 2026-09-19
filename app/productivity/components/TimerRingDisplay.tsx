import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { focusStyles as styles } from '../styles/focus.styles';

interface TimerRingDisplayProps {
  formattedTime: string;
  progressPercent: number;
  selectedSubject: string;
  isStrict: boolean;
  isRunning: boolean;
  isPaused: boolean;
  onEnterZen: () => void;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  primaryAccent: string;
}

export default function TimerRingDisplay({
  formattedTime,
  progressPercent,
  selectedSubject,
  isStrict,
  isRunning,
  isPaused,
  onEnterZen,
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  primaryAccent,
}: TimerRingDisplayProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onEnterZen}
      style={[styles.timerMainCard, { backgroundColor: cardBg, borderColor: borderCol }]}
    >
      {/* Strict Mode Indicator Badge */}
      <View
        style={[
          styles.strictBadge,
          {
            backgroundColor: isStrict ? primaryAccent + '20' : borderCol,
          },
        ]}
      >
        <Feather
          name={isStrict ? 'shield' : 'unlock'}
          size={13}
          color={isStrict ? primaryAccent : textSecondary}
        />
        <Text
          style={[
            styles.strictBadgeText,
            { color: isStrict ? primaryAccent : textSecondary },
          ]}
        >
          {isStrict ? 'Strict Mode Lock' : 'Casual Focus'}
        </Text>
      </View>

      {/* Big Digital Display */}
      <Text style={[styles.timerDisplayDigits, { color: textPrimary }]}>
        {formattedTime}
      </Text>

      {/* Selected Subject Pill */}
      <View
        style={[
          styles.subjectIndicatorTag,
          { backgroundColor: primaryAccent + '15', borderColor: primaryAccent + '40' },
        ]}
      >
        <Text style={[styles.subjectIndicatorText, { color: primaryAccent }]}>
          📚 {selectedSubject.trim() || 'General Study'}
        </Text>
      </View>

      {/* Progress Track */}
      <View style={[styles.progressBarTrack, { backgroundColor: borderCol }]}>
        <View
          style={[
            styles.progressBarFilled,
            {
              width: `${progressPercent}%`,
              backgroundColor: primaryAccent,
            },
          ]}
        />
      </View>

      <Text style={{ fontSize: 11, color: textSecondary, marginTop: 10 }}>
        Tap card for Fullscreen Zen Mode
      </Text>
    </TouchableOpacity>
  );
}
