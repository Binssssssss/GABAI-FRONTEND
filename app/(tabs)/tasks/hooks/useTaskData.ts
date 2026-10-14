import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { localDb, Task } from '@/app/services/localDb';
import api from '@/app/services/api';
import { taskService } from '@/app/services/task.services';

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

const normalizeBackendTask = (
  task: Record<string, any>,
): Task => {
  const safeSubTasks = Array.isArray(task.subTasks)
    ? task.subTasks.map((subTask: any, index: number) => ({
        id: String(
          subTask?.id ?? `${task.id ?? 'task'}-${index}`,
        ),
        title: String(subTask?.title ?? 'Untitled subtask'),
        completed: Boolean(subTask?.completed),
      }))
    : [];

  return {
    id: String(task.id ?? ''),
    title: String(task.title ?? 'Untitled task'),
    description: String(task.description ?? ''),
    subject: String(task.subject ?? 'General'),
    category: (task.category as TaskCategory) ?? 'Academic',
    priority: (task.priority as TaskPriority) ?? 'Medium',
    difficulty: (task.difficulty as TaskDifficulty) ?? 'Medium',
    duration:
      typeof task.duration === 'number'
        ? task.duration
        : Number(task.duration) || 1,
    dueDate: String(
      task.dueDate ?? formatLocalDate(new Date()),
    ).slice(0, 10),
    dueTime: String(task.dueTime ?? '12:00'),
    completed: Boolean(task.completed),
    hasReminder: Boolean(task.hasReminder),
    repeat: (task.repeat as TaskRepeat) ?? 'None',
    isPinned: Boolean(task.isPinned),
    isFavorite: Boolean(task.isFavorite),
    attachments: Number(
      task.attachments ?? safeSubTasks.length,
    ),
    subTasks: safeSubTasks,
    createdAt: (() => {
      const createdAt = task.createdAt;

      if (typeof createdAt === 'number') {
        return createdAt;
      }

      if (typeof createdAt === 'string') {
        const parsed = Date.parse(createdAt);
        return Number.isNaN(parsed) ? Date.now() : parsed;
      }

      return Date.now();
    })(),
  };
};

const getApiErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
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

const showErrorAlert = (
  title: string,
  message: string,
) => {
  Alert.alert(title, message);
};

const showSuccessAlert = (
  title: string,
  message: string,
) => {
  Alert.alert(title, message);
};

// ------------------------------------------------------
// TASK DATA HOOK
// ------------------------------------------------------

