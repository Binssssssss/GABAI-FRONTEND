import React from 'react';
import TaskOverviewView from './TaskOverviewView';
import TaskTimelineView from './TaskTimelineView';
import TaskSubjectsView from './TaskSubjectsView';
import TaskAnalyticsView from './TaskAnalyticsView';
import { TaskTheme } from '../../types';
import type { useTaskData } from '../../hooks/useTaskData';

interface TaskMainViewsContainerProps {
  taskData: ReturnType<typeof useTaskData>;
  theme: TaskTheme;
}

export default function TaskMainViewsContainer({
  taskData,
  theme,
}: TaskMainViewsContainerProps) {
  switch (taskData.activeSubTab) {
    case 'overview':
      return <TaskOverviewView taskData={taskData} theme={theme} />;
    case 'timeline':
      return <TaskTimelineView taskData={taskData} theme={theme} />;
    case 'subjects':
      return <TaskSubjectsView taskData={taskData} theme={theme} />;
    case 'analytics':
      return <TaskAnalyticsView taskData={taskData} theme={theme} />;
    default:
      return <TaskOverviewView taskData={taskData} theme={theme} />;
  }
}
