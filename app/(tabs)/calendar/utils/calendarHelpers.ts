import { CalendarEvent, CalendarViewMode, EventPriority, PriorityColorConfig } from '../types';

export const getLocalDateKey = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const toCalendarDateKey = (value: string): string => {
  const datePart = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (datePart) return datePart;

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? '' : getLocalDateKey(parsedDate);
};

export const shiftCalendarDate = (
  dateKey: string,
  viewMode: CalendarViewMode,
  direction: -1 | 1,
): string => {
  const date = new Date(`${dateKey}T00:00:00`);

  if (viewMode === 'month') {
    const dayOfMonth = date.getDate();
    date.setDate(1);
    date.setMonth(date.getMonth() + direction);
    date.setDate(Math.min(dayOfMonth, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
  } else {
    date.setDate(date.getDate() + direction * (viewMode === 'week' ? 7 : 1));
  }

  return getLocalDateKey(date);
};

export const getWeekDateKeys = (dateKey: string): string[] => {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() - date.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(date);
    day.setDate(date.getDate() + index);
    return getLocalDateKey(day);
  });
};

export const getCalendarRangeLabel = (dateKey: string, viewMode: CalendarViewMode): string => {
  const date = new Date(`${dateKey}T00:00:00`);

  if (viewMode === 'month') {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  if (viewMode === 'week') {
    const weekDates = getWeekDateKeys(dateKey);
    const start = new Date(`${weekDates[0]}T00:00:00`);
    const end = new Date(`${weekDates[6]}T00:00:00`);
    const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endLabel = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startLabel} - ${endLabel}`;
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Get days remaining text from a reference date
 */
export const getDeadlineBadgeText = (dateStr: string, referenceDateStr: string = getLocalDateKey()): string => {
  const normalizedDeadline = toCalendarDateKey(dateStr);
  if (!normalizedDeadline) return 'Date unavailable';

  const today = new Date(`${referenceDateStr}T00:00:00`);
  const deadline = new Date(`${normalizedDeadline}T00:00:00`);
  const timeDiff = deadline.getTime() - today.getTime();
  const diffDays = Math.round(timeDiff / (1000 * 3600 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 0) return 'Overdue';
  return `${diffDays} days left`;
};

export const getDayWorkload = (events: CalendarEvent[]) => {
  const pendingEvents = events.filter((event) => !event.completed);
  const today = getLocalDateKey();
  const isDeadline = (event: CalendarEvent) =>
    event.category === 'Assignment' || event.category === 'Exam';
  const overdueCount = pendingEvents.filter((event) => isDeadline(event) && event.date < today).length;
  const deadlineCount = events.filter((event) =>
    !event.completed && isDeadline(event)
  ).length;
  const weight = pendingEvents.reduce((total, event) => {
    const priorityWeight = event.priority === 'High' ? 3 : event.priority === 'Medium' ? 2 : 1;
    const urgencyWeight = isDeadline(event) && event.date < today ? 2 : isDeadline(event) && event.date === today ? 1 : 0;
    const examWeight = event.category === 'Exam' ? 2 : 0;
    const durationWeight = event.duration >= 120 ? 2 : event.duration >= 60 ? 1 : 0;
    return total + priorityWeight + urgencyWeight + examWeight + durationWeight;
  }, 0);

  const level = weight >= 10 ? 'VERY HIGH' : weight >= 7 ? 'HIGH' : weight >= 4 ? 'MEDIUM' : 'LOW';

  return {
    pendingCount: pendingEvents.length,
    deadlineCount,
    overdueCount,
    weight,
    level,
    color: level === 'VERY HIGH' ? '#B85F61' : level === 'HIGH' ? '#C0783C' : level === 'MEDIUM' ? '#A8782E' : '#56846F',
  };
};

export const getEventConflicts = (events: CalendarEvent[]): Set<string> => {
  const conflictingIds = new Set<string>();
  const timedEvents = events.filter((event) =>
    !event.completed && /^\d{2}:\d{2}$/.test(event.time) && event.duration > 0
  );

  for (let firstIndex = 0; firstIndex < timedEvents.length; firstIndex += 1) {
    const first = timedEvents[firstIndex];
    const firstStart = Number(first.time.slice(0, 2)) * 60 + Number(first.time.slice(3));

    for (let secondIndex = firstIndex + 1; secondIndex < timedEvents.length; secondIndex += 1) {
      const second = timedEvents[secondIndex];
      if (first.date !== second.date) continue;

      const secondStart = Number(second.time.slice(0, 2)) * 60 + Number(second.time.slice(3));
      if (firstStart < secondStart + second.duration && secondStart < firstStart + first.duration) {
        conflictingIds.add(first.id);
        conflictingIds.add(second.id);
      }
    }
  }

  return conflictingIds;
};

export const getRecommendedEvents = (events: CalendarEvent[]): CalendarEvent[] => {
  const priorityRank: Record<EventPriority, number> = { High: 0, Medium: 1, Low: 2 };
  const today = getLocalDateKey();
  const isOverdueDeadline = (event: CalendarEvent) =>
    !event.completed && event.date < today &&
    (event.category === 'Assignment' || event.category === 'Exam');

  return events
    .filter((event) => !event.completed)
    .sort((first, second) => {
      const overdueOrder = Number(isOverdueDeadline(second)) - Number(isOverdueDeadline(first));
      if (overdueOrder !== 0) return overdueOrder;

      const priorityOrder = priorityRank[first.priority] - priorityRank[second.priority];
      if (priorityOrder !== 0) return priorityOrder;

      const dateOrder = first.date.localeCompare(second.date);
      if (dateOrder !== 0) return dateOrder;

      return second.duration - first.duration;
    });
};

/**
 * Get deadline priority color styling
 */
export const getPriorityColors = (priority: EventPriority): PriorityColorConfig => {
  switch (priority) {
    case 'High':
      return { text: '#FCA5A5', bg: '#7F1D1D', dot: '#EF4444' };
    case 'Medium':
      return { text: '#FDBA74', bg: '#7C2D12', dot: '#F59E0B' };
    case 'Low':
      return { text: '#86EFAC', bg: '#14532D', dot: '#10B981' };
    default:
      return { text: '#FDBA74', bg: '#7C2D12', dot: '#F59E0B' };
  }
};
