import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

import {
  ForgotPasswordHeader,
  ForgotPasswordForm,
  ForgotPasswordSuccess,
} from './components';
import { useForgotPassword } from './hooks';
import { forgotPasswordStyles as styles } from './styles';

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  // Theme matching Login & Register screens
  const primaryBrown = '#A97C50';
  const errorRed = '#EF4444';
  const inputBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textPrimary = isDark ? '#ECEDEE' : '#11181C';
  const textSecondary = isDark ? '#9BA1A6' : '#666666';
  const borderColorDefault = isDark ? '#2E2E2E' : '#E2E8F0';

  const {
    email,
    setEmail,
    isFocused,
    setIsFocused,
    emailError,
    setEmailError,
    isLoading,
    isSent,
    handleResetPassword,
    handleBack,
  } = useForgotPassword();

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
          <ForgotPasswordHeader
            onBack={handleBack}
            textPrimary={textPrimary}
            primaryBrown={primaryBrown}
          />

          {isSent ? (
            /* Success State */
            <ForgotPasswordSuccess
              email={email}
              onBackToLogin={handleBack}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              primaryBrown={primaryBrown}
            />
          ) : (
            /* Form State */
            <ForgotPasswordForm
              email={email}
              setEmail={setEmail}
              isFocused={isFocused}
              setIsFocused={setIsFocused}
              emailError={emailError}
              setEmailError={setEmailError}
              isLoading={isLoading}
              onSubmit={handleResetPassword}
              inputBg={inputBg}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              borderColorDefault={borderColorDefault}
              primaryBrown={primaryBrown}
              errorRed={errorRed}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
