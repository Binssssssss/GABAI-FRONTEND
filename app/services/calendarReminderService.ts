
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function requestReminderPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();

  if (settings.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleCalendarReminder(
  title: string,
  dueDate: string,
  dueTime: string,
  minutesBefore = 15,
  eventId?: string,
): Promise<string | null> {
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
    date.getTime() - minutesBefore * 60 * 1000,
  );

  // Do not schedule notifications for past times.
  if (reminderDate.getTime() <= Date.now()) {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Calendar reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'GabAi Reminder',
      body: `${title} is coming up.`,
      sound: 'default',
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