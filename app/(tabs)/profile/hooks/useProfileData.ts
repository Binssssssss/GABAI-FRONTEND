import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { localDb } from '@/app/services/localDb';
import { DEFAULT_USER_PROFILE } from '../constants/profileConfig';
import { UserProfile, ProfileStatItem } from '../types';

export function useProfileData() {
  const router = useRouter();
  const [userProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);

  // Sync state from central database
  const [tasks, setTasks] = useState(() => localDb.getTasks());
  const [events, setEvents] = useState(() => localDb.getEvents());
  const [transactions, setTransactions] = useState(() => localDb.getTransactions());

  useEffect(() => {
    const unsubscribe = localDb.subscribe(() => {
      setTasks(localDb.getTasks());
      setEvents(localDb.getEvents());
      setTransactions(localDb.getTransactions());
    });
    return unsubscribe;
  }, []);

  // Compute live stats
  const completedTasksCount = useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);
  const eventsCount = useMemo(() => events.length, [events]);

  const walletBalance = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, item) => sum + item.amount, 0);
    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, item) => sum + item.amount, 0);
    return income - expense;
  }, [transactions]);

  const stats: ProfileStatItem[] = useMemo(
    () => [
      {
        id: 'tasks',
        label: 'Tasks Done',
        value: completedTasksCount.toString(),
        icon: 'check-square',
      },
      {
        id: 'events',
        label: 'Events',
        value: eventsCount.toString(),
        icon: 'calendar',
      },
      {
        id: 'budget',
        label: 'Budget',
        value: `₱${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: 'credit-card',
      },
    ],
    [completedTasksCount, eventsCount, walletBalance]
  );

  const handleLogout = useCallback(() => {
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
          onPress: () => {
            router.replace('/(auth)/login/login');
          },
        },
      ],
      { cancelable: true }
    );
  }, [router]);

  return {
    userProfile,
    stats,
    handleLogout,
  };
}
