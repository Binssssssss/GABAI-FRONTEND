import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';

import { localDb } from '@/app/services/localDb';

/**
 * Activity history, saved on this phone only.
 *
 * Every task change that goes through the API (create, complete,
 * restore, delete) is written here, from any screen. Each user has
 * their own list, and anything older than 30 days is removed.
 */

export type ActivityType = 'created' | 'completed' | 'restored' | 'deleted';

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  taskId: string;
  title: string;
  subject?: string;
  at: number; // ms
}

interface StoredLog {
  seeded: boolean;
  items: ActivityEntry[];
}

export const ACTIVITY_KEEP_DAYS = 30;
const KEEP_MS = ACTIVITY_KEEP_DAYS * 24 * 60 * 60 * 1000;
const MAX_ITEMS = 500;
const STORAGE_PREFIX = 'gabai.activity.';

// ------------------------------------------------------
// STATE (one loaded log at a time: the signed-in user's)
// ------------------------------------------------------

let loadedUserId: string | null = null;
let log: StoredLog = { seeded: false, items: [] };
let loading: Promise<void> | null = null;
const listeners = new Set<(items: ActivityEntry[]) => void>();

// What we know about each task, so a delete can still show its title.
const knownTasks = new Map<
  string,
  { title: string; subject?: string; completed: boolean }
>();

const prune = (items: ActivityEntry[]) => {
  const cutoff = Date.now() - KEEP_MS;
  return items
    .filter((item) => item.at >= cutoff)
    .sort((a, b) => b.at - a.at)
    .slice(0, MAX_ITEMS);
};

const notify = () => {
  listeners.forEach((listener) => listener(log.items));
};

const save = async () => {
  if (!loadedUserId) return;

  try {
    await AsyncStorage.setItem(
      STORAGE_PREFIX + loadedUserId,
      JSON.stringify(log),
    );
  } catch (error) {
    console.log('Failed to save activity history:', error);
  }
};

/** Loads the current user's log (once), dropping anything past 30 days. */
const ensureLoaded = async () => {
  const userId = localDb.getActiveUserId();

  if (!userId) {
    if (loadedUserId) {
      loadedUserId = null;
      log = { seeded: false, items: [] };
      knownTasks.clear();
      notify();
    }
    return;
  }

  if (userId === loadedUserId) {
    if (loading) await loading;
    return;
  }

  loadedUserId = userId;
  log = { seeded: false, items: [] };
  knownTasks.clear();

  loading = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_PREFIX + userId);
      const parsed = raw ? (JSON.parse(raw) as StoredLog) : null;

      if (loadedUserId !== userId) return;

      if (parsed && Array.isArray(parsed.items)) {
        const before = parsed.items.length;
        log = { seeded: Boolean(parsed.seeded), items: prune(parsed.items) };

        if (log.items.length !== before) {
          await save();
        }
      }
    } catch (error) {
      console.log('Failed to load activity history:', error);
    }
  })();

  await loading;
  loading = null;
  notify();
};

const addEntries = async (
  entries: Omit<ActivityEntry, 'id'>[],
) => {
  if (entries.length === 0) return;

  await ensureLoaded();
  if (!loadedUserId) return;

  const stamped = entries.map((entry, index) => ({
    ...entry,
    id: `${entry.at}-${index}-${Math.random().toString(36).slice(2, 8)}`,
  }));

  log = { ...log, items: prune([...stamped, ...log.items]) };
  notify();
  await save();
};

// ------------------------------------------------------
// READING THE API TRAFFIC
// ------------------------------------------------------

const unwrap = (data: any) => (data && data.data !== undefined ? data.data : data);

