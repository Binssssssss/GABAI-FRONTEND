import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';

type ThemeMode = 'system' | 'light' | 'dark';
type ResolvedColorScheme = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colorScheme: ResolvedColorScheme;
  colors: typeof Colors.light;
}

const ThemeContext = createContext<
  ThemeContextType | undefined
>(undefined);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const systemColorScheme =
    useColorScheme() ?? 'light';

  const [themeMode, setThemeModeState] =
    useState<ThemeMode>('system');

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme =
          await AsyncStorage.getItem('gabai-theme');

        if (
          savedTheme === 'light' ||
          savedTheme === 'dark' ||
          savedTheme === 'system'
        ) {
          setThemeModeState(savedTheme);
        }
      } catch (error) {
        console.log('Failed to load theme:', error);
      } finally {
        setLoaded(true);
      }
    };

    loadTheme();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);

    try {
      await AsyncStorage.setItem('gabai-theme', mode);
    } catch (error) {
      console.log('Failed to save theme:', error);
    }
  };

  const colorScheme: ResolvedColorScheme =
    themeMode === 'system'
      ? resolvedSystemColorScheme
      : themeMode === 'dark'
        ? 'dark'
        : 'light';

  const colors =
    colorScheme === 'dark'
      ? Colors.dark
      : Colors.light;

  if (!loaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        colorScheme,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useAppTheme must be used inside ThemeProvider'
    );
  }

  return context;
}