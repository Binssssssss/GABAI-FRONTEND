import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { Stack, useSegments, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ThemeProvider, useAppTheme } from '@/app/context/ThemeContext';
import { AuthProvider, useAuth } from '@/app/context/AuthContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigation />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppNavigation() {
  const { colorScheme } = useAppTheme();
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const isAuthRoute = segments[0] === '(auth)';
    const isAppRoute = segments[0] === '(tabs)' || segments[0] === 'assistant' || segments[0] === 'productivity';

    if (!session && isAppRoute) {
      router.replace('/(auth)/login/login');
    } else if (session && (segments[0] === undefined || isAuthRoute)) {
      router.replace('/(tabs)/dashboard/dashboard');
    }
  }, [isLoading, router, segments, session]);

  if (isLoading) return null;

  return (
    <NavigationThemeProvider
      value={
        colorScheme === 'dark'
          ? DarkTheme
          : DefaultTheme
      }
    >
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="productivity/index"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />

        <Stack.Screen
          name="calendar"
          options={{
            presentation: 'modal',
            title: 'Calendar',
          }}
        />

        <Stack.Screen
          name="assistant/index"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>

      <StatusBar
        style={colorScheme === 'dark' ? 'light' : 'dark'}
      />
    </NavigationThemeProvider>
  );
}