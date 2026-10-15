import api from '@/app/services/api';
import { fetchFocusHistory } from '@/app/services/focusSessionApi';
import { fetchNotes } from '@/app/services/notesApi';
import { taskService } from '@/app/services/task.services';

import {
  QuickActionKey,
  SummaryBar,
  SummaryCardData,
  SummaryItem,
} from '../types';

/**
 * Builds the GabAi quick-action answers from the user's real data.
 * Each action only talks about its own feature.
 */

const BROWN = '#A97C50';
const RED = '#EF4444';
const AMBER = '#F59E0B';
const GREEN = '#22C55E';
const BLUE = '#38BDF8';
const GRAY = '#9BA1A6';

/* Calendar events are stored as tasks with the category as the subject. */
const CALENDAR_COLORS: Record<string, string> = {
  assignment: '#38BDF8',
  exam: '#F87171',
  class: '#C084FC',
  meeting: '#FB923C',
  personal: '#4ADE80',
  'focus session': BROWN,
};

const isCalendarEvent = (subject?: string | null) =>
  Object.prototype.hasOwnProperty.call(
    CALENDAR_COLORS,
    String(subject ?? '').trim().toLowerCase(),
  );

const MODE_LABELS: Record<string, string> = {
  pomodoro: 'Pomodoro',
  deepWork: 'Deep Work',
  custom: 'Custom',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

/* ---------------- date & number helpers ---------------- */

const DAY_MS = 86400000;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;

/* Sunday-to-Saturday week containing today (same as the calendar). */
const thisWeek = () => {
  const start = startOfDay(new Date());
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start, end };
};

const formatTime = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

/* "15:30" -> "3:30 PM" */
const formatClock = (hhmm?: string | null) => {
  const match = String(hhmm ?? '').match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const h = Number(match[1]);
  return `${h % 12 || 12}:${match[2]} ${h >= 12 ? 'PM' : 'AM'}`;
};

const formatShortDate = (d: Date) =>
  d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

const formatMonthDay = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/* Today / Tomorrow / Yesterday / "Fri, Oct 16" */
const describeDay = (d: Date) => {
  const diff = Math.round((startOfDay(d).getTime() - startOfDay(new Date()).getTime()) / DAY_MS);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return formatShortDate(d);
};

/* 25 -> "25m", 200 -> "3h 20m" */
const formatMinutes = (minutes: number) => {
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h}h ${rest}m` : `${h}h`;
};

/* Time between now and a date: "in 25 min", "in 2h 24m", "in 3 days" */
const timeUntil = (d: Date) => {
  const minutes = Math.round((d.getTime() - Date.now()) / 60000);
  if (minutes < 60) return `in ${Math.max(1, minutes)} min`;
  if (minutes < 24 * 60) return `in ${formatMinutes(minutes)}`;
  const days = Math.round(minutes / (24 * 60));
  return `in ${days} day${days === 1 ? '' : 's'}`;
};

/* "1 day late", "3 hours late" */
const timeLate = (d: Date) => {
  const minutes = Math.round((Date.now() - d.getTime()) / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)} min late`;
  if (minutes < 24 * 60) {
    const h = Math.round(minutes / 60);
    return `${h} hour${h === 1 ? '' : 's'} late`;
  }
  const days = Math.round(minutes / (24 * 60));
  return `${days} day${days === 1 ? '' : 's'} late`;
};

