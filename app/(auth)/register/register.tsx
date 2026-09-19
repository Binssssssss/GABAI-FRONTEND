import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';

import {
  RegisterHeader,
  RegisterForm,
  RegisterSocial,
  RegisterFooter,
} from './components';
import { useRegister } from './hooks';
import { registerStyles as styles } from './styles';

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  // Theme Colors matching Login screen
  const primaryBrown = '#A97C50';
  const errorRed = '#EF4444';
  const inputBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textPrimary = isDark ? '#ECEDEE' : '#11181C';
  const textSecondary = isDark ? '#9BA1A6' : '#666666';
  const borderColorDefault = isDark ? '#2E2E2E' : '#E2E8F0';

  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    passwordVisible,
    setPasswordVisible,
    isLoading,
    isNameFocused,
    setIsNameFocused,
    isEmailFocused,
    setIsEmailFocused,
    isPasswordFocused,
    setIsPasswordFocused,
    nameError,
    setNameError,
    emailError,
    setEmailError,
    passwordError,
    setPasswordError,
    handleRegister,
    handleGoogleSignup,
  } = useRegister();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? '#121212' : '#FFFFFF' }]}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header & Logo Section */}
          <RegisterHeader
            onBack={() => router.replace('/(auth)/login/login')}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            primaryBrown={primaryBrown}
          />

          {/* Form Fields & Submit */}
          <View style={styles.formContainer}>
            <RegisterForm
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              passwordVisible={passwordVisible}
              setPasswordVisible={setPasswordVisible}
              isLoading={isLoading}
              isNameFocused={isNameFocused}
              setIsNameFocused={setIsNameFocused}
              isEmailFocused={isEmailFocused}
              setIsEmailFocused={setIsEmailFocused}
              isPasswordFocused={isPasswordFocused}
              setIsPasswordFocused={setIsPasswordFocused}
              nameError={nameError}
              setNameError={setNameError}
              emailError={emailError}
              setEmailError={setEmailError}
              passwordError={passwordError}
              setPasswordError={setPasswordError}
              onSubmit={handleRegister}
              inputBg={inputBg}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              borderColorDefault={borderColorDefault}
              primaryBrown={primaryBrown}
              errorRed={errorRed}
            />

            {/* Social Authentication */}
            <RegisterSocial
              onGoogleSignup={handleGoogleSignup}
              isLoading={isLoading}
              borderColorDefault={borderColorDefault}
              textSecondary={textSecondary}
              textPrimary={textPrimary}
            />

            {/* Login Navigation Link */}
            <RegisterFooter
              onLoginPress={() => router.replace('/(auth)/login/login')}
              textSecondary={textSecondary}
              primaryBrown={primaryBrown}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
