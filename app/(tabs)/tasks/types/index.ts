import { Task, SubTask } from '@/app/services/localDb';

export type { Task, SubTask };

export type TaskSubTab = 'overview' | 'timeline' | 'subjects' | 'analytics';

export type TaskCategory = 'Academic' | 'Personal' | 'Projects' | 'Exams' | 'Activities';

export type TaskPriority = 'High' | 'Medium' | 'Low';

export type TaskDifficulty = 'Hard' | 'Medium' | 'Easy';

export type TaskRepeat = 'None' | 'Daily' | 'Weekly' | 'Monthly';

export interface TaskTheme {
  isDark: boolean;
  primaryBrown: string;
  successGreen: string;
  errorRed: string;
  warningOrange: string;
  bgTheme: string;
  textPrimary: string;
  textSecondary: string;
  cardBg: string;
  borderCol: string;
  inputBg: string;
}
