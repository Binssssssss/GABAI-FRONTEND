import { SuggestionChipItem, QuickActionItem } from '../types';

export const SUGGESTION_CHIPS: SuggestionChipItem[] = [
  { text: 'How many tasks do I have today?', icon: 'check-square' },
  { text: 'What is my next class?', icon: 'book-open' },
  { text: 'How much did I spend this week?', icon: 'dollar-sign' },
  { text: 'Show upcoming deadlines.', icon: 'clock' },
  { text: 'What should I focus on today?', icon: 'target' },
  { text: 'Show my schedule for today.', icon: 'calendar' },
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
  { key: 'tasks', label: 'Tasks', icon: 'check-square' },
  { key: 'schedule', label: 'Schedule', icon: 'calendar' },
  { key: 'wallet', label: 'Wallet', icon: 'credit-card' },
  { key: 'focus', label: 'Focus Session', icon: 'target' },
  { key: 'notes', label: 'Notes', icon: 'file-text' },
];

/** Conversation starters on Gab's welcome screen (label shown, message sent). */
export const GAB_STARTERS: { label: string; message: string }[] = [
  { label: '📋 Plan my day', message: 'Help me plan my day based on my tasks and schedule.' },
  { label: "😮‍💨 I'm stressed", message: "I'm feeling stressed about school." },
  { label: '💪 Motivate me', message: 'Motivate me to study.' },
  { label: "⏰ What's due soon?", message: "What's due soon?" },
  { label: "💸 How's my budget?", message: "How's my budget this week?" },
  { label: '🎯 Help me focus', message: 'Help me focus. What should I work on first?' },
];
