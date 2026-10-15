import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

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
}: RegisterHeaderProps) {
  return (
    <>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Feather
          name="arrow-left"
          size={24}
          color={textPrimary}
        />
      </TouchableOpacity>

      <View style={[styles.welcomeContainer, { marginTop: 24 }]}>
        <Text
          style={[
            styles.welcomeTitle,
            { color: textPrimary },
          ]}
        >
          Create Account
        </Text>

        <Text
          style={[
            styles.welcomeSubtitle,
            { color: textSecondary },
          ]}
        >
          Sign up to get started with your journey
        </Text>
      </View>
    </>
  );
}
