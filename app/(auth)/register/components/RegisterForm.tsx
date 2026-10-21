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
import { registerStyles as styles } from '../styles';
import {
  LIMITS,
  checkEmail,
  checkName,
  checkNewPassword,
  passwordChecks,
} from '@/utils/formValidation';

interface RegisterFormProps {
  name: string;
  setName: (text: string) => void;
  email: string;
  setEmail: (text: string) => void;
  password: string;
  setPassword: (text: string) => void;
  passwordVisible: boolean;
  setPasswordVisible: (visible: boolean) => void;
  isLoading: boolean;
  isNameFocused: boolean;
  setIsNameFocused: (focused: boolean) => void;
  isEmailFocused: boolean;
  setIsEmailFocused: (focused: boolean) => void;
  isPasswordFocused: boolean;
  setIsPasswordFocused: (focused: boolean) => void;
  nameError: string;
  setNameError: (error: string) => void;
  emailError: string;
  setEmailError: (error: string) => void;
  passwordError: string;
  setPasswordError: (error: string) => void;
  onSubmit: () => void;
  inputBg: string;
  textPrimary: string;
  textSecondary: string;
  borderColorDefault: string;
  primaryBrown: string;
  errorRed: string;
}

export function RegisterForm({
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
  onSubmit,
  inputBg,
  textPrimary,
  textSecondary,
  borderColorDefault,
  primaryBrown,
  errorRed,
}: RegisterFormProps) {
  return (
    <>
      {/* Full Name */}
      <Text style={[styles.inputLabel, { color: textPrimary }]}>Full Name</Text>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: inputBg,
            borderColor: nameError
              ? errorRed
              : isNameFocused
                ? primaryBrown
                : borderColorDefault,
          },
        ]}
      >
        <Feather
          name="user"
          size={20}
          color={nameError ? errorRed : textSecondary}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.textInput, { color: textPrimary }]}
          placeholder="Enter your full name"
          placeholderTextColor={textSecondary}
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (nameError) setNameError('');
          }}
          onFocus={() => setIsNameFocused(true)}
          onBlur={() => {
            setIsNameFocused(false);
            if (name) setNameError(checkName(name));
          }}
          maxLength={LIMITS.nameMax}
          autoCapitalize="words"
        />
      </View>
      {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

      {/* Email Address */}
      <Text style={[styles.inputLabel, { color: textPrimary, marginTop: 12 }]}>Email Address</Text>
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
          onBlur={() => {
            setIsEmailFocused(false);
            if (email) setEmailError(checkEmail(email));
          }}
          maxLength={100}
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
          onBlur={() => {
            setIsPasswordFocused(false);
            if (password) setPasswordError(checkNewPassword(password));
          }}
          maxLength={64}
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

      {/* Live password checklist */}
      {password.length > 0 && (
        <View style={{ marginTop: 8, marginLeft: 4, gap: 4 }}>
          {[
            { ok: passwordChecks(password).length, text: `At least ${LIMITS.passwordMin} characters` },
            { ok: passwordChecks(password).letter, text: 'Has a letter' },
            { ok: passwordChecks(password).number, text: 'Has a number' },
          ].map((rule) => (
            <View key={rule.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Feather
                name={rule.ok ? 'check-circle' : 'circle'}
                size={13}
                color={rule.ok ? '#22C55E' : textSecondary}
              />
              <Text style={{ fontSize: 12, color: rule.ok ? '#22C55E' : textSecondary }}>
                {rule.text}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Register Button */}
      <TouchableOpacity
        style={[styles.registerButton, { backgroundColor: primaryBrown, marginTop: 24 }]}
        onPress={onSubmit}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.registerButtonText}>Register</Text>
        )}
      </TouchableOpacity>
    </>
  );
}
