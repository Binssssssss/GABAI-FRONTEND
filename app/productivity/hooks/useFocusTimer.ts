import { useCallback, useEffect, useEffectEvent, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useFocusLock } from '@/app/context/FocusLockContext';

import {
  ACADEMIC_SUBJECTS,
  CUSTOM_DURATION_LIMITS,
  FOCUS_MODE_DURATIONS,
  FOCUS_MODE_LABELS,
  MIN_LOGGABLE_MINUTES,
  MOTIVATIONAL_AFFIRMATIONS,
  SESSIONS_BEFORE_LONG_BREAK,
  getModeDurationSeconds,
  isBreakMode,
} from '../constants/focusConfig';
import {
  BreakMode,
  FocusCompletion,
  FocusMode,
  FocusSessionConfig,
  FocusSessionRecord,
  FocusStats,
  FocusTaskRef,
} from '../types';

const FOCUS_SESSIONS_KEY = 'gabai.focus.sessions';
const FOCUS_STATE_KEY = 'gabai.focus.state';

const VALID_MODES: FocusMode[] = [
  'pomodoro',
  'deepWork',
  'shortBreak',
  'longBreak',
  'custom',
];

const DEFAULT_CUSTOM_MINUTES = FOCUS_MODE_DURATIONS.custom / 60;

/** Setup plus any in-progress session, restored when the screen reopens. */
type PersistedFocusState = {
  mode: FocusMode;
  customMinutes: number;
  subject: string;
  task: FocusTaskRef | null;
  isStrict: boolean;
  lastFocusMode: FocusMode;
  status: 'idle' | 'running' | 'paused';
  endsAt: number | null;
  remaining: number | null;
};

