import { useAppTheme } from '@/app/context/ThemeContext';

import { ProfileTheme } from '../types';

export function useProfileTheme(): ProfileTheme {
  const { colorScheme } = useAppTheme();

  const isDark = colorScheme === 'dark';

  return {
    isDark,
    primaryAccent: '#A97C50',
    errorRed: '#EF4444',

    bgTheme: isDark ? '#121212' : '#FFFFFF',

    textTheme: isDark
      ? '#ECEDEE'
      : '#11181C',

    textSubTheme: isDark
      ? '#9BA1A6'
      : '#666666',

    cardTheme: isDark
      ? '#1E1E1E'
      : '#F8FAFC',

    borderTheme: isDark
      ? '#2E2E2E'
      : '#E2E8F0',
  };
}