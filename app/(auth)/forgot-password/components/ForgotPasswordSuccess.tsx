import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { forgotPasswordStyles as styles } from '../styles';

interface ForgotPasswordSuccessProps {
  email: string;
  onBackToLogin: () => void;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
}

export function ForgotPasswordSuccess({
  email,
  onBackToLogin,
  textPrimary,
  textSecondary,
  primaryBrown,
}: ForgotPasswordSuccessProps) {
  return (
    <View style={styles.successContainer}>
      <View style={[styles.successIconWrapper, { backgroundColor: primaryBrown + '20' }]}>
        <Feather name="check" size={32} color={primaryBrown} />
      </View>
      <Text style={[styles.successTitle, { color: textPrimary }]}>Reset Link Sent!</Text>
      <Text style={[styles.successSubtitle, { color: textSecondary }]}>
        We have sent password reset instructions to {email}.
      </Text>
      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: primaryBrown }]}
        onPress={onBackToLogin}
      >
        <Text style={styles.buttonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}
