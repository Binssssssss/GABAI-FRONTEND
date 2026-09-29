import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { localDb } from '@/app/services/localDb';
import { useAuth } from '@/app/context/AuthContext';

import { UserProfile, ProfileStatItem } from '../types';

const EMPTY_USER_PROFILE: UserProfile = {
  name: '',
  email: '',
  course: '',
  initials: '',
};

export function useProfileData() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [userProfile, setUserProfile] =
    useState<UserProfile>(EMPTY_USER_PROFILE);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const currentUser = user || {};

        const name = String(
          currentUser.name ||
            currentUser.fullName ||
            currentUser.userName ||
            currentUser.email ||
            '',
        );

        setUserProfile({
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
        });

        console.log('CURRENT STORED USER:', currentUser);
      } catch (error) {
        console.error(
          'Failed to load stored user:',
          error,
        );
      }
    };

    loadUserProfile();
  }, [user]);

  // Sync state from central local database.
  const [tasks, setTasks] = useState(() =>
    localDb.getTasks(),
  );

  const [events, setEvents] = useState(() =>
    localDb.getEvents(),
  );

  const [transactions, setTransactions] = useState(() =>
    localDb.getTransactions(),
  );

  useEffect(() => {
    const unsubscribe = localDb.subscribe(() => {
      setTasks(localDb.getTasks());
      setEvents(localDb.getEvents());
      setTransactions(localDb.getTransactions());
    });

    return unsubscribe;
  }, []);

  // Compute live statistics.
  const completedTasksCount = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks],
  );

  const eventsCount = useMemo(
    () => events.length,
    [events],
  );

  const walletBalance = useMemo(() => {
    const income = transactions
      .filter((transaction) => transaction.type === 'income')
      .reduce(
        (sum, transaction) => sum + transaction.amount,
        0,
      );

    const expense = transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce(
        (sum, transaction) => sum + transaction.amount,
        0,
      );

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
        value: `₱${walletBalance.toLocaleString(
          undefined,
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          },
        )}`,
        icon: 'credit-card',
      },
    ],
    [completedTasksCount, eventsCount, walletBalance],
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
          onPress: async () => {
            try {
              await signOut();

              router.replace('/(auth)/login/login');
            } catch (error) {
              console.error(
                'Logout failed:',
                error,
              );

              Alert.alert(
                'Logout Error',
                'Something went wrong while logging out. Please try again.',
              );
            }
          },
        },
      ],
      {
        cancelable: true,
      },
    );
  }, [router, signOut]);

  return {
    userProfile,
    stats,
    handleLogout,
  };
}
