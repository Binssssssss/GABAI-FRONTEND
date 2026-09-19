import React from 'react';
import AddTaskModal from './AddTaskModal';
import TaskFocusModal from './TaskFocusModal';
import { TaskTheme } from '../../types';
import type { useTaskData } from '../../hooks/useTaskData';

interface TasksModalContainerProps {
  taskData: ReturnType<typeof useTaskData>;
  theme: TaskTheme;
}

export default function TasksModalContainer({
  taskData,
  theme,
}: TasksModalContainerProps) {
  return (
    <>
      <AddTaskModal taskData={taskData} theme={theme} />
      <TaskFocusModal taskData={taskData} theme={theme} />
    </>
  );
}
