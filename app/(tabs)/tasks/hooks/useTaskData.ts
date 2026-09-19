
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert } from 'react-native';
import { localDb, Task, SubTask } from '@/app/services/localDb';
import {
  TaskSubTab,
  TaskCategory,
  TaskPriority,
  TaskDifficulty,
  TaskRepeat,
} from '../types';

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
// TASK DATA HOOK
// ------------------------------------------------------

export function useTaskData() {
  // ----------------------------------------------------
  // BASIC STATE
  // ----------------------------------------------------

  const [activeSubTab, setActiveSubTab] =
    useState<TaskSubTab>('overview');

  const [tasks, setTasksState] = useState<Task[]>(
    () => localDb.getTasks()
  );

  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [isAdding, setIsAdding] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ----------------------------------------------------
  // TASK STORAGE
  // ----------------------------------------------------

  const setTasks = useCallback(
    (newTasks: Task[] | ((prev: Task[]) => Task[])) => {
      const currentTasks = localDb.getTasks();

      const updated =
        typeof newTasks === 'function'
          ? newTasks(currentTasks)
          : newTasks;

      localDb.setTasks(updated);
      setTasksState(updated);
    },
    []
  );

  // Keep hook synchronized with local database
  useEffect(() => {
    const unsubscribe = localDb.subscribe(() => {
      setTasksState(localDb.getTasks());
    });

    return unsubscribe;
  }, []);

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

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

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
    useState(() => formatLocalDate(new Date()));

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

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // ----------------------------------------------------
  // POMODORO TIMER
  // ----------------------------------------------------

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isTimerRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime((prev) => prev - 1);
      }, 1000);
    }

    if (pomodoroTime === 0) {
      setIsTimerRunning(false);

      Alert.alert(
        'Focus Time Up!',
        'Great job! Take a small rest break.'
      );

      setPomodoroTime(25 * 60);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning, pomodoroTime]);

  // ----------------------------------------------------
  // DATE VALUES
  // ----------------------------------------------------

  const { todayStr, tomorrowStr } =
    useMemo(() => getTodayAndTomorrow(), []);

  // ----------------------------------------------------
  // OVERALL CALCULATIONS
  // ----------------------------------------------------

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const activeTasks = tasks.filter(
    (task) => !task.completed
  );

  const completionRate =
    totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

  const estimatedRemainingHours =
    activeTasks.reduce(
      (sum, task) => sum + task.duration,
      0
    );

  // ----------------------------------------------------
  // WORKLOAD LEVEL
  // ----------------------------------------------------

  const getWorkloadLevel = useCallback(() => {
    const totalActive = activeTasks.length;

    const highPriorityCount = activeTasks.filter(
      (task) => task.priority === 'High'
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

  // ----------------------------------------------------
  // FILTERED TASKS
  // ----------------------------------------------------

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();

        const matchesTitle =
          task.title.toLowerCase().includes(query);

        const matchesSubject =
          task.subject.toLowerCase().includes(query);

        const matchesDescription =
          task.description.toLowerCase().includes(query);

        if (
          !matchesTitle &&
          !matchesSubject &&
          !matchesDescription
        ) {
          return false;
        }
      }

      // Filters
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

  const overdueTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.dueDate < todayStr &&
          !task.completed
      ),
    [tasks, todayStr]
  );

  const todayTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.dueDate === todayStr &&
          !task.completed
      ),
    [tasks, todayStr]
  );

  const tomorrowTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.dueDate === tomorrowStr &&
          !task.completed
      ),
    [tasks, tomorrowStr]
  );

  const upcomingTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.dueDate > tomorrowStr &&
          !task.completed
      ),
    [tasks, tomorrowStr]
  );

  const completedTasksList = useMemo(
    () => tasks.filter((task) => task.completed),
    [tasks]
  );

  // ----------------------------------------------------
  // TASK ACTIONS
  // ----------------------------------------------------

  const toggleTask = useCallback(
    (taskId: string) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                completed: !task.completed,
              }
            : task
        )
      );
    },
    [setTasks]
  );

  const toggleSubTask = useCallback(
    (taskId: string, subTaskId: string) => {
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id !== taskId) {
            return task;
          }

          const updatedSubs = task.subTasks.map(
            (subTask) =>
              subTask.id === subTaskId
                ? {
                    ...subTask,
                    completed: !subTask.completed,
                  }
                : subTask
          );

          return {
            ...task,
            subTasks: updatedSubs,
          };
        })
      );
    },
    [setTasks]
  );

  // ----------------------------------------------------
  // DELETE TASK
  // ----------------------------------------------------

  const handleDeleteTask = useCallback(
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
            onPress: () => {
              setTasks((prev) =>
                prev.filter(
                  (task) => task.id !== taskId
                )
              );

              if (focusedTask?.id === taskId) {
                setIsFocusActive(false);
                setFocusedTask(null);
              }
            },
          },
        ]
      );
    },
    [focusedTask, setTasks]
  );

  // ----------------------------------------------------
  // PIN TASK
  // ----------------------------------------------------

  const handleTogglePin = useCallback(
    (taskId: string) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                isPinned: !task.isPinned,
              }
            : task
        )
      );
    },
    [setTasks]
  );

  // ----------------------------------------------------
  // FAVORITE TASK
  // ----------------------------------------------------

  const handleToggleFavorite = useCallback(
    (taskId: string) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                isFavorite: !task.isFavorite,
              }
            : task
        )
      );
    },
    [setTasks]
  );

  // ----------------------------------------------------
  // MULTI SELECT
  // ----------------------------------------------------

  const toggleSelectTask = useCallback(
    (taskId: string) => {
      setSelectedTaskIds((prev) =>
        prev.includes(taskId)
          ? prev.filter((id) => id !== taskId)
          : [...prev, taskId]
      );
    },
    []
  );

  const handleBulkComplete = useCallback(() => {
    if (selectedTaskIds.length === 0) {
      return;
    }

    setTasks((prev) =>
      prev.map((task) =>
        selectedTaskIds.includes(task.id)
          ? {
              ...task,
              completed: true,
            }
          : task
      )
    );

    setSelectedTaskIds([]);
    setIsMultiSelectMode(false);
  }, [selectedTaskIds, setTasks]);

  const handleBulkDelete = useCallback(() => {
    if (selectedTaskIds.length === 0) {
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
          onPress: () => {
            setTasks((prev) =>
              prev.filter(
                (task) =>
                  !selectedTaskIds.includes(task.id)
              )
            );

            setSelectedTaskIds([]);
            setIsMultiSelectMode(false);
          },
        },
      ]
    );
  }, [selectedTaskIds, setTasks]);

  // ----------------------------------------------------
  // FOCUS MODE
  // ----------------------------------------------------

  const handleFocusOnTask = useCallback(
    (task: Task) => {
      setFocusedTask(task);
      setPomodoroTime(25 * 60);
      setIsTimerRunning(false);
      setIsFocusActive(true);
    },
    []
  );

  const handleToggleTimer = useCallback(() => {
    setIsTimerRunning((prev) => !prev);
  }, []);

  const handleResetTimer = useCallback(() => {
    setIsTimerRunning(false);
    setPomodoroTime(25 * 60);
  }, []);

  const handleCloseFocus = useCallback(() => {
    setIsTimerRunning(false);
    setIsFocusActive(false);
    setFocusedTask(null);
  }, []);

  // ----------------------------------------------------
  // SUBTASK BUILDER
  // ----------------------------------------------------

  const handleAddSubTaskToList = useCallback(() => {
    const value = newSubTaskInput.trim();

    if (!value) {
      return;
    }

    setNewSubTasksList((prev) => [
      ...prev,
      value,
    ]);

    setNewSubTaskInput('');
  }, [newSubTaskInput]);

  const handleRemoveSubTaskFromList = useCallback(
    (index: number) => {
      setNewSubTasksList((prev) =>
        prev.filter((_, i) => i !== index)
      );
    },
    []
  );

  // ----------------------------------------------------
  // CREATE TASK
  // ----------------------------------------------------

  const handleCreateTask = useCallback(() => {
    if (!newTitle.trim()) {
      Alert.alert(
        'Error',
        'Please enter a task title'
      );
      return;
    }

    const duration =
      parseFloat(newDuration) || 1.0;

    const subTasksFormatted: SubTask[] =
      newSubTasksList.map((title, index) => ({
        id: `${Date.now()}-${index}`,
        title,
        completed: false,
      }));

    const created: Task = {
      id: Date.now().toString(),

      title: newTitle.trim(),

      description:
        newDesc.trim() ||
        'No detailed description provided.',

      subject: newSubject,

      category: newCategory,

      priority: newPriority,

      difficulty: newDifficulty,

      duration,

      dueDate: newDueDate,

      dueTime: newDueTime,

      completed: false,

      hasReminder: newHasReminder,

      repeat: newRepeat,

      isPinned: false,

      isFavorite: false,

      attachments: 0,

      subTasks: subTasksFormatted,

      createdAt: Date.now(),
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
  // REFRESH
  // ----------------------------------------------------

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);

    setTasksState(localDb.getTasks());

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
