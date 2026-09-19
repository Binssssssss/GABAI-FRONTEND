import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Tabs, usePathname, useRouter } from 'expo-router';
import React, {
  useEffect,
  useState,
} from 'react';
import {
  Alert,
  StyleSheet,
  View,
} from 'react-native';

import { localDb } from '@/app/services/localDb';
import FloatingAssistant from '@/components/FloatingAssistant';

import AppDrawer from '@/components/drawer/AppDrawer';

import {
  DrawerContext,
  useDrawer,
} from '@/app/context/DrawerContext';

export { useDrawer };

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();

  // Theme
  const colorScheme =
    useColorScheme() ?? 'light';

  const theme =
    colorScheme === 'dark'
      ? Colors.dark
      : Colors.light;

  const primaryBrown = '#A97C50';
  const successGreen = '#10B981';
  const errorRed = '#EF4444';

  const bgTheme = theme.background;
  const textPrimary = theme.text;
  const textSecondary = theme.icon;

  const cardBg =
    colorScheme === 'dark'
      ? '#1E1E1E'
      : '#F8FAFC';

  const borderCol =
    colorScheme === 'dark'
      ? '#2E2E2E'
      : '#E2E8F0';

  // Counts
  const [notesCount, setNotesCount] =
    useState(() =>
      localDb
        .getNotes()
        .filter((n) => !n.isArchived).length
    );

  const [tasksCount, setTasksCount] =
    useState(() =>
      localDb
        .getTasks()
        .filter((t) => !t.completed).length
    );

  useEffect(() => {
    const unsubscribe = localDb.subscribe(() => {
      setNotesCount(
        localDb
          .getNotes()
          .filter((n) => !n.isArchived).length
      );

      setTasksCount(
        localDb
          .getTasks()
          .filter((t) => !t.completed).length
      );
    });

    return unsubscribe;
  }, []);

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] =
    useState(false);

  const openDrawer = () => {
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleNavigate = (route: string) => {
    closeDrawer();
    router.replace(route as any);
  };

  const handleLogout = () => {
    closeDrawer();

    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of GabAi?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () =>
            router.replace(
              '/(auth)/login/login'
            ),
        },
      ]
    );
  };

  const isActiveRoute = (route: string) =>
    pathname.includes(route);

  const menuItems = [
    {
      label: 'Dashboard',
      icon: 'grid' as const,
      route: '/(tabs)/dashboard/dashboard',
      active: isActiveRoute('dashboard'),
    },
    {
      label: 'Task Manager',
      icon: 'check-square' as const,
      route: '/(tabs)/tasks/task',
      active: isActiveRoute('tasks'),
      badge: tasksCount,
    },
    {
      label: 'Notes',
      icon: 'file-text' as const,
      route: '/(tabs)/notes/notes',
      active: isActiveRoute('notes'),
      badge: notesCount,
    },
    {
      label: 'Calendar',
      icon: 'calendar' as const,
      route: '/(tabs)/calendar/calendar',
      active: isActiveRoute('calendar'),
    },
    {
      label: 'Expenses',
      icon: 'credit-card' as const,
      route: '/(tabs)/expenses/expenses',
      active: isActiveRoute('expenses'),
    },
    {
      label: 'Focus Session',
      icon: 'target' as const,
      route: '/productivity',
      active: pathname.includes('productivity'),
    },
    {
      label: 'Virtual Assistant',
      icon: 'message-square' as const,
      route: '/assistant',
      active: pathname.includes('assistant'),
    },
  ];

  return (
    <DrawerContext.Provider
      value={{
        openDrawer,
        closeDrawer,
        isDrawerOpen,
      }}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: bgTheme,
          },
        ]}
      >
        {/* Tabs */}
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              display: 'none',
            },
          }}
        >
          <Tabs.Screen name="dashboard/dashboard" />
          <Tabs.Screen name="calendar/calendar" />
          <Tabs.Screen name="tasks/task" />
          <Tabs.Screen name="notes/notes" />
          <Tabs.Screen name="expenses/expenses" />
          <Tabs.Screen name="profile/profile" />
        </Tabs>

        {/* Floating Assistant */}
        <FloatingAssistant />

        {/* Side Drawer */}
        <AppDrawer
          isDrawerOpen={isDrawerOpen}
          closeDrawer={closeDrawer}
          handleNavigate={handleNavigate}
          handleLogout={handleLogout}
          isActiveRoute={isActiveRoute}
          menuItems={menuItems}
          primaryBrown={primaryBrown}
          successGreen={successGreen}
          errorRed={errorRed}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          cardBg={cardBg}
          borderCol={borderCol}
        />
      </View>
    </DrawerContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});