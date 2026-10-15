import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import api from '@/app/services/api';
import { localDb } from '@/app/services/localDb';
import {
  DashboardDeadline,
  DashboardSubject,
  DashboardTask,
  DashboardTimelineItem,
} from '../types';

/*
 * Dashboard data comes from the signed-in user's own account (GET /dashboard).
 * A new user starts with empty lists; nothing is pre-filled.
 */

interface DashboardApiData {
  focusTasks?: DashboardTask[];
  deadlines?: DashboardDeadline[];
  subjects?: DashboardSubject[];
  timelineItems?: DashboardTimelineItem[];
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export function useDashboardData() {
  const [greeting, setGreeting] = useState(getGreeting);
  const [focusTasks, setFocusTasks] = useState<DashboardTask[]>([]);
  const [deadlines, setDeadlines] = useState<DashboardDeadline[]>([]);
  const [subjects, setSubjects] = useState<DashboardSubject[]>([]);
  const [timelineItems, setTimelineItems] = useState<DashboardTimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const userIdRef = useRef(localDb.getActiveUserId());

  const loadDashboard = useCallback(async () => {
    try {
      const response = await api.get('/dashboard');
      const data: DashboardApiData = response.data?.data ?? {};

      if (!mountedRef.current) return;

      setFocusTasks(Array.isArray(data.focusTasks) ? data.focusTasks : []);
      setDeadlines(Array.isArray(data.deadlines) ? data.deadlines : []);
      setSubjects(Array.isArray(data.subjects) ? data.subjects : []);
      setTimelineItems(Array.isArray(data.timelineItems) ? data.timelineItems : []);
      setError(null);
    } catch (err) {
      console.error('[useDashboardData] Failed to load dashboard:', err);
      if (mountedRef.current) {
        setError('Dashboard could not be loaded.');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Reload whenever the Dashboard is opened again (e.g. after adding a task).
  useFocusEffect(
    useCallback(() => {
      setGreeting(getGreeting());
      void loadDashboard();
    }, [loadDashboard]),
  );

  // A different account signed in: clear the old data right away, then reload.
  useEffect(() => {
    return localDb.subscribe(() => {
      const currentUserId = localDb.getActiveUserId();

      if (currentUserId !== userIdRef.current) {
        userIdRef.current = currentUserId;
        setFocusTasks([]);
        setDeadlines([]);
        setSubjects([]);
        setTimelineItems([]);
        setIsLoading(true);

        if (currentUserId) {
          void loadDashboard();
        }
      }
    });
  }, [loadDashboard]);

  /*
   * Checking a task marks it as completed: it disappears from the
   * dashboard right away and is saved, so it also leaves the active
   * list in Tasks / Calendar (it stays under "Completed").
   */
  const handleToggleComplete = useCallback(
    async (id: string) => {
      const index = focusTasks.findIndex((item) => item.id === id);
      if (index === -1) return;

      const task = focusTasks[index];

      // Remove it from the dashboard immediately.
      setFocusTasks((current) => current.filter((item) => item.id !== id));
      localDb.updateTask(id, { completed: true });

      try {
        await api.patch(`/tasks/${id}`, { completed: true });
        void loadDashboard();
      } catch (err) {
        console.error('[useDashboardData] Failed to complete task:', err);

        // Saving failed: put the task back where it was.
        if (mountedRef.current) {
          setFocusTasks((current) => {
            if (current.some((item) => item.id === id)) return current;
            const next = [...current];
            next.splice(Math.min(index, next.length), 0, task);
            return next;
          });
        }
        localDb.updateTask(id, { completed: false });
      }
    },
    [focusTasks, loadDashboard],
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadDashboard();
    if (mountedRef.current) {
      setIsRefreshing(false);
    }
  }, [loadDashboard]);

  return {
    greeting,
    tasks: focusTasks,
    focusTasks,
    deadlines,
    subjects,
    timelineItems,
    isLoading,
    isRefreshing,
    error,
    onRefresh,
    handleToggleComplete,
  };
}