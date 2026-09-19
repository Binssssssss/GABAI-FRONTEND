import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { loginStyles as styles } from '../styles';

interface LoginHeaderProps {
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
}

export function LoginHeader({
  textPrimary,
  textSecondary,
  primaryBrown,
}: LoginHeaderProps) {
  return (
    <>
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <FontAwesome5
          name="graduation-cap"
          size={68}
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
        <Text style={[styles.welcomeTitle, { color: textPrimary }]}>Welcome Back!</Text>
        <Text style={[styles.welcomeSubtitle, { color: textSecondary }]}>
          Login to continue to your account
        </Text>
      </View>
    </>
  );
}
