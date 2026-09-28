
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

/**
 * Load notifications from the backend.
 * Falls back to AsyncStorage if the backend is unavailable.
 */
async function loadNotifications(): Promise<Notification[]> {
  // Return cached notifications if already loaded
  if (cachedNotifications !== null) {
    return cachedNotifications;
  }

  // Prevent multiple requests at the same time
  if (!loadPromise) {
    loadPromise = api
      .get("/notifications")
      .then(async (response) => {
        const notifications: Notification[] =
          response.data?.data ?? [];

        cachedNotifications = notifications;

        // Save latest backend data locally
        await storeNotifications(notifications);

        loadPromise = null;

        notifyListeners();

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

        notifyListeners();

        return storedNotifications;
      });
  }

  return loadPromise;
}

/**
 * Notify all subscribed listeners when notifications change.
 */
function notifyListeners(): void {
  if (cachedNotifications === null) {
    return;
  }

  listeners.forEach((listener) => {
    listener([...cachedNotifications!]);
  });
}

/**
 * Get all notifications.
 */
export async function getNotifications(): Promise<Notification[]> {
  const notifications = await loadNotifications();

  return [...notifications];
}

/**
 * Add a new notification.
 *
 * Backend endpoint:
 * POST /api/notifications
 */
export async function addNotification(
  notification: CreateNotificationInput
): Promise<Notification> {
  try {
    const response = await api.post(
      "/notifications",
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
      response.data?.data;

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
     * Backend failed.
     * Create the notification locally instead.
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

/**
 * Mark one notification as read.
 *
 * Backend endpoint:
 * PATCH /api/notifications/:id/read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<void> {
  try {
    await api.patch(
      `/notifications/${notificationId}/read`
    );

    updateCachedNotificationAsRead(notificationId);
  } catch (error) {
    console.error(
      "Failed to mark notification as read on backend:",
      error
    );

    // Update local cache even if backend fails
    updateCachedNotificationAsRead(notificationId);
  }
}

/**
 * Update a single notification in the local cache.
 */
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

/**
 * Mark all notifications as read.
 *
 * Backend endpoint:
 * PATCH /api/notifications/read-all
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    await api.patch(
      "/notifications/read-all"
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
      "Failed to mark all notifications as read on backend:",
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

/**
 * Delete one notification.
 *
 * Backend endpoint:
 * DELETE /api/notifications/:id
 */
export async function deleteNotification(
  notificationId: string
): Promise<void> {
  try {
    await api.delete(
      `/notifications/${notificationId}`
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

/**
 * Remove a notification from the local cache.
 */
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

/**
 * Clear all locally stored notifications.
 *
 * There is currently no DELETE ALL endpoint
 * in the backend, so this only clears local storage.
 */
export async function clearNotifications(): Promise<void> {
  cachedNotifications = [];

  await clearStoredNotifications();

  notifyListeners();
}

/**
 * Subscribe to notification changes.
 *
 * Returns an unsubscribe function.
 */
export function subscribeToNotifications(
  listener: NotificationListener
): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
