import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export type ReminderLeadMinutes = 15 | 60 | 1440;

/** Calendar alarm: minutes between rings, and how many times it rings. */
export type SnoozeMinutes = 5 | 10 | 15 | 30;
export type RingCount = 1 | 3 | 5;

export interface NotificationPrefs {
  pushEnabled: boolean;
  taskDeadlines: boolean;
  calendarReminders: boolean;
  smartReminders: boolean;
  focusAlerts: boolean;
  leadMinutes: ReminderLeadMinutes;
  snoozeEnabled: boolean;
  snoozeMinutes: SnoozeMinutes;
  ringCount: RingCount;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  pushEnabled: true,
  taskDeadlines: true,
  calendarReminders: true,
  smartReminders: true,
  focusAlerts: true,
  leadMinutes: 15,
  snoozeEnabled: true,
  snoozeMinutes: 5,
  ringCount: 3,
};

const STORAGE_KEY = 'gabai.settings.notifications';

let cached: NotificationPrefs | null = null;

export async function loadNotificationPrefs(): Promise<NotificationPrefs> {
  if (cached) return cached;

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    cached = { ...DEFAULT_NOTIFICATION_PREFS, ...(raw ? JSON.parse(raw) : {}) };
  } catch (error) {
    console.error('Failed to load notification preferences:', error);
    cached = { ...DEFAULT_NOTIFICATION_PREFS };
  }

  return cached as NotificationPrefs;
}

/** Saves on the phone, and (by default) syncs to the backend. */
export async function saveNotificationPrefs(
  next: NotificationPrefs,
  syncToServer = true,
): Promise<void> {
  cached = next;

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.error('Failed to save notification preferences:', error);
  }

  if (syncToServer) {
    try {
      await api.put('/account/notification-preferences', next);
    } catch (error) {
      console.warn('Notification preferences saved locally; server sync failed.');
    }
  }
}

/** Pulls this account's saved preferences from the backend. */
export async function refreshNotificationPrefsFromServer(): Promise<NotificationPrefs | null> {
  try {
    const response = await api.get('/account/notification-preferences');
    const remote = response.data?.data;

    if (remote && typeof remote === 'object') {
      const merged = { ...DEFAULT_NOTIFICATION_PREFS, ...remote };
      await saveNotificationPrefs(merged, false);
      return merged;
    }

    // Nothing on the server yet: push this phone's copy up.
    const local = await loadNotificationPrefs();
    await saveNotificationPrefs(local, true);
    return local;
  } catch {
    return null;
  }
}

export async function clearNotificationPrefs(): Promise<void> {
  cached = null;

  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}