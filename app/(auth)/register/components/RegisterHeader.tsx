import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { registerStyles as styles } from '../styles';

interface RegisterHeaderProps {
  onBack: () => void;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
}

export function RegisterHeader({
  onBack,
  textPrimary,
  textSecondary,
  primaryBrown,
}: RegisterHeaderProps) {
  return (
    <>
      {/* Back button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.7}
      >
        <Feather name="arrow-left" size={24} color={textPrimary} />
      </TouchableOpacity>

      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <FontAwesome5
          name="graduation-cap"
          size={54}
          color={textPrimary}
          style={styles.logoIcon}
        />
        <View style={styles.logoTextContainer}>
          <Text style={[styles.logoTextGab, { color: textPrimary }]}>Gab</Text>
          <Text style={[styles.logoTextAi, { color: primaryBrown }]}>Ai</Text>
        </View>
      </View>

      {/* Welcome Text */}
      <View style={styles.welcomeContainer}>
        <Text style={[styles.welcomeTitle, { color: textPrimary }]}>Create Account</Text>
        <Text style={[styles.welcomeSubtitle, { color: textSecondary }]}>
          Sign up to get started with your journey
        </Text>
      </View>
    </>
  );
}
