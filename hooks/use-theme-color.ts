/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ThemeName = 'light' | 'dark';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const resolvedTheme: ThemeName =
    useColorScheme() === 'dark' ? 'dark' : 'light';
  const colorFromProps = props[resolvedTheme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[resolvedTheme][colorName];
}
