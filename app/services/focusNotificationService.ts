import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { loadNotificationPrefs } from '@/app/services/notificationPrefs';
import {
  NOTIFICATION_CHANNELS,
  ensureNotificationChannels,
} from '@/constants/notificationChannels';

/**
 * Local notification at the end of a focus session or break.
 * It is scheduled on the phone, so it appears even if GabAi is closed.
 */

const STORAGE_KEY = 'gabai.focus.endNotificationId';
const CHANNEL = NOTIFICATION_CHANNELS.focus;

export async function cancelFocusEndNotification(): Promise<void> {
  try {
    const id = await AsyncStorage.getItem(STORAGE_KEY);
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id);
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.warn('Unable to cancel focus notification:', error);
  }
}

export async function scheduleFocusEndNotification(options: {
  endsAt: number;
  isBreak: boolean;
  minutes: number;
  subject: string;
}): Promise<void> {
  await cancelFocusEndNotification();

  if (options.endsAt <= Date.now() + 1000) return;

  try {
    const prefs = await loadNotificationPrefs();
    if (!prefs.pushEnabled || !prefs.focusAlerts) return;

    const permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) return;

    await ensureNotificationChannels();

    const subject = options.subject.trim() || 'General Study';

    const id = await Notifications.scheduleNotificationAsync({
      content: options.isBreak
        ? {
            title: "☕ Break's over",
            body: 'Ready for your next focus session?',
            data: { screen: '/productivity', type: 'focus_break_over' },
            sound: CHANNEL.sound, // gabai_focus_done.wav
          }
        : {
            title: "⏰ Time's up! Focus session complete",
            body: `You focused for ${options.minutes} min on ${subject}. Take a short break.`,
            data: { screen: '/productivity', type: 'focus_time_up' },
            sound: CHANNEL.sound, // gabai_focus_done.wav
          },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(options.endsAt),
        ...(Platform.OS === 'android' ? { channelId: CHANNEL.id } : {}),
      },
    });

    await AsyncStorage.setItem(STORAGE_KEY, id);
  } catch (error) {
    console.warn('Unable to schedule focus notification:', error);
  }
}
