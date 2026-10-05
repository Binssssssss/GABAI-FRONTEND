import { useState, useEffect, useCallback } from 'react';
import { localDb } from '@/app/services/localDb';
import { DashboardTask, DashboardDeadline, DashboardSubject, DashboardTimelineItem } from '../types';
import { INITIAL_SUBJECTS } from '../constants/dashboardData';
import { INITIAL_TIMELINE_ITEMS } from '../constants/dashboardData';


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
      .filter((t) => t.dueDate === new Date().toISOString().split('T')[0] || t.priority === 'High')
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

  const deadlines: DashboardDeadline[] = localDb
    .getTasks()
    .filter((task) => task.dueDate && !task.completed)
    .map((task) => ({
      id: task.id,
      subject: task.subject,
      assignment: task.title,
      countdown: task.dueDate,
      priority: task.priority,
      completion: task.completed ? 100 : 0,
    }));
  const subjects: DashboardSubject[] = Array.from(
    new Set(
      localDb
        .getTasks()
        .map((task) => task.subject)
        .filter(Boolean)
    )
  ).map((subject) => {
    const subjectTasks = localDb
      .getTasks()
      .filter((task) => task.subject === subject);

    const completed = subjectTasks.filter(
      (task) => task.completed
    ).length;

    const pending = subjectTasks.length - completed;

    const completion =
      subjectTasks.length > 0
        ? Math.round(
          (completed / subjectTasks.length) * 100
        )
        : 0;

    return {
      name: subject,
      pending,
      completed,
      quiz: '—',
      projectStatus: '—',
      completion,
    };
  }); const timelineItems: DashboardTimelineItem[] = localDb
    .getTasks()
    .filter((t) => t.dueDate)
    .map((t) => ({
      time: t.dueTime || 'All day',
      type: 'task',
      title: t.title,
      status: t.completed ? 'Completed' : 'Pending',
      deadline: t.dueTime || undefined,
    }));

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
