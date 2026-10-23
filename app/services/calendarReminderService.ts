import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import api from './api';
import { NotificationPrefs, loadNotificationPrefs } from './notificationPrefs';
import {
  NOTIFICATION_CHANNELS,
  ensureNotificationChannels,
} from '@/constants/notificationChannels';

/**
 * Calendar and Task Manager alarms (all scheduled on the phone, so they
 * work while GabAi is closed). Tasks use exactly the same rules:
 *
 * - Event 1 day or more away: a reminder 1 day before (chime) + an alarm at the start time.
 * - Event less than 1 day away: only the alarm at the start time.
 * - The alarm is persistent: it beeps for 1 minute (gabai_calendar.wav), cannot be
 *   swiped away, and rings again every 2 minutes until the user taps Stop,
 *   Snooze or the alarm itself.
 */

const CALENDAR_SCREEN = '/(tabs)/calendar/calendar';
const TASKS_SCREEN = '/(tabs)/tasks/task';
const DAY_MS = 24 * 60 * 60 * 1000;

/** The alarm keeps ringing every RING_EVERY_MIN minutes, MAX_RINGS times at most. */
const RING_EVERY_MIN = 2;
const MAX_RINGS = 15; // 30 minutes

/**
 * Android allows about 500 scheduled alarms per app, so only the nearest
 * events get their alarms ahead of time. The rest are added by the sync
 * when GabAi is opened again.
 */
const MAX_EVENTS_SCHEDULED = 12; // calendar events + 12 tasks, up to 16 alarms each

/** Calendar events are tasks whose subject is one of these. */
const CALENDAR_CATEGORIES = ['Assignment', 'Exam', 'Class', 'Focus Session', 'Meeting', 'Personal'];

/** True for calendar events; false for Task Manager tasks. */
const isCalendarCategory = (category?: string) =>
  CALENDAR_CATEGORIES.includes(String(category ?? ''));

export const ALARM_ACTION_SNOOZE = 'snooze';
export const ALARM_ACTION_STOP = 'stop';

const CATEGORY_WITH_SNOOZE = 'gabai-calendar-alarm';
const CATEGORY_STOP_ONLY = 'gabai-calendar-alarm-stop';

const KIND_ALARM = 'calendar_alarm';
const KIND_DAY_BEFORE = 'calendar_day_before';

type AlarmData = {
  eventId?: string;
  kind?: string;
  title?: string;
  dueDate?: string;
  dueTime?: string;
  category?: string;
  priority?: string;
  ring?: number;
  total?: number;
  sig?: string;
};

/* ---------- helpers ---------- */

const dataOf = (n: { content: { data?: unknown } }) => (n.content.data ?? {}) as AlarmData;

/** "9:5" / "09:05:00" -> "09:05"; anything else -> "" */
const normalizeTime = (value: string | null | undefined) => {
  const match = String(value ?? '').trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '';
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return '';
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/** "2026-10-22" or an ISO date -> "2026-10-22" (phone's local date). */
const normalizeDate = (value: string | null | undefined) => {
  const text = String(value ?? '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const d = new Date(text);
  if (Number.isNaN(d.getTime())) return '';
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
};

/** Local date + time -> Date (null if invalid). */
const toStartDate = (dueDate: string, dueTime: string) => {
  const date = normalizeDate(dueDate);
  const time = normalizeTime(dueTime);
  if (!date || !time) return null;
  const start = new Date(`${date}T${time}:00`);
  return Number.isNaN(start.getTime()) ? null : start;
};

const timeLabel = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

const dateLabel = (d: Date) =>
  d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

const detailParts = (category?: string, priority?: string) =>
  [category, priority === 'High' ? 'High priority' : null].filter(Boolean) as string[];

function alarmPlan(prefs: NotificationPrefs) {
  const snooze = prefs.snoozeEnabled !== false;
  const minutes = [5, 10, 15, 30].includes(Number(prefs.snoozeMinutes))
    ? Number(prefs.snoozeMinutes)
    : 5;
  const rings = MAX_RINGS;
  return { snooze, minutes, rings, key: `p3-${snooze ? 1 : 0}-${minutes}` };
}

/** Changes whenever anything that affects the scheduled alarms changes. */
const signature = (title: string, date: string, time: string, planKey: string) =>
  `${normalizeDate(date)}|${normalizeTime(time)}|${title}|${planKey}`;

async function scheduleAt(
  content: Notifications.NotificationContentInput,
  date: Date,
  channelId: string,
) {
  return Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      ...(Platform.OS === 'android' ? { channelId } : {}),
    },
  });
}