function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function calculateFocusStats(
  sessions: FocusSessionRecord[]
): FocusStats {
  const safeSessions = Array.isArray(sessions) ? sessions : [];

  const focusSessions = safeSessions.filter((session) => {
    if (!session || typeof session !== 'object') {
      return false;
    }

    const completedAt = Date.parse(session.completedAt);

    return (
      !isBreakMode(session.mode) &&
      Number.isFinite(session.durationMinutes) &&
      session.durationMinutes > 0 &&
      Number.isFinite(completedAt)
    );
  });

  const todayKey = getDateKey(new Date());

  const todaySessions = focusSessions.filter(
    (session) =>
      getDateKey(new Date(session.completedAt)) === todayKey
  );

  const todayMinutes = todaySessions.reduce(
    (total, session) => total + session.durationMinutes,
    0
  );

  const totalMinutes = focusSessions.reduce(
    (total, session) => total + session.durationMinutes,
    0
  );

  const activeDays = new Set(
    focusSessions.map((session) =>
      getDateKey(new Date(session.completedAt))
    )
  );

  const cursor = new Date();

  if (!activeDays.has(getDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streakDays = 0;

  while (activeDays.has(getDateKey(cursor))) {
    streakDays++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    todayMinutes,
    todaySessions: todaySessions.length,
    streakDays,
    totalHours: Number((totalMinutes / 60).toFixed(2)),
  };
}

function isValidSession(
  value: unknown
): value is FocusSessionRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Partial<FocusSessionRecord>;

  return (
    typeof session.id === 'string' &&
    typeof session.subject === 'string' &&
    typeof session.durationMinutes === 'number' &&
    Number.isFinite(session.durationMinutes) &&
    session.durationMinutes > 0 &&
    VALID_MODES.includes(session.mode as FocusMode) &&
    typeof session.completedAt === 'string' &&
    Number.isFinite(Date.parse(session.completedAt)) &&
    typeof session.isStrict === 'boolean'
  );
}

function clampCustomMinutes(minutes: number): number {
  if (!Number.isFinite(minutes)) {
    return DEFAULT_CUSTOM_MINUTES;
  }

  return Math.min(
    CUSTOM_DURATION_LIMITS.max,
    Math.max(CUSTOM_DURATION_LIMITS.min, Math.round(minutes))
  );
}

function parsePersistedState(
  stored: string | null
): PersistedFocusState | null {
  if (!stored) return null;

  const value: unknown = JSON.parse(stored);

  if (!value || typeof value !== 'object') return null;

  const state = value as Partial<PersistedFocusState>;

  if (!VALID_MODES.includes(state.mode as FocusMode)) return null;

  const task =
    state.task &&
    typeof state.task === 'object' &&
    typeof state.task.id === 'string' &&
    typeof state.task.title === 'string'
      ? {
          id: state.task.id,
          title: state.task.title,
          subject:
            typeof state.task.subject === 'string'
              ? state.task.subject
              : '',
        }
      : null;

  const lastFocusMode =
    VALID_MODES.includes(state.lastFocusMode as FocusMode) &&
    !isBreakMode(state.lastFocusMode as FocusMode)
      ? (state.lastFocusMode as FocusMode)
      : 'pomodoro';

  return {
    mode: state.mode as FocusMode,
    customMinutes: clampCustomMinutes(Number(state.customMinutes)),
    subject:
      typeof state.subject === 'string'
        ? state.subject
        : ACADEMIC_SUBJECTS[0],
    task,
    isStrict: typeof state.isStrict === 'boolean' ? state.isStrict : true,
    lastFocusMode,
    status:
      state.status === 'running' || state.status === 'paused'
        ? state.status
        : 'idle',
    endsAt: typeof state.endsAt === 'number' ? state.endsAt : null,
    remaining:
      typeof state.remaining === 'number' ? state.remaining : null,
  };
}

function secondsUntil(endsAt: number): number {
  return Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
}

export function useFocusTimer() {
  const [currentMode, setCurrentMode] =
    useState<FocusMode>('pomodoro');

  const [customMinutes, setCustomMinutes] = useState<number>(
    DEFAULT_CUSTOM_MINUTES
  );

  const [selectedSubject, setSelectedSubject] =
    useState<string>(ACADEMIC_SUBJECTS[0]);

  const [selectedTask, setSelectedTask] =
    useState<FocusTaskRef | null>(null);

  const [isStrict, setIsStrict] = useState<boolean>(true);

  // Focus mode to return to after a break.
  const [lastFocusMode, setLastFocusMode] =
    useState<FocusMode>('pomodoro');

  const [zenMode, setZenMode] = useState<boolean>(false);

  const totalDuration = getModeDurationSeconds(
    currentMode,
    customMinutes
  );

  const [timeRemaining, setTimeRemaining] =
    useState<number>(totalDuration);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Wall-clock end of the running session, so the countdown stays
  // accurate while the app is backgrounded or the screen is closed.
  const [endsAt, setEndsAt] = useState<number | null>(null);

  const [sessionRecords, setSessionRecords] =
    useState<FocusSessionRecord[]>([]);

  const [isHydrated, setIsHydrated] = useState(false);

  const [completion, setCompletion] =
    useState<FocusCompletion | null>(null);

  const [affirmationIndex, setAffirmationIndex] =
    useState<number>(0);

  const isBreak = isBreakMode(currentMode);

  // A paused focus session remains locked.
  const isStrictSessionActive = isRunning && isStrict && !isBreak;

  const { setFocusLocked } = useFocusLock();

  // Keep the app-wide lock synchronized with the session.
  // Intentionally do not clear the lock in effect cleanup:
  // cleanup also runs when dependencies change.
  useEffect(() => {
    setFocusLocked(isStrictSessionActive);
  }, [isStrictSessionActive, setFocusLocked]);

  // Release the lock if the screen itself unmounts.
  useEffect(() => () => setFocusLocked(false), [setFocusLocked]);

  const stats = useMemo(
    () => calculateFocusStats(sessionRecords),
    [sessionRecords]
  );

  // Load saved sessions and the last setup / active session on mount.
  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      let records: FocusSessionRecord[] = [];
      let saved: PersistedFocusState | null = null;

      try {
        const stored = await AsyncStorage.getItem(FOCUS_SESSIONS_KEY);
        const parsed: unknown = stored ? JSON.parse(stored) : [];

        records = Array.isArray(parsed)
          ? parsed.filter(isValidSession)
          : [];
      } catch (error) {
        console.warn('Unable to load focus sessions:', error);
      }

      try {
        saved = parsePersistedState(
          await AsyncStorage.getItem(FOCUS_STATE_KEY)
        );
      } catch (error) {
        console.warn('Unable to restore focus timer:', error);
      }

      if (cancelled) return;

      setSessionRecords(records);

      if (saved) {
        const duration = getModeDurationSeconds(
          saved.mode,
          saved.customMinutes
        );

        setCurrentMode(saved.mode);
        setCustomMinutes(saved.customMinutes);
        setSelectedSubject(saved.subject);
        setSelectedTask(saved.task);
        setIsStrict(saved.isStrict);
        setLastFocusMode(saved.lastFocusMode);

        if (saved.status === 'running' && saved.endsAt !== null) {
          // If it ended while away, the completion effect logs it.
          setIsRunning(true);
          setEndsAt(saved.endsAt);
          setTimeRemaining(
            Math.min(duration, secondsUntil(saved.endsAt))
          );
        } else if (
          saved.status === 'paused' &&
          saved.remaining !== null &&
          saved.remaining > 0
        ) {
          setIsRunning(true);
          setIsPaused(true);
          setTimeRemaining(Math.min(duration, saved.remaining));
        } else {
          setTimeRemaining(duration);
        }
      }

      setIsHydrated(true);
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  // Persist setup and session progress. While running only `endsAt`
  // is stored, so this does not write on every tick.
  const pausedRemaining = isRunning && isPaused ? timeRemaining : null;

  useEffect(() => {
    if (!isHydrated) return;

    const snapshot: PersistedFocusState = {
      mode: currentMode,
      customMinutes,
      subject: selectedSubject,
      task: selectedTask,
      isStrict,
      lastFocusMode,
      status: !isRunning ? 'idle' : isPaused ? 'paused' : 'running',
      endsAt: isRunning && !isPaused ? endsAt : null,
      remaining: pausedRemaining,
    };

    AsyncStorage.setItem(
      FOCUS_STATE_KEY,
      JSON.stringify(snapshot)
    ).catch((error) =>
      console.warn('Unable to save focus timer state:', error)
    );
  }, [
    isHydrated,
    currentMode,
    customMinutes,
    selectedSubject,
    selectedTask,
    isStrict,
    lastFocusMode,
    isRunning,
    isPaused,
    endsAt,
    pausedRemaining,
  ]);

  // Rotate motivational messages.
  useEffect(() => {
    const interval = setInterval(() => {
      setAffirmationIndex(
        (previous) =>
          (previous + 1) % MOTIVATIONAL_AFFIRMATIONS.length
      );
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // Save a completed focus session and update history.
  const saveFocusSession = useCallback(
    async (
      details: Omit<FocusSessionRecord, 'id' | 'completedAt'>
    ) => {
      if (
        details.durationMinutes <= 0 ||
        !Number.isFinite(details.durationMinutes)
      ) {
        return;
      }

      const record: FocusSessionRecord = {
        ...details,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        completedAt: new Date().toISOString(),
      };

      try {
        const stored = await AsyncStorage.getItem(FOCUS_SESSIONS_KEY);
        const parsed: unknown = stored ? JSON.parse(stored) : [];

        const existingRecords: FocusSessionRecord[] =
          Array.isArray(parsed) ? parsed.filter(isValidSession) : [];

        const updatedRecords = [...existingRecords, record];

        await AsyncStorage.setItem(
          FOCUS_SESSIONS_KEY,
          JSON.stringify(updatedRecords)
        );

        setSessionRecords(updatedRecords);
      } catch (error) {
        console.error('[Focus History] Unable to save session:', error);

        Alert.alert(
          'Unable to Save Session',
          'Your focus session could not be saved locally. Please try again.'
        );
      }
    },
    []
  );

  // Record a finished focus session and show the completion summary.
  const logFocusSession = useCallback(
    (durationMinutes: number) => {
      const subject = selectedSubject.trim() || 'General Study';
      const sessionsToday = stats.todaySessions + 1;

      setCompletion({
        durationMinutes,
        subject,
        taskTitle: selectedTask?.title,
        isStrict,
        suggestedBreak:
          sessionsToday % SESSIONS_BEFORE_LONG_BREAK === 0
            ? 'longBreak'
            : 'shortBreak',
      });

      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      ).catch(() => {});

      void saveFocusSession({
        subject,
        taskTitle: selectedTask?.title,
        durationMinutes,
        mode: currentMode,
        isStrict,
      });
    },
    [
      selectedSubject,
      selectedTask,
      isStrict,
      currentMode,
      stats.todaySessions,
      saveFocusSession,
    ]
  );

  const beginSession = useCallback((durationSeconds: number) => {
    setEndsAt(Date.now() + durationSeconds * 1000);
    setTimeRemaining(durationSeconds);
    setIsPaused(false);
    setIsRunning(true);

    void Haptics.impactAsync(
      Haptics.ImpactFeedbackStyle.Medium
    ).catch(() => {});
  }, []);

  // Stop without recording and return to a ready state in the same mode.
  const stopSession = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setEndsAt(null);
    setTimeRemaining(totalDuration);
  }, [totalDuration]);

  // Leave break mode and get the previous focus mode ready.
  const returnToFocusMode = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setEndsAt(null);
    setCurrentMode(lastFocusMode);
    setTimeRemaining(
      getModeDurationSeconds(lastFocusMode, customMinutes)
    );
  }, [lastFocusMode, customMinutes]);

  // Finish the session. Runs from the effect below without making it
  // depend on every value the completion logic reads.
  const completeSession = useEffectEvent(() => {
    if (isBreak) {
      returnToFocusMode();

      void Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success
      ).catch(() => {});

      Alert.alert(
        'Break Completed',
        `Your break is over. Your ${FOCUS_MODE_LABELS[lastFocusMode]} session is ready when you are.`
      );

      return;
    }

    stopSession();
    logFocusSession(Math.round(totalDuration / 60));
  });

  // Timer engine. Remaining time is derived from `endsAt`, and the
  // session completes exactly once when it reaches zero. A session that
  // ended while the app was closed completes on the first tick.
  useEffect(() => {
    if (!isRunning || isPaused || endsAt === null) {
      return;
    }

    const interval = setInterval(() => {
      const remaining = secondsUntil(endsAt);

      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        completeSession();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning, isPaused, endsAt]);

  // Apply settings from the setup modal. Setup cannot change mid-session.
  const applyConfig = useCallback(
    (
      config: FocusSessionConfig,
      options?: { start?: boolean }
    ): boolean => {
      if (isRunning) {
        Alert.alert(
          isStrictSessionActive
            ? 'Strict Focus Active'
            : 'Session in Progress',
          isStrictSessionActive
            ? 'You cannot change your session setup during Strict Focus. Finish your session first.'
            : 'End or reset the current session before changing its setup.'
        );
        return false;
      }

      const minutes = clampCustomMinutes(config.customMinutes);
      const duration = getModeDurationSeconds(config.mode, minutes);

      setCurrentMode(config.mode);
      setCustomMinutes(minutes);
      setSelectedSubject(config.subject.trim());
      setSelectedTask(config.task);
      setIsStrict(config.isStrict);

      if (!isBreakMode(config.mode)) {
        setLastFocusMode(config.mode);
      }

      if (options?.start) {
        beginSession(duration);
      } else {
        setTimeRemaining(duration);
      }

      return true;
    },
    [isRunning, isStrictSessionActive, beginSession]
  );

  const startTimer = useCallback(() => {
    if (!isHydrated || isRunning) return;

    beginSession(totalDuration);
  }, [isHydrated, isRunning, totalDuration, beginSession]);

  // Strict Focus cannot be paused.
  const pauseTimer = useCallback(() => {
    if (!isRunning || isPaused) return;

    if (isStrictSessionActive) {
      Alert.alert(
        'Strict Focus Active',
        'Pausing is disabled during Strict Focus. Continue focusing or end the session.'
      );
      return;
    }

    if (endsAt !== null) {
      setTimeRemaining(secondsUntil(endsAt));
    }

    setEndsAt(null);
    setIsPaused(true);

    void Haptics.impactAsync(
      Haptics.ImpactFeedbackStyle.Light
    ).catch(() => {});
  }, [isRunning, isPaused, isStrictSessionActive, endsAt]);

  // Resume is allowed for an already-paused session.
  const resumeTimer = useCallback(() => {
    if (!isRunning || !isPaused) return;

    setEndsAt(Date.now() + timeRemaining * 1000);
    setIsPaused(false);

    void Haptics.impactAsync(
      Haptics.ImpactFeedbackStyle.Light
    ).catch(() => {});
  }, [isRunning, isPaused, timeRemaining]);

  // Strict Focus cannot be reset while active, including while paused.
  const resetTimer = useCallback(() => {
    if (isStrictSessionActive) {
      Alert.alert(
        'Strict Focus Active',
        'Resetting is disabled during Strict Focus. Finish the session, or use End to stop it.'
      );
      return;
    }

    if (!isRunning) {
      stopSession();
      return;
    }

    Alert.alert(
      isBreak ? 'Reset Break' : 'Reset Focus Session',
      isBreak
        ? 'Restart the break timer from the beginning?'
        : 'Are you sure you want to reset the timer? Your unfinished session will not be recorded.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Timer',
          style: 'destructive',
          onPress: stopSession,
        },
      ]
    );
  }, [isStrictSessionActive, isRunning, isBreak, stopSession]);

  // Ending always asks for confirmation. Long enough sessions are logged;
  // shorter ones are discarded.
  const endSession = useCallback(() => {
    if (!isRunning) return;

    if (isBreak) {
      Alert.alert(
        'End Break Early?',
        'Ending a break will not add focused study time.',
        [
          { text: 'Continue Break', style: 'cancel' },
          { text: 'End Break', onPress: returnToFocusMode },
        ]
      );

      return;
    }

    const remaining =
      !isPaused && endsAt !== null ? secondsUntil(endsAt) : timeRemaining;

    const elapsedMinutes = Math.floor(
      (totalDuration - remaining) / 60
    );

    if (elapsedMinutes < MIN_LOGGABLE_MINUTES) {
      Alert.alert(
        isStrictSessionActive ? 'End Strict Session?' : 'End Session?',
        `You have focused for ${elapsedMinutes} min. Sessions shorter than ${MIN_LOGGABLE_MINUTES} minutes are not recorded, so this session will be discarded.`,
        [
          { text: 'Keep Focusing', style: 'cancel' },
          {
            text: 'Discard Session',
            style: 'destructive',
            onPress: stopSession,
          },
        ]
      );

      return;
    }

    const subject = selectedSubject.trim() || 'General Study';

    Alert.alert(
      'Finish Session Early',
      `Record ${elapsedMinutes} minutes of focused study for ${subject}?`,
      [
        { text: 'Keep Focusing', style: 'cancel' },
        {
          text: 'Complete & Log',
          onPress: () => {
            stopSession();
            logFocusSession(elapsedMinutes);
          },
        },
      ]
    );
  }, [
    isRunning,
    isBreak,
    isPaused,
    endsAt,
    timeRemaining,
    totalDuration,
    isStrictSessionActive,
    selectedSubject,
    returnToFocusMode,
    stopSession,
    logFocusSession,
  ]);

  // Start the break suggested by the completion summary.
  const startBreak = useCallback(
    (mode: BreakMode) => {
      if (isRunning) return;

      if (!isBreak) {
        setLastFocusMode(currentMode);
      }

      setCompletion(null);
      setCurrentMode(mode);
      beginSession(FOCUS_MODE_DURATIONS[mode]);
    },
    [isRunning, isBreak, currentMode, beginSession]
  );

  const dismissCompletion = useCallback(() => setCompletion(null), []);

  const progress =
    totalDuration > 0
      ? Math.min(1, Math.max(0, (totalDuration - timeRemaining) / totalDuration))
      : 0;

  return {
    currentMode,
    customMinutes,
    selectedSubject,
    selectedTask,
    isStrict,
    isBreak,
    isStrictSessionActive,
    zenMode,
    setZenMode,
    isRunning,
    isPaused,
    isHydrated,
    totalDuration,
    timeRemaining,
    stats,
    sessionRecords,
    completion,
    dismissCompletion,
    startBreak,
    affirmation: MOTIVATIONAL_AFFIRMATIONS[affirmationIndex],
    progress,
    formattedTime: formatTime(timeRemaining),
    applyConfig,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    endSession,
  };
}
