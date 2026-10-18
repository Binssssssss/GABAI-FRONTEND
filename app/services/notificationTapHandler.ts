import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import {
  ALARM_ACTION_SNOOZE,
  ALARM_ACTION_STOP,
  handleCalendarAlarmResponse,
} from './calendarReminderService';

/**
 * Handles taps on GabAi notifications:
 * - Calendar alarm buttons (Snooze / Stop) work even when logged out.
 * - A normal tap opens the right screen (only when logged in).
 * Local notifications send `data.screen`; server pushes send `data.type`.
 */

const SCREEN_BY_TYPE: { match: string; screen: string }[] = [
  { match: 'focus', screen: '/productivity' },
  { match: 'overdue', screen: '/(tabs)/tasks/task' },
  { match: 'deadline', screen: '/(tabs)/tasks/task' },
  { match: 'task', screen: '/(tabs)/tasks/task' },
  { match: 'calendar', screen: '/(tabs)/calendar/calendar' },
  { match: 'wallet', screen: '/(tabs)/expenses/expenses' },
  { match: 'security', screen: '/settings/privacy' },
  { match: 'smart', screen: '/(tabs)/dashboard/dashboard' },
];

const HANDLED_KEY = 'gabai.notifications.handledResponses';

function screenFor(data: Record<string, unknown> | undefined): string | null {
  if (!data) return null;
  if (typeof data.screen === 'string' && data.screen) return data.screen;

  const type = String(data.type ?? '').toLowerCase();
  return SCREEN_BY_TYPE.find((item) => type.includes(item.match))?.screen ?? null;
}

const responseKey = (response: Notifications.NotificationResponse) =>
  `${response.notification.request.identifier}:${response.actionIdentifier}`;

/* Each response is handled once, even if the app restarts. */
const handledThisSession = new Set<string>();

async function markHandled(key: string): Promise<boolean> {
  if (handledThisSession.has(key)) return false;
  handledThisSession.add(key);

  try {
    const raw = await AsyncStorage.getItem(HANDLED_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (list.includes(key)) return false;
    await AsyncStorage.setItem(HANDLED_KEY, JSON.stringify([...list, key].slice(-40)));
  } catch {
    // Storage problems should never block a notification action.
  }

  return true;
}

/* Results of alarm handling, so the routing step can reuse them. */
const alarmResults = new Map<string, Promise<boolean>>();

function processAlarm(response: Notifications.NotificationResponse): Promise<boolean> {
  const key = responseKey(response);
  let result = alarmResults.get(key);

  if (!result) {
    result = markHandled(`alarm:${key}`).then((isNew) =>
      isNew ? handleCalendarAlarmResponse(response).catch(() => false) : false,
    );
    alarmResults.set(key, result);
  }

  return result;
}

export function useNotificationTapRouting(enabled: boolean) {
  const router = useRouter();

  useEffect(() => {
    const handle = async (response: Notifications.NotificationResponse | null) => {
      if (!response) return;

      await processAlarm(response);

      // Snooze / Stop buttons: done, stay on the current screen.
      const isButton =
        response.actionIdentifier === ALARM_ACTION_SNOOZE ||
        response.actionIdentifier === ALARM_ACTION_STOP;
      if (isButton || !enabled) return;

      // Open the screen only once per tap (not again on every app start).
      if (!(await markHandled(`route:${responseKey(response)}`))) return;

      const screen = screenFor(
        response.notification.request.content.data as Record<string, unknown> | undefined,
      );
      if (screen) router.push(screen as any);
    };

    // App opened by tapping a notification (or one of its buttons).
    Notifications.getLastNotificationResponseAsync()
      .then(handle)
      .catch(() => {});

    // Tapped while the app is running.
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      void handle(response);
    });

    return () => subscription.remove();
  }, [enabled, router]);
}