/* ---------- Snooze / Stop buttons ---------- */

let registeredSnoozeMinutes: number | null = null;

/** Registers the "Snooze N min" and "Stop" buttons shown on the alarm. */
export async function ensureCalendarAlarmCategory(): Promise<void> {
  try {
    const { minutes } = alarmPlan(await loadNotificationPrefs());
    if (registeredSnoozeMinutes === minutes) return;

    // The buttons open GabAi briefly so the action always runs,
    // even when the app was fully closed.
    await Notifications.setNotificationCategoryAsync(CATEGORY_WITH_SNOOZE, [
      {
        identifier: ALARM_ACTION_SNOOZE,
        buttonTitle: `Snooze ${minutes} min`,
        options: { opensAppToForeground: true },
      },
      {
        identifier: ALARM_ACTION_STOP,
        buttonTitle: 'Stop',
        options: { opensAppToForeground: true },
      },
    ]);

    await Notifications.setNotificationCategoryAsync(CATEGORY_STOP_ONLY, [
      {
        identifier: ALARM_ACTION_STOP,
        buttonTitle: 'Stop',
        options: { opensAppToForeground: true },
      },
    ]);

    registeredSnoozeMinutes = minutes;
  } catch (error) {
    console.warn('Unable to register alarm buttons:', error);
  }
}

/* ---------- permission ---------- */

export async function requestReminderPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();

  if (settings.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/* ---------- alarm rings ---------- */

function ringContent(
  info: Required<Pick<AlarmData, 'eventId' | 'title' | 'dueDate' | 'dueTime'>> &
    Pick<AlarmData, 'category' | 'priority' | 'sig'>,
  start: Date,
  ring: number,
  total: number,
  style: 'start' | 'repeat' | 'snoozed',
  withSnooze: boolean,
): Notifications.NotificationContentInput {
  const details = detailParts(info.category, info.priority);
  const isTask = !isCalendarCategory(info.category);
  const title =
    style === 'start'
      ? isTask
        ? `⏰ ${info.title} is due`
        : `⏰ ${info.title} is starting`
      : style === 'snoozed'
        ? `⏰ ${info.title} (snoozed)`
        : `⏰ ${info.title} is still ringing`;

  const body =
    style === 'start'
      ? [`Now · ${timeLabel(start)}`, ...details].join(' · ')
      : `${isTask ? 'Due' : 'Started'} at ${timeLabel(start)} · Tap Stop to turn off`;

  return {
    title,
    body,
    sound: NOTIFICATION_CHANNELS.calendar.sound,
    priority: Notifications.AndroidNotificationPriority.MAX,
    // Persistent: cannot be swiped away; only Stop, Snooze or a tap clears it.
    sticky: true,
    autoDismiss: false,
    categoryIdentifier: withSnooze ? CATEGORY_WITH_SNOOZE : CATEGORY_STOP_ONLY,
    data: {
      ...info,
      kind: KIND_ALARM,
      type: KIND_ALARM,
      screen: isTask ? TASKS_SCREEN : CALENDAR_SCREEN,
      ring,
      total,
    },
  };
}

/**
 * Schedule the reminders for one calendar event (replaces any old ones).
 * Returns the id of the first alarm, or null when nothing was scheduled.
 *
 * `_minutesBefore` is kept so older callers still compile; the timing is
 * now automatic (1 day before + at the start time).
 */
export async function scheduleCalendarReminder(
  title: string,
  dueDate: string,
  dueTime: string,
  _minutesBefore?: number,
  eventId?: string,
  details?: { category?: string; priority?: string },
): Promise<string | null> {
  const prefs = await loadNotificationPrefs();

  if (eventId) {
    await cancelCalendarReminder(eventId);
  }

  if (!prefs.pushEnabled || !prefs.calendarReminders) {
    console.log(`⏰ [CalendarAlarm] "${title}" not scheduled: notifications or calendar reminders are off.`);
    return null;
  }

  const start = toStartDate(dueDate, dueTime);

  if (!start) {
    throw new Error('Invalid calendar reminder date or time.');
  }

  // Nothing to ring for an event that has already started.
  if (start.getTime() <= Date.now()) {
    console.log(`⏰ [CalendarAlarm] "${title}" not scheduled: ${start.toString()} has already passed.`);
    return null;
  }

  const hasPermission = await requestReminderPermission();

  if (!hasPermission) {
    console.log(`⏰ [CalendarAlarm] "${title}" not scheduled: notification permission is not allowed.`);
    return null;
  }

  await ensureNotificationChannels();
  await ensureCalendarAlarmCategory();

  const plan = alarmPlan(prefs);
  const info = {
    eventId: eventId ?? '',
    title,
    dueDate: normalizeDate(dueDate),
    dueTime: normalizeTime(dueTime),
    category: details?.category,
    priority: details?.priority,
    sig: signature(title, dueDate, dueTime, plan.key),
  };

  // 1) Day-before reminder, only when the event is at least 1 day away.
  if (start.getTime() - Date.now() >= DAY_MS) {
    const isTask = !isCalendarCategory(info.category);
    await scheduleAt(
      {
        title: isTask ? `📅 Due tomorrow: ${title}` : `📅 Tomorrow: ${title}`,
        body: [`${dateLabel(start)} at ${timeLabel(start)}`, ...detailParts(info.category, info.priority)].join(' · '),
        sound: NOTIFICATION_CHANNELS.general.sound,
        data: {
          ...info,
          kind: KIND_DAY_BEFORE,
          type: KIND_DAY_BEFORE,
          screen: isTask ? TASKS_SCREEN : CALENDAR_SCREEN,
        },
      },
      new Date(start.getTime() - DAY_MS),
      NOTIFICATION_CHANNELS.general.id,
    );
  }

  // 2) The alarm at the start time, then it rings again until Stop.
  let firstId: string | null = null;

  for (let index = 0; index < plan.rings; index += 1) {
    const id = await scheduleAt(
      ringContent(
        info,
        start,
        index + 1,
        plan.rings,
        index === 0 ? 'start' : 'repeat',
        plan.snooze,
      ),
      new Date(start.getTime() + index * RING_EVERY_MIN * 60 * 1000),
      NOTIFICATION_CHANNELS.calendar.id,
    );

    if (index === 0) firstId = id;
  }

  console.log(
    `⏰ [CalendarAlarm] "${title}" rings at ${start.toString()}` +
      ` (+${plan.rings - 1} repeats every ${RING_EVERY_MIN} min` +
      `${start.getTime() - Date.now() >= DAY_MS ? ', reminder 1 day before' : ''}).`,
  );

  return firstId;
}

/* ---------- cancelling ---------- */

async function cancelWhere(match: (data: AlarmData) => boolean): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  await Promise.all(
    scheduled
      .filter((notification) => match(dataOf(notification)))
      .map((notification) =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier),
      ),
  );
}

