import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/app/context/ThemeContext';
import {
  LoginFooter,
  LoginForm,
  LoginHeader,
  LoginSocial,
} from './components';
import { useLogin } from './hooks';
import { loginStyles as styles } from './styles';

export default function LoginScreen() {
  const { colors } = useAppTheme();

  // Theme colors
  const primaryBrown = colors.primary;
  const errorRed = colors.danger;
  const inputBg = colors.card;
  const textPrimary = colors.text;
  const textSecondary = colors.secondaryText;
  const borderColorDefault = colors.border;

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
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
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
          <View
            style={[
              styles.formContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
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