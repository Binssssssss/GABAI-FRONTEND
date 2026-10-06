import api from '@/app/services/api';
import { useFocusEffect } from 'expo-router';
import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { Alert } from 'react-native';

import {
    CalendarEvent,
    CalendarViewMode,
    EventCategory,
    EventPriority,
} from '../types';
import { getDayWorkload, getLocalDateKey, toCalendarDateKey } from '../utils/calendarHelpers';

interface BackendChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

interface BackendCalendarEvent {
  id: string;
  title: string;
  description?: string;
  category?: string;
  subject?: string;
  date?: string;
  dueDate?: string;
  time?: string | null;
  dueTime?: string | null;
  priority: EventPriority;
  isAllDay?: boolean;
  duration?: number | null;
  checklist?: BackendChecklistItem[];
  subTasks?: BackendChecklistItem[];
  progress?: number;
  completed?: boolean;
  hasReminder?: boolean;
}

interface AcademicPressureSnapshot {
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  label: string;
  score: number;
}

function mapBackendEvent(
  event: BackendCalendarEvent,
): CalendarEvent {
  const eventTime = event.time ?? event.dueTime ?? '';
  const checklist = event.checklist ?? event.subTasks ?? [];
  const knownCategories: EventCategory[] = ['Assignment', 'Exam', 'Class', 'Meeting', 'Personal'];
  const categoryValue = event.category ?? event.subject ?? '';
  const category = knownCategories.includes(categoryValue as EventCategory)
    ? categoryValue as EventCategory
    : 'Assignment';

  return {
    id: event.id,
    title: event.title,
    description: event.description || '',
    category,
    subject: event.subject,
    date: toCalendarDateKey(event.date ?? event.dueDate ?? ''),
    time: eventTime,
    duration: event.duration || 0,
    priority: event.priority,
    isAllDay: event.isAllDay ?? false,
    hasReminder: event.hasReminder ?? false,
    reminderTime: '',
    isRecurring: false,
    recurrenceRule: '',
    progress: event.progress ?? (checklist.length
      ? Math.round(checklist.filter((item) => item.completed).length / checklist.length * 100)
      : 0),
    completed: event.completed ?? false,

    checklist: checklist.map(
      (item) => ({
        id: item.id,
        text: item.title,
        completed: item.completed,
      }),
    ),
  };
}