/** Remove alarms already showing in the notification shade. */
async function dismissShowing(match: (data: AlarmData) => boolean): Promise<void> {
  try {
    const presented = await Notifications.getPresentedNotificationsAsync();

    await Promise.all(
      presented
        .filter((notification) => match(dataOf(notification.request)))
        .map((notification) =>
          Notifications.dismissNotificationAsync(notification.request.identifier),
        ),
    );
  } catch {
    // Not critical.
  }
}

/** Cancel every reminder and alarm for one event (edit, delete, reschedule). */
export async function cancelCalendarReminder(eventId: string): Promise<void> {
  await cancelWhere((data) => data.eventId === eventId);
  await dismissShowing((data) => data.eventId === eventId && data.kind === KIND_ALARM);
}

/** Cancel every scheduled calendar reminder (used when the setting is turned off). */
export async function cancelAllCalendarReminders(): Promise<void> {
  await cancelWhere((data) => Boolean(data.eventId));
}

/* ---------- Snooze / Stop / tap ---------- */

/**
 * Handles a tap on a calendar alarm. Returns true when it was the
 * Snooze or Stop button (so the app should not change screens).
 */
export async function handleCalendarAlarmResponse(
  response: Notifications.NotificationResponse,
): Promise<boolean> {
  const data = dataOf(response.notification.request);
  const action = response.actionIdentifier;
  const isButton = action === ALARM_ACTION_SNOOZE || action === ALARM_ACTION_STOP;

  if (data.kind !== KIND_ALARM || !data.eventId) {
    return false;
  }

  const eventId = data.eventId;
  const isThisAlarm = (d: AlarmData) => d.eventId === eventId && d.kind === KIND_ALARM;

  // Stop, Snooze and opening the alarm all stop the remaining rings.
  await cancelWhere(isThisAlarm);
  await dismissShowing(isThisAlarm);

  if (action !== ALARM_ACTION_SNOOZE) {
    return isButton;
  }

  // Snooze: quiet for "Snooze for" minutes, then the alarm rings again
  // (and keeps ringing) until Stop.
  const prefs = await loadNotificationPrefs();
  const plan = alarmPlan(prefs);
  const start = toStartDate(data.dueDate ?? '', data.dueTime ?? '') ?? new Date();
  const snoozeAt = Date.now() + plan.minutes * 60 * 1000;

  await ensureNotificationChannels();
  await ensureCalendarAlarmCategory();

  const info = {
    eventId,
    title: data.title ?? 'Calendar event',
    dueDate: data.dueDate ?? '',
    dueTime: data.dueTime ?? '',
    category: data.category,
    priority: data.priority,
    sig: data.sig,
  };

  for (let index = 0; index < plan.rings; index += 1) {
    await scheduleAt(
      ringContent(info, start, index + 1, plan.rings, index === 0 ? 'snoozed' : 'repeat', plan.snooze),
      new Date(snoozeAt + index * RING_EVERY_MIN * 60 * 1000),
      NOTIFICATION_CHANNELS.calendar.id,
    );
  }

  return true;
}

