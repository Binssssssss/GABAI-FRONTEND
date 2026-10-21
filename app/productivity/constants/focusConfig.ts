import { FocusMode } from '../types';

export const FOCUS_MODE_DURATIONS: Record<FocusMode, number> = {
  pomodoro: 25 * 60, // 25 min
  deepWork: 50 * 60, // 50 min
  shortBreak: 5 * 60, // 5 min
  longBreak: 15 * 60, // 15 min
  custom: 30 * 60, // 30 min (default, user adjustable)
};

export const CUSTOM_DURATION_LIMITS = {
  min: 1,
  max: 180,
  step: 5,
};

export const CUSTOM_DURATION_PRESETS = [15, 30, 45, 60, 90];

/** Long break is suggested after every Nth focus session of the day. */
export const SESSIONS_BEFORE_LONG_BREAK = 4;

/** Minimum focused minutes required to log an early finish. */
export const MIN_LOGGABLE_MINUTES = 1;

/**
 * A length in seconds as text: 42 -> "42s", 757 -> "12m 37s",
 * 3918 -> "1h 05m 18s".
 */
export function formatFocusDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (value: number) => String(value).padStart(2, '0');

  if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`;
  if (m > 0) return `${m}m ${pad(s)}s`;
  return `${s}s`;
}

/** Same as formatFocusDuration, for a length given in minutes. */
export const formatFocusMinutes = (minutes: number): string =>
  formatFocusDuration(minutes * 60);

export function getModeDurationSeconds(
  mode: FocusMode,
  customMinutes: number
): number {
  return mode === 'custom'
    ? customMinutes * 60
    : FOCUS_MODE_DURATIONS[mode];
}

export function isBreakMode(mode: FocusMode): boolean {
  return mode === 'shortBreak' || mode === 'longBreak';
}

export const FOCUS_MODES_CONFIG: {
  mode: FocusMode;
  label: string;
  description: string;
  icon: 'target' | 'layers' | 'sliders' | 'coffee' | 'sun';
  durationMin: number;
  isBreak: boolean;
}[] = [
  { mode: 'pomodoro', label: 'Pomodoro', description: 'Short, sharp sprint', icon: 'target', durationMin: 25, isBreak: false },
  { mode: 'deepWork', label: 'Deep Work', description: 'Long, uninterrupted block', icon: 'layers', durationMin: 50, isBreak: false },
  { mode: 'custom', label: 'Custom', description: 'Set your own length', icon: 'sliders', durationMin: 30, isBreak: false },
  { mode: 'shortBreak', label: 'Short Break', description: 'Quick reset', icon: 'coffee', durationMin: 5, isBreak: true },
  { mode: 'longBreak', label: 'Long Break', description: 'Full recharge', icon: 'sun', durationMin: 15, isBreak: true },
];

export const FOCUS_MODE_LABELS: Record<FocusMode, string> = {
  pomodoro: 'Pomodoro',
  deepWork: 'Deep Work',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
  custom: 'Custom',
};

/**
 * Fallback subject only. The real subject list comes from the subjects
 * the user typed in their own tasks (see FocusSetupModal).
 */
export const ACADEMIC_SUBJECTS: string[] = ['General Study'];

/**
 * Calendar events are stored as tasks with their category as the subject.
 * These names are categories, not school subjects.
 */
export const NON_SUBJECT_NAMES = [
  'general',
  'general study',
  'assignment',
  'exam',
  'class',
  'meeting',
  'personal',
  'focus session',
];

export function isRealSubject(value: string | null | undefined): boolean {
  const name = (value ?? '').trim().toLowerCase();
  return name.length > 0 && !NON_SUBJECT_NAMES.includes(name);
}

export const MOTIVATIONAL_AFFIRMATIONS: string[] = [
  'Deep work produces rare and valuable outcomes.',
  'Concentration is a muscle. Train it with every minute.',
  'No multitasking. One subject. Pure momentum.',
  'Your future self will thank you for this study session.',
  'Stay locked in. Master the material step by step.',
  'Small daily disciplines compound into academic mastery.',
];