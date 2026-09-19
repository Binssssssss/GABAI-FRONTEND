import { TaskCategory, TaskPriority, TaskDifficulty, TaskRepeat } from '../types';

export const CATEGORIES: TaskCategory[] = [
  'Academic',
  'Personal',
  'Projects',
  'Exams',
  'Activities',
];

export const SUBJECTS: string[] = [
  'Capstone Paper',
  'Economics with Taxation',
  'Technopreneurship',
  'Ethics',
  'General',
];

export const FILTERS: string[] = [
  'All',
  'Today',
  'Tomorrow',
  'Priority',
  'Difficulty',
  'Subject',
  'Category',
  'Recently Added',
  'Longest Pending',
  'Completed',
];

export const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High'];

export const DIFFICULTIES: TaskDifficulty[] = ['Easy', 'Medium', 'Hard'];

export const REPEAT_OPTIONS: TaskRepeat[] = ['None', 'Daily', 'Weekly', 'Monthly'];