const peso = (value: number) =>
  `₱${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const plural = (count: number, word: string, many = `${word}s`) =>
  `${count} ${count === 1 ? word : many}`;

const priorityBadge = (priority?: string) => {
  const p = String(priority ?? '').toLowerCase();
  if (p === 'high') return { text: 'HIGH', color: RED };
  if (p === 'medium') return { text: 'MEDIUM', color: AMBER };
  if (p === 'low') return { text: 'LOW', color: GREEN };
  return undefined;
};

const priorityColor = (priority?: string) => priorityBadge(priority)?.color ?? GRAY;

/* ---------------- shared task loading ---------------- */

interface LoadedTask {
  id: string;
  title: string;
  subject: string;
  priority?: string;
  completed: boolean;
  updatedAt?: string;
  hasReminder?: boolean;
  subTasks: { completed: boolean }[];
  /** Due moment; end of day when there is no time. */
  due: Date | null;
  hasTime: boolean;
}

async function loadTasks(): Promise<LoadedTask[]> {
  const tasks = await taskService.getTasks();

  return tasks
    .filter((t) => t && typeof t.id === 'string')
    .map((t) => {
      const dateText = String(t.dueDate ?? '').slice(0, 10);
      const clock = String(t.dueTime ?? '').match(/^(\d{1,2}):(\d{2})/);
      let due: Date | null = null;

      if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
        due = clock
          ? new Date(`${dateText}T${clock[1].padStart(2, '0')}:${clock[2]}:00`)
          : new Date(`${dateText}T23:59:00`);
        if (Number.isNaN(due.getTime())) due = null;
      }

      return {
        id: t.id,
        title: String(t.title ?? 'Untitled'),
        subject: String(t.subject ?? '').trim(),
        priority: t.priority,
        completed: Boolean(t.completed),
        updatedAt: t.updatedAt,
        hasReminder: t.hasReminder,
        subTasks: Array.isArray(t.subTasks) ? t.subTasks : [],
        due,
        hasTime: Boolean(clock),
      };
    });
}

/* ============================================================
   TASKS — Task Manager items only (no calendar events)
   ============================================================ */

async function buildTasksSummary(): Promise<SummaryCardData> {
  const all = (await loadTasks()).filter((t) => !isCalendarEvent(t.subject));
  const now = new Date();
  const todayKey = dayKey(now);

  const open = all.filter((t) => !t.completed);
  const overdue = open
    .filter((t) => t.due && t.due.getTime() < now.getTime())
    .sort((a, b) => a.due!.getTime() - b.due!.getTime());
  const dueToday = open
    .filter((t) => t.due && dayKey(t.due) === todayKey && t.due.getTime() >= now.getTime())
    .sort((a, b) => a.due!.getTime() - b.due!.getTime());
  const upcoming = open
    .filter((t) => !t.due || dayKey(t.due) > todayKey)
    .sort((a, b) => (a.due?.getTime() ?? Infinity) - (b.due?.getTime() ?? Infinity));

  const { start } = thisWeek();
  const doneThisWeek = all.filter(
    (t) => t.completed && t.updatedAt && new Date(t.updatedAt).getTime() >= start.getTime(),
  ).length;

  const toItem = (t: LoadedTask, kind: 'overdue' | 'today' | 'upcoming'): SummaryItem => {
    const doneSubs = t.subTasks.filter((s) => s.completed).length;
    const subtitle = [
      t.subject || 'No subject',
      t.subTasks.length ? `${doneSubs} of ${t.subTasks.length} subtasks done` : null,
      kind === 'overdue' && t.due
        ? `was due ${formatMonthDay(t.due)}${t.hasTime ? `, ${formatTime(t.due)}` : ''}`
        : null,
    ]
      .filter(Boolean)
      .join(' · ');

    if (kind === 'overdue') {
      return {
        title: t.title,
        subtitle,
        right: t.due ? timeLate(t.due) : 'Overdue',
        rightColor: RED,
        color: RED,
        badge: priorityBadge(t.priority),
      };
    }

    if (kind === 'today') {
      return {
        title: t.title,
        subtitle,
        right: t.hasTime && t.due ? formatTime(t.due) : 'Today',
        rightSub: t.due ? timeUntil(t.due) : undefined,
        color: priorityColor(t.priority),
        badge: priorityBadge(t.priority),
      };
    }

    return {
      title: t.title,
      subtitle,
      right: t.due ? formatShortDate(t.due) : 'No due date',
      rightSub: t.due && t.hasTime ? formatTime(t.due) : undefined,
      color: priorityColor(t.priority),
      badge: priorityBadge(t.priority),
    };
  };

  const first = overdue[0] ?? dueToday[0] ?? upcoming[0];

  let lead: string;
  if (open.length === 0) {
    lead = doneThisWeek
      ? `You're all caught up. You completed **${plural(doneThisWeek, 'task')}** this week.`
      : "You're all caught up. You have **no open tasks**.";
  } else {
    const parts = [`You have **${plural(open.length, 'open task')}**.`];
    const counts = [
      dueToday.length ? `**${dueToday.length} due today**` : null,
      overdue.length ? `**${overdue.length} overdue**` : null,
    ].filter(Boolean);
    if (counts.length) parts.push(`${counts.join(' and ')}.`);
    if (first) parts.push(`Start with **"${first.title}"**.`);
    lead = parts.join(' ');
  }

  return {
    icon: 'check-square',
    title: 'Task Summary',
    meta: `as of ${formatTime(now)}`,
    lead,
    stats: [
      { value: String(open.length), label: 'Open' },
      { value: String(dueToday.length), label: 'Due today', color: BROWN },
      { value: String(overdue.length), label: 'Overdue', color: overdue.length ? RED : undefined },
      { value: String(doneThisWeek), label: 'Done this week', color: GREEN },
    ],
    sections: [
      ...(overdue.length
        ? [{ title: 'OVERDUE', items: overdue.slice(0, 3).map((t) => toItem(t, 'overdue')) }]
        : []),
      ...(dueToday.length
        ? [{ title: 'DUE TODAY', items: dueToday.slice(0, 3).map((t) => toItem(t, 'today')) }]
        : []),
      ...(upcoming.length
        ? [{ title: 'UPCOMING', items: upcoming.slice(0, 3).map((t) => toItem(t, 'upcoming')) }]
        : []),
    ],
    buttons: [
      { label: 'Open Task Manager', icon: 'arrow-right', route: '/(tabs)/tasks/task', primary: true },
    ],
  };
}

