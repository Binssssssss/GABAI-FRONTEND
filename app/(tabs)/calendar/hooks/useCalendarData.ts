import { useState, useEffect, useCallback, useMemo,} from 'react';
import { Alert } from 'react-native';
import api from '@/app/services/api';

import {
  CalendarEvent,
  EventCategory,
  EventPriority,
  CalendarViewMode,
} from '../types';

interface BackendChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

interface BackendCalendarEvent {
  id: string;
  title: string;
  description?: string;
  subject: string;
  category: string;
  date: string;
  time: string | null;
  priority: EventPriority;
  isAllDay: boolean;
  duration: number | null;
  checklist: BackendChecklistItem[];
  progress: number;
  completed: boolean;
  hasReminder: boolean;
}

function mapBackendEvent(
  event: BackendCalendarEvent,
): CalendarEvent {
  return {
    id: event.id,
    title: event.title,
    description: event.description || '',
    category: event.category as EventCategory,
    date: event.date,
    time: event.time || '',
    duration: event.duration || 0,
    priority: event.priority,
    isAllDay: event.isAllDay,
    hasReminder: event.hasReminder,
    reminderTime: '',
    isRecurring: false,
    recurrenceRule: '',
    progress: event.progress,

    checklist: event.checklist.map(
      (item) => ({
        id: item.id,
        text: item.title,
        completed: item.completed,
      }),
    ),
  };
}

