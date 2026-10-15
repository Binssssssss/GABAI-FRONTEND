import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppAlert } from '@/components/AppAlert';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/app/context/ThemeContext';
import api from '@/app/services/api';

const ACCENT = '#A97C50';
const CODE_LENGTH = 6;
const CODE_TTL_SECONDS = 10 * 60;
const RESEND_COOLDOWN_SECONDS = 60;

const formatClock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ?? error?.message ?? fallback;

/**
 * Shown after Register (and when an unverified account tries to log in).
 * The user enters the 6-digit code sent to their email via Resend.
 */
export default function VerifyEmailScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = String(params.email ?? '').trim();

  const inputRef = useRef<TextInput>(null);

  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Countdowns are based on wall-clock times so they stay correct.
  const [expiresAt, setExpiresAt] = useState(() => Date.now() + CODE_TTL_SECONDS * 1000);
  const [resendAt, setResendAt] = useState(() => Date.now() + RESEND_COOLDOWN_SECONDS * 1000);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const expiresIn = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  const resendIn = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const isComplete = code.length === CODE_LENGTH;

  const goToLogin = () => router.replace('/(auth)/login/login');
  const goToRegister = () => router.replace('/(auth)/register/register');

  const verify = async (value = code) => {
    if (value.length !== CODE_LENGTH || isVerifying) return;

    setIsVerifying(true);
    setErrorText('');

    try {
      const response = await api.post('/auth/verify-email', { email, code: value });

      AppAlert.alert(
        'Email verified',
        response.data?.message ?? 'Email verified. You can now log in.',
        [{ text: 'Go to Login', onPress: goToLogin }],
        { cancelable: false },
      );
    } catch (error: any) {
      setErrorText(getErrorMessage(error, 'Verification failed. Please try again.'));
      setCode('');
      inputRef.current?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const resend = async () => {
    if (resendIn > 0 || isResending) return;

    setIsResending(true);
    setErrorText('');

    try {
      const response = await api.post('/auth/resend-verification', { email });
      const cooldown = Number(response.data?.cooldownSeconds) || RESEND_COOLDOWN_SECONDS;

      setCode('');
      setExpiresAt(Date.now() + CODE_TTL_SECONDS * 1000);
      setResendAt(Date.now() + cooldown * 1000);

      AppAlert.alert('Code sent', response.data?.message ?? 'A new code has been sent to your email.');
    } catch (error: any) {
      const retryAfter = Number(error?.response?.data?.errors?.retryAfter);
      if (retryAfter > 0) setResendAt(Date.now() + retryAfter * 1000);

      setErrorText(getErrorMessage(error, 'Could not send a new code. Please try again.'));
    } finally {
      setIsResending(false);
    }
  };

  const onChangeCode = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);
    if (errorText) setErrorText('');

    // Submit automatically once all 6 digits are typed or pasted.
    if (digits.length === CODE_LENGTH) void verify(digits);
  };

  if (!email) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: colors.background }]}>
        <View style={s.centered}>
          <Text style={[s.title, { color: colors.text }]}>Missing email</Text>
          <Text style={[s.subtitle, { color: colors.secondaryText }]}>
            Please register again to receive a verification code.
          </Text>
          <TouchableOpacity style={s.primaryBtn} onPress={goToRegister}>
            <Text style={s.primaryBtnText}>Back to Register</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Back to login"
            onPress={goToLogin}
            style={[s.backBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Feather name="arrow-left" size={18} color={colors.text} />
          </TouchableOpacity>

          <View style={s.iconCircle}>
            <Feather name="mail" size={34} color={ACCENT} />
          </View>

          <Text style={[s.title, { color: colors.text }]}>Verify your email</Text>
          <Text style={[s.subtitle, { color: colors.secondaryText }]}>
            We sent a 6-digit code to{'\n'}
            <Text style={{ color: colors.text, fontWeight: '700' }}>{email}</Text>
            {'\n'}Enter it below to activate your account.
          </Text>

          {/* 6 boxes backed by one hidden input (supports paste and autofill) */}
          <Pressable style={s.boxes} onPress={() => inputRef.current?.focus()}>
            {Array.from({ length: CODE_LENGTH }, (_, index) => {
              const digit = code[index] ?? '';
              const isCurrent = index === code.length && !isVerifying;
              return (
                <View
                  key={index}
                  style={[
                    s.box,
                    {
                      backgroundColor: colors.surface,
                      borderColor: errorText
                        ? '#EF4444'
                        : digit || isCurrent
                          ? ACCENT
                          : colors.border,
                    },
                    isCurrent && s.boxCurrent,
                  ]}
                >
                  <Text style={[s.boxText, { color: colors.text }]}>{digit}</Text>
                </View>
              );
            })}
          </Pressable>

          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={onChangeCode}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            maxLength={CODE_LENGTH}
            autoFocus
            style={s.hiddenInput}
            accessibilityLabel="Verification code"
          />

          {!!errorText && <Text style={s.errorText}>{errorText}</Text>}

          <Text style={[s.expiry, { color: colors.secondaryText }]}>
            {expiresIn > 0
              ? `Code expires in ${formatClock(expiresIn)}`
              : 'This code has expired. Request a new one.'}
          </Text>

          <TouchableOpacity
            style={[s.primaryBtn, (!isComplete || isVerifying) && { opacity: 0.6 }]}
            disabled={!isComplete || isVerifying}
            onPress={() => verify()}
            activeOpacity={0.85}
          >
            {isVerifying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={s.primaryBtnText}>Verify & Continue</Text>
            )}
          </TouchableOpacity>

          <View style={s.resendRow}>
            <Text style={[s.resendText, { color: colors.secondaryText }]}>
              Didn&apos;t get the code?{' '}
            </Text>
            {resendIn > 0 ? (
              <Text style={[s.resendText, { color: ACCENT, fontWeight: '700' }]}>
                Resend in {formatClock(resendIn)}
              </Text>
            ) : (
              <TouchableOpacity onPress={resend} disabled={isResending}>
                <Text style={[s.resendText, { color: ACCENT, fontWeight: '700' }]}>
                  {isResending ? 'Sending…' : 'Resend code'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={[s.hint, { color: colors.secondaryText }]}>
            Check your Spam or Promotions folder if you can&apos;t find it.
          </Text>

          <TouchableOpacity onPress={goToRegister} style={{ alignSelf: 'center' }}>
            <Text style={[s.changeEmail, { color: colors.secondaryText }]}>
              Use a different email
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: ACCENT + '1F',
    borderWidth: 2,
    borderColor: ACCENT + '40',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 28,
    marginBottom: 22,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 10,
  },
  boxes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 9,
    marginTop: 30,
    marginBottom: 12,
  },
  box: {
    width: 46,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxCurrent: {
    shadowColor: ACCENT,
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 2,
  },
  boxText: {
    fontSize: 24,
    fontWeight: '800',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 6,
  },
  expiry: {
    fontSize: 12,
    textAlign: 'center',
  },
  primaryBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  resendText: {
    fontSize: 14,
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  changeEmail: {
    fontSize: 13,
    textDecorationLine: 'underline',
    marginTop: 14,
  },
});
