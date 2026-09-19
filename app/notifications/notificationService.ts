import {
  clearStoredNotifications,
  getStoredNotifications,
  storeNotifications,
} from './notificationStorage';
import {
  CreateNotificationInput,
  Notification,
} from './types';

type NotificationListener = (notifications: Notification[]) => void;

let cachedNotifications: Notification[] | null = null;
let loadPromise: Promise<Notification[]> | null = null;
const listeners = new Set<NotificationListener>();

async function loadNotifications(): Promise<Notification[]> {
  if (cachedNotifications) {
    return cachedNotifications;
  }

  if (!loadPromise) {
    loadPromise = getStoredNotifications().then((notifications) => {
      cachedNotifications = notifications;
      loadPromise = null;
      return notifications;
    });
  }

  return loadPromise;
}

function notifyListeners(): void {
  if (!cachedNotifications) {
    return;
  }

  listeners.forEach((listener) => listener([...cachedNotifications!]));
}

async function updateNotifications(
  update: (notifications: Notification[]) => Notification[]
): Promise<Notification[]> {
  const currentNotifications = await loadNotifications();
  const updatedNotifications = update([...currentNotifications]);

  cachedNotifications = updatedNotifications;
  await storeNotifications(updatedNotifications);
  notifyListeners();

  return [...updatedNotifications];
}

export async function getNotifications(): Promise<Notification[]> {
  const notifications = await loadNotifications();
  return [...notifications];
}

export async function addNotification(
  notification: CreateNotificationInput
): Promise<Notification> {
  const newNotification: Notification = {
    ...notification,
    id: notification.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };

  await updateNotifications((notifications) => [
    newNotification,
    ...notifications,
  ]);

  return newNotification;
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  await updateNotifications((notifications) =>
    notifications.map((notification) =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    )
  );
}

export async function deleteNotification(
  notificationId: string
): Promise<void> {
  await updateNotifications((notifications) =>
    notifications.filter((notification) => notification.id !== notificationId)
  );
}

export async function clearNotifications(): Promise<void> {
  cachedNotifications = [];
  await clearStoredNotifications();
  notifyListeners();
}

export function subscribeToNotifications(
  listener: NotificationListener
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}