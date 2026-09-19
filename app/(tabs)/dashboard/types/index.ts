export interface DashboardTask {
  id: string;
  title: string;
  subject: string;
  dueTime: string;
  priority: 'High' | 'Medium' | 'Low';
  countdown: string;
  completed: boolean;
}

export interface DashboardDeadline {
  id: string;
  subject: string;
  assignment: string;
  countdown: string;
  priority: 'High' | 'Medium' | 'Low';
  completion: number;
}

export interface DashboardSubject {
  name: string;
  pending: number;
  completed: number;
  quiz: string;
  projectStatus: string;
  completion: number;
}

export interface DashboardTimelineItem {
  time: string;
  type: 'class' | 'task' | 'event' | 'reminder';
  title: string;
  status?: string;
  deadline?: string;
}
