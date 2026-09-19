import { EventPriority, PriorityColorConfig } from '../types';

/**
 * Get days remaining text from a reference date
 */
export const getDeadlineBadgeText = (dateStr: string, referenceDateStr: string = '2026-07-24'): string => {
  const today = new Date(referenceDateStr);
  const deadline = new Date(dateStr);
  const timeDiff = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 0) return 'Overdue';
  return `${diffDays} days left`;
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