const parseBody = (body: unknown): any => {
  if (typeof body !== 'string') return body ?? {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
};

const toTime = (value: unknown): number | undefined => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

const remember = (task: any) => {
  if (!task || typeof task.id !== 'string') return;

  knownTasks.set(task.id, {
    title: String(task.title ?? 'Untitled task'),
    subject: task.subject ? String(task.subject) : undefined,
    completed: Boolean(task.completed),
  });
};

const describe = (taskId: string) => {
  const known = knownTasks.get(taskId);
  if (known) return known;

  const cached = localDb.getTasks().find((task) => task.id === taskId);
  if (cached) {
    return {
      title: cached.title,
      subject: cached.subject,
      completed: cached.completed,
    };
  }

  return undefined;
};

/**
 * First time we see this user's task list, add the last 30 days of
 * it, so the history isn't empty on day one.
 */
const seedFromTaskList = async (tasks: any[]) => {
  await ensureLoaded();
  if (!loadedUserId || log.seeded) return;

  const cutoff = Date.now() - KEEP_MS;
  const entries: Omit<ActivityEntry, 'id'>[] = [];

  tasks.forEach((task) => {
    if (!task || typeof task.id !== 'string') return;

    const base = {
      taskId: task.id,
      title: String(task.title ?? 'Untitled task'),
      subject: task.subject ? String(task.subject) : undefined,
    };

    const createdAt = toTime(task.createdAt);
    if (createdAt && createdAt >= cutoff) {
      entries.push({ ...base, type: 'created', at: createdAt });
    }

    const updatedAt = toTime(task.updatedAt);
    if (task.completed && updatedAt && updatedAt >= cutoff) {
      entries.push({ ...base, type: 'completed', at: updatedAt });
    }
  });

  log = { seeded: true, items: log.items };
  if (entries.length > 0) {
    await addEntries(entries);
  } else {
    await save();
  }
};

const TASK_ID_URL = /^\/?tasks\/([^/?]+)\/?(?:\?.*)?$/;
const RESERVED = new Set(['bulk', 'filter', 'upcoming', 'analytics', 'recommendation']);

/**
 * Called for every successful API response (see api.ts).
 * Never throws: history is a nice-to-have.
 */
export function recordTaskActivity(response: AxiosResponse) {
  void (async () => {
    try {
      // Load this user's history first (it also resets the title cache
      // when a different user signs in).
      await ensureLoaded();

      const method = (response.config.method ?? 'get').toLowerCase();
      const url = (response.config.url ?? '').replace(/^\/api/, '');
      const body = parseBody(response.config.data);
      const result = unwrap(response.data);
      const now = Date.now();

      // Task lists: remember titles, and seed the history once.
      if (method === 'get' && /^\/?tasks\/?(\?.*)?$/.test(url)) {
        const list = Array.isArray(result)
          ? result
          : Array.isArray(result?.tasks)
            ? result.tasks
            : [];
        list.forEach(remember);
        await seedFromTaskList(list);
        return;
      }

      // New task.
      if (method === 'post' && /^\/?tasks\/?$/.test(url)) {
        const task = result ?? body;
        remember(task);
        await addEntries([
          {
            type: 'created',
            taskId: String(task?.id ?? now),
            title: String(task?.title ?? body?.title ?? 'Untitled task'),
            subject: task?.subject ?? body?.subject,
            at: now,
          },
        ]);
        return;
      }

      // Complete many at once.
      if (method === 'post' && /^\/?tasks\/bulk\/complete\/?$/.test(url)) {
        const ids: string[] = Array.isArray(body?.taskIds) ? body.taskIds : [];
        const entries = ids
          .map((id) => ({ id, info: describe(id) }))
          .filter(({ info }) => !info?.completed)
          .map(({ id, info }) => ({
            type: 'completed' as const,
            taskId: id,
            title: info?.title ?? 'A task',
            subject: info?.subject,
            at: now,
          }));
        ids.forEach((id) => {
          const info = knownTasks.get(id);
          if (info) knownTasks.set(id, { ...info, completed: true });
        });
        await addEntries(entries);
        return;
      }

      // Delete many at once.
      if (method === 'delete' && /^\/?tasks\/bulk\/?$/.test(url)) {
        const ids: string[] = Array.isArray(body?.taskIds) ? body.taskIds : [];
        await addEntries(
          ids.map((id) => {
            const info = describe(id);
            knownTasks.delete(id);
            return {
              type: 'deleted' as const,
              taskId: id,
              title: info?.title ?? 'A task',
              subject: info?.subject,
              at: now,
            };
          }),
        );
        return;
      }

      const match = url.match(TASK_ID_URL);
      if (!match || RESERVED.has(match[1])) return;
      const taskId = match[1];

      // Delete one.
      if (method === 'delete') {
        const info = describe(taskId);
        knownTasks.delete(taskId);
        await addEntries([
          {
            type: 'deleted',
            taskId,
            title: info?.title ?? 'A task',
            subject: info?.subject,
            at: now,
          },
        ]);
        return;
      }

      // Complete / restore one (only when it really changed).
      if (
        (method === 'patch' || method === 'put') &&
        typeof body?.completed === 'boolean'
      ) {
        const before = describe(taskId);
        const task = result && typeof result === 'object' ? result : {};
        const title = String(task.title ?? before?.title ?? 'A task');
        const subject = task.subject ?? before?.subject;

        remember({ id: taskId, title, subject, completed: body.completed });

        if (before && before.completed === body.completed) return;

        await addEntries([
          {
            type: body.completed ? 'completed' : 'restored',
            taskId,
            title,
            subject,
            at: now,
          },
        ]);
        return;
      }

      // Any other task update: just keep the title fresh.
      if ((method === 'patch' || method === 'put') && result?.id) {
        remember(result);
      }
    } catch (error) {
      console.log('Activity history skipped a response:', error);
    }
  })();
}

// ------------------------------------------------------
// FOR SCREENS
// ------------------------------------------------------

/** The signed-in user's activity, newest first (last 30 days). */
export function useActivityLog(): ActivityEntry[] {
  const [items, setItems] = useState<ActivityEntry[]>(() =>
    loadedUserId === localDb.getActiveUserId() ? prune(log.items) : [],
  );

  useEffect(() => {
    const listener = (next: ActivityEntry[]) => setItems(prune(next));
    listeners.add(listener);

    // Load (and drop expired items) when a screen opens.
    void ensureLoaded().then(() => {
      setItems(loadedUserId ? prune(log.items) : []);
    });

    return () => {
      listeners.delete(listener);
    };
  }, []);

  return items;
}
