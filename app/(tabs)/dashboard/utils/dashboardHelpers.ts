import { DashboardTask, DashboardTimelineItem } from '../types';

export const getPriorityColor = (
  priority: DashboardTask['priority'],
  colors: { errorRed: string; warningOrange: string; successGreen: string }
): string => {
  switch (priority) {
    case 'High':
      return colors.errorRed;
    case 'Medium':
      return colors.warningOrange;
    case 'Low':
      return colors.successGreen;
    default:
      return colors.warningOrange;
  }
};

export const getTimelineIcon = (type: DashboardTimelineItem['type']): 'book-open' | 'check-square' | 'users' | 'bell' => {
  switch (type) {
    case 'class':
      return 'book-open';
    case 'task':
      return 'check-square';
    case 'event':
      return 'users';
    case 'reminder':
      return 'bell';
    default:
      return 'bell';
  }
};
