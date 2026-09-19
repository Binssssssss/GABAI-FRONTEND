import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { localDb } from '@/app/services/localDb';
import { CalendarEvent, ChecklistItem, EventCategory, EventPriority, CalendarViewMode } from '../types';

export function useCalendarData() {
  // Calendar States hooked up to central database
  const [events, setEventsState] = useState<CalendarEvent[]>(() => localDb.getEvents());

  const setEvents = useCallback((newEvents: CalendarEvent[] | ((prev: CalendarEvent[]) => CalendarEvent[])) => {
    const updated = typeof newEvents === 'function' ? newEvents(localDb.getEvents()) : newEvents;
    localDb.setEvents(updated);
    setEventsState(updated);
  }, []);

  useEffect(() => {
    const unsubscribe = localDb.subscribe(() => {
      setEventsState(localDb.getEvents());
    });
    return unsubscribe;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>('2026-07-26'); // Today (July 26, 2026)
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals & Controls
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Rescheduling States
  const [rescheduleMode, setRescheduleMode] = useState(false);
  const [activeReschedulingId, setActiveReschedulingId] = useState<string | null>(null);

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<EventCategory>('Class');
  const [newPriority, setNewPriority] = useState<EventPriority>('Medium');
  const [newDate, setNewDate] = useState('2026-07-24');
  const [newTime, setNewTime] = useState('09:00');
  const [newDuration, setNewDuration] = useState('60');
  const [newIsAllDay, setNewIsAllDay] = useState(false);
  const [newHasReminder, setNewHasReminder] = useState(false);
  const [newReminderTime, setNewReminderTime] = useState('15 minutes before');
  const [newIsRecurring, setNewIsRecurring] = useState(false);
  const [newRecurrenceRule, setNewRecurrenceRule] = useState<'Daily' | 'Weekly'>('Weekly');
  const [newDescription, setNewDescription] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newChecklistItems, setNewChecklistItems] = useState<string[]>([]);

  // Calculate stats for upcoming deadlines sidebar
  const upcomingDeadlines = useMemo(() => {
    return events
      .filter((e) => e.category === 'Assignment' || e.category === 'Exam')
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [events]);

  // Toggle item in event detail checklist
  const toggleChecklistItem = useCallback((eventId: string, itemId: string) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => {
        if (event.id === eventId) {
          const updatedChecklist = event.checklist.map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
          );
          const completedCount = updatedChecklist.filter((item) => item.completed).length;
          const totalCount = updatedChecklist.length;
          const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          const updatedEvent = { ...event, checklist: updatedChecklist, progress };
          setSelectedEvent((current) => (current && current.id === eventId ? updatedEvent : current));
          return updatedEvent;
        }
        return event;
      })
    );
  }, [setEvents]);

  const resetForm = useCallback(() => {
    setNewTitle('');
    setNewCategory('Class');
    setNewPriority('Medium');
    setNewDate(selectedDate);
    setNewTime('09:00');
    setNewDuration('60');
    setNewIsAllDay(false);
    setNewHasReminder(false);
    setNewIsRecurring(false);
    setNewDescription('');
    setNewChecklistItems([]);
    setNewChecklistText('');
  }, [selectedDate]);

  // Save new event to the list
  const saveEvent = useCallback(() => {
    if (!newTitle.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for the event.');
      return;
    }

    const createdChecklist: ChecklistItem[] = newChecklistItems.map((item, idx) => ({
      id: `${Date.now()}-${idx}`,
      text: item,
      completed: false,
    }));

    const event: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      date: newDate,
      time: newTime,
      duration: parseInt(newDuration, 10) || 60,
      priority: newPriority,
      isAllDay: newIsAllDay,
      hasReminder: newHasReminder,
      reminderTime: newHasReminder ? newReminderTime : '',
      isRecurring: newIsRecurring,
      recurrenceRule: newIsRecurring ? newRecurrenceRule : '',
      progress: 0,
      checklist: createdChecklist,
      description: newDescription,
    };

    setEvents((prev) => [...prev, event]);
    setIsAddModalOpen(false);
    resetForm();
    Alert.alert('Event Added', 'Your event has been successfully scheduled.');
  }, [
    newTitle,
    newCategory,
    newDate,
    newTime,
    newDuration,
    newPriority,
    newIsAllDay,
    newHasReminder,
    newReminderTime,
    newIsRecurring,
    newRecurrenceRule,
    newDescription,
    newChecklistItems,
    setEvents,
    resetForm,
  ]);

  // Delete event from calendar
  const deleteEvent = useCallback((eventId: string) => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setEvents((prev) => prev.filter((e) => e.id !== eventId));
          setIsDetailModalOpen(false);
          setSelectedEvent(null);
        },
      },
    ]);
  }, [setEvents]);

  // Enter reschedule mode
  const startRescheduling = useCallback((eventId: string) => {
    setActiveReschedulingId(eventId);
    setRescheduleMode(true);
    setIsDetailModalOpen(false);
  }, []);

  const cancelRescheduling = useCallback(() => {
    setRescheduleMode(false);
    setActiveReschedulingId(null);
  }, []);

  // Reschedule an event by selecting a new date
  const completeRescheduling = useCallback((targetDate: string) => {
    if (!activeReschedulingId) return;

    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === activeReschedulingId) {
          return { ...evt, date: targetDate };
        }
        return evt;
      })
    );

    const rescheduledEvent = events.find((e) => e.id === activeReschedulingId);
    Alert.alert('Event Rescheduled', `"${rescheduledEvent?.title}" has been moved to ${targetDate}.`);

    setRescheduleMode(false);
    setActiveReschedulingId(null);
  }, [activeReschedulingId, events, setEvents]);

  // Add item to creation checklist
  const addChecklistItem = useCallback(() => {
    if (newChecklistText.trim()) {
      setNewChecklistItems((prev) => [...prev, newChecklistText.trim()]);
      setNewChecklistText('');
    }
  }, [newChecklistText]);

  const removeChecklistItem = useCallback((index: number) => {
    setNewChecklistItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const openQuickAdd = useCallback(() => {
    resetForm();
    setIsAddModalOpen(true);
  }, [resetForm]);

  // Filter events based on search query and category
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [events, selectedCategory, searchQuery]);

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
    startRescheduling,
    cancelRescheduling,
    completeRescheduling,
    upcomingDeadlines,
    filteredEvents,
    // Form fields
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
  };
}
