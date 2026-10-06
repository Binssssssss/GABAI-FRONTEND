import {
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  taskService,
  Task as BackendTask,
} from '@/app/services/task.services';

import {
  DashboardTask,
  DashboardDeadline,
  DashboardSubject,
  DashboardTimelineItem,
} from '../types';

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');
  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getToday = () => {
  return formatLocalDate(new Date());
};

const getDaysDifference = (
  dueDate: string
): number => {
  if (!dueDate) {
    return 0;
  }

  const today = new Date();
  const due = new Date(dueDate);

  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const difference =
    due.getTime() -
    today.getTime();

  return Math.ceil(
    difference /
      (1000 * 60 * 60 * 24)
  );
};

const getDeadlineLabel = (
  dueDate: string
): string => {
  const difference =
    getDaysDifference(dueDate);

  if (difference < 0) {
    const days = Math.abs(difference);

    return `${days} day${
      days === 1 ? '' : 's'
    } overdue`;
  }

  if (difference === 0) {
    return 'Today';
  }

  if (difference === 1) {
    return 'Tomorrow';
  }

  return `In ${difference} days`;
};

const getMappedTask = (
  task: BackendTask
): DashboardTask => ({
  id: task.id,
  subject: task.subject || 'General',
  title: task.title,
  dueTime: task.dueTime || 'All day',
  priority: task.priority,
  countdown: getDeadlineLabel(
    task.dueDate
  ),
  completed: task.completed,
});

