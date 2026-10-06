/**
 * GabAi app theme palette.
 * The app uses a single centralized theme source for both light and dark modes.
 */

import { Platform } from 'react-native';

const tintColor = '#A97C50';

export const Colors = {
  light: {
    background: '#FFFFFF',
    card: '#F8FAFC',
    surface: '#F8FAFC',
    surfaceStrong: '#F3F4F6',
    subtleSurface: 'rgba(169, 124, 80, 0.08)',
    border: '#E5E7EB',
    text: '#171717',
    secondaryText: '#6B7280',
    icon: '#6B7280',
    primary: '#A97C50',
    tint: tintColor,
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColor,
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
  },
  dark: {
    background: '#121212',
    card: '#1E1E1E',
    surface: '#1E1E1E',
    surfaceStrong: '#242424',
    subtleSurface: 'rgba(169, 124, 80, 0.12)',
    border: '#2E2E2E',
    text: '#ECEDEE',
    secondaryText: '#9BA1A6',
    icon: '#9BA1A6',
    primary: '#A97C50',
    tint: tintColor,
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColor,
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