/* ============================================================
   SCHEDULE — calendar events only
   ============================================================ */

async function buildScheduleSummary(): Promise<SummaryCardData> {
  const events = (await loadTasks()).filter((t) => isCalendarEvent(t.subject) && t.due);
  const now = new Date();
  const todayKey = dayKey(now);
  const tomorrow = new Date(now.getTime() + DAY_MS);
  const tomorrowKey = dayKey(tomorrow);

  const byTime = (a: LoadedTask, b: LoadedTask) => a.due!.getTime() - b.due!.getTime();

  const today = events.filter((e) => dayKey(e.due!) === todayKey).sort(byTime);
  const tomorrowEvents = events
    .filter((e) => dayKey(e.due!) === tomorrowKey && !e.completed)
    .sort(byTime);

  const next = events
    .filter((e) => !e.completed && e.hasTime && e.due!.getTime() > now.getTime())
    .sort(byTime)[0];

  const weekEnd = new Date(startOfDay(now).getTime() + 7 * DAY_MS);
  const thisWeekEvents = events.filter(
    (e) => !e.completed && e.due!.getTime() >= startOfDay(now).getTime() && e.due! < weekEnd,
  );
  const exams = thisWeekEvents.filter((e) => e.subject.toLowerCase() === 'exam').length;
  const assignments = thisWeekEvents.filter((e) => e.subject.toLowerCase() === 'assignment').length;

  const toItem = (e: LoadedTask, showCountdown: boolean): SummaryItem => {
    const category = e.subject.charAt(0).toUpperCase() + e.subject.slice(1);
    const isPast = e.hasTime && e.due!.getTime() < now.getTime();
    const status = e.completed ? 'Done' : isPast ? 'Ended' : null;

    return {
      title: e.title,
      subtitle: [
        category,
        e.priority === 'High' ? 'High priority' : null,
        e.hasReminder ? 'Reminder on' : null,
        status,
      ]
        .filter(Boolean)
        .join(' · '),
      right: e.hasTime ? formatTime(e.due!) : 'All day',
      rightSub: showCountdown && !e.completed && !isPast && e.hasTime ? timeUntil(e.due!) : undefined,
      color: CALENDAR_COLORS[e.subject.toLowerCase()] ?? BROWN,
    };
  };

  let lead: string;
  if (today.length === 0) {
    lead = next
      ? `You have **no events today**. Your next event is **${next.title}** on **${describeDay(
          next.due!,
        )} at ${formatTime(next.due!)}**.`
      : 'You have **no events today** and nothing scheduled ahead.';
  } else {
    lead = `You have **${plural(today.length, 'event')} today**.`;
    if (next && dayKey(next.due!) === todayKey) {
      lead += ` Next is **${next.title} at ${formatTime(next.due!)}**, starting **${timeUntil(
        next.due!,
      )}**.`;
    } else {
      lead += ' There are no more events for the rest of the day.';
    }
  }

  const weekParts = [
    exams ? plural(exams, 'exam') : null,
    assignments ? plural(assignments, 'assignment') : null,
  ].filter(Boolean);

  return {
    icon: 'calendar',
    title: "Today's Schedule",
    meta: formatShortDate(now),
    lead,
    sections: [
      {
        title: 'TODAY',
        items: today.slice(0, 5).map((e) => toItem(e, true)),
        empty: 'No events scheduled today.',
      },
      ...(tomorrowEvents.length
        ? [
            {
              title: `TOMORROW · ${formatShortDate(tomorrow).toUpperCase()}`,
              items: tomorrowEvents.slice(0, 3).map((e) => toItem(e, false)),
            },
          ]
        : []),
    ],
    tip: weekParts.length
      ? `Next 7 days: ${weekParts.join(' and ')} on your calendar.`
      : undefined,
    buttons: [
      { label: 'Open Calendar', icon: 'arrow-right', route: '/(tabs)/calendar/calendar', primary: true },
    ],
  };
}

