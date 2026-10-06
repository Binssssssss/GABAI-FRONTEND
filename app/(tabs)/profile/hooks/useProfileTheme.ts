import { useAppTheme } from '@/app/context/ThemeContext';

import { ProfileTheme } from '../types';

export function useProfileTheme(): ProfileTheme {
  const { colorScheme, colors } = useAppTheme();
  const isDark = colorScheme === 'dark';

  return {
    isDark,
    primaryAccent: '#A97C50',
    errorRed: colors.danger,

    bgTheme: colors.background,

    textTheme: colors.text,

    textSubTheme: colors.icon,

    cardTheme: colors.surface,

    borderTheme: colors.border,
  };
}