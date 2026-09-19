import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { registerStyles as styles } from '../styles';

interface RegisterFooterProps {
  onLoginPress: () => void;
  textSecondary: string;
  primaryBrown: string;
}

export function RegisterFooter({
  onLoginPress,
  textSecondary,
  primaryBrown,
}: RegisterFooterProps) {
  return (
    <View style={styles.footerContainer}>
      <Text style={[styles.footerText, { color: textSecondary }]}>
        Already have an account?{' '}
      </Text>
      <TouchableOpacity onPress={onLoginPress}>
        <Text style={[styles.footerLink, { color: primaryBrown }]}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}
