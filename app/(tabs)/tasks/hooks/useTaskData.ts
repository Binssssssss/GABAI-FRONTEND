import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';

import api from '@/app/services/api';
import { Task, SubTask } from '@/app/services/localDb';

import {
  TaskSubTab,
  TaskCategory,
  TaskPriority,
  TaskDifficulty,
  TaskRepeat,
} from '../types';

// ------------------------------------------------------
// API RESPONSE TYPES
// ------------------------------------------------------

interface ApiChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

interface ApiTask {
  id: string;
  title: string;
  description?: string;
  subject: string;
  date: string;
  time?: string | null;
  priority: string;
  category?: string;
  isAllDay?: boolean;
  duration?: number | null;
  checklist?: ApiChecklistItem[];
  progress?: number;
  completed: boolean;
  hasReminder: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ------------------------------------------------------
// TASK ANALYTICS
// ------------------------------------------------------

export interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
  weeklyProductivity: number;

  weeklyCompletion: {
    day: string;
    count: number;
  }[];

  badges: {
    id: string;
    title: string;
    description: string;
    icon: string;
    type: string;
  }[];
}

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
// HELPERS
// ------------------------------------------------------

const normalizePriority = (
  priority?: string,
): TaskPriority => {
  const value = (priority ?? '').toLowerCase();

  if (value === 'high') {
    return 'High';
  }

  if (value === 'low') {
    return 'Low';
  }

  return 'Medium';
};

const normalizeCategory = (
  category?: string,
): TaskCategory => {
  if (
    category === 'Personal' ||
    category === 'Projects' ||
    category === 'Exams' ||
    category === 'Activities'
  ) {
    return category;
  }

  return 'Academic';
};

const normalizeDifficulty = (
  difficulty?: string,
): TaskDifficulty => {
  if (difficulty === 'Hard') {
    return 'Hard';
  }

  if (difficulty === 'Easy') {
    return 'Easy';
  }

  return 'Medium';
};

const normalizeRepeat = (
  repeat?: string,
): TaskRepeat => {
  if (repeat === 'Daily') {
    return 'Daily';
  }

  if (repeat === 'Weekly') {
    return 'Weekly';
  }

  if (repeat === 'Monthly') {
    return 'Monthly';
  }

  return 'None';
};

// ------------------------------------------------------
// API → FRONTEND TASK MAPPER
// ------------------------------------------------------

const mapApiTaskToTask = (
  apiTask: ApiTask,
): Task => {
  const subTasks: SubTask[] = (
    apiTask.checklist ?? []
  ).map((item) => ({
    id: item.id,
    title: item.title,
    completed: item.completed,
  }));

  return {
    id: apiTask.id,

    title: apiTask.title,

    description:
      apiTask.description ?? '',

    subject:
      apiTask.subject || 'General',

    /*
     * The current backend does NOT store a separate
     * category field.
     *
     * Calendar/task responses may return category
     * mapped from subject, so we normalize it here
     * for frontend compatibility.
     */
    category: normalizeCategory(
      apiTask.category,
    ),

    priority: normalizePriority(
      apiTask.priority,
    ),

    /*
     * Difficulty is currently frontend-only because
     * the backend Task model has no difficulty column.
     */
    difficulty: normalizeDifficulty(),

    duration:
      typeof apiTask.duration === 'number'
        ? apiTask.duration
        : 1,

    dueDate:
      apiTask.date,

    dueTime:
      apiTask.time ?? '',

    completed:
      Boolean(apiTask.completed),

    hasReminder:
      Boolean(apiTask.hasReminder),

    /*
     * Repeat is currently frontend-only because
     * the backend Task model has no recurrence field.
     */
    repeat: normalizeRepeat(),

    /*
     * Pin/Favorite are currently local UI states.
     */
    isPinned: false,

    isFavorite: false,

    attachments: 0,

    subTasks,

    createdAt: apiTask.createdAt
      ? new Date(
          apiTask.createdAt,
        ).getTime()
      : Date.now(),
  };
};

// ------------------------------------------------------
// ERROR HELPER
// ------------------------------------------------------

