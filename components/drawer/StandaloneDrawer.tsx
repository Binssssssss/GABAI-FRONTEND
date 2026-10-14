import { usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/app/context/AuthContext';
import { useFocusLock } from '@/app/context/FocusLockContext';
import { useAppTheme } from '@/app/context/ThemeContext';
import { localDb } from '@/app/services/localDb';
import AppDrawer from '@/components/drawer/AppDrawer';

/**
 * The same side menu used by the main tabs, for screens that live outside
 * the (tabs) layout (e.g. Focus Session). Render it at the end of the
 * screen and control it with `isOpen` / `onClose`.
 */
interface StandaloneDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const countOpenNotes = () =>
  localDb.getNotes().filter((note) => !note.isArchived).length;

const countOpenTasks = () =>
  localDb.getTasks().filter((task) => !task.completed).length;

export default function StandaloneDrawer({
  isOpen,
  onClose,
}: StandaloneDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { colors: theme } = useAppTheme();
  const { isFocusLocked } = useFocusLock();

  const [notesCount, setNotesCount] = useState(countOpenNotes);
  const [tasksCount, setTasksCount] = useState(countOpenTasks);

  useEffect(() => {
    const unsubscribe = localDb.subscribe(() => {
      setNotesCount(countOpenNotes());
      setTasksCount(countOpenTasks());
    });

    return unsubscribe;
  }, []);

  const showFocusLockAlert = () => {
    Alert.alert(
      'Strict Focus Active',
      'Navigation is locked while your Strict Focus session is active. Finish your session before leaving.',
      [{ text: 'Continue Focusing', style: 'cancel' }],
    );
  };

  const handleNavigate = (route: string) => {
    onClose();

    if (isFocusLocked) {
      showFocusLockAlert();
      return;
    }

    // Already here: just close the menu.
    if (route === '/productivity' && pathname.includes('productivity')) {
      return;
    }

    router.replace(route as any);
  };

  const handleLogout = () => {
    if (isFocusLocked) {
      showFocusLockAlert();
      return;
    }

    onClose();

    Alert.alert('Log Out', 'Are you sure you want to log out of GabAi?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/(auth)/login/login');
          } catch (error) {
            console.error('Logout failed:', error);
            Alert.alert('Logout Failed', 'Unable to log out. Please try again.');
          }
        },
      },
    ]);
  };

  const isActiveRoute = (route: string) => pathname.includes(route);

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

  return (
    <AppDrawer
      isDrawerOpen={isOpen}
      closeDrawer={onClose}
      handleNavigate={handleNavigate}
      handleLogout={handleLogout}
      isActiveRoute={isActiveRoute}
      menuItems={menuItems}
      primaryBrown="#A97C50"
      successGreen={theme.success}
      errorRed={theme.danger}
      textPrimary={theme.text}
      textSecondary={theme.icon}
      cardBg={theme.surface}
      borderCol={theme.border}
    />
  );
}
