import { useState, useEffect, useCallback } from 'react';
import { localDb } from '@/app/services/localDb';
import { DashboardTask, DashboardDeadline, DashboardSubject, DashboardTimelineItem } from '../types';
import { INITIAL_DEADLINES, INITIAL_SUBJECTS, INITIAL_TIMELINE_ITEMS } from '../constants/dashboardData';

export function useDashboardData() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('Hello');

  // Dynamic Greeting based on current hour
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Today's Focus State loaded from central database
  const getMappedTasks = useCallback((): DashboardTask[] => {
    return localDb
      .getTasks()
      .filter((t) => t.dueDate === '2026-07-26' || t.priority === 'High')
      .map((t) => ({
        id: t.id,
        subject: t.subject,
        title: t.title,
        dueTime: t.dueTime,
        priority: t.priority,
        countdown: t.dueDate === '2026-07-26' ? 'Today' : 'Upcoming',
        completed: t.completed,
      }));
  }, []);

  const [focusTasks, setFocusTasks] = useState<DashboardTask[]>(getMappedTasks);

  useEffect(() => {
    const unsubscribe = localDb.subscribe(() => {
      setFocusTasks(getMappedTasks());
    });
    return unsubscribe;
  }, [getMappedTasks]);

  const handleToggleComplete = useCallback((id: string) => {
    localDb.toggleTaskCompleted(id);
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  const deadlines: DashboardDeadline[] = INITIAL_DEADLINES;
  const subjects: DashboardSubject[] = INITIAL_SUBJECTS;
  const timelineItems: DashboardTimelineItem[] = INITIAL_TIMELINE_ITEMS;

  return {
    greeting,
    focusTasks,
    deadlines,
    subjects,
    timelineItems,
    isRefreshing,
    onRefresh,
    handleToggleComplete,
  };
}
