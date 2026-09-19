import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { forgotPasswordStyles as styles } from '../styles';

interface ForgotPasswordFormProps {
  email: string;
  setEmail: (text: string) => void;
  isFocused: boolean;
  setIsFocused: (focused: boolean) => void;
  emailError: string;
  setEmailError: (error: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
  inputBg: string;
  textPrimary: string;
  textSecondary: string;
  borderColorDefault: string;
  primaryBrown: string;
  errorRed: string;
}

export function ForgotPasswordForm({
  email,
  setEmail,
  isFocused,
  setIsFocused,
  emailError,
  setEmailError,
  isLoading,
  onSubmit,
  inputBg,
  textPrimary,
  textSecondary,
  borderColorDefault,
  primaryBrown,
  errorRed,
}: ForgotPasswordFormProps) {
  return (
    <View style={styles.formContainer}>
      <Text style={[styles.title, { color: textPrimary }]}>Forgot Password?</Text>
      <Text style={[styles.subtitle, { color: textSecondary }]}>
        Enter your email address below and we&apos;ll send you instructions to reset your password.
      </Text>

      {/* Email Address */}
      <Text style={[styles.inputLabel, { color: textPrimary }]}>Email Address</Text>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: inputBg,
            borderColor: emailError
              ? errorRed
              : isFocused
                ? primaryBrown
                : borderColorDefault,
          },
        ]}
      >
        <Feather
          name="mail"
          size={20}
          color={emailError ? errorRed : textSecondary}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.textInput, { color: textPrimary }]}
          placeholder="Enter your email"
          placeholderTextColor={textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) setEmailError('');
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: primaryBrown, marginTop: 24 }]}
        onPress={onSubmit}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.buttonText}>Send Reset Link</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
