import {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { Alert } from 'react-native';

import { localDb, Task, SubTask } from '@/app/services/localDb';
import api from '@/app/services/api';

import {
  TaskSubTab,
  TaskCategory,
  TaskPriority,
  TaskDifficulty,
  TaskRepeat,
} from '../types';

// ------------------------------------------------------
// API TYPES
// ------------------------------------------------------

type ApiTask = Partial<Task> & {
  id: string;
  title: string;
};

// ------------------------------------------------------
// DATE HELPERS
// ------------------------------------------------------

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getTodayAndTomorrow = () => {
  const today = new Date();

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return {
    todayStr: formatLocalDate(today),
    tomorrowStr: formatLocalDate(tomorrow),
  };
};

// ------------------------------------------------------
// API HELPERS
// ------------------------------------------------------

<<<<<<< HEAD
const mapApiTaskToTask = (task: ApiTask): Task => {
  return {
    id: task.id,
    title: task.title,

    description:
      task.description ??
      'No detailed description provided.',
=======
const normalizeBackendTask = (
  task: BackendTask
): Task => ({
  id: task.id,
  title: task.title,
  description: task.description || '',
  subject: task.subject || 'General',

  // Frontend-only defaults.
  category: 'Academic',
  difficulty: 'Medium',
  duration: 1,
  repeat: 'None',
  isPinned: false,
  isFavorite: false,
  attachments: 0,
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2

    subject:
      task.subject ??
      'General',

<<<<<<< HEAD
    category:
      task.category ??
      'Academic',

    priority:
      task.priority ??
      'Medium',

    difficulty:
      task.difficulty ??
      'Medium',

    duration:
      typeof task.duration === 'number'
        ? task.duration
        : 1,

    dueDate:
      task.dueDate ??
      formatLocalDate(new Date()),

    dueTime:
      task.dueTime ??
      '12:00',

    completed:
      task.completed ?? false,

    hasReminder:
      task.hasReminder ?? false,

    repeat:
      task.repeat ??
      'None',

    isPinned:
      task.isPinned ?? false,

    isFavorite:
      task.isFavorite ?? false,

    attachments:
      task.attachments ?? 0,

    subTasks:
      task.subTasks ?? [],

    createdAt:
      task.createdAt ?? Date.now(),
  };
};

const getApiErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      }
    ).response;

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};
=======
  subTasks: (task.subTasks || []).map(
    (subTask) => ({
      id: subTask.id,
      title: subTask.title,
      completed: subTask.completed,
    })
  ),

  createdAt:
    Date.parse(task.createdAt) ||
    Date.now(),
});
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2

// ------------------------------------------------------
// TASK DATA HOOK
// ------------------------------------------------------

