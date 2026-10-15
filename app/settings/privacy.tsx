import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppAlert } from '@/components/AppAlert';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProfileTheme } from '@/app/(tabs)/profile/hooks';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/app/services/api';
import { isAppLockEnabled, setAppLockEnabled } from '@/app/services/appLock';
import {
  authenticateUser,
  hasDeviceLockSetUp,
  isLocalAuthSupported,
} from '@/app/services/localAuth';
import {
  ActionRow,
  Divider,
  ScreenHeader,
  SectionLabel,
  SettingsCard,
  SwitchRow,
} from '@/components/settings/SettingsUI';

/* Password input with a label and a show/hide (eye) button. */
function PasswordField({
  label,
  value,
  onChangeText,
  placeholder,
  theme,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  theme: ReturnType<typeof useProfileTheme>;
}) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View>
      <Text style={[styles.fieldLabel, { color: theme.textSubTheme }]}>{label}</Text>
      <View
        style={[
          styles.passwordRow,
          {
            borderColor: focused ? theme.primaryAccent : theme.borderTheme,
            backgroundColor: theme.bgTheme,
          },
        ]}
      >
        <TextInput
          style={[styles.passwordInput, { color: theme.textTheme }]}
          placeholder={placeholder}
          placeholderTextColor={theme.textSubTheme}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={visible ? `Hide ${label}` : `Show ${label}`}
          onPress={() => setVisible((v) => !v)}
          hitSlop={10}
          style={styles.eyeButton}
        >
          <Feather
            name={visible ? 'eye-off' : 'eye'}
            size={19}
            color={visible ? theme.primaryAccent : theme.textSubTheme}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function PrivacySecurityScreen() {
  const theme = useProfileTheme();
  const router = useRouter();
  const { signOut } = useAuth();

  // "google" accounts manage their password in their Google Account.
  const [authProvider, setAuthProvider] = useState<'email' | 'google' | null>(null);
  const [accountEmail, setAccountEmail] = useState('');

  // App lock
  const [appLock, setAppLock] = useState(false);
  const [lockAvailable, setLockAvailable] = useState(true);
  const lockSupported = isLocalAuthSupported();

  // Change password
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete account
  const [showDelete, setShowDelete] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      setAppLock(isLocalAuthSupported() && (await isAppLockEnabled()));
      setLockAvailable(await hasDeviceLockSetUp());
    })();
  }, []);

  // Find out how this account signs in.
  useEffect(() => {
    api
      .get('/account/profile')
      .then((response) => {
        const profile = response.data?.data ?? response.data;
        setAuthProvider(profile?.authProvider === 'google' ? 'google' : 'email');
        setAccountEmail(profile?.email ?? '');
      })
      .catch(() => setAuthProvider('email'));
  }, []);

  // ---------------- APP LOCK ----------------

  const handleAppLockToggle = async (value: boolean) => {
    if (!lockSupported) {
      AppAlert.alert(
        'Update needed',
        'App Lock needs the latest version of GabAi. Please install the newest build.',
      );
      return;
    }

    if (value && !lockAvailable) {
      AppAlert.alert(
        'Set up a screen lock first',
        'Add a fingerprint, face, PIN or pattern in your phone settings, then try again.',
      );
      return;
    }

    const passed = await authenticateUser(
      value ? 'Confirm to turn on App Lock' : 'Confirm to turn off App Lock',
    );

    if (!passed) return;

    await setAppLockEnabled(value);
    setAppLock(value);
  };

  // ---------------- CHANGE PASSWORD ----------------

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      AppAlert.alert('Missing information', 'Please fill in all three fields.');
      return;
    }

    if (newPassword.length < 8) {
      AppAlert.alert('Password too short', 'Your new password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      AppAlert.alert('Passwords do not match', 'Please re-enter your new password.');
      return;
    }

    try {
      setIsSaving(true);

      await api.post('/account/change-password', { currentPassword, newPassword });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);

      AppAlert.alert('Password updated', 'Your password was changed successfully.');
    } catch (error: any) {
      AppAlert.alert(
        'Unable to change password',
        error?.response?.data?.message ?? 'Please check your connection and try again.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ---------------- DELETE ACCOUNT ----------------

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);

      await api.delete('/account', { data: { confirmation: 'DELETE' } });

      await Notifications.cancelAllScheduledNotificationsAsync();
      await setAppLockEnabled(false);
      await signOut();

      router.replace('/(auth)/login/login');
    } catch (error: any) {
      AppAlert.alert(
        'Unable to delete account',
        error?.response?.data?.message ?? 'Please check your connection and try again.',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAccount = () => {
    AppAlert.alert(
      'Delete your account?',
      'This permanently deletes your account and all of your tasks, notes, expenses and focus sessions. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: confirmDelete },
      ],
    );
  };

  const inputStyle = [
    styles.input,
    { color: theme.textTheme, borderColor: theme.borderTheme, backgroundColor: theme.bgTheme },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgTheme }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Privacy & Security" theme={theme} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SectionLabel text="APP LOCK" theme={theme} />
          <SettingsCard theme={theme}>
            <SwitchRow
              theme={theme}
              icon="lock"
              title="Lock GabAi"
              subtitle={
                lockSupported
                  ? 'Ask for fingerprint, face or phone PIN when you open the app'
                  : 'Needs the latest app build'
              }
              value={appLock}
              onValueChange={handleAppLockToggle}
            />
          </SettingsCard>

          <SectionLabel text="PASSWORD" theme={theme} />
          {authProvider === 'google' ? (
            <SettingsCard theme={theme}>
              <View style={styles.googleBox}>
                <View style={styles.googleHeader}>
                  <View style={styles.googleLogo}>
                    <Text style={styles.googleG}>G</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.googleTitle, { color: theme.textTheme }]}>
                      Signed in with Google
                    </Text>
                    {!!accountEmail && (
                      <Text style={[styles.googleEmail, { color: theme.textSubTheme }]}>
                        {accountEmail}
                      </Text>
                    )}
                  </View>
                </View>

                <Text style={[styles.googleNote, { color: theme.textSubTheme }]}>
                  Your password is managed by Google. To change it, go to your Google Account.
                </Text>

                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => Linking.openURL('https://myaccount.google.com/security')}
                  style={[
                    styles.googleButton,
                    { borderColor: theme.borderTheme, backgroundColor: theme.bgTheme },
                  ]}
                >
                  <Feather name="external-link" size={15} color={theme.textTheme} />
                  <Text style={[styles.googleButtonText, { color: theme.textTheme }]}>
                    Manage Google Account
                  </Text>
                </TouchableOpacity>
              </View>
            </SettingsCard>
          ) : (
          <SettingsCard theme={theme}>
            <ActionRow
              theme={theme}
              icon="key"
              title="Change Password"
              expanded={showPasswordForm}
              onPress={() => setShowPasswordForm((prev) => !prev)}
            />

            {showPasswordForm && (
              <View style={styles.form}>
                <PasswordField
                  label="Current password"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  theme={theme}
                />
                <PasswordField
                  label="New password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  theme={theme}
                />
                <PasswordField
                  label="Confirm new password"
                  placeholder="Type the new password again"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  theme={theme}
                />

                {/* Live checks */}
                {newPassword.length > 0 && (
                  <View style={styles.rules}>
                    {[
                      { ok: newPassword.length >= 8, text: 'At least 8 characters' },
                      {
                        ok: confirmPassword.length > 0 && confirmPassword === newPassword,
                        text: 'Passwords match',
                      },
                    ].map((rule) => (
                      <View key={rule.text} style={styles.ruleRow}>
                        <Feather
                          name={rule.ok ? 'check-circle' : 'circle'}
                          size={13}
                          color={rule.ok ? '#22C55E' : theme.textSubTheme}
                        />
                        <Text
                          style={[
                            styles.ruleText,
                            { color: rule.ok ? '#22C55E' : theme.textSubTheme },
                          ]}
                        >
                          {rule.text}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.primaryButton, { backgroundColor: theme.primaryAccent }]}
                  onPress={handleChangePassword}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Update Password</Text>
                  )}
                </TouchableOpacity>

                <Text style={[styles.hint, { color: theme.textSubTheme }]}>
                  Forgot your current password? Log out and use
                  {' "Forgot Password" '}on the login screen.
                </Text>
              </View>
            )}
          </SettingsCard>
          )}

          <SectionLabel text="DANGER ZONE" theme={theme} />
          <SettingsCard theme={theme}>
            <ActionRow
              theme={theme}
              icon="trash-2"
              title="Delete Account"
              subtitle="Permanently remove your account and data"
              danger
              expanded={showDelete}
              onPress={() => setShowDelete((prev) => !prev)}
            />

            {showDelete && (
              <>
                <Divider theme={theme} />
                <View style={styles.form}>
                  <Text style={[styles.hint, { color: theme.textSubTheme, marginTop: 0 }]}>
                    Type DELETE to confirm.
                  </Text>
                  <TextInput
                    style={inputStyle}
                    placeholder="DELETE"
                    placeholderTextColor={theme.textSubTheme}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    value={deleteText}
                    onChangeText={setDeleteText}
                  />
                  <TouchableOpacity
                    style={[
                      styles.primaryButton,
                      {
                        backgroundColor: theme.errorRed,
                        opacity: deleteText === 'DELETE' ? 1 : 0.4,
                      },
                    ]}
                    disabled={deleteText !== 'DELETE' || isDeleting}
                    onPress={handleDeleteAccount}
                  >
                    {isDeleting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.primaryButtonText}>Delete My Account</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </SettingsCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 120 },
  form: { paddingHorizontal: 14, paddingBottom: 16, gap: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  primaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  hint: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6, marginLeft: 2 },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 14,
  },
  passwordInput: { flex: 1, fontSize: 15, paddingVertical: 12 },
  eyeButton: { paddingHorizontal: 12, paddingVertical: 10 },
  rules: { gap: 5, marginLeft: 2 },
  googleBox: { padding: 14, gap: 12 },
  googleHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  googleLogo: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: { fontSize: 18, fontWeight: '800', color: '#4285F4' },
  googleTitle: { fontSize: 14, fontWeight: '600' },
  googleEmail: { fontSize: 12, marginTop: 2 },
  googleNote: { fontSize: 12.5, lineHeight: 19 },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
  },
  googleButtonText: { fontSize: 14, fontWeight: '700' },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  ruleText: { fontSize: 12 },
});
