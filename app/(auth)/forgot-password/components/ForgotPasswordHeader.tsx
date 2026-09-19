import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { forgotPasswordStyles as styles } from '../styles';

interface ForgotPasswordHeaderProps {
  onBack: () => void;
  textPrimary: string;
  primaryBrown: string;
}

export function ForgotPasswordHeader({
  onBack,
  textPrimary,
  primaryBrown,
}: ForgotPasswordHeaderProps) {
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
          size={48}
          color={textPrimary}
          style={styles.logoIcon}
        />
        <Text style={[styles.logoText, { color: textPrimary }]}>
          Gab<Text style={{ color: primaryBrown }}>Ai</Text>
        </Text>
      </View>
    </>
  );
}
