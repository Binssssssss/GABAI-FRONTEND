import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '@/app/services/api';
import { localDb } from '@/app/services/localDb';

/**
 * Focus sessions are saved to the backend so the Today stats and Focus
 * History belong to the logged-in account. A local copy is kept so the
 * screens still show something when the phone is offline.
 */

export type FocusHistoryMode =
  | 'pomodoro'
  | 'deepWork'
  | 'shortBreak'
  | 'longBreak'
  | 'custom';

export interface FocusHistoryRecord {
  id: string;
  subject: string;
  taskTitle?: string;
  durationMinutes: number;
  mode: FocusHistoryMode;
  completedAt: string;
  isStrict: boolean;
}

const CACHE_KEY = 'gabai.focus.sessions';
const TASK_TITLES_KEY = 'gabai.focus.taskTitles';

const VALID_MODES: FocusHistoryMode[] = [
  'pomodoro',
  'deepWork',
  'shortBreak',
  'longBreak',
  'custom',
];

function isRecord(value: unknown): value is FocusHistoryRecord {
  if (!value || typeof value !== 'object') return false;

  const item = value as Partial<FocusHistoryRecord>;

  return (
    typeof item.id === 'string' &&
    typeof item.subject === 'string' &&
    typeof item.durationMinutes === 'number' &&
    Number.isFinite(item.durationMinutes) &&
    item.durationMinutes > 0 &&
    typeof item.completedAt === 'string' &&
    Number.isFinite(Date.parse(item.completedAt))
  );
}

function normalize(value: FocusHistoryRecord): FocusHistoryRecord {
  return {
    ...value,
    mode: VALID_MODES.includes(value.mode) ? value.mode : 'custom',
    isStrict: Boolean(value.isStrict),
  };
}

function sortNewestFirst(records: FocusHistoryRecord[]) {
  return [...records].sort(
    (a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt),
  );
}

/* ---------- sessions the user deleted (kept on this phone only) ---------- */

// The backend can't delete focus sessions, so deleted ones are
// remembered here (per account) and left out everywhere.
const HIDDEN_PREFIX = 'gabai.focus.hidden.';

const hiddenKey = () =>
  HIDDEN_PREFIX + (localDb.getActiveUserId() ?? 'guest');

async function readHiddenIds(): Promise<Set<string>> {
  try {
    const stored = await AsyncStorage.getItem(hiddenKey());
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

async function withoutHidden(
  records: FocusHistoryRecord[],
): Promise<FocusHistoryRecord[]> {
  const hidden = await readHiddenIds();
  return hidden.size === 0
    ? records
    : records.filter((record) => !hidden.has(record.id));
}

/** Delete a session from Focus History (on this phone). */
export async function deleteFocusSession(sessionId: string): Promise<void> {
  const hidden = await readHiddenIds();
  hidden.add(sessionId);
  await AsyncStorage.setItem(hiddenKey(), JSON.stringify([...hidden]));

  const cached = await readCachedHistory();
  await writeCachedHistory(cached.filter((record) => record.id !== sessionId));
}

/* ---------- local cache ---------- */

export async function readCachedHistory(): Promise<FocusHistoryRecord[]> {
  try {
    const stored = await AsyncStorage.getItem(CACHE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];

    return Array.isArray(parsed)
      ? withoutHidden(sortNewestFirst(parsed.filter(isRecord).map(normalize)))
      : [];
  } catch {
    return [];
  }
}

async function writeCachedHistory(records: FocusHistoryRecord[]) {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(records));
  } catch (error) {
    console.warn('Unable to cache focus history:', error);
  }
}