export function useTaskData() {
  // ----------------------------------------------------
  // BASIC STATE
  // ----------------------------------------------------

  const [activeSubTab, setActiveSubTab] =
    useState<TaskSubTab>('overview');

  const [tasks, setTasksState] =
<<<<<<< HEAD
    useState<Task[]>(() => localDb.getTasks());
=======
    useState<Task[]>([]);
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2

  const [activeFilter, setActiveFilter] =
    useState<string>('All');

<<<<<<< HEAD
  const [isAdding, setIsAdding] =
    useState(false);
=======
  const [sortOption, setSortOption] =
    useState<string>('Due Date');

  const [isAdding, setIsAdding] =
    useState(false);

  // Task currently being edited.
  // null means create mode.
  const [editingTask, setEditingTask] =
    useState<Task | null>(null);
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  // ----------------------------------------------------
  // ANALYTICS
  // ----------------------------------------------------

<<<<<<< HEAD
  const [analytics, setAnalytics] =
    useState<any>(null);
=======
  const loadTasks = useCallback(
    async () => {
      try {
        setIsLoading(true);

        console.log(
          '========== LOAD TASKS =========='
        );

        console.log(
          'Calling taskService.getTasks()...'
        );

        const backendTasks =
          await taskService.getTasks();

        console.log(
          'Backend tasks:',
          backendTasks
        );

        console.log(
          'Is array:',
          Array.isArray(backendTasks)
        );

        const normalizedTasks =
          backendTasks.map(
            normalizeBackendTask
          );

        console.log(
          'Normalized tasks:',
          normalizedTasks
        );

        localDb.setTasks(
          normalizedTasks
        );

        setTasksState(
          normalizedTasks
        );

        console.log(
          'Task state updated successfully.'
        );

        console.log(
          '================================'
        );
      } catch (error) {
        console.error(
          'Failed to load tasks:',
          error
        );

        showErrorAlert(
          'Unable to Load Tasks',
          'We could not load your tasks right now. Please check your connection and try again.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ----------------------------------------------------
  // INITIAL LOAD
  // ----------------------------------------------------

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  // ----------------------------------------------------
  // LOCAL DATABASE SYNC
  // ----------------------------------------------------

  useEffect(() => {
    const unsubscribe =
      localDb.subscribe(() => {
        setTasksState(
          localDb.getTasks()
        );
      });

    return unsubscribe;
  }, []);

  // ----------------------------------------------------
  // TASK STORAGE
  // ----------------------------------------------------
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2

  const setTasks = useCallback(
    (
      newTasks:
        | Task[]
        | ((prev: Task[]) => Task[]),
    ) => {
      const currentTasks =
        localDb.getTasks();

      const updated =
        typeof newTasks === 'function'
          ? newTasks(currentTasks)
          : newTasks;

      localDb.setTasks(updated);
      setTasksState(updated);
    },
    [],
  );

  // Keep hook synchronized with local database
  useEffect(() => {
    const unsubscribe =
      localDb.subscribe(() => {
        setTasksState(
          localDb.getTasks(),
        );
      });

    return unsubscribe;
  }, []);

  // ----------------------------------------------------
  // MULTI SELECT
  // ----------------------------------------------------

  const [
    isMultiSelectMode,
    setIsMultiSelectMode,
  ] = useState(false);

  const [
    selectedTaskIds,
    setSelectedTaskIds,
  ] = useState<string[]>([]);

  // ----------------------------------------------------
  // FOCUS MODE
  // ----------------------------------------------------

  const [
    focusedTask,
    setFocusedTask,
  ] = useState<Task | null>(null);

  const [
    isFocusActive,
    setIsFocusActive,
  ] = useState(false);

  const [
    pomodoroTime,
    setPomodoroTime,
  ] = useState(25 * 60);

  const [
    isTimerRunning,
    setIsTimerRunning,
  ] = useState(false);

  // ----------------------------------------------------
  // TASK FORM
  // ----------------------------------------------------

  const [newTitle, setNewTitle] =
    useState('');

  const [newDesc, setNewDesc] =
    useState('');

  const [newSubject, setNewSubject] =
    useState('Capstone Paper');

  const [newCategory, setNewCategory] =
    useState<TaskCategory>('Academic');

  const [newPriority, setNewPriority] =
    useState<TaskPriority>('Medium');

  const [newDifficulty, setNewDifficulty] =
    useState<TaskDifficulty>('Medium');

  const [newDuration, setNewDuration] =
    useState('1.5');

  const [newDueDate, setNewDueDate] =
    useState(() =>
      formatLocalDate(new Date()),
    );

  const [newDueTime, setNewDueTime] =
    useState('12:00');

  const [
    newHasReminder,
    setNewHasReminder,
  ] = useState(false);

  const [newRepeat, setNewRepeat] =
    useState<TaskRepeat>('None');

  const [
    newSubTaskInput,
    setNewSubTaskInput,
  ] = useState('');

  const [
    newSubTasksList,
    setNewSubTasksList,
  ] = useState<string[]>([]);

  // ----------------------------------------------------
  // SEARCH
  // ----------------------------------------------------

  const [searchQuery, setSearchQuery] =
    useState('');

  const [isSearching, setIsSearching] =
    useState(false);

  // ----------------------------------------------------
  // DATE VALUES
  // ----------------------------------------------------

  const {
    todayStr,
    tomorrowStr,
  } = useMemo(
    () => getTodayAndTomorrow(),
    [],
  );

  // ----------------------------------------------------
  // LOAD TASK ANALYTICS
  // ----------------------------------------------------

  const loadAnalytics = useCallback(
    async () => {
      try {
        const response =
          await api.get(
            '/api/tasks/analytics',
          );

        if (
          response.data?.success &&
          response.data?.data
        ) {
          setAnalytics(
            response.data.data,
          );
        }
      } catch (error) {
        console.error(
          'Failed to load task analytics:',
          error,
        );
      }
    },
    [],
  );

  // ----------------------------------------------------
  // LOAD TASKS FROM BACKEND
  // ----------------------------------------------------

  const loadTasks = useCallback(
    async (
      showLoading = true,
    ) => {
      try {
        if (showLoading) {
          setIsLoading(true);
        }

        const response =
          await api.get(
            '/api/tasks',
          );

        const responseData =
          response.data;

        const apiTasks: ApiTask[] =
          Array.isArray(
            responseData?.data,
          )
            ? responseData.data
            : Array.isArray(
                responseData,
              )
              ? responseData
              : [];

        const mappedTasks =
          apiTasks.map(
            mapApiTaskToTask,
          );

        setTasksState(
          mappedTasks,
        );

        localDb.setTasks(
          mappedTasks,
        );

        await loadAnalytics();
      } catch (error) {
        console.error(
          'Failed to load tasks:',
          error,
        );

        Alert.alert(
          'Unable to Load Tasks',
          getApiErrorMessage(
            error,
            'Something went wrong while loading your tasks.',
          ),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [loadAnalytics],
  );

  // ----------------------------------------------------
  // INITIAL LOAD
  // ----------------------------------------------------

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadTasks();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [loadTasks]);

  // ----------------------------------------------------
  // POMODORO TIMER
  // ----------------------------------------------------

  useEffect(() => {
    let interval:
      ReturnType<typeof setInterval> | null =
      null;

    if (
      isTimerRunning &&
      pomodoroTime > 0
    ) {
      interval = setInterval(() => {
        setPomodoroTime(
          (prev) => prev - 1,
        );
      }, 1000);
    }

    if (pomodoroTime === 0 && isTimerRunning) {
      const timeoutId = setTimeout(() => {
        setIsTimerRunning(false);

        Alert.alert(
          'Focus Time Up!',
          'Great job! Take a small rest break.',
        );

        setPomodoroTime(
          25 * 60,
        );
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        if (interval) {
          clearInterval(interval);
        }
      };
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [
    isTimerRunning,
    pomodoroTime,
  ]);

  // ----------------------------------------------------
  // OVERALL CALCULATIONS
  // ----------------------------------------------------

  const totalTasks =
    tasks.length;

  const completedTasks =
    tasks.filter(
      (task) => task.completed,
    ).length;

  const activeTasks =
    tasks.filter(
      (task) => !task.completed,
    );

  const completionRate =
    totalTasks > 0
      ? Math.round(
<<<<<<< HEAD
          (completedTasks /
            totalTasks) *
            100,
        )
=======
        (completedTasks /
          totalTasks) *
        100
      )
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
      : 0;

  const estimatedRemainingHours =
    activeTasks.reduce(
      (sum, task) =>
        sum + task.duration,
      0,
    );

  // ----------------------------------------------------
  // WORKLOAD LEVEL
  // ----------------------------------------------------

  const getWorkloadLevel =
    useCallback(() => {
      const totalActive =
        activeTasks.length;

      const highPriorityCount =
        activeTasks.filter(
          (task) =>
            task.priority ===
            'High',
        ).length;

      if (
        totalActive >= 6 ||
        highPriorityCount >= 3
      ) {
        return {
          level: 'Heavy',
          color: '#EF4444',
          desc: 'High stress level detected. Prioritize critical deadlines first.',
        };
      }

      if (
        totalActive >= 3 ||
        highPriorityCount >= 1
      ) {
        return {
          level: 'Moderate',
          color: '#F59E0B',
          desc: 'Balanced workload. Keep steady study sessions.',
        };
      }

      return {
        level: 'Light',
        color: '#10B981',
        desc: 'Great job! Workload is well managed and relaxed.',
      };
    }, [activeTasks]);

  // ----------------------------------------------------
  // FILTERED TASKS
  // ----------------------------------------------------

  const filteredTasks =
    useMemo(() => {
<<<<<<< HEAD
      return tasks.filter(
        (task) => {
          // Search
          if (
            searchQuery.trim()
          ) {
            const query =
              searchQuery
                .toLowerCase()
                .trim();
=======
      return tasks.filter((task) => {
        if (searchQuery.trim()) {
          const query =
            searchQuery
              .toLowerCase()
              .trim();
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2


          const matchesTitle =
            task.title
              .toLowerCase()
              .includes(query);

          const matchesSubject =
            task.subject
              .toLowerCase()
              .includes(query);

          const matchesDescription =
            task.description
              .toLowerCase()
              .includes(query);

          // Filters
          if (
<<<<<<< HEAD
            activeFilter ===
            'Today'
=======
            !matchesTitle &&
            !matchesSubject &&
            !matchesDescription
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
          ) {
            return false;
          }
<<<<<<< HEAD

          if (
            activeFilter ===
            'Tomorrow'
          ) {
            return (
              task.dueDate ===
                tomorrowStr &&
              !task.completed
            );
          }

          if (
            activeFilter ===
            'Priority'
          ) {
            return (
              task.priority ===
                'High' &&
              !task.completed
            );
          }

          if (
            activeFilter ===
            'Difficulty'
          ) {
            return (
              task.difficulty ===
                'Hard' &&
              !task.completed
            );
          }

          if (
            activeFilter ===
            'Completed'
          ) {
            return task.completed;
          }

          return true;
        },
      );
=======
        }

        if (activeFilter === 'Today') {
          return (
            task.dueDate === todayStr &&
            !task.completed
          );
        }

        if (activeFilter === 'Tomorrow') {
          return (
            task.dueDate === tomorrowStr &&
            !task.completed
          );
        }

        if (activeFilter === 'Priority') {
          return (
            task.priority === 'High' &&
            !task.completed
          );
        }

        if (activeFilter === 'Difficulty') {
          return (
            task.difficulty === 'Hard' &&
            !task.completed
          );
        }

        if (activeFilter === 'Completed') {
          return task.completed;
        }

        return true;
      });


>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
    }, [
      tasks,
      searchQuery,
      activeFilter,
      todayStr,
      tomorrowStr,
    ]);

    const sortedTasks = useMemo(() => {
  const sorted = [...filteredTasks];

  if (sortOption === 'Due Date') {
    sorted.sort((a, b) => {
      return (
        new Date(a.dueDate).getTime() -
        new Date(b.dueDate).getTime()
      );
    });
  }

  return sorted;
}, [filteredTasks, sortOption]);


  // ----------------------------------------------------
  // TIMELINE TASK GROUPS
  // ----------------------------------------------------

  const overdueTasks =
    useMemo(
      () =>
        tasks.filter(
          (task) =>
            task.dueDate <
<<<<<<< HEAD
              todayStr &&
            !task.completed,
=======
            todayStr &&
            !task.completed
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
        ),
      [tasks, todayStr],
    );

  const todayTasks =
    useMemo(
      () =>
        tasks.filter(
          (task) =>
            task.dueDate ===
<<<<<<< HEAD
              todayStr &&
            !task.completed,
=======
            todayStr &&
            !task.completed
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
        ),
      [tasks, todayStr],
    );

  const tomorrowTasks =
    useMemo(
      () =>
        tasks.filter(
          (task) =>
            task.dueDate ===
<<<<<<< HEAD
              tomorrowStr &&
            !task.completed,
=======
            tomorrowStr &&
            !task.completed
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
        ),
      [tasks, tomorrowStr],
    );

  const upcomingTasks =
    useMemo(
      () =>
        tasks.filter(
          (task) =>
            task.dueDate >
<<<<<<< HEAD
              tomorrowStr &&
            !task.completed,
=======
            tomorrowStr &&
            !task.completed
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
        ),
      [tasks, tomorrowStr],
    );

  const completedTasksList =
    useMemo(
      () =>
        tasks.filter(
          (task) =>
            task.completed,
        ),
      [tasks],
    );

  // ----------------------------------------------------
<<<<<<< HEAD
  // TOGGLE TASK COMPLETION
=======
  // OPEN EDIT TASK
  // ----------------------------------------------------

  const openEditTask =
    useCallback(
      (task: Task) => {
        setEditingTask(task);

        setNewTitle(
          task.title
        );

        setNewDesc(
          task.description || ''
        );

        setNewSubject(
          task.subject || 'General'
        );

        setNewCategory(
          task.category
        );

        setNewPriority(
          task.priority
        );

        setNewDifficulty(
          task.difficulty
        );

        setNewDuration(
          String(task.duration)
        );

        setNewDueDate(
          task.dueDate
        );

        setNewDueTime(
          task.dueTime || '12:00'
        );

        setNewHasReminder(
          task.hasReminder
        );

        setNewRepeat(
          task.repeat
        );

        setNewSubTasksList(
          (task.subTasks || []).map(
            (subTask) =>
              subTask.title
          )
        );

        setNewSubTaskInput('');

        setIsAdding(true);
      },
      []
    );

  // ----------------------------------------------------
  // COMPLETE / RESTORE TASK
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
  // ----------------------------------------------------

  const toggleTask =
    useCallback(
      async (taskId: string) => {
        const currentTask =
          tasks.find(
            (task) =>
              task.id === taskId
          );

        if (!currentTask) {
          showErrorAlert(
            'Task Not Found',
            'We could not find this task. Please refresh and try again.'
          );
          return;
        }

        const newCompletedState =
          !currentTask.completed;

        try {
          const updatedBackendTask =
            await taskService.updateTask(
              taskId,
              {
                completed:
                  newCompletedState,
              }
            );

          const updatedTask =
            normalizeBackendTask(
              updatedBackendTask
            );

          setTasks((prev) =>
            prev.map((task) =>
              task.id === taskId
                ? {
                  ...task,
                  completed:
                    updatedTask.completed,
                }
<<<<<<< HEAD
              : task,
          ),
        );
      },
      [setTasks],
=======
                : task
            )
          );

          if (newCompletedState) {
            showSuccessAlert(
              'Task Completed',
              `"${currentTask.title}" has been marked as completed.`
            );
          } else {
            showSuccessAlert(
              'Task Restored',
              `"${currentTask.title}" has been restored to your active tasks.`
            );
          }
        } catch (error: any) {
          console.error(
            'Failed to update task completion:',
            error
          );

          showErrorAlert(
            newCompletedState
              ? 'Unable to Complete Task'
              : 'Unable to Restore Task',
            error?.response?.data?.message ||
            'We could not update this task. Please try again.'
          );
        }
      },
      [tasks, setTasks]
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
    );

  // ----------------------------------------------------
  // EXPLICIT RESTORE TASK
  // ----------------------------------------------------

  const handleRestoreTask =
    useCallback(
<<<<<<< HEAD
      (
        taskId: string,
        subTaskId: string,
      ) => {
=======
      async (taskId: string) => {
        const currentTask =
          tasks.find(
            (task) =>
              task.id === taskId
          );

        if (!currentTask) {
          showErrorAlert(
            'Task Not Found',
            'We could not find this task. Please refresh and try again.'
          );
          return;
        }

        if (!currentTask.completed) {
          return;
        }

        try {
          const updatedBackendTask =
            await taskService.updateTask(
              taskId,
              {
                completed: false,
              }
            );

          const updatedTask =
            normalizeBackendTask(
              updatedBackendTask
            );

          setTasks((prev) =>
            prev.map((task) =>
              task.id === taskId
                ? {
                  ...task,
                  completed:
                    updatedTask.completed,
                }
                : task
            )
          );

          showSuccessAlert(
            'Task Restored',
            `"${currentTask.title}" has been restored to your active tasks.`
          );
        } catch (error: any) {
          console.error(
            'Failed to restore task:',
            error
          );

          showErrorAlert(
            'Unable to Restore Task',
            error?.response?.data?.message ||
            'We could not restore this task. Please try again.'
          );
        }
      },
      [tasks, setTasks]
    );

  // ----------------------------------------------------
  // SUBTASK TOGGLE
  // ----------------------------------------------------

  const toggleSubTask = useCallback(
    async (
      taskId: string,
      subTaskId: string
    ) => {
      const currentTask = tasks.find(
        (task) => task.id === taskId
      );

      if (!currentTask) {
        return;
      }

      const currentSubTask =
        currentTask.subTasks.find(
          (subTask) =>
            subTask.id === subTaskId
        );

      if (!currentSubTask) {
        return;
      }

      const newCompletedState =
        !currentSubTask.completed;

      try {
        await taskService.updateSubTask(
          taskId,
          subTaskId,
          newCompletedState
        );

>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
        setTasks((prev) =>
          prev.map((task) => {
            if (task.id !== taskId) {
              return task;
            }

            const updatedSubs =
              task.subTasks.map(
                (subTask) =>
                  subTask.id ===
                  subTaskId
                    ? {
                        ...subTask,
                        completed:
                          !subTask.completed,
                      }
                    : subTask,
              );

            return {
              ...task,
<<<<<<< HEAD
              subTasks:
                updatedSubs,
=======
              subTasks: task.subTasks.map(
                (subTask) =>
                  subTask.id === subTaskId
                    ? {
                      ...subTask,
                      completed:
                        newCompletedState,
                    }
                    : subTask
              ),
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
            };
          }),
        );
<<<<<<< HEAD
      },
      [setTasks],
    );
=======
      } catch (error: any) {
        console.error(
          'Failed to update subtask:',
          error
        );
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2

        Alert.alert(
          'Unable to Update Subtask',
          error?.response?.data?.message ||
          'We could not update this subtask. Please try again.'
        );
      }
    },
    [tasks, setTasks]
  );
  // ----------------------------------------------------
  // DELETE TASK
  // ----------------------------------------------------

  const handleDeleteTask =
    useCallback(
      (taskId: string) => {
        Alert.alert(
<<<<<<< HEAD
          'Delete Task',
          'Are you sure you want to delete this task?',
=======
          'Delete Task?',
          'This task will be permanently removed from your task list.',
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Delete',
              style: 'destructive',
<<<<<<< HEAD
              onPress: () => {
                setTasks((prev) =>
                  prev.filter(
                    (task) =>
                      task.id !==
                      taskId,
                  ),
                );

                if (
                  focusedTask?.id ===
                  taskId
                ) {
                  setIsFocusActive(
                    false,
                  );
                  setFocusedTask(
                    null,
=======
              onPress: async () => {
                try {
                  await taskService.deleteTask(
                    taskId
                  );

                  setTasks((prev) =>
                    prev.filter(
                      (task) =>
                        task.id !== taskId
                    )
                  );

                  if (
                    focusedTask?.id ===
                    taskId
                  ) {
                    setIsFocusActive(
                      false
                    );
                    setFocusedTask(null);
                  }

                  if (
                    editingTask?.id ===
                    taskId
                  ) {
                    setEditingTask(
                      null
                    );
                    setIsAdding(false);
                  }

                  showSuccessAlert(
                    'Task Deleted',
                    'The task was deleted successfully.'
                  );
                } catch (error: any) {
                  console.error(
                    'Failed to delete task:',
                    error
                  );

                  showErrorAlert(
                    'Unable to Delete Task',
                    error?.response?.data?.message ||
                    'We could not delete this task. Please try again.'
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
                  );
                }
              },
            },
          ],
        );
      },
<<<<<<< HEAD
      [focusedTask, setTasks],
=======
      [
        focusedTask,
        editingTask,
        setTasks,
      ]
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
    );

  // ----------------------------------------------------
  // PIN TASK
  // ----------------------------------------------------

  const handleTogglePin =
    useCallback(
      (taskId: string) => {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? {
<<<<<<< HEAD
                  ...task,
                  isPinned:
                    !task.isPinned,
                }
              : task,
          ),
=======
                ...task,
                isPinned:
                  !task.isPinned,
              }
              : task
          )
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
        );
      },
      [setTasks],
    );

  // ----------------------------------------------------
  // FAVORITE TASK
  // ----------------------------------------------------

  const handleToggleFavorite =
    useCallback(
      (taskId: string) => {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? {
<<<<<<< HEAD
                  ...task,
                  isFavorite:
                    !task.isFavorite,
                }
              : task,
          ),
=======
                ...task,
                isFavorite:
                  !task.isFavorite,
              }
              : task
          )
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
        );
      },
      [setTasks],
    );

  // ----------------------------------------------------
  // MULTI SELECT
  // ----------------------------------------------------

  const toggleSelectTask =
    useCallback(
      (taskId: string) => {
        setSelectedTaskIds(
          (prev) =>
            prev.includes(taskId)
              ? prev.filter(
<<<<<<< HEAD
                  (id) =>
                    id !== taskId,
                )
              : [
                  ...prev,
                  taskId,
                ],
=======
                (id) =>
                  id !== taskId
              )
              : [
                ...prev,
                taskId,
              ]
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
        );
      },
      [],
    );

  const handleBulkComplete =
    useCallback(async () => {
      if (
        selectedTaskIds.length ===
        0
      ) {
        return;
      }

<<<<<<< HEAD
      setTasks((prev) =>
        prev.map((task) =>
=======
      const selectedTasks =
        tasks.filter((task) =>
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
          selectedTaskIds.includes(
            task.id,
          )
        );

      try {
        await Promise.all(
          selectedTasks.map((task) =>
            task.completed
              ? Promise.resolve()
              : taskService.updateTask(
                task.id,
                {
                  completed: true,
                }
              )
          )
        );

        setTasks((prev) =>
          prev.map((task) =>
            selectedTaskIds.includes(
              task.id
            )
              ? {
                ...task,
                completed: true,
              }
<<<<<<< HEAD
            : task,
        ),
      );

      setSelectedTaskIds([]);
      setIsMultiSelectMode(
        false,
      );
=======
              : task
          )
        );

        const count =
          selectedTaskIds.length;

        setSelectedTaskIds([]);
        setIsMultiSelectMode(false);

        showSuccessAlert(
          'Tasks Completed',
          `${count} task${count === 1 ? '' : 's'
          } marked as completed.`
        );
      } catch (error: any) {
        console.error(
          'Failed to bulk complete tasks:',
          error
        );

        showErrorAlert(
          'Unable to Complete Tasks',
          error?.response?.data?.message ||
          'Some tasks could not be completed. Please try again.'
        );
      }
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
    }, [
      selectedTaskIds,
      tasks,
      setTasks,
    ]);

  const handleBulkDelete =
    useCallback(() => {
      if (
        selectedTaskIds.length ===
        0
      ) {
        return;
      }

      Alert.alert(
<<<<<<< HEAD
        'Bulk Delete',
        `Delete ${selectedTaskIds.length} selected tasks?`,
=======
        'Delete Selected Tasks?',
        `You're about to delete ${count} selected task${count === 1 ? '' : 's'
        }. This action cannot be undone.`,
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete All',
            style: 'destructive',
<<<<<<< HEAD
            onPress: () => {
              setTasks((prev) =>
                prev.filter(
                  (task) =>
                    !selectedTaskIds.includes(
                      task.id,
                    ),
                ),
              );

              setSelectedTaskIds([]);
              setIsMultiSelectMode(
                false,
              );
=======
            onPress: async () => {
              try {
                await Promise.all(
                  selectedTaskIds.map(
                    (taskId) =>
                      taskService.deleteTask(
                        taskId
                      )
                  )
                );

                setTasks((prev) =>
                  prev.filter(
                    (task) =>
                      !selectedTaskIds.includes(
                        task.id
                      )
                  )
                );

                setSelectedTaskIds([]);
                setIsMultiSelectMode(false);

                showSuccessAlert(
                  'Tasks Deleted',
                  `${count} task${count === 1
                    ? ''
                    : 's'
                  } removed successfully.`
                );
              } catch (error: any) {
                console.error(
                  'Failed to bulk delete tasks:',
                  error
                );

                showErrorAlert(
                  'Unable to Delete Tasks',
                  error?.response?.data?.message ||
                  'Some tasks could not be deleted. Please try again.'
                );
              }
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
            },
          },
        ],
      );
    }, [
      selectedTaskIds,
      setTasks,
    ]);

  // ----------------------------------------------------
  // FOCUS MODE
  // ----------------------------------------------------

  const handleFocusOnTask =
    useCallback(
      (task: Task) => {
        setFocusedTask(task);

        setPomodoroTime(
          25 * 60,
        );
        setIsTimerRunning(
          false,
        );
<<<<<<< HEAD
=======

        setIsTimerRunning(false);
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
        setIsFocusActive(true);
      },
      [],
    );

  const handleToggleTimer =
    useCallback(() => {
      setIsTimerRunning(
        (prev) => !prev,
      );
    }, []);

  const handleResetTimer =
    useCallback(() => {
<<<<<<< HEAD
      setIsTimerRunning(
        false,
      );
=======
      setIsTimerRunning(false);

>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
      setPomodoroTime(
        25 * 60,
      );
    }, []);

  const handleCloseFocus =
    useCallback(() => {
      setIsTimerRunning(
        false,
      );
      setIsFocusActive(false);
      setFocusedTask(null);
    }, []);

  // ----------------------------------------------------
  // SUBTASK BUILDER
  // ----------------------------------------------------

  const handleAddSubTaskToList =
    useCallback(() => {
      const value =
        newSubTaskInput.trim();

      if (!value) {
        return;
      }

      setNewSubTasksList(
        (prev) => [
          ...prev,
          value,
        ],
      );

      setNewSubTaskInput('');
    }, [newSubTaskInput]);

  const handleRemoveSubTaskFromList =
    useCallback(
      (index: number) => {
        setNewSubTasksList(
          (prev) =>
            prev.filter(
              (_, i) =>
                i !== index,
            ),
        );
      },
      [],
    );

  // ----------------------------------------------------
  // CREATE TASK
  // ----------------------------------------------------

  const handleCreateTask =
    useCallback(() => {
      if (!newTitle.trim()) {
        Alert.alert(
          'Error',
          'Please enter a task title',
        );
        return;
      }

      const duration =
        parseFloat(
          newDuration,
        ) || 1.0;

<<<<<<< HEAD
      const subTasksFormatted: SubTask[] =
        newSubTasksList.map(
          (title, index) => ({
            id: `${Date.now()}-${index}`,
            title,
            completed: false,
          }),
        );

      const created: Task = {
        id: Date.now().toString(),

        title:
          newTitle.trim(),

        description:
          newDesc.trim() ||
          'No detailed description provided.',

        subject:
          newSubject,

        category:
          newCategory,

        priority:
          newPriority,

        difficulty:
          newDifficulty,

        duration,

        dueDate:
          newDueDate,

        dueTime:
          newDueTime,

        completed: false,

        hasReminder:
          newHasReminder,

        repeat:
          newRepeat,

        isPinned: false,

        isFavorite: false,

        attachments: 0,

        subTasks:
          subTasksFormatted,

        createdAt:
          Date.now(),
      };

      setTasks((prev) => [
        created,
        ...prev,
      ]);

      // Reset form
      setNewTitle('');
      setNewDesc('');
      setNewSubTasksList([]);
      setNewSubTaskInput('');
      setIsAdding(false);
=======
        const backendTask =
          await taskService.createTask({
            title:
              newTitle.trim(),

            description:
              newDesc.trim() ||
              'No detailed description provided.',

            subject:
              newSubject,

            priority:
              newPriority,

            dueDate:
              newDueDate,

            dueTime:
              newDueTime,

            hasReminder:
              newHasReminder,

            subTasks:
              newSubTasksList,
          });

        const created =
          normalizeBackendTask(
            backendTask
          );

        const taskWithLocalFields: Task =
        {
          ...created,

          category:
            newCategory,

          difficulty:
            newDifficulty,

          duration,

          repeat:
            newRepeat,
        };

        setTasks((prev) => [
          taskWithLocalFields,
          ...prev,
        ]);

        setNewTitle('');
        setNewDesc('');
        setNewSubTasksList([]);
        setNewSubTaskInput('');

        setEditingTask(null);
        setIsAdding(false);

        showSuccessAlert(
          'Task Added',
          'Your task has been added successfully.'
        );
      } catch (error: any) {
        console.error(
          'Failed to create task:',
          error
        );

        showErrorAlert(
          'Unable to Save Task',
          error?.response?.data?.message ||
          'We could not save your task. Please try again.'
        );
      }
>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
    }, [
      newTitle,
      newDesc,
      newSubject,
      newCategory,
      newPriority,
      newDifficulty,
      newDuration,
      newDueDate,
      newDueTime,
      newHasReminder,
      newRepeat,
      newSubTasksList,
      setTasks,
    ]);

  // ----------------------------------------------------
  // UPDATE TASK
  // ----------------------------------------------------

  const handleUpdateTask =
    useCallback(async () => {
      if (!editingTask) {
        showErrorAlert(
          'No Task Selected',
          'We could not determine which task you are editing.'
        );
        return;
      }

      if (!newTitle.trim()) {
        showErrorAlert(
          'Task Title Required',
          'Please enter a title for your task before saving.'
        );
        return;
      }

      try {
        const updatedBackendTask =
          await taskService.updateTask(
            editingTask.id,
            {
              title:
                newTitle.trim(),

              description:
                newDesc.trim() ||
                'No detailed description provided.',

              subject:
                newSubject,

              priority:
                newPriority,

              dueDate:
                newDueDate,

              dueTime:
                newDueTime,

              hasReminder:
                newHasReminder,

              subTasks:
                newSubTasksList,
            }
          );

        const updated =
          normalizeBackendTask(
            updatedBackendTask
          );

        setTasks((prev) =>
          prev.map((existingTask) => {
            if (
              existingTask.id !==
              editingTask.id
            ) {
              return existingTask;
            }

            return {
              ...updated,

              // Preserve frontend-only
              // task properties.
              category:
                existingTask.category,

              difficulty:
                existingTask.difficulty,

              duration:
                existingTask.duration,

              repeat:
                existingTask.repeat,

              isPinned:
                existingTask.isPinned,

              isFavorite:
                existingTask.isFavorite,

              attachments:
                existingTask.attachments,
            };
          })
        );

        // Keep focus mode synchronized
        // if this task is currently focused.
        if (
          focusedTask?.id ===
          editingTask.id
        ) {
          setFocusedTask((prev) =>
            prev
              ? {
                ...prev,

                title:
                  newTitle.trim(),

                description:
                  newDesc.trim() ||
                  'No detailed description provided.',

                subject:
                  newSubject,

                priority:
                  newPriority,

                dueDate:
                  newDueDate,

                dueTime:
                  newDueTime,

                hasReminder:
                  newHasReminder,

                subTasks:
                  updated.subTasks,
              }
              : prev
          );
        }

        setEditingTask(null);
        setIsAdding(false);

        setNewTitle('');
        setNewDesc('');
        setNewSubTasksList([]);
        setNewSubTaskInput('');

        showSuccessAlert(
          'Task Updated',
          'Your task has been updated successfully.'
        );
      } catch (error: any) {
        console.error(
          'Failed to update task:',
          error
        );

        showErrorAlert(
          'Unable to Update Task',
          error?.response?.data?.message ||
          'We could not update your task. Please try again.'
        );
      }
    }, [
      editingTask,
      newTitle,
      newDesc,
      newSubject,
      newPriority,
      newDueDate,
      newDueTime,
      newHasReminder,
      newSubTasksList,
      focusedTask,
      setTasks,
    ]);

  // ----------------------------------------------------
  // REFRESH
  // ----------------------------------------------------

  const handleRefresh =
    useCallback(() => {
      setIsRefreshing(true);

      setTasksState(
        localDb.getTasks(),
      );

      setTimeout(() => {
        setIsRefreshing(false);
      }, 600);
    }, []);

  // ----------------------------------------------------
  // RETURN
  // ----------------------------------------------------

  return {
    // Tasks
    tasks,
    filteredTasks,
    sortedTasks,

    // Loading
    isLoading,

    // Analytics
    analytics,
    loadAnalytics,

    // Tabs & filters
    activeSubTab,
    setActiveSubTab,

    activeFilter,
    setActiveFilter,
    sortOption,
    setSortOption,

    // Search
    searchQuery,
    setSearchQuery,

    isSearching,
    setIsSearching,

    // Multi-select
    isMultiSelectMode,
    setIsMultiSelectMode,

    selectedTaskIds,
    toggleSelectTask,

    handleBulkComplete,
    handleBulkDelete,

    // Add / Edit task
    isAdding,
    setIsAdding,
    editingTask,
    setEditingTask,
    openEditTask,

    // Refresh
    isRefreshing,
    handleRefresh,

    // Focus mode
    focusedTask,
    isFocusActive,

    pomodoroTime,
    isTimerRunning,

    handleFocusOnTask,
    handleToggleTimer,
    handleResetTimer,
    handleCloseFocus,


    // Statistics
    totalTasks,
    completedTasks,
    activeTasks,
    completionRate,
    estimatedRemainingHours,
    getWorkloadLevel,

    // Timeline
    overdueTasks,
    todayTasks,
    tomorrowTasks,
    upcomingTasks,
    completedTasksList,

    // Task actions
    toggleTask,
    handleRestoreTask,
    toggleSubTask,
    handleDeleteTask,

    handleTogglePin,
    handleToggleFavorite,

    // Form fields
    newTitle,
    setNewTitle,

    newDesc,
    setNewDesc,

    newSubject,
    setNewSubject,

    newCategory,
    setNewCategory,

    newPriority,
    setNewPriority,

    newDifficulty,
    setNewDifficulty,

    newDuration,
    setNewDuration,

    newDueDate,
    setNewDueDate,

    newDueTime,
    setNewDueTime,

    newHasReminder,
    setNewHasReminder,

    newRepeat,
    setNewRepeat,

    newSubTaskInput,
    setNewSubTaskInput,

    newSubTasksList,
    handleAddSubTaskToList,
    handleRemoveSubTaskFromList,

    // Create / Update
    handleCreateTask,
<<<<<<< HEAD

    // Backend
    loadTasks,
  };
}

export default function TaskDataRoute() {
  return useTaskData();
}
=======
    handleUpdateTask,
  };
}

>>>>>>> 6bdaf6c3588bd70a35c14037169cb559ea075de2
