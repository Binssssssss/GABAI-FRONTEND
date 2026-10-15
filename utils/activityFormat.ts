import type { ActivityEntry, ActivityType } from '@/app/services/activityLog';
import { formatClock } from '@/utils/time';

/** Shared look for Activity history rows (dashboard + history screen). */

export const ACTIVITY_VERB: Record<ActivityType, string> = {
  created: 'Created',
  completed: 'Completed',
  restored: 'Restored',
  deleted: 'Deleted',
};

export const ACTIVITY_ICON: Record<
  ActivityType,
  'clipboard' | 'check-circle' | 'rotate-ccw' | 'trash-2'
> = {
  created: 'clipboard',
  completed: 'check-circle',
  restored: 'rotate-ccw',
  deleted: 'trash-2',
};

export const getActivityColor = (
  type: ActivityType,
  brown: string,
  red: string,
) => {
  if (type === 'completed') return '#22C55E';
  if (type === 'deleted') return red;
  return brown;
};

export const activityText = (entry: ActivityEntry) =>
  `${ACTIVITY_VERB[entry.type]} "${entry.title}".`;

const DAY_MS = 24 * 60 * 60 * 1000;

export const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
};

const formatDay = (time: number) =>
  new Date(time).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

/** "2:15 PM" today, "Yesterday", otherwise "Oct 13". */
export const formatActivityWhen = (at: number) => {
  const today = startOfToday();
  if (at >= today) return formatClock(new Date(at));
  if (at >= today - DAY_MS) return 'Yesterday';
  return formatDay(at);
};

export type ActivityGroup = 'today' | 'yesterday' | 'week' | 'earlier';

export const ACTIVITY_GROUP_TITLES: Record<ActivityGroup, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  week: 'This week',
  earlier: 'Earlier',
};

export const getActivityGroup = (at: number): ActivityGroup => {
  const today = startOfToday();
  if (at >= today) return 'today';
  if (at >= today - DAY_MS) return 'yesterday';
  if (at >= today - 6 * DAY_MS) return 'week';
  return 'earlier';
};

/** Time shown on the history screen: clock for recent days, date after. */
export const formatActivityTime = (at: number) =>
  getActivityGroup(at) === 'today' || getActivityGroup(at) === 'yesterday'
    ? formatClock(new Date(at))
    : formatDay(at);
