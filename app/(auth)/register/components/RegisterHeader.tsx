import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useAppTheme } from '@/app/context/ThemeContext';
import { registerStyles as styles } from '../styles';
import { loginStyles } from '../../login/styles';

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
  const { colorScheme } = useAppTheme();

  const logoSource =
    colorScheme === 'dark'
      ? require('../../../../assets/images/GABAI-LOGO-WHITE.png')
      : require('../../../../assets/images/GABAI-LOGO-BLACK.png');

  return (
    <>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.7}
      >
        <Feather
          name="arrow-left"
          size={24}
          color={textPrimary}
        />
      </TouchableOpacity>

      {/* Same logo size as the Login screen */}
      <View style={loginStyles.logoContainer}>
        <Image
          source={logoSource}
          style={loginStyles.logoImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.welcomeContainer}>
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