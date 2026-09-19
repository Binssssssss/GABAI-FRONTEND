import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { loginStyles as styles } from '../styles';

interface LoginFooterProps {
  onRegisterPress: () => void;
  textSecondary: string;
  primaryBrown: string;
}

export function LoginFooter({
  onRegisterPress,
  textSecondary,
  primaryBrown,
}: LoginFooterProps) {
  return (
    <View style={styles.footerContainer}>
      <Text style={[styles.footerText, { color: textSecondary }]}>
        Don&apos;t have an account?{' '}
      </Text>
      <TouchableOpacity onPress={onRegisterPress}>
        <Text style={[styles.footerLink, { color: primaryBrown }]}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}
