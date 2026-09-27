import api from "../services/api";

import {
  clearStoredNotifications,
  getStoredNotifications,
  storeNotifications,
} from "./notificationStorage";

import {
  CreateNotificationInput,
  Notification,
} from "./types";

type NotificationListener = (
  notifications: Notification[]
) => void;

let cachedNotifications: Notification[] | null = null;
let loadPromise: Promise<Notification[]> | null = null;

const listeners = new Set<NotificationListener>();

async function loadNotifications(): Promise<Notification[]> {
  if (cachedNotifications !== null) {
    return cachedNotifications;
  }

  if (!loadPromise) {
    loadPromise = api
      .get("/api/notifications")
      .then(async (response) => {
        const notifications: Notification[] =
          response.data.data ?? [];

        cachedNotifications = notifications;

        // Save latest backend data locally
        await storeNotifications(notifications);

        loadPromise = null;

        return notifications;
      })
      .catch(async (error) => {
        loadPromise = null;

        console.error(
          "Failed to load notifications from backend:",
          error
        );

        // Fallback to AsyncStorage
        const storedNotifications =
          await getStoredNotifications();

        cachedNotifications = storedNotifications;

        return storedNotifications;
      });
  }

  return loadPromise;
}

function notifyListeners(): void {
  if (cachedNotifications === null) {
    return;
  }

  listeners.forEach((listener) => {
    listener([...cachedNotifications!]);
  });
}

export async function getNotifications(): Promise<Notification[]> {
  const notifications = await loadNotifications();

  return [...notifications];
}

export async function addNotification(
  notification: CreateNotificationInput
): Promise<Notification> {
  try {
    const response = await api.post(
      "/api/notifications",
      {
        title: notification.title,
        message: notification.message,
        type: notification.type,
        time: notification.time,
        icon: notification.icon,
        iconColor: notification.iconColor,
        taskId: notification.taskId,
        assignmentId: notification.assignmentId,
      }
    );

    const newNotification: Notification =
      response.data.data;

    cachedNotifications = [
      newNotification,
      ...(cachedNotifications ?? []),
    ];

    await storeNotifications(cachedNotifications);

    notifyListeners();

    return newNotification;
  } catch (error) {
    console.error(
      "Failed to create notification on backend:",
      error
    );

    /*
     * Fallback:
     * If backend is unavailable, create it locally.
     */

    const newNotification: Notification = {
      ...notification,
      id:
        notification.id ??
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
    };

    cachedNotifications = [
      newNotification,
      ...(cachedNotifications ?? []),
    ];

    await storeNotifications(cachedNotifications);

    notifyListeners();

    return newNotification;
  }
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  try {
    await api.patch(
      `/api/notifications/${notificationId}/read`
    );

    updateCachedNotificationAsRead(notificationId);
  } catch (error) {
    console.error(
      "Failed to mark notification as read on backend:",
      error
    );

    /*
     * Backend failed, but we can still update
     * the local cache.
     */

    updateCachedNotificationAsRead(notificationId);
  }
}

function updateCachedNotificationAsRead(
  notificationId: string
): void {
  if (cachedNotifications === null) {
    return;
  }

  cachedNotifications = cachedNotifications.map(
    (notification) =>
      notification.id === notificationId
        ? {
            ...notification,
            read: true,
          }
        : notification
  );

  storeNotifications(cachedNotifications);
  notifyListeners();
}

export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    await api.patch(
      "/api/notifications/read-all"
    );

    if (cachedNotifications === null) {
      return;
    }

    cachedNotifications = cachedNotifications.map(
      (notification) => ({
        ...notification,
        read: true,
      })
    );

    await storeNotifications(cachedNotifications);

    notifyListeners();
  } catch (error) {
    console.error(
      "Failed to mark all notifications as read:",
      error
    );

    // Local fallback
    if (cachedNotifications === null) {
      return;
    }

    cachedNotifications = cachedNotifications.map(
      (notification) => ({
        ...notification,
        read: true,
      })
    );

    await storeNotifications(cachedNotifications);

    notifyListeners();
  }
}

export async function deleteNotification(
  notificationId: string
): Promise<void> {
  try {
    await api.delete(
      `/api/notifications/${notificationId}`
    );

    removeCachedNotification(notificationId);
  } catch (error) {
    console.error(
      "Failed to delete notification from backend:",
      error
    );

    // Local fallback
    removeCachedNotification(notificationId);
  }
}

function removeCachedNotification(
  notificationId: string
): void {
  if (cachedNotifications === null) {
    return;
  }

  cachedNotifications =
    cachedNotifications.filter(
      (notification) =>
        notification.id !== notificationId
    );

  storeNotifications(cachedNotifications);

  notifyListeners();
}

export async function clearNotifications(): Promise<void> {
  /*
   * There is currently no DELETE ALL endpoint
   * in the backend.
   *
   * Therefore, this only clears the local cache.
   */

  cachedNotifications = [];

  await clearStoredNotifications();

  notifyListeners();
}

export function subscribeToNotifications(
  listener: NotificationListener
): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}