import React, { useCallback, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppAlert } from '@/components/AppAlert';
import { Stack, useFocusEffect } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProfileTheme } from '@/app/(tabs)/profile/hooks';
import {
  initializeNotifications,
  unregisterPushToken,
} from '@/app/services/notificationService';
import {
  cancelAllCalendarReminders,
  resyncCalendarAlarmsFromServer,
} from '@/app/services/calendarReminderService';
import {
  DEFAULT_NOTIFICATION_PREFS,
  NotificationPrefs,
  SnoozeMinutes,
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

const SNOOZE_OPTIONS: SnoozeMinutes[] = [5, 10, 15, 30];

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

        AppAlert.alert(
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

    if (key === 'calendarReminders') {
      if (value) {
        void resyncCalendarAlarmsFromServer();
      } else {
        await cancelAllCalendarReminders();
      }
    }
  };

  // Snooze settings: save, then re-schedule the upcoming alarms with them.
  const updateAlarm = async (patch: Partial<NotificationPrefs>) => {
    await update(patch);
    void resyncCalendarAlarmsFromServer();
  };

  const permissionText =
    permission === 'granted'
      ? 'Allowed on this phone'
      : permission === 'denied'
        ? 'Blocked in your phone settings'
        : 'Not asked yet';

  const off = !prefs.pushEnabled;
  const alarmOff = off || !prefs.calendarReminders;

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
            subtitle="Day-before reminder and alarm at the start time"
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

        <SectionLabel text="CALENDAR ALARM" theme={theme} />
        <SettingsCard theme={theme}>
          <SwitchRow
            theme={theme}
            icon="bell"
            title="Snooze button"
            subtitle="Show Snooze on the alarm"
            value={prefs.snoozeEnabled}
            disabled={alarmOff}
            onValueChange={(v) => updateAlarm({ snoozeEnabled: v })}
          />

          <View style={[styles.alarmBody, alarmOff && { opacity: 0.45 }]}>
            <Text
              style={[
                styles.fieldLabel,
                { color: theme.textSubTheme, opacity: prefs.snoozeEnabled ? 1 : 0.45 },
              ]}
            >
              SNOOZE FOR
            </Text>
            <View
              style={[
                styles.segment,
                { borderColor: theme.borderTheme, opacity: prefs.snoozeEnabled ? 1 : 0.45 },
              ]}
            >
              {SNOOZE_OPTIONS.map((value) => {
                const selected = prefs.snoozeMinutes === value;
                return (
                  <TouchableOpacity
                    key={value}
                    disabled={alarmOff || !prefs.snoozeEnabled}
                    onPress={() => updateAlarm({ snoozeMinutes: value })}
                    style={[styles.segmentItem, selected && { backgroundColor: theme.primaryAccent }]}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        { color: selected ? '#FFFFFF' : theme.textSubTheme },
                      ]}
                    >
                      {value} min
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.previewRow}>
              <Text style={[styles.previewText, { color: theme.textSubTheme }]}>
                The alarm beeps for 1 minute and rings again every 2 minutes until you tap{' '}
                <Text style={{ color: theme.textTheme, fontWeight: '700' }}>Stop</Text>
                {prefs.snoozeEnabled ? (
                  <>
                    {' '}or{' '}
                    <Text style={{ color: theme.textTheme, fontWeight: '700' }}>
                      Snooze {prefs.snoozeMinutes} min
                    </Text>
                  </>
                ) : null}
                . It can't be swiped away.
              </Text>
            </View>
          </View>
        </SettingsCard>

        <Text style={[styles.note, { color: theme.textSubTheme }]}>
          Events 1 day or more away also get a reminder the day before. Events less than
          1 day away only get the alarm at the start time.
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
  alarmBody: { paddingHorizontal: 16, paddingBottom: 16 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginTop: 12, marginBottom: 8 },
  segment: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, padding: 3 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 9 },
  segmentText: { fontSize: 13, fontWeight: '600' },
  previewRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 14, rowGap: 6 },
  previewText: { fontSize: 12.5, lineHeight: 19 },
});
