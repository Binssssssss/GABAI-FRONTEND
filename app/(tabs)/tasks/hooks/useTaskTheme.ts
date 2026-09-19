import { useAppTheme } from '@/app/context/ThemeContext';
import { TaskTheme } from '../types';

export function useTaskTheme(): TaskTheme {
  const { colorScheme } = useAppTheme();

  const isDark = colorScheme === 'dark';

  return {
    isDark,

    // GabAi Brand
    primaryBrown: '#A97C50',
    successGreen: '#10B981',
    errorRed: '#EF4444',
    warningOrange: '#F59E0B',

    // Theme Colors
    bgTheme: isDark ? '#121212' : '#FFFFFF',
    textPrimary: isDark ? '#ECEDEE' : '#11181C',
    textSecondary: isDark ? '#9BA1A6' : '#666666',
    cardBg: isDark ? '#1E1E1E' : '#F8FAFC',
    borderCol: isDark ? '#2E2E2E' : '#E2E8F0',
    inputBg: isDark ? '#181818' : '#FFFFFF',
  };
}