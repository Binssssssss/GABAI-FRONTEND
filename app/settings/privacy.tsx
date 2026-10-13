import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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

export default function PrivacySecurityScreen() {
  const theme = useProfileTheme();
  const router = useRouter();
  const { signOut } = useAuth();

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

  // ---------------- APP LOCK ----------------

  const handleAppLockToggle = async (value: boolean) => {
    if (!lockSupported) {
      Alert.alert(
        'Update needed',
        'App Lock needs the latest version of GabAi. Please install the newest build.',
      );
      return;
    }

    if (value && !lockAvailable) {
      Alert.alert(
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
      Alert.alert('Missing information', 'Please fill in all three fields.');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Password too short', 'Your new password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please re-enter your new password.');
      return;
    }

    try {
      setIsSaving(true);

      await api.post('/account/change-password', { currentPassword, newPassword });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);

      Alert.alert('Password updated', 'Your password was changed successfully.');
    } catch (error: any) {
      Alert.alert(
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
      Alert.alert(
        'Unable to delete account',
        error?.response?.data?.message ?? 'Please check your connection and try again.',
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
                <TextInput
                  style={inputStyle}
                  placeholder="Current password"
                  placeholderTextColor={theme.textSubTheme}
                  secureTextEntry
                  autoCapitalize="none"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TextInput
                  style={inputStyle}
                  placeholder="New password (min. 8 characters)"
                  placeholderTextColor={theme.textSubTheme}
                  secureTextEntry
                  autoCapitalize="none"
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TextInput
                  style={inputStyle}
                  placeholder="Confirm new password"
                  placeholderTextColor={theme.textSubTheme}
                  secureTextEntry
                  autoCapitalize="none"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />

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
                  Signed up with Google? You may not have a password yet. Use
                  {' "Forgot Password" '}on the login screen to set one.
                </Text>
              </View>
            )}
          </SettingsCard>

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
});