export function useDashboardData() {
  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [tasks, setTasks] =
    useState<BackendTask[]>([]);

  const [error, setError] =
    useState<string | null>(null);

  const [greeting] = useState(() => {
    const hour =
      new Date().getHours();

    if (hour < 12) {
      return 'Good morning';
    }

    if (hour < 18) {
      return 'Good afternoon';
    }

    return 'Good evening';
  });

  /**
   * Load dashboard tasks
   */
  const loadTasks =
    useCallback(async () => {
      try {
        setError(null);

        console.log(
          '========== DASHBOARD TASK LOAD =========='
        );

        const backendTasks =
          await taskService.getTasks();

        console.log(
          'Dashboard backend tasks:',
          backendTasks
        );

        console.log(
          'Dashboard tasks is array:',
          Array.isArray(
            backendTasks
          )
        );

        setTasks(
          Array.isArray(
            backendTasks
          )
            ? backendTasks
            : []
        );

        console.log(
          'Dashboard task count:',
          Array.isArray(
            backendTasks
          )
            ? backendTasks.length
            : 0
        );

        console.log(
          '========================================='
        );
      } catch (err) {
        console.error(
          'Failed to load dashboard tasks:',
          err
        );

        setError(
          'Unable to load your tasks.'
        );

        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    }, []);

  /**
   * Initial load
   */
  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  /**
   * Today's focus
   *
   * Priority:
   * 1. Overdue
   * 2. Today's tasks
   * 3. High priority upcoming tasks
   */
  const focusTasks: DashboardTask[] =
    (() => {
      const today =
        getToday();

      const activeTasks =
        tasks.filter(
          (task) =>
            !task.completed
        );

      const overdue =
        activeTasks.filter(
          (task) =>
            task.dueDate < today
        );

      const todayTasks =
        activeTasks.filter(
          (task) =>
            task.dueDate === today
        );

      const highPriority =
        activeTasks.filter(
          (task) =>
            task.priority ===
            'High'
        );

      const combined = [
        ...overdue,
        ...todayTasks,
        ...highPriority,
      ];

      const uniqueTasks =
        combined.filter(
          (task, index, array) =>
            array.findIndex(
              (item) =>
                item.id === task.id
            ) === index
        );

      return uniqueTasks
        .sort((a, b) => {
          const priorityOrder = {
            High: 0,
            Medium: 1,
            Low: 2,
          };

          if (
            priorityOrder[a.priority] !==
            priorityOrder[b.priority]
          ) {
            return (
              priorityOrder[a.priority] -
              priorityOrder[b.priority]
            );
          }

          return (
            a.dueDate.localeCompare(
              b.dueDate
            )
          );
        })
        .slice(0, 3)
        .map(getMappedTask);
    })();

  /**
   * Upcoming deadlines
   *
   * Shows incomplete tasks ordered
   * by nearest deadline.
   */
  const deadlines: DashboardDeadline[] =
    tasks
      .filter(
        (task) =>
          !task.completed &&
          !!task.dueDate
      )
      .sort(
        (a, b) =>
          a.dueDate.localeCompare(
            b.dueDate
          )
      )
      .slice(0, 5)
      .map((task) => ({
        id: task.id,
        subject:
          task.subject ||
          'General',
        assignment:
          task.title,
        countdown:
          getDeadlineLabel(
            task.dueDate
          ),
        priority:
          task.priority,
        completion: task.completed
          ? 100
          : 0,
      }));

  /**
   * Subject progress
   */
  const subjects: DashboardSubject[] =
    (() => {
      const subjectMap =
        new Map<
          string,
          BackendTask[]
        >();

      tasks.forEach((task) => {
        const subject =
          task.subject?.trim() ||
          'General';

        const existing =
          subjectMap.get(
            subject
          ) || [];

        existing.push(task);

        subjectMap.set(
          subject,
          existing
        );
      });

      return Array.from(
        subjectMap.entries()
      ).map(
        ([name, subjectTasks]) => {
          const completed =
            subjectTasks.filter(
              (task) =>
                task.completed
            ).length;

          const pending =
            subjectTasks.length -
            completed;

          const completion =
            subjectTasks.length >
            0
              ? Math.round(
                  (completed /
                    subjectTasks.length) *
                    100
                )
              : 0;

          return {
            name,
            pending,
            completed,
            quiz: '—',
            projectStatus: '—',
            completion,
          };
        }
      );
    })();

  /**
   * Today's schedule
   *
   * For now this uses actual tasks.
   * Calendar/event integration can be
   * added separately.
   */
  const timelineItems: DashboardTimelineItem[] =
    tasks
      .filter(
        (task) =>
          task.dueDate ===
          getToday()
      )
      .sort((a, b) =>
        (a.dueTime || '23:59').localeCompare(
          b.dueTime || '23:59'
        )
      )
      .map((task) => ({
        time:
          task.dueTime ||
          'All day',

        type: 'task',

        title: task.title,

        status: task.completed
          ? 'Completed'
          : 'Pending',

        deadline:
          task.dueTime ||
          undefined,
      }));

  /**
   * Toggle task completion
   */
  const handleToggleComplete =
    useCallback(
      async (id: string) => {
        const currentTask =
          tasks.find(
            (task) =>
              task.id === id
          );

        if (!currentTask) {
          return;
        }

        const newCompleted =
          !currentTask.completed;

        try {
          console.log(
            'Updating dashboard task:',
            id,
            newCompleted
          );

          await taskService.updateTask(
            id,
            {
              completed:
                newCompleted,
            }
          );

          setTasks((previous) =>
            previous.map(
              (task) =>
                task.id === id
                  ? {
                      ...task,
                      completed:
                        newCompleted,
                    }
                  : task
            )
          );
        } catch (err) {
          console.error(
            'Failed to update task:',
            err
          );

          setError(
            'Unable to update the task.'
          );
        }
      },
      [tasks]
    );

  /**
   * Refresh dashboard
   */
  const onRefresh =
    useCallback(async () => {
      setIsRefreshing(true);

      try {
        await loadTasks();
      } finally {
        setIsRefreshing(false);
      }
    }, [loadTasks]);

  return {
    greeting,

    tasks,

    focusTasks,

    deadlines,

    subjects,

    timelineItems,

    isLoading,

    isRefreshing,

    error,

    onRefresh,

    handleToggleComplete,
  };
}