/* The backend has no task column, so task titles are remembered here. */
async function readTaskTitles(): Promise<Record<string, string>> {
  try {
    const stored = await AsyncStorage.getItem(TASK_TITLES_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : {};

    return parsed && typeof parsed === 'object'
      ? (parsed as Record<string, string>)
      : {};
  } catch {
    return {};
  }
}

async function rememberTaskTitle(sessionId: string, taskTitle?: string) {
  if (!taskTitle) return;

  try {
    const titles = await readTaskTitles();
    titles[sessionId] = taskTitle;
    await AsyncStorage.setItem(TASK_TITLES_KEY, JSON.stringify(titles));
  } catch (error) {
    console.warn('Unable to save focus task title:', error);
  }
}

/* ---------- backend ---------- */

/* Minutes with the seconds kept (e.g. 12m 37s -> 12.6167). */
function exactMinutes(item: FocusHistoryRecord & { durationSeconds?: unknown }): number {
  const seconds = Number(item.durationSeconds);
  return Number.isFinite(seconds) && seconds > 0 ? seconds / 60 : item.durationMinutes;
}

/**
 * Load the account's completed focus sessions. Falls back to the local
 * copy when the server cannot be reached.
 */
export async function fetchFocusHistory(): Promise<{
  records: FocusHistoryRecord[];
  fromServer: boolean;
}> {
  try {
    const response = await api.get('/focus-sessions/history', {
      params: { limit: 100 },
    });

    if (!response.data?.success) {
      throw new Error('History request was not successful.');
    }

    const titles = await readTaskTitles();
    const data: unknown = response.data.data;

    const allRecords = sortNewestFirst(
      (Array.isArray(data) ? data : [])
        .filter(isRecord)
        .map((item) =>
          normalize({
            ...item,
            // Newer servers also send the exact seconds.
            durationMinutes: exactMinutes(item),
            taskTitle: titles[item.id] ?? item.taskTitle,
          }),
        ),
    );

    const records = await withoutHidden(allRecords);

    await writeCachedHistory(records);

    return { records, fromServer: true };
  } catch (error: any) {
    if (error?.response?.status !== 404) {
      console.warn('Using offline focus history:', error?.message ?? error);
    }

    return { records: await readCachedHistory(), fromServer: false };
  }
}

/**
 * Save one finished focus session to the backend
 * (start + complete with the time actually focused, to the second).
 * `durationMinutes` may have a fraction for the seconds.
 */
export async function saveFocusSessionToServer(details: {
  subject: string;
  taskTitle?: string;
  durationMinutes: number;
  mode: FocusHistoryMode;
  isStrict: boolean;
}): Promise<FocusHistoryRecord> {
  // The backend allows one active session per user; clear a leftover one.
  try {
    const current = await api.get('/focus-sessions/current');
    const active = current.data?.data;

    if (active?.id) {
      await api.patch(`/focus-sessions/${active.id}/cancel`);
    }
  } catch {
    // No active session, or the check failed; starting will tell us.
  }

  const durationSeconds = Math.max(1, Math.round(details.durationMinutes * 60));

  const started = await api.post('/focus-sessions/start', {
    duration: durationSeconds,
    subject: details.subject,
    focusMode: details.mode,
    isStrict: details.isStrict,
  });

  const sessionId: string | undefined = started.data?.data?.id;

  if (!sessionId) {
    throw new Error('The server did not return a focus session ID.');
  }

  const completed = await api.patch(`/focus-sessions/${sessionId}/complete`);
  const endedAt: string | undefined = completed.data?.data?.endedAt;

  await rememberTaskTitle(sessionId, details.taskTitle);

  return {
    id: sessionId,
    subject: details.subject,
    taskTitle: details.taskTitle,
    durationMinutes: durationSeconds / 60,
    mode: details.mode,
    isStrict: details.isStrict,
    completedAt: endedAt ? new Date(endedAt).toISOString() : new Date().toISOString(),
  };
}

/** Add a record to the local copy (used right after saving). */
export async function addToCachedHistory(record: FocusHistoryRecord) {
  const cached = await readCachedHistory();
  const next = sortNewestFirst([
    record,
    ...cached.filter((item) => item.id !== record.id),
  ]);

  await writeCachedHistory(next);

  return next;
}