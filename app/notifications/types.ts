
export type NotificationType =
  | 'task_due_today'
  | 'task_due_tomorrow'
  | 'task_overdue'
  | 'upcoming_deadline'
  | 'high_priority_task'
  | 'completed_task'
  | 'missed_task'
  | 'productivity_insight'
  | 'general';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  time: string;
  read: boolean;

  icon: string;
  iconColor: string;

  taskId?: string;
  assignmentId?: string;
}

export type CreateNotificationInput = Omit<Notification, 'id'> & {
  id?: string;
};

