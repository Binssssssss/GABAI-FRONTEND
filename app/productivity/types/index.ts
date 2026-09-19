export type FocusMode = 'pomodoro' | 'deepWork' | 'shortBreak' | 'longBreak' | 'custom';

export type AmbientSound = 'none' | 'rain' | 'library' | 'cafe' | 'waves' | 'whitenoise';

export interface FocusSessionRecord {
  id: string;
  subject: string;
  durationMinutes: number;
  mode: FocusMode;
  completedAt: string;
  isStrict: boolean;
}

export interface FocusStats {
  todayMinutes: number;
  todaySessions: number;
  streakDays: number;
  totalHours: number;
}