export function useTaskData() {
  const [activeSubTab, setActiveSubTab] =
    useState<TaskSubTab>('overview');

  // The backend is the source of truth.
  const [tasks, setTasksState] = useState<Task[]>([]);

  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [sortOption, setSortOption] = useState<string>('Due Date');

  const [isAdding, setIsAdding] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [analytics, setAnalytics] = useState<any>(null);

  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const [focusedTask, setFocusedTask] = useState<Task | null>(null);
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] =
    useState<TaskCategory>('Academic');
  const [newPriority, setNewPriority] =
    useState<TaskPriority>('Medium');
  const [newDifficulty, setNewDifficulty] =
    useState<TaskDifficulty>('Medium');
  const [newDuration, setNewDuration] = useState('1.5');

  const [newDueDate, setNewDueDate] = useState(() =>
    formatLocalDate(new Date()),
  );

  const [newDueTime, setNewDueTime] = useState('12:00');
  const [newHasReminder, setNewHasReminder] = useState(false);
  const [newRepeat, setNewRepeat] = useState<TaskRepeat>('None');
  const [newSubTaskInput, setNewSubTaskInput] = useState('');
  const [newSubTasksList, setNewSubTasksList] = useState<string[]>([]);

  const { todayStr, tomorrowStr } = useMemo(
    () => getTodayAndTomorrow(),
    [],
  );

  // ------------------------------------------------------
  // UPDATE TASK STATE
  // ------------------------------------------------------

  // Only sync to the cache after setTasks has been called,
  // so the initial empty list doesn't wipe it on mount.
  const hasTaskUpdates = useRef(false);

  const setTasks = useCallback(
    (updater: Task[] | ((prev: Task[]) => Task[])) => {
      hasTaskUpdates.current = true;
      setTasksState(updater);
    },
    [],
  );

  // Cache the latest list, but never use the cache as
  // a fallback when the backend request fails.
  // Done in an effect (not inside the state updater) because
  // localDb notifies subscribers like the Dashboard, and
  // updating them during this component's render is an error.
  useEffect(() => {
    if (hasTaskUpdates.current) {
      localDb.setTasks(tasks);
    }
  }, [tasks]);

  // ------------------------------------------------------
  // RESET TASK FORM
  // ------------------------------------------------------

  const resetTaskForm = useCallback(() => {
    setNewTitle('');
    setNewDesc('');
    setNewSubject('');
    setNewCategory('Academic');
    setNewPriority('Medium');
    setNewDifficulty('Medium');
    setNewDuration('1.5');
    setNewDueDate(formatLocalDate(new Date()));
    setNewDueTime('12:00');
    setNewHasReminder(false);
    setNewRepeat('None');
    setNewSubTaskInput('');
    setNewSubTasksList([]);
  }, []);

  // ------------------------------------------------------
  // LOAD ANALYTICS
  // ------------------------------------------------------

  const loadAnalytics = useCallback(async () => {
    try {
      const response = await api.get('/tasks/analytics');

      if (response.data?.success && response.data?.data) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load task analytics:', error);
    }
  }, []);

  // ------------------------------------------------------
  // LOAD TASKS FROM BACKEND
  // ------------------------------------------------------

  const loadTasks = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setIsLoading(true);
        }

        const response = await api.get('/tasks');
        const responseData = response.data;

        const apiTasks: ApiTask[] = Array.isArray(responseData?.data)
          ? responseData.data
          : Array.isArray(responseData?.tasks)
            ? responseData.tasks
            : Array.isArray(responseData)
              ? responseData
              : [];

        const mappedTasks = apiTasks
          .filter(
            (task) =>
              task &&
              typeof task.id === 'string' &&
              task.id.trim().length > 0,
          )
          .map((task) =>
            normalizeBackendTask(task as Record<string, any>),
          );

        // Replace the list with the actual backend response.
        // An empty response means there are no backend tasks.
        setTasks(mappedTasks);

        await loadAnalytics();
      } catch (error) {
        console.error('Failed to load tasks:', error);

        // Do not show cached local-only tasks as server tasks.
        showErrorAlert(
          'Unable to Load Tasks',
          getApiErrorMessage(
            error,
            'Something went wrong while loading your tasks. Please try again.',
          ),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [loadAnalytics, setTasks],
  );

  // Load when the Tasks tab is opened, and again every time it is shown
  // (e.g. after a task was completed from the Dashboard).
  const hasLoadedOnce = useRef(false);

  useFocusEffect(
    useCallback(() => {
      const showLoading = !hasLoadedOnce.current;
      hasLoadedOnce.current = true;

      const timeoutId = setTimeout(() => {
        void loadTasks(showLoading);
      }, 0);

      return () => clearTimeout(timeoutId);
    }, [loadTasks]),
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await loadTasks(false);
    } finally {
      setIsRefreshing(false);
    }
  }, [loadTasks]);

  // ------------------------------------------------------
  // TASK STATISTICS
  // ------------------------------------------------------

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed,
  ).length;

  const activeTasks = tasks.filter(
    (task) => !task.completed,
  );

  const completionRate =
    totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

  const estimatedRemainingHours = activeTasks.reduce(
    (sum, task) => sum + (Number(task.duration) || 0),
    0,
  );

  const getWorkloadLevel = useCallback(() => {
    const totalActive = activeTasks.length;

    const highPriorityCount = activeTasks.filter(
      (task) => task.priority === 'High',
    ).length;

    if (totalActive >= 6 || highPriorityCount >= 3) {
      return {
        level: 'Heavy',
        color: '#EF4444',
        desc: 'High stress level detected. Prioritize critical deadlines first.',
      };
    }

    if (totalActive >= 3 || highPriorityCount >= 1) {
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

  // ------------------------------------------------------
  // SEARCH + FILTER TASKS
  // ------------------------------------------------------

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();

    return tasks.filter((task) => {
      const searchableFields = [
        task.title,
        task.subject,
        task.description,
      ];

      const matchesSearch =
        query.length === 0 ||
        searchableFields.some((field) =>
          String(field ?? '').toLocaleLowerCase().includes(query),
        );

      if (!matchesSearch) {
        return false;
      }

      switch (activeFilter) {
        case 'Today':
          return task.dueDate === todayStr && !task.completed;

        case 'Tomorrow':
          return task.dueDate === tomorrowStr && !task.completed;

        case 'Priority':
          return task.priority === 'High' && !task.completed;

        case 'Difficulty':
          return task.difficulty === 'Hard' && !task.completed;

        case 'Completed':
          return task.completed;

        // Completed tasks only show under the "Completed" filter.
        case 'All':
        default:
          return !task.completed;
      }
    });
  }, [
    tasks,
    searchQuery,
    activeFilter,
    todayStr,
    tomorrowStr,
  ]);

  // ------------------------------------------------------
  // SORT FILTERED TASKS
  // ------------------------------------------------------

  const sortedTasks = useMemo(() => {
    const sorted = [...filteredTasks];

    if (sortOption === 'Due Date') {
      sorted.sort((a, b) =>
        String(a.dueDate ?? '').localeCompare(
          String(b.dueDate ?? ''),
        ),
      );

      return sorted;
    }

    if (sortOption === 'Priority') {
      const score: Record<string, number> = {
        High: 3,
        Medium: 2,
        Low: 1,
      };

      sorted.sort(
        (a, b) =>
          (score[b.priority] ?? 0) - (score[a.priority] ?? 0),
      );

      return sorted;
    }

    if (sortOption === 'Title') {
      sorted.sort((a, b) =>
        String(a.title ?? '').localeCompare(
          String(b.title ?? ''),
        ),
      );
    }

    return sorted;
  }, [filteredTasks, sortOption]);

  // ------------------------------------------------------
  // TASK GROUPS
  // ------------------------------------------------------

  const overdueTasks = useMemo(
    () =>
      tasks.filter(
        (task) => task.dueDate < todayStr && !task.completed,
      ),
    [tasks, todayStr],
  );

  const todayTasks = useMemo(
    () =>
      tasks.filter(
        (task) => task.dueDate === todayStr && !task.completed,
      ),
    [tasks, todayStr],
  );

  const tomorrowTasks = useMemo(
    () =>
      tasks.filter(
        (task) => task.dueDate === tomorrowStr && !task.completed,
      ),
    [tasks, tomorrowStr],
  );

  const upcomingTasks = useMemo(
    () =>
      tasks.filter(
        (task) => task.dueDate > tomorrowStr && !task.completed,
      ),
    [tasks, tomorrowStr],
  );

  const completedTasksList = useMemo(
    () => tasks.filter((task) => task.completed),
    [tasks],
  );

  // ------------------------------------------------------
  // EDIT TASK
  // ------------------------------------------------------

  const openEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setNewTitle(task.title);
    setNewDesc(task.description || '');
    setNewSubject(task.subject || 'General');
    setNewCategory(task.category || 'Academic');
    setNewPriority(task.priority || 'Medium');
    setNewDifficulty(task.difficulty || 'Medium');
    setNewDuration(String(task.duration || 1));
    setNewDueDate(task.dueDate || formatLocalDate(new Date()));
    setNewDueTime(task.dueTime || '12:00');
    setNewHasReminder(Boolean(task.hasReminder));
    setNewRepeat(task.repeat || 'None');

    setNewSubTasksList(
      (task.subTasks || []).map((subTask) => subTask.title),
    );

    setNewSubTaskInput('');
    setIsAdding(true);
  }, []);

  // ------------------------------------------------------
  // COMPLETE / RESTORE TASK
  // ------------------------------------------------------

  const toggleTask = useCallback(
    async (taskId: string) => {
      const currentTask = tasks.find(
        (task) => task.id === taskId,
      );

      if (!currentTask) {
        showErrorAlert(
          'Task Not Found',
          'This task is no longer available. Please refresh your tasks.',
        );
        return;
      }

      const newCompletedState = !currentTask.completed;

      console.log('TOGGLING BACKEND TASK:', {
        id: taskId,
        title: currentTask.title,
        completed: newCompletedState,
      });

      try {
        // Update the server first to avoid a false local success.
        await taskService.updateTask(taskId, {
          completed: newCompletedState,
        });

        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? { ...task, completed: newCompletedState }
              : task,
          ),
        );

        showSuccessAlert(
          newCompletedState ? 'Task Completed' : 'Task Restored',
          newCompletedState
            ? `"${currentTask.title}" has been marked as completed.`
            : `"${currentTask.title}" has been restored to your active tasks.`,
        );
      } catch (error: any) {
        console.error('Failed to update task completion:', {
          taskId,
          status: error?.response?.status,
          message: getApiErrorMessage(error, 'Unknown error'),
          response: error?.response?.data,
        });

        if (error?.response?.status === 404) {
          Alert.alert(
            'Task Not Found',
            'This task could not be found on the server. Refreshing your task list now.',
            [
              {
                text: 'OK',
                onPress: () => {
                  void loadTasks(false);
                },
              },
            ],
          );
          return;
        }

        showErrorAlert(
          newCompletedState
            ? 'Unable to Complete Task'
            : 'Unable to Restore Task',
          getApiErrorMessage(
            error,
            'We could not update this task. Please try again.',
          ),
        );
      }
    },
    [tasks, setTasks, loadTasks],
  );

  const handleRestoreTask = useCallback(
    async (taskId: string) => {
      const currentTask = tasks.find(
        (task) => task.id === taskId,
      );

      if (!currentTask || !currentTask.completed) {
        return;
      }

      try {
        await taskService.updateTask(taskId, {
          completed: false,
        });

        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? { ...task, completed: false }
              : task,
          ),
        );

        showSuccessAlert(
          'Task Restored',
          `"${currentTask.title}" has been restored to your active tasks.`,
        );
      } catch (error: any) {
        console.error('Failed to restore task:', error);

        if (error?.response?.status === 404) {
          void loadTasks(false);
        }

        showErrorAlert(
          'Unable to Restore Task',
          getApiErrorMessage(
            error,
            'We could not restore this task. Please try again.',
          ),
        );
      }
    },
    [tasks, setTasks, loadTasks],
  );

  // ------------------------------------------------------
  // SUBTASKS
  // ------------------------------------------------------

  const toggleSubTask = useCallback(
    async (taskId: string, subTaskId: string) => {
      const currentTask = tasks.find(
        (task) => task.id === taskId,
      );

      if (!currentTask) {
        return;
      }

      const currentSubTask = currentTask.subTasks.find(
        (subTask) => subTask.id === subTaskId,
      );

      if (!currentSubTask) {
        return;
      }

      const newCompletedState = !currentSubTask.completed;

      setTasks((prev) =>
        prev.map((task) => {
          if (task.id !== taskId) {
            return task;
          }

          return {
            ...task,
            subTasks: task.subTasks.map((subTask) =>
              subTask.id === subTaskId
                ? {
                    ...subTask,
                    completed: newCompletedState,
                  }
                : subTask,
            ),
          };
        }),
      );

      try {
        await taskService.updateSubTask(
          taskId,
          subTaskId,
          newCompletedState,
        );
      } catch (error: any) {
        console.error('Failed to update subtask:', error);

        setTasks((prev) =>
          prev.map((task) => {
            if (task.id !== taskId) {
              return task;
            }

            return {
              ...task,
              subTasks: task.subTasks.map((subTask) =>
                subTask.id === subTaskId
                  ? {
                      ...subTask,
                      completed: currentSubTask.completed,
                    }
                  : subTask,
              ),
            };
          }),
        );

        if (error?.response?.status === 404) {
          void loadTasks(false);
        }

        showErrorAlert(
          'Unable to Update Subtask',
          getApiErrorMessage(
            error,
            'We could not update this subtask. Please try again.',
          ),
        );
      }
    },
    [tasks, setTasks, loadTasks],
  );

  // ------------------------------------------------------
  // DELETE TASK
  // ------------------------------------------------------

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      Alert.alert(
        'Delete Task?',
        'This task will be permanently removed from your task list.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await taskService.deleteTask(taskId);

                setTasks((prev) =>
                  prev.filter((task) => task.id !== taskId),
                );

                if (focusedTask?.id === taskId) {
                  setIsFocusActive(false);
                  setFocusedTask(null);
                }

                if (editingTask?.id === taskId) {
                  setEditingTask(null);
                  setIsAdding(false);
                }

                showSuccessAlert(
                  'Task Deleted',
                  'The task was deleted successfully.',
                );
              } catch (error: any) {
                console.error('Failed to delete task:', error);

                if (error?.response?.status === 404) {
                  void loadTasks(false);
                }

                showErrorAlert(
                  'Unable to Delete Task',
                  getApiErrorMessage(
                    error,
                    'We could not delete this task. Please try again.',
                  ),
                );
              }
            },
          },
        ],
      );
    },
    [editingTask, focusedTask, setTasks, loadTasks],
  );

  // ------------------------------------------------------
  // PIN / FAVORITE
  // ------------------------------------------------------

  const handleTogglePin = useCallback(
    (taskId: string) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, isPinned: !task.isPinned }
            : task,
        ),
      );
    },
    [setTasks],
  );

  const handleToggleFavorite = useCallback(
    (taskId: string) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, isFavorite: !task.isFavorite }
            : task,
        ),
      );
    },
    [setTasks],
  );

  // ------------------------------------------------------
  // MULTI-SELECT
  // ------------------------------------------------------

  const toggleSelectTask = useCallback((taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  }, []);

  const handleBulkComplete = useCallback(async () => {
    const selected = selectedTaskIds;

    if (selected.length === 0) {
      return;
    }

    try {
      await Promise.all(
        selected.map((id) =>
          taskService.updateTask(id, { completed: true }),
        ),
      );

      setTasks((prev) =>
        prev.map((task) =>
          selected.includes(task.id)
            ? { ...task, completed: true }
            : task,
        ),
      );

      setSelectedTaskIds([]);
      setIsMultiSelectMode(false);
    } catch (error: any) {
      console.error(
        'Failed to complete selected tasks:',
        error,
      );

      // Refresh the backend list in case some requests succeeded.
      await loadTasks(false);

      showErrorAlert(
        'Unable to Complete Tasks',
        getApiErrorMessage(
          error,
          'Some tasks could not be completed. Your task list has been refreshed.',
        ),
      );
    }
  }, [selectedTaskIds, setTasks, loadTasks]);

  const handleBulkDelete = useCallback(async () => {
    const selected = selectedTaskIds;

    if (selected.length === 0) {
      return;
    }

    try {
      await Promise.all(
        selected.map((id) => taskService.deleteTask(id)),
      );

      setTasks((prev) =>
        prev.filter((task) => !selected.includes(task.id)),
      );

      setSelectedTaskIds([]);
      setIsMultiSelectMode(false);
    } catch (error: any) {
      console.error(
        'Failed to delete selected tasks:',
        error,
      );

      await loadTasks(false);

      showErrorAlert(
        'Unable to Delete Tasks',
        getApiErrorMessage(
          error,
          'Some tasks could not be deleted. Your task list has been refreshed.',
        ),
      );
    }
  }, [selectedTaskIds, setTasks, loadTasks]);

  // ------------------------------------------------------
  // FOCUS TIMER
  // ------------------------------------------------------

  const handleFocusOnTask = useCallback((task: Task) => {
    setFocusedTask(task);
    setIsFocusActive(true);
    setPomodoroTime(25 * 60);
    setIsTimerRunning(false);
  }, []);

  const handleCloseFocus = useCallback(() => {
    setIsFocusActive(false);
    setFocusedTask(null);
    setIsTimerRunning(false);
    setPomodoroTime(25 * 60);
  }, []);

  const handleToggleTimer = useCallback(() => {
    setIsTimerRunning((prev) => !prev);
  }, []);

  const handleResetTimer = useCallback(() => {
    setIsTimerRunning(false);
    setPomodoroTime(25 * 60);
  }, []);

  useEffect(() => {
    if (!isFocusActive || !isTimerRunning) {
      return;
    }

    const interval = setInterval(() => {
      setPomodoroTime((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);

          Alert.alert(
            'Focus Time Up!',
            'Great job! Take a small rest break.',
          );

          return 25 * 60;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isFocusActive, isTimerRunning]);

  // ------------------------------------------------------
  // SUBTASK FORM HELPERS
  // ------------------------------------------------------

  const handleAddSubTaskToList = useCallback(() => {
    const trimmed = newSubTaskInput.trim();

    if (!trimmed) {
      return;
    }

    setNewSubTasksList((prev) => [...prev, trimmed]);
    setNewSubTaskInput('');
  }, [newSubTaskInput]);

  const handleRemoveSubTaskFromList = useCallback(
    (index: number) => {
      setNewSubTasksList((prev) =>
        prev.filter((_, currentIndex) => currentIndex !== index),
      );
    },
    [],
  );

  // ------------------------------------------------------
  // CREATE TASK
  // ------------------------------------------------------

  const handleCreateTask = useCallback(async () => {
    const cleanTitle = newTitle.trim();

    if (!cleanTitle) {
      showErrorAlert(
        'Task title required',
        'Please add a task title before saving.',
      );
      return;
    }

    const rawSubTasks = newSubTasksList.map((item, index) => ({
      id: `subtask-${Date.now()}-${index}`,
      title: item,
      completed: false,
    }));

    const draftTask: Omit<Task, 'id' | 'createdAt'> = {
      title: cleanTitle,
      description: newDesc.trim(),
      subject: newSubject.trim() || 'General',
      category: newCategory,
      priority: newPriority,
      difficulty: newDifficulty,
      duration: Number(newDuration) || 1,
      dueDate: newDueDate || formatLocalDate(new Date()),
      dueTime: newDueTime || '12:00',
      completed: false,
      hasReminder: newHasReminder,
      repeat: newRepeat,
      isPinned: false,
      isFavorite: false,
      attachments: rawSubTasks.length,
      subTasks: rawSubTasks,
    };

    try {
      const createdTask = await taskService.createTask({
        title: draftTask.title,
        description: draftTask.description,
        subject: draftTask.subject,
        priority: draftTask.priority,
        dueDate: draftTask.dueDate,
        dueTime: draftTask.dueTime,
        hasReminder: draftTask.hasReminder,
        subTasks: draftTask.subTasks.map(
          (subTask) => subTask.title,
        ),
      });

      const normalizedTask = normalizeBackendTask(
        createdTask as Record<string, any>,
      );

      if (!normalizedTask.id) {
        throw new Error(
          'The server did not return a valid task ID.',
        );
      }

      setTasks((prev) => [
        normalizedTask,
        ...prev.filter((task) => task.id !== normalizedTask.id),
      ]);

      resetTaskForm();
      setIsAdding(false);

      showSuccessAlert(
        'Task Added',
        `"${normalizedTask.title}" was added successfully.`,
      );
    } catch (error: any) {
      console.error('Failed to create task:', error);

      // Do not create a local-only task on server failure.
      showErrorAlert(
        'Unable to Create Task',
        getApiErrorMessage(
          error,
          'The task could not be saved to the server. Please check your connection and try again.',
        ),
      );
    }
  }, [
    newCategory,
    newDesc,
    newDifficulty,
    newDueDate,
    newDueTime,
    newDuration,
    newHasReminder,
    newPriority,
    newRepeat,
    newSubject,
    newTitle,
    newSubTasksList,
    resetTaskForm,
    setTasks,
  ]);

  // ------------------------------------------------------
  // UPDATE TASK
  // ------------------------------------------------------

  const handleUpdateTask = useCallback(async () => {
    if (!editingTask) {
      return;
    }

    const cleanTitle = newTitle.trim();

    if (!cleanTitle) {
      showErrorAlert(
        'Task title required',
        'Please add a task title before saving.',
      );
      return;
    }

    try {
      const updatedTask = await taskService.updateTask(
        editingTask.id,
        {
          title: cleanTitle,
          description: newDesc.trim(),
          subject: newSubject.trim() || 'General',
          priority: newPriority,
          dueDate: newDueDate || formatLocalDate(new Date()),
          dueTime: newDueTime || '12:00',
          hasReminder: newHasReminder,
          completed: editingTask.completed,
          subTasks: newSubTasksList,
        },
      );

      const normalizedTask = normalizeBackendTask(
        updatedTask as Record<string, any>,
      );

      if (!normalizedTask.id) {
        throw new Error(
          'The server did not return a valid updated task.',
        );
      }

      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingTask.id
            ? { ...task, ...normalizedTask }
            : task,
        ),
      );

      setIsAdding(false);
      setEditingTask(null);
      resetTaskForm();

      showSuccessAlert(
        'Task Updated',
        `"${normalizedTask.title}" has been updated.`,
      );
    } catch (error: any) {
      console.error('Failed to update task:', error);

      if (error?.response?.status === 404) {
        void loadTasks(false);
      }

      showErrorAlert(
        'Unable to Update Task',
        getApiErrorMessage(
          error,
          'We could not update the task. Please try again.',
        ),
      );
    }
  }, [
    editingTask,
    newDesc,
    newDueDate,
    newDueTime,
    newHasReminder,
    newPriority,
    newSubject,
    newSubTasksList,
    newTitle,
    resetTaskForm,
    setTasks,
    loadTasks,
  ]);

  // ------------------------------------------------------
  // RETURN HOOK VALUES
  // ------------------------------------------------------

  return {
    activeSubTab,
    setActiveSubTab,

    tasks,
    setTasks,

    activeFilter,
    setActiveFilter,

    sortOption,
    setSortOption,

    isAdding,
    setIsAdding,

    editingTask,
    setEditingTask,

    isRefreshing,
    isLoading,

    isSearching,
    setIsSearching,

    searchQuery,
    setSearchQuery,

    analytics,

    isMultiSelectMode,
    setIsMultiSelectMode,

    selectedTaskIds,
    setSelectedTaskIds,

    focusedTask,
    setFocusedTask,

    isFocusActive,
    setIsFocusActive,

    pomodoroTime,
    isTimerRunning,
    setPomodoroTime,
    setIsTimerRunning,

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
    setNewSubTasksList,

    totalTasks,
    completedTasks,
    activeTasks,
    completionRate,
    estimatedRemainingHours,
    getWorkloadLevel,

    filteredTasks,
    sortedTasks,

    overdueTasks,
    todayTasks,
    tomorrowTasks,
    upcomingTasks,
    completedTasksList,

    todayStr,
    tomorrowStr,

    openEditTask,
    toggleTask,
    handleRestoreTask,
    toggleSubTask,
    handleDeleteTask,

    handleTogglePin,
    handleToggleFavorite,

    toggleSelectTask,
    handleBulkComplete,
    handleBulkDelete,

    handleFocusOnTask,
    handleCloseFocus,
    handleToggleTimer,
    handleResetTimer,

    handleAddSubTaskToList,
    handleRemoveSubTaskFromList,

    handleCreateTask,
    handleUpdateTask,

    handleRefresh,
    resetTaskForm,
  };
}