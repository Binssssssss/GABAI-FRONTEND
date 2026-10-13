import {
  TaskCategory,
  TaskPriority,
  TaskRepeat,
} from '../types';

/**
 * Task categories
 *
 * NOTE:
 * The current backend Task model does not store a separate
 * category field. The backend currently uses `subject` as the
 * task category when formatting calendar/task responses.
 *
 * These values can still be used by the frontend UI for
 * task creation/filtering, but should not be expected to
 * persist as a separate database field.
 */
export const CATEGORIES: TaskCategory[] = [
  'Academic',
  'Personal',
  'Projects',
  'Exams',
  'Activities',
];

/**
 * Available subjects
 *
 * Keep these aligned with the subjects currently used by
 * the GabAi task data.
 */
export const SUBJECTS: string[] = [
  'Database',
  'Capstone Paper',
  'Economics with Taxation',
  'Technopreneurship',
  'Ethics',
  'General',
];

/**
 * Task filters supported by the current frontend/backend setup.
 *
 * Difficulty and Category are excluded because the current
 * backend Task model does not have dedicated fields for them.
 */
export const FILTERS: string[] = [
  'All',
  'Today',
  'Tomorrow',
  'Priority',
  'Subject',
  'Recently Added',
  'Longest Pending',
  'Completed',
];

/**
 * Supported task priorities
 */
export const PRIORITIES: TaskPriority[] = [
  'Low',
  'Medium',
  'High',
];

/**
 * Repeat options
 *
 * These are currently frontend options only.
 * The current backend Task model does not persist recurrence.
 */
export const REPEAT_OPTIONS: TaskRepeat[] = [
  'None',
  'Daily',
  'Weekly',
  'Monthly',
];