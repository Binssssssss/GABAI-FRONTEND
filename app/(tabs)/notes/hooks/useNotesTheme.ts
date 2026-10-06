import { useAppTheme } from '@/app/context/ThemeContext';
import { NotesTheme } from '../types';

export function useNotesTheme(): NotesTheme {
  const { colorScheme, colors } = useAppTheme();
  const isDark = colorScheme === 'dark';

  return {
    isDark,

    // GabAi Brand
    primaryBrown: '#A97C50',
    successGreen: colors.success,

    // Theme Colors
    bgTheme: colors.background,
    textPrimary: colors.text,
    textSecondary: colors.icon,
    cardBg: colors.surface,
    borderCol: colors.border,
    inputBg: isDark ? colors.subtleSurface : colors.surfaceStrong,
  };
}