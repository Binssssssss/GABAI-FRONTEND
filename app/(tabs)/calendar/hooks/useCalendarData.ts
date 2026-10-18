import api from '@/app/services/api';
import {
  scheduleCalendarReminder,
  cancelCalendarReminder,
  syncCalendarAlarms,
} from '@/app/services/calendarReminderService';
import { useFocusEffect } from 'expo-router';
import {
  useCallback,
  useMemo,
  useState,
} from 'react';
import { AppAlert } from '@/components/AppAlert';

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
  const knownCategories: EventCategory[] = [
    'Assignment',
    'Exam',
    'Class',
    'Focus Session',
    'Meeting',
    'Personal',
  ];
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

  const [editingEventId, setEditingEventId] =
    useState<string | null>(null);

  const isEditingEvent = editingEventId !== null;

  const [isDetailModalOpen, setIsDetailModalOpen] =
    useState(false);

  const [selectedEvent, setSelectedEvent] =
    useState<CalendarEvent | null>(null);

  const [rescheduleMode, setRescheduleMode] =
    useState(false);

  const [activeReschedulingId, setActiveReschedulingId] =
    useState<string | null>(null);

  // The Reschedule sheet (pick a new date + type a new time).
  const [isRescheduleSheetOpen, setIsRescheduleSheetOpen] =
    useState(false);

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

      // Make sure every upcoming event has its alarm on this phone.
      void syncCalendarAlarms(mappedEvents);

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
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        console.error('Failed to load academic pressure:', error);
      }

      setAcademicPressure({
        level: 'LOW',
        label: 'Low workload',
        score: 0,
      });
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
   * OPEN EVENT FOR EDITING
   */
  const openEditEvent = useCallback(
    (event: CalendarEvent) => {
      setEditingEventId(event.id);

      setNewTitle(event.title);
      setNewCategory(event.category);
      setNewPriority(event.priority);
      setNewDate(event.date);
      setNewTime(event.time || '09:00');
      setNewDuration(String(event.duration || 60));
      setNewIsAllDay(event.isAllDay);
      setNewHasReminder(event.hasReminder);
      setNewReminderTime('At start time');
      setNewDescription(event.description || '');

      // Checklist editing is not supported by the current
      // backend update endpoint, so don't imply changes will save.
      setNewChecklistItems([]);
      setNewChecklistText('');

      setIsDetailModalOpen(false);
      setIsAddModalOpen(true);
    },
    [],
  );


  /*
   * SAVE EVENT
   */

  /*
  * SAVE OR UPDATE EVENT
  */
  const saveEvent = useCallback(async () => {
    if (!newTitle.trim()) {
      AppAlert.alert(
        'Validation Error',
        'Please enter a title for the event.',
      );
      return;
    }

    if (!newDate.trim()) {
      AppAlert.alert(
        'Validation Error',
        'Please enter an event date.',
      );
      return;
    }

    if (!newIsAllDay && !newTime.trim()) {
      AppAlert.alert(
        'Validation Error',
        'Please enter an event time.',
      );
      return;
    }

    const eventPayload = {
      title: newTitle.trim(),
      description: newDescription.trim(),
      subject: newCategory,
      priority: newPriority,
      dueDate: newDate,
      dueTime: newIsAllDay ? '' : newTime,
      hasReminder: newHasReminder,
    };

    // Snapshot the form; it is cleared right away.
    const title = newTitle.trim();
    const date = newDate;
    const time = newTime;
    const isAllDay = newIsAllDay;
    const hasReminder = newHasReminder;
    const category = newCategory;
    const priority = newPriority;
    const duration = Number(newDuration);
    const checklistItems = newChecklistItems;
    const wantsReminder = hasReminder && !isAllDay && time.trim().length > 0;

    if (editingEventId) {
      // UPDATE EXISTING EVENT (real-time: show the change first)
      const eventId = editingEventId;
      const original = events.find((event) => event.id === eventId);

      const shownEvent: CalendarEvent = {
        ...(original ?? mapBackendEvent({ id: eventId, ...eventPayload } as BackendCalendarEvent)),
        title,
        description: eventPayload.description,
        category: mapBackendEvent({ id: eventId, ...eventPayload } as BackendCalendarEvent).category,
        subject: category,
        priority,
        date: toCalendarDateKey(date),
        time: eventPayload.dueTime,
        isAllDay,
        hasReminder,
      };

      setEvents((prev) =>
        prev.map((event) => (event.id === eventId ? shownEvent : event)),
      );
      setSelectedEvent(shownEvent);
      setIsAddModalOpen(false);
      setIsDetailModalOpen(true);
      setEditingEventId(null);
      resetForm();

      try {
        const response = await api.put(`/tasks/${eventId}`, eventPayload);
        const updatedEvent = mapBackendEvent(response.data.data);

        setEvents((prev) =>
          prev.map((event) => (event.id === eventId ? updatedEvent : event)),
        );
        setSelectedEvent((current) =>
          current?.id === eventId ? updatedEvent : current,
        );

        // Update the device's scheduled notification.
        try {
          await cancelCalendarReminder(eventId);

          if (wantsReminder) {
            await scheduleCalendarReminder(
              title,
              date,
              time,
              undefined, // use the Notification Settings lead time
              eventId,
              { category, priority },
            );
          }
        } catch (reminderError) {
          console.error('Failed to update event reminder:', reminderError);
        }

        void loadUpcomingDeadlines();
      } catch (error: any) {
        console.error('Failed to update event:', error);

        // Undo the instant change.
        if (original) {
          setEvents((prev) =>
            prev.map((event) => (event.id === eventId ? original : event)),
          );
          setSelectedEvent((current) =>
            current?.id === eventId ? original : current,
          );
        }

        AppAlert.alert(
          'Error',
          error?.response?.data?.message || 'Failed to update the event.',
        );
      }

      return;
    }

    // CREATE NEW EVENT (real-time: show it first, then save)
    const tempId = `pending-${Date.now()}`;
    const tempEvent = mapBackendEvent({
      id: tempId,
      ...eventPayload,
      duration,
      completed: false,
      subTasks: checklistItems.map((item, index) => ({
        id: `${tempId}-${index}`,
        title: item,
        completed: false,
      })),
    } as BackendCalendarEvent);

    setEvents((prev) => [tempEvent, ...prev]);
    setIsAddModalOpen(false);
    resetForm();

    try {
      const response = await api.post('/tasks', {
        ...eventPayload,
        // Lets the backend send "Event Created" instead of "Task Created".
        source: 'calendar',
        duration,
        completed: false,
        subTasks: checklistItems.map((item) => ({
          title: item,
          completed: false,
        })),
      });

      const createdEvent = mapBackendEvent(response.data.data);

      // Swap the instant copy for the saved event.
      setEvents((prev) =>
        prev.map((event) => (event.id === tempId ? createdEvent : event)),
      );

      if (wantsReminder) {
        try {
          await scheduleCalendarReminder(
            title,
            date,
            time,
            undefined, // use the Notification Settings lead time
            createdEvent.id,
            { category, priority },
          );
        } catch (reminderError) {
          console.error('Failed to schedule calendar reminder:', reminderError);
        }
      }

      void loadUpcomingDeadlines();
    } catch (error: any) {
      console.error('Failed to create event:', error);

      setEvents((prev) => prev.filter((event) => event.id !== tempId));

      AppAlert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to save the event.',
      );
    }
  }, [
    events,
    editingEventId,
    newTitle,
    newDescription,
    newCategory,
    newPriority,
    newDate,
    newTime,
    newIsAllDay,
    newHasReminder,
    newDuration,
    newChecklistItems,
    loadUpcomingDeadlines,
    resetForm,
  ]);

  /*
   * DELETE EVENT
   */
  const deleteEvent = useCallback(
    (eventId: string) => {
      AppAlert.alert(
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
              // Real-time: remove it from the screen first.
              const removedEvent = events.find(
                (event) => event.id === eventId,
              );

              setEvents((prev) =>
                prev.filter((event) => event.id !== eventId),
              );

              setUpcomingDeadlines((prev) =>
                prev.filter((event) => event.id !== eventId),
              );

              setSelectedEvent(null);
              setIsDetailModalOpen(false);

              if (eventId.startsWith('pending-')) return;

              try {
                await api.delete(`/tasks/${eventId}`);
                await cancelCalendarReminder(eventId);
              } catch (error: any) {
                // Put it back.
                const restored = removedEvent;
                if (restored && error?.response?.status !== 404) {
                  setEvents((prev) => [restored, ...prev]);
                  void loadUpcomingDeadlines();
                }

                console.error(
                  'Failed to delete event:',
                  error?.response?.status,
                  error?.response?.data || error.message,
                );

                AppAlert.alert(
                  'Error',
                  error?.response?.data?.message ||
                  'Failed to delete event.',
                );
              }
            },
          },
        ],
      );


    },
    [events, loadUpcomingDeadlines],
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
              `/tasks/${eventId}/subtasks/${itemId}`,
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

          AppAlert.alert(
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

        setIsDetailModalOpen(false);

        // Open the Reschedule sheet instead of "tap a date" mode,
        // so it works from every view (Month, Week, Day, Agenda).
        setIsRescheduleSheetOpen(true);
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
      setIsRescheduleSheetOpen(false);
    }, []);

  /*
   * COMPLETE RESCHEDULING
   */
  const completeRescheduling =
    useCallback(
      async (targetDate: string, targetTime?: string): Promise<boolean> => {
        if (!activeReschedulingId) {
          return false;
        }

        const event =
          events.find(
            (item) =>
              item.id ===
              activeReschedulingId,
          );

        if (!event) {
          cancelRescheduling();
          return false;
        }

        // From the sheet: the typed time ("" = all-day). Otherwise keep the old time.
        const newTime =
          targetTime !== undefined
            ? targetTime
            : event.isAllDay
              ? ''
              : event.time;

        const persistReschedule = async (): Promise<boolean> => {
          try {
            const response = await api.patch(
              `/tasks/${event.id}/reschedule`,
              {
                dueDate: targetDate,
                dueTime: newTime,
              },
            );

            const updatedEvent =
              mapBackendEvent(
                response.data.data,
              );

            // Remove the old reminder before updating it.
            await cancelCalendarReminder(event.id);

            // Schedule a new reminder if the event still needs one.
            if (event.hasReminder && !event.isAllDay && newTime) {
              try {
                await scheduleCalendarReminder(
                  updatedEvent.title,
                  targetDate,
                  updatedEvent.time || newTime,
                  undefined, // use the Notification Settings lead time
                  event.id,
                  { category: event.category, priority: event.priority },
                );
              } catch (reminderError) {
                console.error(
                  'Failed to update calendar reminder:',
                  reminderError,
                );
              }
            }

            setEvents((prev) =>
              prev.map((item) =>
                item.id === activeReschedulingId
                  ? updatedEvent
                  : item,
              ),
            );

            setSelectedEvent((current) =>
              current?.id === event.id ? updatedEvent : current,
            );

            // Show the day the event moved to.
            setSelectedDate(targetDate);

            await loadUpcomingDeadlines();

            const dateLabel = new Date(`${targetDate}T12:00:00`).toLocaleDateString(
              'en-US',
              { weekday: 'short', month: 'short', day: 'numeric' },
            );
            const [hh, mm] = (newTime || '').split(':').map(Number);
            const timeLabel =
              newTime && Number.isFinite(hh) && Number.isFinite(mm)
                ? ` at ${hh % 12 === 0 ? 12 : hh % 12}:${String(mm).padStart(2, '0')} ${hh >= 12 ? 'PM' : 'AM'}`
                : '';

            AppAlert.alert(
              'Event rescheduled',
              `"${event.title}" moved to ${dateLabel}${timeLabel}.`,
            );

            setRescheduleMode(false);
            setActiveReschedulingId(null);
            setIsRescheduleSheetOpen(false);
            return true;
          } catch (error: any) {
            console.error('Failed to reschedule event:', error);

            AppAlert.alert(
              'Error',
              error?.response?.data?.message || 'Failed to reschedule event.',
            );
            return false;
          }
        };

        // The sheet already shows how busy the new day is.
        if (targetTime !== undefined) {
          return persistReschedule();
        }

        const targetEvents = events.filter(
          (item) => item.date === targetDate && item.id !== event.id,
        );
        const currentWorkload = getDayWorkload(targetEvents);
        const projectedWorkload = getDayWorkload([
          ...targetEvents,
          { ...event, date: targetDate },
        ]);

        if (projectedWorkload.weight > currentWorkload.weight) {
          AppAlert.alert(
            'Workload impact',
            `Moving "${event.title}" to ${targetDate} changes that date's workload from ${currentWorkload.level} to ${projectedWorkload.level}.`,
            [
              { text: 'Keep current date', style: 'cancel', onPress: cancelRescheduling },
              { text: 'Move anyway', onPress: () => { void persistReschedule(); } },
            ],
          );
          return false;
        }

        return persistReschedule();
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
        // Completed items are hidden from the calendar lists.
        if (event.completed) return false;

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
  const openQuickAdd = useCallback(() => {
    setEditingEventId(null);
    resetForm();
    setIsAddModalOpen(true);
  }, [resetForm]);

return {
  events,
  isLoadingEvents,
  eventsLoadFailed,

  isEditingEvent,
  editingEventId,
  setEditingEventId,
  openEditEvent,

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
  isRescheduleSheetOpen,
  reschedulingEvent:
    events.find((item) => item.id === activeReschedulingId) ?? null,

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