export function useCalendarData() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] =
    useState<CalendarEvent[]>([]);

  const [selectedDate, setSelectedDate] =
    useState<string>(
      new Date().toISOString().split('T')[0],
    );

  const [viewMode, setViewMode] =
    useState<CalendarViewMode>('month');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [selectedCategory, setSelectedCategory] =
    useState<string>('All');

  const [isAddModalOpen, setIsAddModalOpen] =
    useState(false);

  const [isDetailModalOpen, setIsDetailModalOpen] =
    useState(false);

  const [selectedEvent, setSelectedEvent] =
    useState<CalendarEvent | null>(null);

  const [rescheduleMode] =
    useState(false);

  const [activeReschedulingId] =
    useState<string | null>(null);

  const [newTitle, setNewTitle] =
    useState('');

  const [newCategory, setNewCategory] =
    useState<EventCategory>('Class');

  const [newPriority, setNewPriority] =
    useState<EventPriority>('Medium');

  const [newDate, setNewDate] =
    useState(selectedDate);

  const [newTime, setNewTime] =
    useState('09:00');

  const [newDuration, setNewDuration] =
    useState('60');

  const [newIsAllDay, setNewIsAllDay] =
    useState(false);

  const [newHasReminder, setNewHasReminder] =
    useState(false);

  const [newReminderTime, setNewReminderTime] =
    useState('15 minutes before');

  const [newIsRecurring, setNewIsRecurring] =
    useState(false);

  const [newRecurrenceRule, setNewRecurrenceRule] =
    useState<'Daily' | 'Weekly'>('Weekly');

  const [newDescription, setNewDescription] =
    useState('');

  const [newChecklistText, setNewChecklistText] =
    useState('');

  const [newChecklistItems, setNewChecklistItems] =
    useState<string[]>([]);

  /*
   * LOAD CALENDAR EVENTS
   */
  const loadEvents = useCallback(async () => {
    try {
      const response =
        await api.get('/api/tasks');

      const backendEvents =
        response.data?.data || [];

      const mappedEvents =
        backendEvents.map(
          mapBackendEvent,
        );

      setEvents(mappedEvents);
    } catch (error) {
      console.error(
        'Failed to load calendar events:',
        error,
      );
    }
  }, []);

  /*
   * LOAD UPCOMING DEADLINES
   */
  const loadUpcomingDeadlines =
    useCallback(async () => {
      try {
        const response =
          await api.get('/api/tasks/upcoming');

        const backendDeadlines =
          response.data?.data || [];

        const mappedDeadlines =
          backendDeadlines
            .map(mapBackendEvent)
            .filter(
              (event: CalendarEvent) =>
                event.category === 'Assignment' ||
                event.category === 'Exam',
            );

        setUpcomingDeadlines(
          mappedDeadlines,
        );
      } catch (error) {
        console.error(
          'Failed to load upcoming deadlines:',
          error,
        );
      }
    }, []);

  /*
   * INITIAL LOAD
   */
  useEffect(() => {
    loadEvents();
    loadUpcomingDeadlines();
  }, [
    loadEvents,
    loadUpcomingDeadlines,
  ]);

  /*
   * REFRESH BOTH CALENDAR + DEADLINES
   */
  const refreshCalendar =
    useCallback(async () => {
      await Promise.all([
        loadEvents(),
        loadUpcomingDeadlines(),
      ]);
    }, [
      loadEvents,
      loadUpcomingDeadlines,
    ]);

  /*
   * RESET FORM
   */
  const resetForm =
    useCallback(() => {
      setNewTitle('');
      setNewCategory('Class');
      setNewPriority('Medium');
      setNewDate(selectedDate);
      setNewTime('09:00');
      setNewDuration('60');
      setNewIsAllDay(false);
      setNewHasReminder(false);
      setNewReminderTime(
        '15 minutes before',
      );
      setNewIsRecurring(false);
      setNewRecurrenceRule('Weekly');
      setNewDescription('');
      setNewChecklistItems([]);
      setNewChecklistText('');
    }, [selectedDate]);

  /*
   * SAVE EVENT TO BACKEND
   */
  const saveEvent =
    useCallback(async () => {
      if (!newTitle.trim()) {
        Alert.alert(
          'Validation Error',
          'Please enter a title for the event.',
        );
        return;
      }

      try {
        const response =
          await api.post('/api/tasks', {
            title: newTitle.trim(),

            description:
              newDescription.trim(),

            subject: newCategory,

            priority: newPriority,

            dueDate: newDate,

            dueTime: newIsAllDay
              ? ''
              : newTime,

            hasReminder:
              newHasReminder,

            completed: false,

            subTasks:
              newChecklistItems.map(
                (item) => ({
                  title: item,
                  completed: false,
                }),
              ),
          });

        const createdEvent =
          mapBackendEvent(
            response.data.data,
          );

        setEvents((prev) => [
          createdEvent,
          ...prev,
        ]);

        await loadUpcomingDeadlines();

        setIsAddModalOpen(false);

        resetForm();

        Alert.alert(
          'Event Added',
          'Your event has been successfully scheduled.',
        );
      } catch (error: any) {
        console.error(
          'Failed to create event:',
          error,
        );

        Alert.alert(
          'Error',
          error?.response?.data?.message ||
            'Failed to save the event.',
        );
      }
    }, [
      newTitle,
      newDescription,
      newCategory,
      newPriority,
      newDate,
      newTime,
      newIsAllDay,
      newHasReminder,
      newChecklistItems,
      loadUpcomingDeadlines,
      resetForm,
    ]);

  /*
   * FILTER EVENTS
   */
  const filteredEvents =
    useMemo(() => {
      const search =
        searchQuery.toLowerCase();

      return events.filter((event) => {
        const matchesCategory =
          selectedCategory === 'All' ||
          event.category ===
            selectedCategory;

        const matchesSearch =
          event.title
            .toLowerCase()
            .includes(search) ||
          (event.description || '')
            .toLowerCase()
            .includes(search);

        return (
          matchesCategory &&
          matchesSearch
        );
      });
    }, [
      events,
      selectedCategory,
      searchQuery,
    ]);

  /*
   * OPEN QUICK ADD
   */
  const openQuickAdd =
    useCallback(() => {
      resetForm();
      setIsAddModalOpen(true);
    }, [resetForm]);

  return {
    events,

    selectedDate,
    setSelectedDate,

    viewMode,
    setViewMode,

    searchQuery,
    setSearchQuery,

    selectedCategory,
    setSelectedCategory,

    isAddModalOpen,
    setIsAddModalOpen,

    isDetailModalOpen,
    setIsDetailModalOpen,

    selectedEvent,
    setSelectedEvent,

    rescheduleMode,
    activeReschedulingId,

    upcomingDeadlines,

    filteredEvents,

    newTitle,
    setNewTitle,

    newCategory,
    setNewCategory,

    newPriority,
    setNewPriority,

    newDate,
    setNewDate,

    newTime,
    setNewTime,

    newDuration,
    setNewDuration,

    newIsAllDay,
    setNewIsAllDay,

    newHasReminder,
    setNewHasReminder,

    newReminderTime,
    setNewReminderTime,

    newIsRecurring,
    setNewIsRecurring,

    newRecurrenceRule,
    setNewRecurrenceRule,

    newDescription,
    setNewDescription,

    newChecklistText,
    setNewChecklistText,

    newChecklistItems,

    saveEvent,

    openQuickAdd,

    refreshCalendar,

    loadEvents,

    loadUpcomingDeadlines,
  };
}
