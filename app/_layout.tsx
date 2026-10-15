
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from 'expo-router/react-navigation';
import {
  Stack,
  useRouter,
  useSegments,
} from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { FocusLockProvider } from '@/app/context/FocusLockContext';
import { ThemeProvider, useAppTheme } from '@/app/context/ThemeContext';
import { AuthProvider, useAuth } from '@/app/context/AuthContext';
import { useNotificationTapRouting } from '@/app/services/notificationTapHandler';
import { AppAlertHost } from '../components/AppAlert';
import AppLockGate from '@/components/AppLockGate';

function createGabaiNavigationTheme(
  colorScheme: 'light' | 'dark',
  colors: any
) {
  const baseTheme =
    colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      background: colors.background,
      card: colors.card,
      border: colors.border,
      text: colors.text,
      primary: colors.primary,
      notification: colors.primary,
    },
  };
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        {/* App Lock (Privacy & Security): covers the app until unlocked. */}
        <AppLockGate>
          <FocusLockProvider>
            <AppNavigation />
          </FocusLockProvider>
        </AppLockGate>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppNavigation() {
  const {
    colorScheme,
    colors,
  } = useAppTheme();

  const {
    session,
    isLoading,
  } = useAuth();

  const segments = useSegments();
  const router = useRouter();

  // Tapping a notification opens its screen (only when logged in).
  useNotificationTapRouting(!!session && !isLoading);

  useEffect(() => {
    if (isLoading) {
      return;
    }


    const isAuthRoute = segments[0] === '(auth)';

    const isAppRoute =
      segments[0] === '(tabs)' ||
      segments[0] === 'assistant' ||
      segments[0] === 'productivity';

    if (!session && isAppRoute) {
      router.replace('/(auth)/login/login');
    } else if (
      session &&
      (segments[0] === undefined || isAuthRoute)
    ) {
      router.replace('/(tabs)/dashboard/dashboard');
    }

    if (
      session &&
      (segments[0] === undefined ||
        isAuthRoute)
    ) {
      router.replace(
        '/(tabs)/dashboard/dashboard',
      );
    }
  }, [
    isLoading,
    router,
    segments,
    session,
  ]);

  if (isLoading) {
    return null;
  }

  return (
    <NavigationThemeProvider
      value={createGabaiNavigationTheme(
        colorScheme,
        colors,
      )}
    >
      <Stack>
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(auth)"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="productivity/index"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />

        <Stack.Screen
          name="settings/notifications"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="settings/privacy"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="settings/profile"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="activity-history"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="completed-tasks"
          options={{
            headerShown: false,
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

      {/* GabAi-styled alerts (AppAlert.alert) show here. */}
      <AppAlertHost />

      <StatusBar
        style={
          colorScheme === 'dark'
            ? 'light'
            : 'dark'
        }
      />
    </NavigationThemeProvider>
  );
}
