import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';

import api from '@/app/services/api';
import { useAuth } from '@/app/context/AuthContext';

import { UserProfile, ProfileStatItem } from '../types';

// Where each stat card goes when tapped.
const STAT_ROUTES: Record<string, string> = {
  tasks: '/(tabs)/tasks/task',
  events: '/(tabs)/calendar/calendar',
  budget: '/(tabs)/expenses/expenses',
};

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatPeso = (amount: number): string => {
  const formatted = Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? '-' : ''}₱${formatted}`;
};

// Same response handling as useTaskData.
const extractTaskList = (responseData: any): any[] => {
  if (Array.isArray(responseData?.data)) return responseData.data;
  if (Array.isArray(responseData?.tasks)) return responseData.tasks;
  if (Array.isArray(responseData)) return responseData;
  return [];
};

export function useProfileData() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [netBalance, setNetBalance] = useState(0);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // ------------------------------------------------------
  // USER PROFILE
  // ------------------------------------------------------

  // Derived from `user` during render (no effect + setState needed).
  const userProfile: UserProfile = useMemo(() => {
    const currentUser = user || {};

    const name = String(
      currentUser.name ||
        currentUser.fullName ||
        currentUser.userName ||
        currentUser.email ||
        '',
    );

    return {
      name,
      email: String(currentUser.email || ''),
      course: String(currentUser.course || ''),
      initials: name
        .split(' ')
        .filter(Boolean)
        .map((part: string) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    };
  }, [user]);

  // ------------------------------------------------------
  // LOAD STATS FROM BACKEND
  // ------------------------------------------------------

  const loadStats = useCallback(async () => {
    setIsStatsLoading(true);

    // Run both requests together; one failing shouldn't blank the other.
    const [tasksResult, balanceResult] = await Promise.allSettled([
      api.get('/tasks'),
      api.get('/transactions/balance'),
    ]);

    // Tasks Done + Events (calendar events are tasks with due dates)
    if (tasksResult.status === 'fulfilled') {
      const tasks = extractTaskList(tasksResult.value.data);
      const todayStr = formatLocalDate(new Date());

      setCompletedTasksCount(
        tasks.filter((task) => Boolean(task?.completed)).length,
      );

      setEventsCount(
        tasks.filter((task) => {
          const dueDate = String(task?.dueDate ?? '').slice(0, 10);
          return !task?.completed && dueDate !== '' && dueDate >= todayStr;
        }).length,
      );
    } else {
      console.error('Profile: failed to load tasks:', tasksResult.reason);
    }

    // Budget (same endpoint as the Expenses wallet card)
    if (balanceResult.status === 'fulfilled') {
      const data = balanceResult.value.data?.data;
      setNetBalance(Number(data?.netBalance) || 0);
    } else if (balanceResult.reason?.response?.status === 404) {
      setNetBalance(0); // no transactions yet
    } else {
      console.error('Profile: failed to load balance:', balanceResult.reason);
    }

    setIsStatsLoading(false);
  }, []);

  // Reload every time the Profile tab comes into view,
  // so changes made in Tasks / Calendar / Expenses show up.
  useFocusEffect(
    useCallback(() => {
      void loadStats();
    }, [loadStats]),
  );

  // ------------------------------------------------------
  // STAT CARDS
  // ------------------------------------------------------

  const stats: ProfileStatItem[] = useMemo(
    () => [
      {
        id: 'tasks',
        label: 'Tasks Done',
        value: isStatsLoading ? '…' : completedTasksCount.toString(),
        icon: 'check-square',
      },
      {
        id: 'events',
        label: 'Events',
        value: isStatsLoading ? '…' : eventsCount.toString(),
        icon: 'calendar',
      },
      {
        id: 'budget',
        label: 'Budget',
        value: isStatsLoading ? '…' : formatPeso(netBalance),
        icon: 'credit-card',
      },
    ],
    [isStatsLoading, completedTasksCount, eventsCount, netBalance],
  );

  const handleStatPress = useCallback(
    (statId: string) => {
      const route = STAT_ROUTES[statId];
      if (route) {
        router.push(route as any);
      }
    },
    [router],
  );

  // ------------------------------------------------------
  // LOGOUT
  // ------------------------------------------------------

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of GabAi?',
      [
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
              Alert.alert(
                'Logout Error',
                'Something went wrong while logging out. Please try again.',
              );
            }
          },
        },
      ],
      { cancelable: true },
    );
  }, [router, signOut]);

  return {
    userProfile,
    stats,
    isStatsLoading,
    refreshStats: loadStats,
    handleStatPress,
    handleLogout,
  };
}