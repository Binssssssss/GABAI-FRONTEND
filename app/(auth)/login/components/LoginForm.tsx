import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { loginStyles as styles } from '../styles';

interface LoginFormProps {
  email: string;
  setEmail: (text: string) => void;
  password: string;
  setPassword: (text: string) => void;
  passwordVisible: boolean;
  setPasswordVisible: (visible: boolean) => void;
  isLoading: boolean;
  isEmailFocused: boolean;
  setIsEmailFocused: (focused: boolean) => void;
  isPasswordFocused: boolean;
  setIsPasswordFocused: (focused: boolean) => void;
  emailError: string;
  setEmailError: (error: string) => void;
  passwordError: string;
  setPasswordError: (error: string) => void;
  onForgotPassword: () => void;
  onSubmit: () => void;
  inputBg: string;
  textPrimary: string;
  textSecondary: string;
  borderColorDefault: string;
  primaryBrown: string;
  errorRed: string;
}

export function LoginForm({
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
  onForgotPassword,
  onSubmit,
  inputBg,
  textPrimary,
  textSecondary,
  borderColorDefault,
  primaryBrown,
  errorRed,
}: LoginFormProps) {
  return (
    <>
      {/* Email Address */}
      <Text style={[styles.inputLabel, { color: textPrimary }]}>Email Address</Text>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: inputBg,
            borderColor: emailError
              ? errorRed
              : isEmailFocused
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
          onFocus={() => setIsEmailFocused(true)}
          onBlur={() => setIsEmailFocused(false)}
        />
      </View>
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      {/* Password */}
      <Text style={[styles.inputLabel, { color: textPrimary, marginTop: 12 }]}>Password</Text>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: inputBg,
            borderColor: passwordError
              ? errorRed
              : isPasswordFocused
                ? primaryBrown
                : borderColorDefault,
          },
        ]}
      >
        <Feather
          name="lock"
          size={20}
          color={passwordError ? errorRed : textSecondary}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.textInput, { color: textPrimary }]}
          placeholder="Enter your password"
          placeholderTextColor={textSecondary}
          secureTextEntry={!passwordVisible}
          autoCapitalize="none"
          autoCorrect={false}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) setPasswordError('');
          }}
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={() => setIsPasswordFocused(false)}
        />
        <Pressable
          onPress={() => setPasswordVisible(!passwordVisible)}
          style={styles.eyeButton}
        >
          <Feather
            name={passwordVisible ? 'eye' : 'eye-off'}
            size={20}
            color={textSecondary}
          />
        </Pressable>
      </View>
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

      {/* Forgot Password Link */}
      <TouchableOpacity
        onPress={onForgotPassword}
        activeOpacity={0.7}
        style={styles.forgotPasswordWrapper}
      >
        <Text style={[styles.forgotPasswordText, { color: primaryBrown }]}>
          Forgot Password?
        </Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.loginButton, { backgroundColor: primaryBrown }]}
        onPress={onSubmit}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </TouchableOpacity>
    </>
  );
}
