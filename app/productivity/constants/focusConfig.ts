import { FocusMode, AmbientSound } from '../types';

export const FOCUS_MODE_DURATIONS: Record<FocusMode, number> = {
  pomodoro: 25 * 60, // 25 min
  deepWork: 50 * 60, // 50 min
  shortBreak: 5 * 60, // 5 min
  longBreak: 15 * 60, // 15 min
  custom: 30 * 60, // 30 min
};

export const FOCUS_MODES_CONFIG: { mode: FocusMode; label: string; durationMin: number; isBreak: boolean }[] = [
  { mode: 'pomodoro', label: 'Pomodoro', durationMin: 25, isBreak: false },
  { mode: 'deepWork', label: 'Deep Work', durationMin: 50, isBreak: false },
  { mode: 'shortBreak', label: 'Short Break', durationMin: 5, isBreak: true },
  { mode: 'longBreak', label: 'Long Break', durationMin: 15, isBreak: true },
];

export const ACADEMIC_SUBJECTS: string[] = [
  'Capstone Paper',
  'Algorithms & Complexity',
  'Database Systems',
  'Economics',
  'Technopreneurship',
  'Ethics',
  'General Study',
];

export const AMBIENT_SOUNDS: { id: AmbientSound; label: string; icon: string }[] = [
  { id: 'none', label: 'Mute', icon: 'volume-x' },
  { id: 'rain', label: 'Rain', icon: 'cloud-rain' },
  { id: 'library', label: 'Library', icon: 'book' },
  { id: 'cafe', label: 'Café', icon: 'coffee' },
  { id: 'waves', label: 'Waves', icon: 'wind' },
  { id: 'whitenoise', label: 'White Noise', icon: 'activity' },
];

export const MOTIVATIONAL_AFFIRMATIONS: string[] = [
  'Deep work produces rare and valuable outcomes.',
  'Concentration is a muscle. Train it with every minute.',
  'No multitasking. One subject. Pure momentum.',
  'Your future self will thank you for this study session.',
  'Stay locked in. Master the material step by step.',
  'Small daily disciplines compound into academic mastery.',
];
