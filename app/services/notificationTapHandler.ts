import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

/**
 * Opens the right screen when the user taps a GabAi notification.
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

function screenFor(data: Record<string, unknown> | undefined): string | null {
  if (!data) return null;
  if (typeof data.screen === 'string' && data.screen) return data.screen;

  const type = String(data.type ?? '').toLowerCase();
  return SCREEN_BY_TYPE.find((item) => type.includes(item.match))?.screen ?? null;
}

export function useNotificationTapRouting(enabled: boolean) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    const open = (response: Notifications.NotificationResponse | null) => {
      const screen = screenFor(
        response?.notification.request.content.data as Record<string, unknown> | undefined,
      );
      if (screen) router.push(screen as any);
    };

    // App opened by tapping a notification.
    Notifications.getLastNotificationResponseAsync()
      .then(open)
      .catch(() => {});

    // Tapped while the app is running.
    const subscription = Notifications.addNotificationResponseReceivedListener(open);

    return () => subscription.remove();
  }, [enabled, router]);
}
