import React, { useCallback, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProfileTheme } from '@/app/(tabs)/profile/hooks';
import {
  initializeNotifications,
  unregisterPushToken,
} from '@/app/services/notificationService';
import { cancelAllCalendarReminders } from '@/app/services/calendarReminderService';
import {
  DEFAULT_NOTIFICATION_PREFS,
  NotificationPrefs,
  ReminderLeadMinutes,
  loadNotificationPrefs,
  refreshNotificationPrefsFromServer,
  saveNotificationPrefs,
} from '@/app/services/notificationPrefs';
import {
  Divider,
  ScreenHeader,
  SectionLabel,
  SettingsCard,
  SwitchRow,
} from '@/components/settings/SettingsUI';

const LEAD_OPTIONS: { label: string; value: ReminderLeadMinutes }[] = [
  { label: '15 min', value: 15 },
  { label: '1 hour', value: 60 },
  { label: '1 day', value: 1440 },
];

type CategoryKey = 'taskDeadlines' | 'calendarReminders' | 'smartReminders' | 'focusAlerts';

export default function NotificationSettingsScreen() {
  const theme = useProfileTheme();

  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIFICATION_PREFS);
  const [permission, setPermission] = useState<string>('undetermined');

  const refreshPermission = useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermission(status);
  }, []);

  // Runs every time the screen is shown, so coming back from
  // the phone's settings app refreshes the permission status.
  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        await refreshPermission();

        const local = await loadNotificationPrefs();
        if (active) setPrefs(local);

        const remote = await refreshNotificationPrefsFromServer();
        if (active && remote) setPrefs(remote);
      })();

      return () => {
        active = false;
      };
    }, [refreshPermission]),
  );

  const update = useCallback(
    async (patch: Partial<NotificationPrefs>) => {
      const next = { ...prefs, ...patch };
      setPrefs(next);
      await saveNotificationPrefs(next);
    },
    [prefs],
  );

  const handleMasterToggle = async (value: boolean) => {
    if (value) {
      await update({ pushEnabled: true });

      const result = await initializeNotifications();
      await refreshPermission();

      if (!result.permissionGranted) {
        await update({ pushEnabled: false });

        Alert.alert(
          'Notifications are blocked',
          'Allow notifications for GabAi in your phone settings, then try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
      }

      return;
    }

    await update({ pushEnabled: false });
    await unregisterPushToken();
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const handleCategoryToggle = async (key: CategoryKey, value: boolean) => {
    await update({ [key]: value } as Partial<NotificationPrefs>);

    if (key === 'calendarReminders' && !value) {
      await cancelAllCalendarReminders();
    }
  };

  const permissionText =
    permission === 'granted'
      ? 'Allowed on this phone'
      : permission === 'denied'
        ? 'Blocked in your phone settings'
        : 'Not asked yet';

  const off = !prefs.pushEnabled;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgTheme }]} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Notifications" theme={theme} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SettingsCard theme={theme}>
          <SwitchRow
            theme={theme}
            icon="bell"
            title="Allow notifications"
            subtitle={permissionText}
            value={prefs.pushEnabled}
            onValueChange={handleMasterToggle}
          />

          {permission === 'denied' && (
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => Linking.openSettings()}
            >
              <Text style={{ color: theme.primaryAccent, fontWeight: '600' }}>
                Open phone settings
              </Text>
            </TouchableOpacity>
          )}
        </SettingsCard>

        <SectionLabel text="NOTIFY ME ABOUT" theme={theme} />
        <SettingsCard theme={theme}>
          <SwitchRow
            theme={theme}
            icon="check-square"
            title="Task deadlines"
            subtitle="Alerts when a task is due soon"
            value={prefs.taskDeadlines}
            disabled={off}
            onValueChange={(v) => handleCategoryToggle('taskDeadlines', v)}
          />
          <Divider theme={theme} />
          <SwitchRow
            theme={theme}
            icon="calendar"
            title="Calendar reminders"
            subtitle="Alerts before your events"
            value={prefs.calendarReminders}
            disabled={off}
            onValueChange={(v) => handleCategoryToggle('calendarReminders', v)}
          />
          <Divider theme={theme} />
          <SwitchRow
            theme={theme}
            icon="clock"
            title="Focus session alerts"
            subtitle="Alerts about your study sessions"
            value={prefs.focusAlerts}
            disabled={off}
            onValueChange={(v) => handleCategoryToggle('focusAlerts', v)}
          />
          <Divider theme={theme} />
          <SwitchRow
            theme={theme}
            icon="zap"
            title="Smart reminders"
            subtitle="Suggestions on your dashboard"
            value={prefs.smartReminders}
            onValueChange={(v) => handleCategoryToggle('smartReminders', v)}
          />
        </SettingsCard>

        <SectionLabel text="REMIND ME BEFORE" theme={theme} />
        <SettingsCard theme={theme}>
          <View style={[styles.chipRow, off && { opacity: 0.5 }]}>
            {LEAD_OPTIONS.map((option) => {
              const selected = prefs.leadMinutes === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  disabled={off}
                  onPress={() => update({ leadMinutes: option.value })}
                  style={[
                    styles.chip,
                    {
                      borderColor: selected ? theme.primaryAccent : theme.borderTheme,
                      backgroundColor: selected ? theme.primaryAccent + '20' : 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: selected ? theme.primaryAccent : theme.textTheme,
                      fontWeight: '600',
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SettingsCard>

        <Text style={[styles.note, { color: theme.textSubTheme }]}>
          Changing the reminder time applies to events you add or edit from now on.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 120 },
  linkRow: { paddingHorizontal: 16, paddingBottom: 14 },
  chipRow: { flexDirection: 'row', gap: 10, padding: 14 },
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  note: { fontSize: 12, marginTop: 14, paddingHorizontal: 4, lineHeight: 18 },
});
