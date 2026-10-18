import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Android notification channels and their GabAi sounds.
 *
 * On Android the CHANNEL decides the sound, and a channel's sound can't be
 * changed after it is made. To change a sound later, give it a new id.
 * The sound files live in assets/sounds and are registered in app.json.
 * The backend (push-notification.service.ts) uses the same ids.
 */
export const NOTIFICATION_CHANNELS = {
  general: {
    id: 'gabai-general',
    name: 'GabAi notifications',
    sound: 'gabai_chime.wav',
  },
  calendar: {
    id: 'gabai-calendar',
    name: 'Calendar reminders',
    sound: 'gabai_calendar.wav',
  },
  focus: {
    id: 'gabai-focus',
    name: 'Focus Session',
    sound: 'gabai_focus_done.wav',
  },
  alerts: {
    id: 'gabai-alerts',
    name: 'Important alerts',
    sound: 'gabai_alert.wav',
  },
} as const;

export type NotificationChannelKey = keyof typeof NOTIFICATION_CHANNELS;

// Channels from older versions (they used the phone's default sound).
const OLD_CHANNEL_IDS = ['gabai-default', 'reminders', 'focus', 'focus-session'];

let setupPromise: Promise<void> | null = null;

async function createChannels(): Promise<void> {
  await Promise.all(
    OLD_CHANNEL_IDS.map((id) =>
      Notifications.deleteNotificationChannelAsync(id).catch(() => undefined),
    ),
  );

  const { general, calendar, focus, alerts } = NOTIFICATION_CHANNELS;

  await Notifications.setNotificationChannelAsync(general.id, {
    name: general.name,
    importance: Notifications.AndroidImportance.HIGH,
    sound: general.sound,
    vibrationPattern: [0, 250, 250, 250],
  });

  // Calendar reminders must get noticed: max importance, long vibration,
  // shown in full on the lock screen.
  await Notifications.setNotificationChannelAsync(calendar.id, {
    name: calendar.name,
    description: 'Beeps before your scheduled classes, exams and events.',
    importance: Notifications.AndroidImportance.MAX,
    sound: calendar.sound,
    vibrationPattern: [0, 400, 200, 400, 200, 400],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });

  await Notifications.setNotificationChannelAsync(focus.id, {
    name: focus.name,
    description: "Time's up and break's over alerts.",
    importance: Notifications.AndroidImportance.HIGH,
    sound: focus.sound,
    vibrationPattern: [0, 300, 200, 300],
  });

  await Notifications.setNotificationChannelAsync(alerts.id, {
    name: alerts.name,
    description: 'Overdue tasks, low balance and account security.',
    importance: Notifications.AndroidImportance.HIGH,
    sound: alerts.sound,
    vibrationPattern: [0, 200, 100, 200, 100, 200],
  });
}

/** Make sure every GabAi channel exists (runs once per app launch). */
export function ensureNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return Promise.resolve();

  if (!setupPromise) {
    setupPromise = createChannels().catch((error) => {
      setupPromise = null; // try again next time
      console.warn('Unable to set up notification channels:', error);
    });
  }

  return setupPromise;
}

/** Sound for a local notification (used by iOS; Android uses the channel). */
export const channelSound = (key: NotificationChannelKey) =>
  NOTIFICATION_CHANNELS[key].sound;
