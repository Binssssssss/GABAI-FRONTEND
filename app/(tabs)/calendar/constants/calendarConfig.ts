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

export const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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
