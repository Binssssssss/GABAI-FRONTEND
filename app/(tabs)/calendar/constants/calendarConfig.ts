import { EventCategory } from '../types';

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  Assignment: '#38BDF8', // Sky Blue
  Exam: '#F87171', // Soft Red
  Class: '#C084FC', // Lavender
  Meeting: '#FB923C', // Warm Orange
  Personal: '#4ADE80', // Pastel Green
};

export const CALENDAR_CATEGORIES: ('All' | EventCategory)[] = [
  'All',
  'Assignment',
  'Exam',
  'Class',
  'Meeting',
  'Personal',
];

export const DAYS_IN_JULY_2026 = 31;
export const START_OFFSET_JULY_2026 = 3; // Sun, Mon, Tue are blank offset cells
export const TOTAL_GRID_CELLS = 35; // 5 rows of 7

export const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const WEEK_DAYS_DATA = [
  { label: 'Sun', date: '19', full: '2026-07-19' },
  { label: 'Mon', date: '20', full: '2026-07-20' },
  { label: 'Tue', date: '21', full: '2026-07-21' },
  { label: 'Wed', date: '22', full: '2026-07-22' },
  { label: 'Thu', date: '23', full: '2026-07-23' },
  { label: 'Fri', date: '24', full: '2026-07-24' },
  { label: 'Sat', date: '25', full: '2026-07-25' },
];

export const DAY_HOURS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

export const REMINDER_OPTIONS = [
  '15 minutes before',
  '30 minutes before',
  '1 hour before',
  '1 day before',
];
