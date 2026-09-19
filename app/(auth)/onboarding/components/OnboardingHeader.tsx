import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { onboardingStyles as styles } from '../styles';

interface OnboardingHeaderProps {
  onSkip: () => void;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
  isLastSlide: boolean;
}

export function OnboardingHeader({
  onSkip,
  textPrimary,
  textSecondary,
  primaryBrown,
  isLastSlide,
}: OnboardingHeaderProps) {
  return (
    <View style={styles.headerBar}>
      <View style={styles.logoRow}>
        <FontAwesome5
          name="graduation-cap"
          size={22}
          color={textPrimary}
          style={styles.logoCap}
        />
        <Text style={[styles.logoTextGab, { color: textPrimary }]}>Gab</Text>
        <Text style={[styles.logoTextAi, { color: primaryBrown }]}>Ai</Text>
      </View>

      {!isLastSlide ? (
        <TouchableOpacity style={styles.skipButton} onPress={onSkip} activeOpacity={0.7}>
          <Text style={[styles.skipButtonText, { color: textSecondary }]}>Skip</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 44 }} />
      )}
    </View>
  );
}