export function useCalendarData() {
  const [events, setEvents] =
    useState<CalendarEvent[]>([]);

  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventsLoadFailed, setEventsLoadFailed] = useState(false);

  const [upcomingDeadlines, setUpcomingDeadlines] =
    useState<CalendarEvent[]>([]);

  const [academicPressure, setAcademicPressure] =
    useState<AcademicPressureSnapshot | null>(null);

  const [selectedDate, setSelectedDate] =
    useState<string>(getLocalDateKey);

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

  const [rescheduleMode, setRescheduleMode] =
    useState(false);

  const [activeReschedulingId, setActiveReschedulingId] =
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
        await api.get('/tasks');

      const backendEvents = response.data?.data ?? response.data ?? [];

      const mappedEvents = (Array.isArray(backendEvents) ? backendEvents : [])
        .map(mapBackendEvent)
        .filter((event: CalendarEvent) => Boolean(event.date));

      setEvents(mappedEvents);
      setEventsLoadFailed(false);

      /*
       * Keep selected event synchronized
       * with the latest backend data.
       */
      setSelectedEvent((currentEvent) => {
        if (!currentEvent) {
          return null;
        }

        const updatedEvent =
          mappedEvents.find(
            (event: CalendarEvent) =>
              event.id === currentEvent.id,
          );

        return updatedEvent || null;
      });
    } catch (error) {
      setEventsLoadFailed(true);
      console.error(
        'Failed to load calendar events:',
        error,
      );
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  /*
   * LOAD UPCOMING DEADLINES
   */
  const loadUpcomingDeadlines =
    useCallback(async () => {
      try {
        const response =
          await api.get('/tasks/upcoming');

        const backendDeadlines = response.data?.data ?? response.data ?? [];

        const mappedDeadlines = (Array.isArray(backendDeadlines) ? backendDeadlines : [])
            .map(mapBackendEvent)
            .filter(
              (event: CalendarEvent) =>
                !event.completed && (
                  event.category === 'Assignment' ||
                  event.category === 'Exam'
                ),
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

  const loadAcademicPressure = useCallback(async () => {
    try {
      const response = await api.get('/academic-pressure');
      const pressure = response.data?.data ?? response.data;

      if (pressure?.level && pressure?.label && typeof pressure.score === 'number') {
        setAcademicPressure(pressure as AcademicPressureSnapshot);
      }
    } catch (error) {
      console.error('Failed to load academic pressure:', error);
    }
  }, []);

  /*
   * REFRESH CALENDAR
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

  useFocusEffect(useCallback(() => {
    let isActive = true;

    void Promise.resolve().then(() => {
      if (!isActive) return;
      void refreshCalendar();
      void loadAcademicPressure();
    });

    return () => {
      isActive = false;
    };
  }, [refreshCalendar, loadAcademicPressure]));

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
   * SAVE EVENT
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
   * DELETE EVENT
   */
  const deleteEvent =
    useCallback(
      (eventId: string) => {
        Alert.alert(
          'Delete Event',
          'Are you sure you want to delete this event?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },

            {
              text: 'Delete',
              style: 'destructive',

              onPress: async () => {
                try {
                  await api.delete(
                    `/api/tasks/${eventId}`,
                  );

                  setEvents((prev) =>
                    prev.filter(
                      (event) =>
                        event.id !== eventId,
                    ),
                  );

                  setUpcomingDeadlines(
                    (prev) =>
                      prev.filter(
                        (event) =>
                          event.id !==
                          eventId,
                      ),
                  );

                  setSelectedEvent(null);
                  setIsDetailModalOpen(false);

                  Alert.alert(
                    'Deleted',
                    'Event deleted successfully.',
                  );
                } catch (error: any) {
                  console.error(
                    'Failed to delete event:',
                    error,
                  );

                  Alert.alert(
                    'Error',
                    error?.response?.data
                      ?.message ||
                    'Failed to delete event.',
                  );
                }
              },
            },
          ],
        );
      },
      [],
    );

  /*
   * TOGGLE CHECKLIST ITEM
   *
   * This now persists the checklist
   * completion status to the backend.
   */
  const toggleChecklistItem =
    useCallback(
      async (
        eventId: string,
        itemId: string,
      ) => {
        const event = events.find(
          (item) => item.id === eventId,
        );

        if (!event) {
          return;
        }

        const checklistItem =
          event.checklist.find(
            (item) => item.id === itemId,
          );

        if (!checklistItem) {
          return;
        }

        const newCompleted =
          !checklistItem.completed;

        console.log(
          'completed:',
          newCompleted,
        );

        console.log(
          'type:',
          typeof newCompleted,
        );

        try {
          const response =
            await api.patch(
              `/api/tasks/${eventId}/subtasks/${itemId}`,
              {
                completed: newCompleted,
              },
            );

          const updatedEvent =
            mapBackendEvent(
              response.data?.data,
            );

          setEvents((prev) =>
            prev.map((item) =>
              item.id === eventId
                ? updatedEvent
                : item,
            ),
          );

          setSelectedEvent(
            (currentEvent) =>
              currentEvent?.id === eventId
                ? updatedEvent
                : currentEvent,
          );
        } catch (error: any) {
          console.error(
            'Failed to update checklist item:',
            error,
          );

          Alert.alert(
            'Error',
            error?.response?.data?.message ||
            'Failed to update checklist item.',
          );
        }
      },
      [events],
    );

  /*
   * START RESCHEDULING
   */
  const startRescheduling =
    useCallback(
      (eventId: string) => {
        setActiveReschedulingId(
          eventId,
        );

        setRescheduleMode(true);

        setIsDetailModalOpen(false);
      },
      [],
    );

  /*
   * CANCEL RESCHEDULING
   */
  const cancelRescheduling =
    useCallback(() => {
      setRescheduleMode(false);
      setActiveReschedulingId(null);
    }, []);

  /*
   * COMPLETE RESCHEDULING
   */
  const completeRescheduling =
    useCallback(
      async (targetDate: string) => {
        if (!activeReschedulingId) {
          return;
        }

        const event =
          events.find(
            (item) =>
              item.id ===
              activeReschedulingId,
          );

        if (!event) {
          cancelRescheduling();
          return;
        }

        const persistReschedule = async () => {
          try {
            const response = await api.patch(
              `/api/tasks/${event.id}/reschedule`,
              {
                dueDate: targetDate,
                dueTime: event.isAllDay
                  ? ''
                  : event.time,
              },
            );

            const updatedEvent =
              mapBackendEvent(
                response.data.data,
              );

            setEvents((prev) =>
              prev.map((item) =>
                item.id === activeReschedulingId
                  ? updatedEvent
                  : item,
              ),
            );

            await loadUpcomingDeadlines();

            Alert.alert(
              'Event Rescheduled',
              `"${event.title}" has been moved to ${targetDate}.`,
            );

            setRescheduleMode(false);
            setActiveReschedulingId(null);
          } catch (error: any) {
            console.error('Failed to reschedule event:', error);

            Alert.alert(
              'Error',
              error?.response?.data?.message || 'Failed to reschedule event.',
            );
          }
        };

        const targetEvents = events.filter(
          (item) => item.date === targetDate && item.id !== event.id,
        );
        const currentWorkload = getDayWorkload(targetEvents);
        const projectedWorkload = getDayWorkload([
          ...targetEvents,
          { ...event, date: targetDate },
        ]);

        if (projectedWorkload.weight > currentWorkload.weight) {
          Alert.alert(
            'Workload impact',
            `Moving "${event.title}" to ${targetDate} changes that date's workload from ${currentWorkload.level} to ${projectedWorkload.level}.`,
            [
              { text: 'Keep current date', style: 'cancel', onPress: cancelRescheduling },
              { text: 'Move anyway', onPress: () => { void persistReschedule(); } },
            ],
          );
          return;
        }

        await persistReschedule();
      },
      [
        activeReschedulingId,
        events,
        cancelRescheduling,
        loadUpcomingDeadlines,
      ],
    );

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
   * ADD CHECKLIST ITEM
   *
   * These items are temporary form data.
   * They are saved to the backend when
   * saveEvent() is called.
   */
  const addChecklistItem =
    useCallback(() => {
      if (!newChecklistText.trim()) {
        return;
      }

      setNewChecklistItems(
        (prev) => [
          ...prev,
          newChecklistText.trim(),
        ],
      );

      setNewChecklistText('');
    }, [newChecklistText]);

  /*
   * REMOVE CHECKLIST ITEM
   */
  const removeChecklistItem =
    useCallback((index: number) => {
      setNewChecklistItems(
        (prev) =>
          prev.filter(
            (_, i) => i !== index,
          ),
      );
    }, []);

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
    isLoadingEvents,
    eventsLoadFailed,

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

    startRescheduling,
    cancelRescheduling,
    completeRescheduling,

    upcomingDeadlines,

    academicPressure,

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

    addChecklistItem,
    removeChecklistItem,

    saveEvent,
    deleteEvent,
    toggleChecklistItem,

    openQuickAdd,

    refreshCalendar,
    loadEvents,
    loadUpcomingDeadlines,
  };
}

