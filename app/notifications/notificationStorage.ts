import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification } from './types';

const NOTIFICATIONS_STORAGE_KEY = '@gabai/notifications';

export async function getStoredNotifications(): Promise<Notification[]> {
  const serializedNotifications = await AsyncStorage.getItem(
    NOTIFICATIONS_STORAGE_KEY
  );

  if (!serializedNotifications) {
    return [];
  }

  try {
    const parsedNotifications: unknown = JSON.parse(serializedNotifications);

    return Array.isArray(parsedNotifications)
      ? (parsedNotifications as Notification[])
      : [];
  } catch {
    return [];
  }
}

export async function storeNotifications(
  notifications: Notification[]
): Promise<void> {
  await AsyncStorage.setItem(
    NOTIFICATIONS_STORAGE_KEY,
    JSON.stringify(notifications)
  );
}

export async function clearStoredNotifications(): Promise<void> {
  await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
}