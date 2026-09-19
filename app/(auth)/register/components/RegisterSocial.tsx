import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { registerStyles as styles } from '../styles';

interface RegisterSocialProps {
  onGoogleSignup: () => void;
  isLoading: boolean;
  borderColorDefault: string;
  textSecondary: string;
  textPrimary: string;
}

export function RegisterSocial({
  onGoogleSignup,
  isLoading,
  borderColorDefault,
  textSecondary,
  textPrimary,
}: RegisterSocialProps) {
  return (
    <>
      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={[styles.dividerLine, { backgroundColor: borderColorDefault }]} />
        <Text style={[styles.dividerText, { color: textSecondary }]}>or</Text>
        <View style={[styles.dividerLine, { backgroundColor: borderColorDefault }]} />
      </View>

      {/* Google Signup */}
      <TouchableOpacity
        style={[styles.googleButton, { borderColor: borderColorDefault }]}
        onPress={onGoogleSignup}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <Image
          source="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.png"
          style={styles.googleIcon}
        />
        <Text style={[styles.googleButtonText, { color: textPrimary }]}>
          Continue with Google
        </Text>
      </TouchableOpacity>
    </>
  );
}
