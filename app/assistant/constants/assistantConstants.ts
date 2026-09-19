import { SuggestionChipItem, QuickActionItem } from '../types';

export const SUGGESTION_CHIPS: SuggestionChipItem[] = [
  { text: 'How many tasks do I have today?', icon: 'check-square' },
  { text: 'What is my next class?', icon: 'book-open' },
  { text: 'How much did I spend this week?', icon: 'dollar-sign' },
  { text: 'Show upcoming deadlines.', icon: 'clock' },
  { text: 'What should I focus on today?', icon: 'target' },
  { text: 'Open my calendar.', icon: 'calendar' },
];

export const SUGGESTED_QUESTIONS: string[] = [
  'What should I work on first today?',
  'Do I have overdue tasks?',
  'How much have I spent this month?',
  'Show tomorrow\'s schedule.',
  'Which subject has the most assignments?',
  'How many classes do I have today?',
];

export const QUICK_ACTIONS: QuickActionItem[] = [
  { label: 'Tasks', query: 'List today\'s tasks' },
  { label: 'Schedule', query: 'Show today\'s schedule' },
  { label: 'Calendar', query: 'Open calendar' },
  { label: 'Expenses', query: 'How much did I spend this week?' },
  { label: 'Focus Session', query: 'Start focus session' },
  { label: 'Notes', query: 'Open notepad' },
  { label: 'Analytics', query: 'Show productivity statistics' },
];
