import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { loadNotificationPrefs } from './notificationPrefs';

export async function requestReminderPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();

  if (settings.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/**
 * Schedule a local reminder before a calendar event.
 *
 * Respects the user's Notification Settings:
 * - returns null when notifications or calendar reminders are off
 * - uses the saved "Remind me before" time unless minutesBefore is given
 */
export async function scheduleCalendarReminder(
  title: string,
  dueDate: string,
  dueTime: string,
  minutesBefore?: number,
  eventId?: string,
): Promise<string | null> {
  const prefs = await loadNotificationPrefs();

  if (!prefs.pushEnabled || !prefs.calendarReminders) {
    return null;
  }

  const leadMinutes = minutesBefore ?? prefs.leadMinutes;

  const hasPermission = await requestReminderPermission();

  if (!hasPermission) {
    return null;
  }

  // Cancel any existing reminder for this event before rescheduling.
  if (eventId) {
    await cancelCalendarReminder(eventId);
  }

  // Expect dueDate as YYYY-MM-DD and dueTime as HH:mm.
  const date = new Date(`${dueDate}T${dueTime}:00`);

  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid calendar reminder date or time.');
  }

  const reminderDate = new Date(
    date.getTime() - leadMinutes * 60 * 1000,
  );

  // Do not schedule notifications for past times.
  if (reminderDate.getTime() <= Date.now()) {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Calendar reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'GabAi Reminder',
      body: `${title} is coming up.`,
      data: {
        eventId: eventId ?? null,
        dueDate,
        dueTime,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
      ...(Platform.OS === 'android'
        ? { channelId: 'reminders' }
        : {}),
    },
  });
}

export async function cancelCalendarReminder(
  eventId: string,
): Promise<void> {
  const scheduledNotifications =
    await Notifications.getAllScheduledNotificationsAsync();

  const matchingNotifications = scheduledNotifications.filter(
    (notification) =>
      notification.content.data?.eventId === eventId,
  );

  await Promise.all(
    matchingNotifications.map((notification) =>
      Notifications.cancelScheduledNotificationAsync(
        notification.identifier,
      ),
    ),
  );
}

/** Cancel every scheduled calendar reminder (used when the setting is turned off). */
export async function cancelAllCalendarReminders(): Promise<void> {
  const scheduled =
    await Notifications.getAllScheduledNotificationsAsync();

  await Promise.all(
    scheduled
      .filter((notification) => notification.content.data?.eventId)
      .map((notification) =>
        Notifications.cancelScheduledNotificationAsync(
          notification.identifier,
        ),
      ),
  );
}
