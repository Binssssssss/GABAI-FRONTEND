import { useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/app/context/ThemeContext';
import {
  RegisterFooter,
  RegisterForm,
  RegisterHeader,
  RegisterSocial,
} from './components';
import { useRegister } from './hooks';
import { registerStyles as styles } from './styles';

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  const primaryBrown = colors.primary;
  const errorRed = colors.danger;
  const inputBg = colors.card;
  const textPrimary = colors.text;
  const textSecondary = colors.secondaryText;
  const borderColorDefault = colors.border;

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
      style={[styles.container, { backgroundColor: palette.background }]}
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
          <View
            style={[
              styles.formContainer,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}
          >
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
