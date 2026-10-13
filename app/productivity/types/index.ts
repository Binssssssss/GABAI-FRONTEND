export type FocusMode = 'pomodoro' | 'deepWork' | 'shortBreak' | 'longBreak' | 'custom';

export type BreakMode = Extract<FocusMode, 'shortBreak' | 'longBreak'>;

export interface FocusTaskRef {
  id: string;
  title: string;
  subject: string;
}

export interface FocusSessionRecord {
  id: string;
  subject: string;
  taskTitle?: string;
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

/** Settings chosen in the session setup modal. */
export interface FocusSessionConfig {
  mode: FocusMode;
  customMinutes: number;
  subject: string;
  task: FocusTaskRef | null;
  isStrict: boolean;
}

/** Theme colors shared by the focus timer components. */
export interface FocusPalette {
  primary: string;
  onPrimary: string;
  background: string;
  card: string;
  cardStrong: string;
  border: string;
  text: string;
  subtext: string;
  danger: string;
  success: string;
}

/** Summary shown after a focus session is logged. */
export interface FocusCompletion {
  durationMinutes: number;
  subject: string;
  taskTitle?: string;
  isStrict: boolean;
  suggestedBreak: BreakMode;
}
