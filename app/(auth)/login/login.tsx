import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

import {
  LoginHeader,
  LoginForm,
  LoginSocial,
  LoginFooter,
} from './components';
import { useLogin } from './hooks';
import { loginStyles as styles } from './styles';

export default function LoginScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  // Color Palette matching mockup
  const primaryBrown = '#A97C50';
  const errorRed = '#EF4444';
  const inputBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textPrimary = isDark ? '#ECEDEE' : '#11181C';
  const textSecondary = isDark ? '#9BA1A6' : '#666666';
  const borderColorDefault = isDark ? '#2E2E2E' : '#E2E8F0';

  const {
    email,
    setEmail,
    password,
    setPassword,
    passwordVisible,
    setPasswordVisible,
    isLoading,
    isEmailFocused,
    setIsEmailFocused,
    isPasswordFocused,
    setIsPasswordFocused,
    emailError,
    setEmailError,
    passwordError,
    setPasswordError,
    handleLogin,
    handleGoogleLogin,
    handleForgotPassword,
    handleNavigateRegister,
  } = useLogin();

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
          {/* Logo & Welcome Header */}
          <LoginHeader
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            primaryBrown={primaryBrown}
          />

          {/* Form Fields & Submit */}
          <View style={styles.formContainer}>
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              passwordVisible={passwordVisible}
              setPasswordVisible={setPasswordVisible}
              isLoading={isLoading}
              isEmailFocused={isEmailFocused}
              setIsEmailFocused={setIsEmailFocused}
              isPasswordFocused={isPasswordFocused}
              setIsPasswordFocused={setIsPasswordFocused}
              emailError={emailError}
              setEmailError={setEmailError}
              passwordError={passwordError}
              setPasswordError={setPasswordError}
              onForgotPassword={handleForgotPassword}
              onSubmit={handleLogin}
              inputBg={inputBg}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              borderColorDefault={borderColorDefault}
              primaryBrown={primaryBrown}
              errorRed={errorRed}
            />

            {/* Social Authentication */}
            <LoginSocial
              onGoogleLogin={handleGoogleLogin}
              isLoading={isLoading}
              borderColorDefault={borderColorDefault}
              textSecondary={textSecondary}
              textPrimary={textPrimary}
            />

            {/* Register Navigation Link */}
            <LoginFooter
              onRegisterPress={handleNavigateRegister}
              textSecondary={textSecondary}
              primaryBrown={primaryBrown}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
