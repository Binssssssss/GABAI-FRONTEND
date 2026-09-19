export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export type EventCategory = 'Assignment' | 'Exam' | 'Class' | 'Meeting' | 'Personal';
export type EventPriority = 'High' | 'Medium' | 'Low';
export type CalendarViewMode = 'month' | 'week' | 'day';

export interface CalendarEvent {
  id: string;
  title: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  priority: EventPriority;
  isAllDay: boolean;
  hasReminder: boolean;
  reminderTime: string; // e.g. "15 minutes before"
  isRecurring: boolean;
  recurrenceRule: string; // "Daily" | "Weekly" | ""
  progress: number; // 0 - 100
  checklist: ChecklistItem[];
  description?: string;
}

export interface PriorityColorConfig {
  text: string;
  bg: string;
  dot: string;
}
