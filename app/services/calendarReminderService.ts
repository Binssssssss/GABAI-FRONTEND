import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { loadNotificationPrefs } from './notificationPrefs';
import {
  NOTIFICATION_CHANNELS,
  ensureNotificationChannels,
} from '@/constants/notificationChannels';

// Calendar reminders beep (gabai_calendar.wav) so the user notices them.
const CHANNEL = NOTIFICATION_CHANNELS.calendar;

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
  details?: { category?: string; priority?: string },
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

  await ensureNotificationChannels();

  // "📅 Midterm Exam in 1 hour" / "Today at 4:15 PM · Exam · High priority"
  const leadLabel =
    leadMinutes % 1440 === 0
      ? `${leadMinutes / 1440} day${leadMinutes === 1440 ? '' : 's'}`
      : leadMinutes % 60 === 0
        ? `${leadMinutes / 60} hour${leadMinutes === 60 ? '' : 's'}`
        : `${leadMinutes} min`;

  const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  const tomorrow = new Date(reminderDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayLabel =
    dayKey(date) === dayKey(reminderDate)
      ? 'Today'
      : dayKey(date) === dayKey(tomorrow)
        ? 'Tomorrow'
        : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const timeLabel = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const body = [
    `${dayLabel} at ${timeLabel}`,
    details?.category,
    details?.priority === 'High' ? 'High priority' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return Notifications.scheduleNotificationAsync({
    content: {
      title: `📅 ${title} in ${leadLabel}`,
      body,
      data: {
        eventId: eventId ?? null,
        dueDate,
        dueTime,
        screen: '/(tabs)/calendar/calendar',
        type: 'calendar_reminder',
      },
      sound: CHANNEL.sound,
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
      ...(Platform.OS === 'android'
        ? { channelId: CHANNEL.id }
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
