import React from 'react';
import { View, Text } from 'react-native';
import { loginStyles as styles } from '../styles';

interface LoginHeaderProps {
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
}

export function LoginHeader({
  textPrimary,
  textSecondary,
}: LoginHeaderProps) {
  return (
    <View style={[styles.welcomeContainer, { marginTop: 48 }]}>
      <Text style={[styles.welcomeTitle, { color: textPrimary }]}>Welcome Back!</Text>
      <Text style={[styles.welcomeSubtitle, { color: textSecondary }]}>
        Login to continue to your account
      </Text>
    </View>
  );
}
