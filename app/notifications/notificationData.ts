import { Feather } from '@expo/vector-icons';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
  category: 'academic' | 'productivity' | 'achievement';
  read: boolean;
}

export const initialNotifications: AppNotification[] = [
  {
    id: '1',
    title: 'Weekly Productivity',
    message: 'You completed 8 tasks this week.',
    time: '2 hours ago',
    icon: 'bar-chart-2',
    iconColor: '#A97C50',
    category: 'productivity',
    read: false,
  },
  {
    id: '2',
    title: 'Workload Insight',
    message: 'Capstone Paper has the highest remaining workload.',
    time: 'Today',
    icon: 'trending-up',
    iconColor: '#F59E0B',
    category: 'productivity',
    read: false,
  },
  {
    id: '3',
    title: 'Great Progress',
    message: 'You have no overdue assignments.',
    time: 'Today',
    icon: 'check-circle',
    iconColor: '#10B981',
    category: 'achievement',
    read: false,
  },
];