const getApiErrorMessage = (
  error: any,
  fallback: string,
): string => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

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
    useState<Task[]>([]);

  const [activeFilter, setActiveFilter] =
    useState<string>('All');

  const [isAdding, setIsAdding] =
    useState(false);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  // ----------------------------------------------------
  // ANALYTICS
  // ----------------------------------------------------

  const [analytics, setAnalytics] =
    useState<TaskAnalytics | null>(null);

  // ----------------------------------------------------
  // MULTI SELECT
  // ----------------------------------------------------

  const [isMultiSelectMode, setIsMultiSelectMode] =
    useState(false);

  const [selectedTaskIds, setSelectedTaskIds] =
    useState<string[]>([]);

  // ----------------------------------------------------
  // FOCUS MODE
  // ----------------------------------------------------

  const [focusedTask, setFocusedTask] =
    useState<Task | null>(null);

  const [isFocusActive, setIsFocusActive] =
    useState(false);

  const [pomodoroTime, setPomodoroTime] =
    useState(25 * 60);

  const [isTimerRunning, setIsTimerRunning] =
    useState(false);

  // ----------------------------------------------------
  // CREATE TASK FORM
  // ----------------------------------------------------

  const [newTitle, setNewTitle] =
    useState('');

  const [newDesc, setNewDesc] =
    useState('');

  const [newSubject, setNewSubject] =
    useState('Capstone Paper');

  /*
   * Category, difficulty, duration, and repeat remain
   * available for the existing frontend form.
   *
   * They are NOT sent to the current backend because
   * the Task database model does not contain these fields.
   */
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

  const [newHasReminder, setNewHasReminder] =
    useState(false);

  const [newRepeat, setNewRepeat] =
    useState<TaskRepeat>('None');

  const [newSubTaskInput, setNewSubTaskInput] =
    useState('');

  const [newSubTasksList, setNewSubTasksList] =
    useState<string[]>([]);

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

  const { todayStr, tomorrowStr } =
    useMemo(
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
          await api.get('/tasks/analytics');

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
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setIsLoading(true);
        }

        const response =
          await api.get('/tasks');

        const responseData =
          response.data;

        const apiTasks: ApiTask[] =
          Array.isArray(
            responseData?.data,
          )
            ? responseData.data
            : Array.isArray(responseData)
              ? responseData
              : [];

        const mappedTasks =
          apiTasks.map(
            mapApiTaskToTask,
          );

        setTasksState(
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
    const timeout = setTimeout(() => {
      void loadTasks(false);
    }, 0);

    return () => clearTimeout(timeout);
  }, [loadTasks]);

  // ----------------------------------------------------
  // POMODORO TIMER
  // ----------------------------------------------------

  useEffect(() => {
    if (!isTimerRunning) {
      return;
    }

    const interval =
      setInterval(() => {
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

    return () => {
      clearInterval(interval);
    };
  }, [isTimerRunning]);

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
          (completedTasks /
            totalTasks) *
            100,
        )
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
          desc:
            'High stress level detected. Prioritize critical deadlines first.',
        };
      }

      if (
        totalActive >= 3 ||
        highPriorityCount >= 1
      ) {
        return {
          level: 'Moderate',
          color: '#F59E0B',
          desc:
            'Balanced workload. Keep steady study sessions.',
        };
      }

      return {
        level: 'Light',
        color: '#10B981',
        desc:
          'Great job! Workload is well managed and relaxed.',
      };
    }, [activeTasks]);

  // ----------------------------------------------------
  // FILTERED TASKS
  // ----------------------------------------------------

  const filteredTasks =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      let result = tasks.filter(
        (task) => {
          // --------------------------------------------
          // SEARCH
          // --------------------------------------------

          if (query) {
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

            if (
              !matchesTitle &&
              !matchesSubject &&
              !matchesDescription
            ) {
              return false;
            }
          }

          // --------------------------------------------
          // FILTER
          // --------------------------------------------

          switch (activeFilter) {
            case 'Today':
              return (
                task.dueDate ===
                  todayStr &&
                !task.completed
              );

            case 'Tomorrow':
              return (
                task.dueDate ===
                  tomorrowStr &&
                !task.completed
              );

            case 'Priority':
              return (
                task.priority ===
                  'High' &&
                !task.completed
              );

            case 'Completed':
              return task.completed;

            case 'Upcoming':
              return (
                task.dueDate >
                  tomorrowStr &&
                !task.completed
              );

            case 'Pending':
              return !task.completed;

            case 'Overdue':
              return (
                task.dueDate <
                  todayStr &&
                !task.completed
              );

            /*
             * These are kept as neutral/general filters
             * because the current backend does not have
             * dedicated category/difficulty fields.
             */
            case 'Difficulty':
              return (
                task.difficulty ===
                  'Hard' &&
                !task.completed
              );

            case 'Subject':
              return Boolean(
                task.subject,
              );

            case 'Category':
              return Boolean(
                task.category,
              );

            default:
              return true;
          }
        },
      );

      // ----------------------------------------------
      // FRONTEND-ONLY SORTING FILTERS
      // ----------------------------------------------

      if (
        activeFilter ===
        'Recently Added'
      ) {
        result = [
          ...result,
        ].sort(
          (a, b) =>
            b.createdAt -
            a.createdAt,
        );
      }

      if (
        activeFilter ===
        'Longest Pending'
      ) {
        result = [
          ...result,
        ].filter(
          (task) =>
            !task.completed,
        ).sort(
          (a, b) =>
            a.dueDate.localeCompare(
              b.dueDate,
            ),
        );
      }

      return result;
    }, [
      tasks,
      searchQuery,
      activeFilter,
      todayStr,
      tomorrowStr,
    ]);

  // ----------------------------------------------------
  // TIMELINE TASKS
  // ----------------------------------------------------

  const overdueTasks =
    useMemo(
      () =>
        tasks.filter(
          (task) =>
            task.dueDate <
              todayStr &&
            !task.completed,
        ),
      [tasks, todayStr],
    );

  const todayTasks =
    useMemo(
      () =>
        tasks.filter(
          (task) =>
            task.dueDate ===
              todayStr &&
            !task.completed,
        ),
      [tasks, todayStr],
    );

  const tomorrowTasks =
    useMemo(
      () =>
        tasks.filter(
          (task) =>
            task.dueDate ===
              tomorrowStr &&
            !task.completed,
        ),
      [tasks, tomorrowStr],
    );

  const upcomingTasks =
    useMemo(
      () =>
        tasks.filter(
          (task) =>
            task.dueDate >
              tomorrowStr &&
            !task.completed,
        ),
      [tasks, tomorrowStr],
    );

  const completedTasksList =
    useMemo(
      () =>
        tasks.filter(
          (task) => task.completed,
        ),
      [tasks],
    );

  // ----------------------------------------------------
  // TOGGLE TASK COMPLETION
  // ----------------------------------------------------

  const toggleTask =
    useCallback(
      async (taskId: string) => {
        const task =
          tasks.find(
            (item) =>
              item.id === taskId,
          );

        if (!task) {
          return;
        }

        const newCompleted =
          !task.completed;

        try {
          await api.put(
            `/tasks/${taskId}`,
            {
              completed:
                newCompleted,
            },
          );

          setTasksState(
            (prev) =>
              prev.map(
                (item) =>
                  item.id === taskId
                    ? {
                        ...item,
                        completed:
                          newCompleted,
                      }
                    : item,
              ),
          );

          await loadAnalytics();
        } catch (error) {
          console.error(
            'Failed to toggle task:',
            error,
          );

          Alert.alert(
            'Update Failed',
            getApiErrorMessage(
              error,
              'Unable to update the task.',
            ),
          );
        }
      },
      [tasks, loadAnalytics],
    );

  // ----------------------------------------------------
  // TOGGLE SUBTASK
  // ----------------------------------------------------

  const toggleSubTask =
    useCallback(
      async (
        taskId: string,
        subTaskId: string,
      ) => {
        const task =
          tasks.find(
            (item) =>
              item.id === taskId,
          );

        if (!task) {
          return;
        }

        const subTask =
          task.subTasks.find(
            (item) =>
              item.id === subTaskId,
          );

        if (!subTask) {
          return;
        }

        const newCompleted =
          !subTask.completed;

        try {
          const response =
            await api.patch(
              `/tasks/${taskId}/subtasks/${subTaskId}`,
              {
                completed:
                  newCompleted,
              },
            );

          const responseTask =
            response.data?.data;

          if (responseTask) {
            setTasksState(
              (prev) =>
                prev.map(
                  (item) =>
                    item.id ===
                    taskId
                      ? mapApiTaskToTask(
                          responseTask,
                        )
                      : item,
                ),
            );
          } else {
            setTasksState(
              (prev) =>
                prev.map(
                  (item) => {
                    if (
                      item.id !==
                      taskId
                    ) {
                      return item;
                    }

                    return {
                      ...item,
                      subTasks:
                        item.subTasks.map(
                          (sub) =>
                            sub.id ===
                            subTaskId
                              ? {
                                  ...sub,
                                  completed:
                                    newCompleted,
                                }
                              : sub,
                        ),
                    };
                  },
                ),
            );
          }
        } catch (error) {
          console.error(
            'Failed to toggle subtask:',
            error,
          );

          Alert.alert(
            'Update Failed',
            getApiErrorMessage(
              error,
              'Unable to update the checklist item.',
            ),
          );
        }
      },
      [tasks],
    );

  // ----------------------------------------------------
  // DELETE TASK
  // ----------------------------------------------------

  const handleDeleteTask =
    useCallback(
      (taskId: string) => {
        Alert.alert(
          'Delete Task',
          'Are you sure you want to delete this task?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Delete',
              style: 'destructive',

              onPress:
                async () => {
                  try {
                    await api.delete(
                      `/tasks/${taskId}`,
                    );

                    setTasksState(
                      (prev) =>
                        prev.filter(
                          (task) =>
                            task.id !==
                            taskId,
                        ),
                    );

                    await loadAnalytics();

                    if (
                      focusedTask?.id ===
                      taskId
                    ) {
                      setIsFocusActive(
                        false,
                      );

                      setFocusedTask(
                        null,
                      );
                    }
                  } catch (error) {
                    console.error(
                      'Failed to delete task:',
                      error,
                    );

                    Alert.alert(
                      'Delete Failed',
                      getApiErrorMessage(
                        error,
                        'Unable to delete the task.',
                      ),
                    );
                  }
                },
            },
          ],
        );
      },
      [focusedTask, loadAnalytics],
    );

  // ----------------------------------------------------
  // PIN TASK
  // ----------------------------------------------------

  const handleTogglePin =
    useCallback(
      (taskId: string) => {
        setTasksState(
          (prev) =>
            prev.map(
              (task) =>
                task.id === taskId
                  ? {
                      ...task,
                      isPinned:
                        !task.isPinned,
                    }
                  : task,
            ),
        );
      },
      [],
    );

  // ----------------------------------------------------
  // FAVORITE TASK
  // ----------------------------------------------------

  const handleToggleFavorite =
    useCallback(
      (taskId: string) => {
        setTasksState(
          (prev) =>
            prev.map(
              (task) =>
                task.id === taskId
                  ? {
                      ...task,
                      isFavorite:
                        !task.isFavorite,
                    }
                  : task,
            ),
        );
      },
      [],
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
                  (id) =>
                    id !== taskId,
                )
              : [
                  ...prev,
                  taskId,
                ],
        );
      },
      [],
    );

  // ----------------------------------------------------
  // BULK COMPLETE
  // ----------------------------------------------------

  const handleBulkComplete =
    useCallback(
      async () => {
        if (
          selectedTaskIds.length ===
          0
        ) {
          return;
        }

        try {
          await api.post(
            '/tasks/bulk/complete',
            {
              taskIds:
                selectedTaskIds,
            },
          );

          setTasksState(
            (prev) =>
              prev.map(
                (task) =>
                  selectedTaskIds.includes(
                    task.id,
                  )
                    ? {
                        ...task,
                        completed:
                          true,
                      }
                    : task,
              ),
          );

          await loadAnalytics();

          setSelectedTaskIds(
            [],
          );

          setIsMultiSelectMode(
            false,
          );
        } catch (error) {
          console.error(
            'Failed to bulk complete tasks:',
            error,
          );

          Alert.alert(
            'Bulk Complete Failed',
            getApiErrorMessage(
              error,
              'Unable to complete the selected tasks.',
            ),
          );
        }
      },
      [
        selectedTaskIds,
        loadAnalytics,
      ],
    );

  // ----------------------------------------------------
  // BULK DELETE
  // ----------------------------------------------------

  const handleBulkDelete =
    useCallback(() => {
      if (
        selectedTaskIds.length ===
        0
      ) {
        return;
      }

      Alert.alert(
        'Bulk Delete',
        `Delete ${selectedTaskIds.length} selected tasks?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete All',
            style: 'destructive',

            onPress:
              async () => {
                try {
                  await api.delete(
                    '/tasks/bulk',
                    {
                      data: {
                        taskIds:
                          selectedTaskIds,
                      },
                    },
                  );

                  setTasksState(
                    (prev) =>
                      prev.filter(
                        (task) =>
                          !selectedTaskIds.includes(
                            task.id,
                          ),
                      ),
                  );

                  await loadAnalytics();

                  setSelectedTaskIds(
                    [],
                  );

                  setIsMultiSelectMode(
                    false,
                  );
                } catch (error) {
                  console.error(
                    'Failed to bulk delete tasks:',
                    error,
                  );

                  Alert.alert(
                    'Bulk Delete Failed',
                    getApiErrorMessage(
                      error,
                      'Unable to delete the selected tasks.',
                    ),
                  );
                }
              },
          },
        ],
      );
    }, [
      selectedTaskIds,
      loadAnalytics,
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
      setIsTimerRunning(false);

      setPomodoroTime(
        25 * 60,
      );
    }, []);

  const handleCloseFocus =
    useCallback(() => {
      setIsTimerRunning(false);
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
    useCallback(
      async () => {
        if (!newTitle.trim()) {
          Alert.alert(
            'Error',
            'Please enter a task title.',
          );

          return;
        }

        if (!newDueDate.trim()) {
          Alert.alert(
            'Error',
            'Please enter a due date.',
          );

          return;
        }

        try {
          setIsLoading(true);

          /*
           * IMPORTANT:
           * Only fields supported by the current
           * backend Task model are sent.
           *
           * category
           * difficulty
           * duration
           * repeat
           *
           * are NOT sent because they are not
           * database fields in the current backend.
           */
          const payload = {
            title:
              newTitle.trim(),

            description:
              newDesc.trim(),

            subject:
              newSubject.trim() ||
              'General',

            priority:
              newPriority,

            dueDate:
              newDueDate.trim(),

            dueTime:
              newDueTime.trim(),

            hasReminder:
              newHasReminder,

            completed:
              false,

            subTasks:
              newSubTasksList
                .filter(
                  (title) =>
                    title.trim()
                      .length > 0,
                )
                .map(
                  (title) => ({
                    title:
                      title.trim(),
                    completed:
                      false,
                  }),
                ),
          };

          const response =
            await api.post(
              '/tasks',
              payload,
            );

          const createdApiTask =
            response.data?.data;

          if (!createdApiTask) {
            throw new Error(
              'Task was created but the server returned no task data.',
            );
          }

          const createdTask =
            mapApiTaskToTask(
              createdApiTask,
            );

          setTasksState(
            (prev) => [
              createdTask,
              ...prev,
            ],
          );

          await loadAnalytics();

          // --------------------------------------------
          // RESET FORM
          // --------------------------------------------

          setNewTitle('');

          setNewDesc('');

          setNewSubject(
            'Capstone Paper',
          );

          setNewCategory(
            'Academic',
          );

          setNewPriority(
            'Medium',
          );

          setNewDifficulty(
            'Medium',
          );

          setNewDuration(
            '1.5',
          );

          setNewDueDate(
            formatLocalDate(
              new Date(),
            ),
          );

          setNewDueTime(
            '12:00',
          );

          setNewHasReminder(
            false,
          );

          setNewRepeat(
            'None',
          );

          setNewSubTasksList(
            [],
          );

          setNewSubTaskInput(
            '',
          );

          setIsAdding(false);

          Alert.alert(
            'Success',
            'Task created successfully.',
          );
        } catch (error) {
          console.error(
            'Failed to create task:',
            error,
          );

          Alert.alert(
            'Create Task Failed',
            getApiErrorMessage(
              error,
              'Unable to create the task.',
            ),
          );
        } finally {
          setIsLoading(false);
        }
      },
      [
        newTitle,
        newDesc,
        newSubject,
        newPriority,
        newDueDate,
        newDueTime,
        newHasReminder,
        newSubTasksList,
        loadAnalytics,
      ],
    );

  // ----------------------------------------------------
  // REFRESH
  // ----------------------------------------------------

  const handleRefresh =
    useCallback(
      async () => {
        setIsRefreshing(true);

        try {
          await loadTasks(false);
        } finally {
          setIsRefreshing(false);
        }
      },
      [loadTasks],
    );

  // ----------------------------------------------------
  // RETURN
  // ----------------------------------------------------

  return {
    // Tasks
    tasks,
    filteredTasks,

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

    // Add task
    isAdding,
    setIsAdding,

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

    // Create
    handleCreateTask,
  };
}

export default function TaskDataRoute() {
  return useTaskData();
}