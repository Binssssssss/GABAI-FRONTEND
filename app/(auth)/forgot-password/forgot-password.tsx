import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/app/context/ThemeContext';
import {
  ForgotPasswordForm,
  ForgotPasswordHeader,
  ForgotPasswordSuccess,
} from './components';
import { useForgotPassword } from './hooks';
import { forgotPasswordStyles as styles } from './styles';

export default function ForgotPasswordScreen() {
  const { colors } = useAppTheme();

  const primaryBrown = colors.primary;
  const errorRed = colors.danger;
  const inputBg = colors.card;
  const textPrimary = colors.text;
  const textSecondary = colors.secondaryText;
  const borderColorDefault = colors.border;

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
      style={[styles.container, { backgroundColor: colors.background }]}
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
