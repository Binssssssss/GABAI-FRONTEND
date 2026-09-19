import { DashboardDeadline, DashboardSubject, DashboardTimelineItem } from '../types';

export const INITIAL_DEADLINES: DashboardDeadline[] = [
  {
    id: '1',
    subject: 'Capstone Paper',
    assignment: 'Methodology Outline Draft',
    countdown: '3 hours left',
    priority: 'High',
    completion: 80,
  },
  {
    id: '2',
    subject: 'Economics',
    assignment: 'Fiscal Policy Exercise',
    countdown: '1 day left',
    priority: 'High',
    completion: 60,
  },
  {
    id: '3',
    subject: 'Technopreneurship',
    assignment: 'Competitor Analysis Deck',
    countdown: '2 days left',
    priority: 'Medium',
    completion: 40,
  },
  {
    id: '4',
    subject: 'Ethics',
    assignment: 'Case Study Essay 2',
    countdown: '4 days left',
    priority: 'Low',
    completion: 10,
  },
  {
    id: '5',
    subject: 'Database Systems',
    assignment: 'Normalization Lab 3',
    countdown: '5 days left',
    priority: 'Medium',
    completion: 0,
  },
];

export const INITIAL_SUBJECTS: DashboardSubject[] = [
  {
    name: 'Capstone Paper',
    pending: 3,
    completed: 5,
    quiz: 'Final Defense Aug 3',
    projectStatus: 'Drafting methodology',
    completion: 62,
  },
  {
    name: 'Economics',
    pending: 2,
    completed: 3,
    quiz: 'Quiz 2 Monday',
    projectStatus: 'N/A',
    completion: 60,
  },
  {
    name: 'Technopreneurship',
    pending: 1,
    completed: 4,
    quiz: 'Pitching Friday',
    projectStatus: 'Prototype stage',
    completion: 80,
  },
  {
    name: 'Ethics',
    pending: 1,
    completed: 2,
    quiz: 'None Scheduled',
    projectStatus: 'N/A',
    completion: 66,
  },
];

export const INITIAL_TIMELINE_ITEMS: DashboardTimelineItem[] = [
  { time: '09:00 AM', type: 'class', title: 'Economics Lecture' },
  { time: '11:00 AM', type: 'event', title: 'Group Study Session at Library' },
  { time: '01:30 PM', type: 'class', title: 'Technopreneurship Lab' },
  { time: '04:00 PM', type: 'task', title: 'Review Economics Chapter 5 Formulas', status: 'Pending', deadline: '4:00 PM' },
  { time: '08:00 PM', type: 'reminder', title: 'Log budget expenses for today' },
];
