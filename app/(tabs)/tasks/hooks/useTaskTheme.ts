import { useAppTheme } from '@/app/context/ThemeContext';
import { TaskTheme } from '../types';

export function useTaskTheme(): TaskTheme {
  const { colorScheme, colors } = useAppTheme();
  const isDark = colorScheme === 'dark';

  return {
    isDark,

    // GabAi Brand
    primaryBrown: '#A97C50',
    successGreen: colors.success,
    errorRed: colors.danger,
    warningOrange: colors.warning,

    // Theme Colors
    bgTheme: colors.background,
    textPrimary: colors.text,
    textSecondary: colors.icon,
    cardBg: colors.surface,
    borderCol: colors.border,
    inputBg: isDark ? colors.subtleSurface : colors.surfaceStrong,
  };
}