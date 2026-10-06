import React from 'react';
import { View, Text, Image } from 'react-native';
import { useAppTheme } from '@/app/context/ThemeContext';
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
  const { colorScheme } = useAppTheme();
  const logoSource =
    colorScheme === 'dark'
      ? require('@/assets/images/GABAI-LOGO-WHITE.png')
      : require('@/assets/images/GABAI-LOGO-BLACK.png');

  return (
    <>
      <View style={styles.logoContainer}>
        <Image
          source={logoSource}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.welcomeContainer}>
        <Text style={[styles.welcomeTitle, { color: textPrimary }]}>Welcome Back!</Text>
        <Text style={[styles.welcomeSubtitle, { color: textSecondary }]}>
          Login to continue to your account
        </Text>
      </View>
    </>
  );
}