/* ---------- keep alarms in sync ---------- */

export interface AlarmSyncEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  isAllDay?: boolean;
  hasReminder?: boolean;
  completed?: boolean;
  /** The task's subject; calendar events use a category name here. */
  subject?: string;
  category?: string;
  priority?: string;
}

/**
 * Which alarms a sync manages:
 * - 'calendar': calendar events only (Calendar screen)
 * - 'tasks': Task Manager tasks only (Tasks screen)
 * - 'all': both (full list from the server)
 */
export type AlarmSyncScope = 'all' | 'calendar' | 'tasks';

const inScope = (scope: AlarmSyncScope, category?: string) =>
  scope === 'all' || (scope === 'calendar') === isCalendarCategory(category);

const syncing: Partial<Record<AlarmSyncScope, Promise<void>>> = {};
const pendingSync: Partial<Record<AlarmSyncScope, AlarmSyncEvent[]>> = {};

/**
 * Makes the phone's scheduled alarms match the events: adds missing ones,
 * re-does ones whose time or alarm settings changed, and removes alarms for
 * deleted or completed events. Safe to call often.
 */
export function syncCalendarAlarms(
  events: AlarmSyncEvent[],
  scope: AlarmSyncScope = 'calendar',
): Promise<void> {
  // A sync is already running: run once more with these newest events after it.
  const running = syncing[scope];
  if (running) {
    pendingSync[scope] = events;
    return running;
  }

  const job = (async () => {
    try {
      const prefs = await loadNotificationPrefs();
      const scheduled = (await Notifications.getAllScheduledNotificationsAsync()).filter(
        (notification) =>
          Boolean(dataOf(notification).eventId) &&
          inScope(scope, dataOf(notification).category),
      );

      if (!prefs.pushEnabled || !prefs.calendarReminders) {
        await Promise.all(
          scheduled.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
        );
        return;
      }

      const permission = await Notifications.getPermissionsAsync();
      if (!permission.granted) return;

      await ensureCalendarAlarmCategory();

      const plan = alarmPlan(prefs);
      const eligible = events.filter(
        (event) =>
          event.hasReminder &&
          !event.completed &&
          !event.isAllDay &&
          normalizeTime(event.time) &&
          inScope(scope, String(event.subject ?? event.category ?? '')),
      );
      const eligibleIds = new Set(eligible.map((event) => event.id));

      // Deleted, completed or alarm turned off -> remove.
      await Promise.all(
        scheduled
          .filter((n) => !eligibleIds.has(String(dataOf(n).eventId)))
          .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
      );

      // Nearest upcoming events first (only these get alarms ahead of time).
      const upcoming = eligible
        .map((event) => ({ event, start: toStartDate(event.date, event.time) }))
        .filter((item): item is { event: AlarmSyncEvent; start: Date } =>
          Boolean(item.start && item.start.getTime() > Date.now()),
        )
        .sort((a, b) => a.start.getTime() - b.start.getTime());

      // The nearest 12 calendar events and the nearest 12 tasks.
      const near = [
        ...upcoming.filter((item) => isCalendarCategory(String(item.event.subject ?? item.event.category ?? ''))).slice(0, MAX_EVENTS_SCHEDULED),
        ...upcoming.filter((item) => !isCalendarCategory(String(item.event.subject ?? item.event.category ?? ''))).slice(0, MAX_EVENTS_SCHEDULED),
      ];
      const nearIds = new Set(near.map((item) => item.event.id));

      // Far-away events: drop their alarms for now (re-added when they get closer).
      await Promise.all(
        scheduled
          .filter((n) => {
            const id = String(dataOf(n).eventId);
            return upcoming.some((item) => item.event.id === id) && !nearIds.has(id);
          })
          .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
      );

      for (const { event } of near) {
        const sig = signature(event.title, event.date, event.time, plan.key);
        const existing = scheduled.filter((n) => dataOf(n).eventId === event.id);

        if (existing.length > 0 && existing.every((n) => dataOf(n).sig === sig)) continue;

        try {
          await scheduleCalendarReminder(event.title, event.date, event.time, undefined, event.id, {
            category: String(event.subject ?? event.category ?? ''),
            priority: event.priority,
          });
        } catch (error) {
          console.warn(`Unable to schedule alarm for "${event.title}":`, error);
        }
      }
    } catch (error) {
      console.warn('Calendar alarm sync failed:', error);
    } finally {
      delete syncing[scope];
      const next = pendingSync[scope];
      if (next) {
        delete pendingSync[scope];
        void syncCalendarAlarms(next, scope);
      }
    }
  })();

  syncing[scope] = job;
  return job;
}

