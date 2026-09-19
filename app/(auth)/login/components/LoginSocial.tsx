import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { loginStyles as styles } from '../styles';

interface LoginSocialProps {
  onGoogleLogin: () => void;
  isLoading: boolean;
  borderColorDefault: string;
  textSecondary: string;
  textPrimary: string;
}

export function LoginSocial({
  onGoogleLogin,
  isLoading,
  borderColorDefault,
  textSecondary,
  textPrimary,
}: LoginSocialProps) {
  return (
    <>
      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={[styles.dividerLine, { backgroundColor: borderColorDefault }]} />
        <Text style={[styles.dividerText, { color: textSecondary }]}>or</Text>
        <View style={[styles.dividerLine, { backgroundColor: borderColorDefault }]} />
      </View>

      {/* Google Sign-in */}
      <TouchableOpacity
        style={[styles.googleButton, { borderColor: borderColorDefault }]}
        onPress={onGoogleLogin}
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
