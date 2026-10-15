
import { useAppTheme } from '@/app/context/ThemeContext';
import { useFocusLock } from '@/app/context/FocusLockContext';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { AppAlert } from '@/components/AppAlert';

import { localDb } from '@/app/services/localDb';
import FloatingAssistant from '@/components/FloatingAssistant';
import AppDrawer from '@/components/drawer/AppDrawer';

import { useAuth } from '@/app/context/AuthContext';
import {
  DrawerContext,
} from '@/app/context/DrawerContext';

export { useDrawer } from '@/app/context/DrawerContext';

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { colors: theme } = useAppTheme();
  const { isFocusLocked } = useFocusLock();

  const primaryBrown = '#A97C50';
  const successGreen = theme.success;
  const errorRed = theme.danger;

  const bgTheme = theme.background;
  const textPrimary = theme.text;
  const textSecondary = theme.icon;
  const cardBg = theme.surface;
  const borderCol = theme.border;

  // Counts
  const [notesCount, setNotesCount] = useState(
    () =>
      localDb
        .getNotes()
        .filter((note) => !note.isArchived).length
  );

  const [tasksCount, setTasksCount] = useState(
    () =>
      localDb
        .getTasks()
        .filter((task) => !task.completed).length
  );

  useEffect(() => {
    const unsubscribe = localDb.subscribe(() => {
      setNotesCount(
        localDb
          .getNotes()
          .filter((note) => !note.isArchived).length
      );

      setTasksCount(
        localDb
          .getTasks()
          .filter((task) => !task.completed).length
      );
    });

    return unsubscribe;
  }, []);

  // Shared navigation lock warning
  const showFocusLockAlert = () => {
    AppAlert.alert(
      'Strict Focus Active',
      'Navigation is locked while your Strict Focus session is active. Finish your session before leaving.',
      [{ text: 'Continue Focusing', style: 'cancel' }]
    );
  };

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => {
    if (isFocusLocked) {
      showFocusLockAlert();
      return;
    }

    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleNavigate = (route: string) => {
    if (isFocusLocked) {
      closeDrawer();
      showFocusLockAlert();
      return;
    }

    closeDrawer();
    router.replace(route as any);
  };

  const handleLogout = () => {
    if (isFocusLocked) {
      showFocusLockAlert();
      return;
    }

    closeDrawer();

    AppAlert.alert(
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
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/login/login');
            } catch (error) {
              console.error('Logout failed:', error);
              AppAlert.alert(
                'Logout Failed',
                'Unable to log out. Please try again.'
              );
            }
          },
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
      label: 'Wallet',
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
      label: 'GabAi',
      icon: 'message-square' as const,
      route: '/assistant',
      active: pathname.includes('assistant'),
    },
  ];

  // Prevent tab presses while Strict Focus is locked.
  const guardTabPress = (event: { preventDefault: () => void }) => {
    if (isFocusLocked) {
      event.preventDefault();
      showFocusLockAlert();
    }
  };

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
          { backgroundColor: bgTheme },
        ]}
      >
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              display: 'none',
            },
          }}
        >
          <Tabs.Screen
            name="dashboard/dashboard"
            listeners={{ tabPress: guardTabPress }}
          />

          <Tabs.Screen
            name="calendar/calendar"
            listeners={{ tabPress: guardTabPress }}
          />

          <Tabs.Screen
            name="tasks/task"
            listeners={{ tabPress: guardTabPress }}
          />

          <Tabs.Screen
            name="notes/notes"
            listeners={{ tabPress: guardTabPress }}
          />

          <Tabs.Screen
            name="expenses/expenses"
            listeners={{ tabPress: guardTabPress }}
          />

          <Tabs.Screen
            name="profile/profile"
            listeners={{ tabPress: guardTabPress }}
          />
        </Tabs>

        {/* Hide the assistant shortcut during Strict Focus */}
        {!isFocusLocked && <FloatingAssistant />}

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
