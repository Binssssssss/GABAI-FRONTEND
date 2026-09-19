import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { onboardingStyles as styles } from '../styles';

interface OnboardingControlsProps {
  isLastSlide: boolean;
  onNext: () => void;
  onLogin: () => void;
  primaryBrown: string;
  textSecondary: string;
}

export function OnboardingControls({
  isLastSlide,
  onNext,
  onLogin,
  primaryBrown,
  textSecondary,
}: OnboardingControlsProps) {
  return (
    <View style={styles.bottomContainer}>
      {/* Primary Action Button */}
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: primaryBrown }]}
        onPress={onNext}
        activeOpacity={0.85}
      >
        <Text style={styles.actionButtonText}>
          {isLastSlide ? 'Get Started' : 'Continue'}
        </Text>
        <Feather
          name={isLastSlide ? 'arrow-right' : 'chevron-right'}
          size={20}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      {/* Login Navigation Footer */}
      <View style={styles.loginRow}>
        <Text style={[styles.loginText, { color: textSecondary }]}>
          Already have an account?{' '}
        </Text>
        <TouchableOpacity onPress={onLogin}>
          <Text style={[styles.loginLink, { color: primaryBrown }]}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