/** Loads the user's events from the server, then syncs the alarms. */
export async function resyncCalendarAlarmsFromServer(): Promise<void> {
  try {
    const response = await api.get('/tasks');
    const items = response.data?.data ?? response.data ?? [];

    if (!Array.isArray(items)) return;

    await syncCalendarAlarms(
      items.map((item: any) => ({
        id: String(item.id),
        title: String(item.title ?? ''),
        date: normalizeDate(item.date ?? item.dueDate),
        time: normalizeTime(item.time ?? item.dueTime),
        isAllDay: Boolean(item.isAllDay),
        hasReminder: Boolean(item.hasReminder),
        completed: Boolean(item.completed),
        subject: item.category ?? item.subject,
        priority: item.priority,
      })),
      'all',
    );
  } catch (error) {
    console.warn('Unable to refresh calendar alarms:', error);
  }
}


/* ---------- diagnostics (shown in the Metro terminal) ---------- */

/**
 * Logs the phone's pending calendar alarms and the alarm channel.
 * If an alarm's time has passed but it is still listed here, Android never
 * fired it (the phone blocked GabAi in the background).
 */
export async function logCalendarAlarmStatus(reason: string): Promise<void> {
  try {
    const scheduled = (await Notifications.getAllScheduledNotificationsAsync()).filter(
      (n) => dataOf(n).kind === KIND_ALARM || dataOf(n).kind === KIND_DAY_BEFORE,
    );

    const times = scheduled
      .map((n) => {
        const trigger = n.trigger as { value?: number; date?: number | string } | null;
        const at = Number(trigger?.value ?? trigger?.date);
        return Number.isFinite(at) ? at : NaN;
      })
      .filter((at) => Number.isFinite(at))
      .sort((a, b) => a - b);

    const overdue = times.filter((at) => at < Date.now() - 60 * 1000).length;
    const next = times.find((at) => at >= Date.now());

    console.log(
      `⏰ [CalendarAlarm] status (${reason}): ${scheduled.length} pending` +
        `${next ? `, next at ${new Date(next).toString()}` : ''}` +
        `${overdue ? `, ⚠️ ${overdue} past their time but NOT fired (blocked by the phone)` : ''}.`,
    );

    if (Platform.OS === 'android') {
      const channel = await Notifications.getNotificationChannelAsync(NOTIFICATION_CHANNELS.calendar.id);
      console.log(
        `⏰ [CalendarAlarm] channel: ${
          channel
            ? `importance=${channel.importance}, sound=${channel.sound}, usage=${channel.audioAttributes?.usage}`
            : 'MISSING'
        }`,
      );
    }
  } catch (error) {
    console.warn('⏰ [CalendarAlarm] status check failed:', error);
  }
}