/* ============================================================
   WALLET
   ============================================================ */

interface WalletTx {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
}

const EXPENSE_COLORS = [RED, AMBER, BLUE, '#C084FC', GREEN];

async function buildWalletSummary(): Promise<SummaryCardData> {
  const [txResponse, balanceResponse] = await Promise.all([
    api.get('/transactions').catch((error: any) => {
      if (error?.response?.status === 404) return { data: { data: [] } };
      throw error;
    }),
    api.get('/transactions/balance').catch(() => ({ data: { data: null } })),
  ]);

  const list: WalletTx[] = (Array.isArray(txResponse.data?.data) ? txResponse.data.data : [])
    .map((t: any) => ({
      id: String(t.id),
      title: String(t.title ?? 'Untitled'),
      amount: Number(t.amount) || 0,
      type: t.type === 'income' ? 'income' : 'expense',
      category: String(t.category ?? 'Others'),
      date: new Date(t.date ?? t.createdAt),
    }))
    .filter((t: WalletTx) => !Number.isNaN(t.date.getTime()))
    .sort((a: WalletTx, b: WalletTx) => b.date.getTime() - a.date.getTime());

  const balanceData = balanceResponse.data?.data;
  const totalIn = list.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalOut = list.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = Math.max(
    0,
    Number(balanceData?.netBalance ?? totalIn - totalOut) || 0,
  );

  const { start, end } = thisWeek();
  const week = list.filter((t) => t.date >= start && t.date < end);
  const weekIn = week.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const weekOut = week.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const todayKey = dayKey(new Date());
  const todayOut = list
    .filter((t) => t.type === 'expense' && dayKey(t.date) === todayKey)
    .reduce((s, t) => s + t.amount, 0);

  const byCategory = new Map<string, number>();
  for (const t of week) {
    if (t.type !== 'expense') continue;
    byCategory.set(t.category, (byCategory.get(t.category) ?? 0) + t.amount);
  }
  const categories = [...byCategory.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  const top = categories[0];

  const bars: SummaryBar[] = categories.map(([name, amount], index) => ({
    label: name,
    value: top ? amount / top[1] : 0,
    display: peso(amount),
    color: EXPENSE_COLORS[index % EXPENSE_COLORS.length],
  }));

  let lead = `Your current balance is **${peso(balance)}**.`;
  if (weekOut > 0) {
    lead += ` You spent **${peso(weekOut)} this week**${
      todayOut > 0 ? `, **${peso(todayOut)} today**` : ''
    }.`;
    if (top) lead += ` **${top[0]}** is your biggest expense.`;
  } else {
    lead += ' You have **no expenses this week**.';
  }

  return {
    icon: 'credit-card',
    title: 'Wallet Summary',
    meta: `${formatMonthDay(start)} – ${formatMonthDay(new Date(end.getTime() - DAY_MS))}`,
    lead,
    stats: [
      { value: peso(balance), label: 'Balance' },
      { value: `+${peso(weekIn)}`, label: 'In this week', color: GREEN },
      { value: `−${peso(weekOut)}`, label: 'Out this week', color: RED },
    ],
    sections: [
      {
        title: 'WHERE YOUR MONEY WENT · THIS WEEK',
        bars,
        empty: 'No spending recorded this week.',
      },
      {
        title: 'RECENT ACTIVITY',
        items: list.slice(0, 3).map((t) => ({
          title: t.title,
          subtitle: `${t.category} · ${describeDay(t.date)}, ${formatTime(t.date)}`,
          right: `${t.type === 'income' ? '+' : '−'} ${peso(t.amount)}`,
          rightColor: t.type === 'income' ? GREEN : RED,
          color: t.type === 'income' ? GREEN : RED,
        })),
        empty: 'No transactions yet.',
      },
    ],
    buttons: [
      { label: 'Open Wallet', icon: 'arrow-right', route: '/(tabs)/expenses/expenses', primary: true },
    ],
  };
}

/* ============================================================
   FOCUS SESSION
   ============================================================ */

async function buildFocusSummary(): Promise<SummaryCardData> {
  const { records } = await fetchFocusHistory();
  const sessions = records.filter((r) => r.mode !== 'shortBreak' && r.mode !== 'longBreak');

  const now = new Date();
  const todayKey = dayKey(now);
  const { start } = thisWeek();

  const today = sessions.filter((s) => dayKey(new Date(s.completedAt)) === todayKey);
  const week = sessions.filter((s) => new Date(s.completedAt) >= start);

  const todayMinutes = today.reduce((sum, s) => sum + s.durationMinutes, 0);
  const weekMinutes = week.reduce((sum, s) => sum + s.durationMinutes, 0);

  // Consecutive days with at least one session (today or yesterday onward).
  const days = new Set(sessions.map((s) => dayKey(new Date(s.completedAt))));
  const cursor = new Date(now);
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const bySubject = new Map<string, number>();
  for (const s of week) {
    bySubject.set(s.subject, (bySubject.get(s.subject) ?? 0) + s.durationMinutes);
  }
  const subjects = [...bySubject.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const topMinutes = subjects[0]?.[1] ?? 0;

  let lead: string;
  if (today.length) {
    lead = `You focused for **${formatMinutes(todayMinutes)}** today across **${plural(
      today.length,
      'session',
    )}**.`;
  } else if (sessions.length) {
    const last = new Date(sessions[0].completedAt);
    lead = `You have **no focus sessions today** yet. Your last session was **${describeDay(
      last,
    )} at ${formatTime(last)}**.`;
  } else {
    lead = 'You have **no focus sessions** yet. Start one to begin tracking your study time.';
  }
  if (streak > 1) lead += ` You're on a **${streak}-day streak**.`;

  return {
    icon: 'target',
    title: 'Focus Summary',
    meta: formatShortDate(now),
    lead,
    stats: [
      { value: formatMinutes(todayMinutes), label: 'Today', color: BROWN },
      { value: formatMinutes(weekMinutes), label: 'This week' },
      { value: `${streak}d`, label: 'Streak', color: AMBER },
    ],
    sections: [
      {
        title: "TODAY'S SESSIONS",
        items: today.slice(0, 3).map((s) => ({
          title: s.taskTitle ?? s.subject,
          subtitle: [
            s.taskTitle ? s.subject : null,
            MODE_LABELS[s.mode] ?? 'Focus',
            s.isStrict ? 'Strict' : null,
          ]
            .filter(Boolean)
            .join(' · '),
          right: `${s.durationMinutes} min`,
          rightSub: formatTime(new Date(s.completedAt)),
          color: BROWN,
        })),
        empty: 'No sessions completed today.',
      },
      ...(subjects.length
        ? [
            {
              title: 'MOST FOCUSED THIS WEEK',
              bars: subjects.map(([name, minutes]) => ({
                label: name,
                value: topMinutes ? minutes / topMinutes : 0,
                display: formatMinutes(minutes),
                color: BROWN,
              })),
            },
          ]
        : []),
    ],
    buttons: [
      { label: 'Start Focus Session', icon: 'play', route: '/productivity', primary: true },
      { label: 'View history', icon: 'clock', route: '/productivity/history' },
    ],
  };
}

/* ============================================================
   NOTES
   ============================================================ */

/* Notes are saved as rich text (HTML); show a short plain-text preview. */
const preview = (content: string) => {
  const text = String(content ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 48 ? `"${text.slice(0, 48)}…"` : text ? `"${text}"` : 'Empty note';
};

async function buildNotesSummary(): Promise<SummaryCardData> {
  const notes = (await fetchNotes())
    .filter((n) => !n.isArchived)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const todayKey = dayKey(new Date());
  const pinned = notes.filter((n) => n.isPinned);
  const updatedToday = notes.filter((n) => dayKey(new Date(n.updatedAt)) === todayKey);
  const recent = notes.filter((n) => !n.isPinned).slice(0, 3);

  const toItem = (n: (typeof notes)[number]): SummaryItem => {
    const updated = new Date(n.updatedAt);
    return {
      title: n.title?.trim() || 'Untitled note',
      subtitle: `${n.category || 'General'} · ${preview(n.content)}`,
      right: describeDay(updated),
      rightSub: formatTime(updated),
      color: n.isPinned ? BROWN : GRAY,
    };
  };

  let lead: string;
  if (notes.length === 0) {
    lead = 'You have **no notes** yet. Create one to keep your ideas and reviewers in one place.';
  } else {
    lead = `You have **${plural(notes.length, 'note')}**`;
    const extra = [
      pinned.length ? `**${pinned.length} pinned**` : null,
      updatedToday.length ? `**${updatedToday.length} updated today**` : null,
    ].filter(Boolean);
    lead += extra.length ? ` — ${extra.join(' and ')}.` : '.';
    lead += ` Your most recent note is **"${notes[0].title?.trim() || 'Untitled note'}"**.`;
  }

  return {
    icon: 'file-text',
    title: 'Notes Summary',
    meta: plural(notes.length, 'note'),
    lead,
    stats: [
      { value: String(notes.length), label: 'Total' },
      { value: String(pinned.length), label: 'Pinned', color: BROWN },
      { value: String(updatedToday.length), label: 'Updated today' },
    ],
    sections: [
      ...(pinned.length ? [{ title: 'PINNED', items: pinned.slice(0, 2).map(toItem) }] : []),
      ...(recent.length ? [{ title: 'RECENTLY UPDATED', items: recent.map(toItem) }] : []),
    ],
    buttons: [{ label: 'Open Notes', icon: 'arrow-right', route: '/(tabs)/notes/notes', primary: true }],
  };
}

/* ============================================================ */

const BUILDERS: Record<QuickActionKey, () => Promise<SummaryCardData>> = {
  tasks: buildTasksSummary,
  schedule: buildScheduleSummary,
  wallet: buildWalletSummary,
  focus: buildFocusSummary,
  notes: buildNotesSummary,
};

const FEATURE_NAMES: Record<QuickActionKey, string> = {
  tasks: 'tasks',
  schedule: 'schedule',
  wallet: 'wallet',
  focus: 'focus sessions',
  notes: 'notes',
};

export async function buildQuickSummary(key: QuickActionKey): Promise<SummaryCardData> {
  return BUILDERS[key]();
}

export function quickSummaryError(key: QuickActionKey): string {
  return `I couldn't load your ${FEATURE_NAMES[key]} right now. Please check your connection and try again.`;
}