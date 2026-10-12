
import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusLock } from '@/app/context/FocusLockContext';

import {
  FocusMode,
  AmbientSound,
  FocusStats,
  FocusSessionRecord,
} from '../types';

import {
  FOCUS_MODE_DURATIONS,
  MOTIVATIONAL_AFFIRMATIONS,
  ACADEMIC_SUBJECTS,
} from '../constants/focusConfig';

const FOCUS_SESSIONS_KEY = 'gabai.focus.sessions';

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
      session.mode !== 'shortBreak' &&
      session.mode !== 'longBreak' &&
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

  const validModes: FocusMode[] = [
    'pomodoro',
    'deepWork',
    'shortBreak',
    'longBreak',
    'custom',
  ];

  return (
    typeof session.id === 'string' &&
    typeof session.subject === 'string' &&
    typeof session.durationMinutes === 'number' &&
    Number.isFinite(session.durationMinutes) &&
    session.durationMinutes > 0 &&
    validModes.includes(session.mode as FocusMode) &&
    typeof session.completedAt === 'string' &&
    Number.isFinite(Date.parse(session.completedAt)) &&
    typeof session.isStrict === 'boolean'
  );
}

export function useFocusTimer() {
  const [currentMode, setCurrentMode] =
    useState<FocusMode>('pomodoro');

  const [selectedSubject, setSelectedSubject] =
    useState<string>(ACADEMIC_SUBJECTS[0]);

  const [isStrict, setIsStrict] = useState<boolean>(true);
  const [zenMode, setZenMode] = useState<boolean>(false);
  const [ambientSound, setAmbientSound] =
    useState<AmbientSound>('none');

  const totalDuration = FOCUS_MODE_DURATIONS[currentMode];

  const [timeRemaining, setTimeRemaining] =
    useState<number>(totalDuration);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const [sessionRecords, setSessionRecords] =
    useState<FocusSessionRecord[]>([]);

  const [sessionsLoaded, setSessionsLoaded] = useState(false);

  const [showCompletionModal, setShowCompletionModal] =
    useState<boolean>(false);

  const [completedDurationMin, setCompletedDurationMin] =
    useState<number>(25);

  const [affirmationIndex, setAffirmationIndex] =
    useState<number>(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const completedRef = useRef(false);

  const isBreakMode =
    currentMode === 'shortBreak' ||
    currentMode === 'longBreak';

  // A paused focus session remains locked.
  const isStrictSessionActive =
    isRunning && isStrict && !isBreakMode;

  const { setFocusLocked } = useFocusLock();

  // Keep the app-wide lock synchronized with the session.
  // Intentionally do not clear the lock in effect cleanup:
  // cleanup also runs when dependencies change.
  useEffect(() => {
    setFocusLocked(isStrictSessionActive);
  }, [isStrictSessionActive, setFocusLocked]);

  const stats = calculateFocusStats(sessionRecords);

  const clearTimerInterval = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Load saved sessions on mount.
  useEffect(() => {
    let cancelled = false;

    async function loadSessions() {
      try {
        const stored = await AsyncStorage.getItem(FOCUS_SESSIONS_KEY);

        if (cancelled) return;

        const parsed: unknown = stored ? JSON.parse(stored) : [];

        const validSessions = Array.isArray(parsed)
          ? parsed.filter(isValidSession)
          : [];

        setSessionRecords(validSessions);
      } catch (error) {
        console.warn('Unable to load focus sessions:', error);
      } finally {
        if (!cancelled) {
          setSessionsLoaded(true);
        }
      }
    }

    void loadSessions();

    return () => {
      cancelled = true;
    };
  }, []);

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
    async (durationMinutes: number) => {
      if (
        !sessionsLoaded ||
        durationMinutes <= 0 ||
        !Number.isFinite(durationMinutes)
      ) {
        return;
      }

      const record: FocusSessionRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        subject: selectedSubject.trim() || 'General Study',
        durationMinutes,
        mode: currentMode,
        completedAt: new Date().toISOString(),
        isStrict,
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
    [
      sessionsLoaded,
      selectedSubject,
      currentMode,
      isStrict,
    ]
  );

  // Timer engine.
  useEffect(() => {
    if (!isRunning || isPaused || !sessionsLoaded) {
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => clearTimerInterval();
  }, [
    isRunning,
    isPaused,
    sessionsLoaded,
    clearTimerInterval,
  ]);

  // Handle completion once when the timer reaches zero.
  useEffect(() => {
    if (!isRunning || timeRemaining > 0 || completedRef.current) {
      return;
    }

    completedRef.current = true;
    clearTimerInterval();

    setIsRunning(false);
    setIsPaused(false);

    if (isBreakMode) {
      Alert.alert(
        'Break Completed',
        'Your break is over. Start another focus session when you are ready.'
      );

      return;
    }

    const minutesCompleted = Math.round(totalDuration / 60);

    setCompletedDurationMin(minutesCompleted);
    setShowCompletionModal(true);

    void saveFocusSession(minutesCompleted);
  }, [
    isRunning,
    timeRemaining,
    isBreakMode,
    totalDuration,
    clearTimerInterval,
    saveFocusSession,
  ]);

  // Do not allow changing modes during Strict Focus.
  const handleSelectMode = useCallback(
    (mode: FocusMode) => {
      if (mode === currentMode) return;

      if (isStrictSessionActive) {
        Alert.alert(
          'Strict Focus Active',
          'You cannot change focus modes during a Strict Focus session. Finish your session first.'
        );
        return;
      }

      const changeMode = () => {
        clearTimerInterval();
        completedRef.current = false;

        setIsRunning(false);
        setIsPaused(false);
        setCurrentMode(mode);
        setTimeRemaining(FOCUS_MODE_DURATIONS[mode]);
      };

      if (isRunning || isPaused) {
        Alert.alert(
          'Active Session in Progress',
          'Changing modes will reset your timer. The unfinished session will not be recorded.',
          [
            { text: 'Keep Current Session', style: 'cancel' },
            {
              text: 'Change Mode',
              style: 'destructive',
              onPress: changeMode,
            },
          ]
        );

        return;
      }

      changeMode();
    },
    [
      currentMode,
      isRunning,
      isPaused,
      isStrictSessionActive,
      clearTimerInterval,
    ]
  );

  // Prevent disabling Strict Focus or changing its setting mid-session.
  const handleSetStrict = useCallback(
    (value: boolean | ((previous: boolean) => boolean)) => {
      const nextValue =
        typeof value === 'function' ? value(isStrict) : value;

      if ((isRunning || isPaused) && nextValue !== isStrict) {
        Alert.alert(
          'Session in Progress',
          'You cannot change the Strict Focus setting during an active session.'
        );
        return;
      }

      setIsStrict(nextValue);
    },
    [isStrict, isRunning, isPaused]
  );

  // Prevent changing the selected subject during Strict Focus.
  const handleSetSelectedSubject = useCallback(
    (subject: string) => {
      if (isStrictSessionActive) {
        Alert.alert(
          'Strict Focus Active',
          'Stay with your selected subject until the session ends.'
        );
        return;
      }

      setSelectedSubject(subject);
    },
    [isStrictSessionActive]
  );

  const startTimer = useCallback(() => {
    if (isRunning && !isPaused) return;

    if (timeRemaining <= 0) {
      setTimeRemaining(totalDuration);
    }

    completedRef.current = false;
    setIsPaused(false);
    setIsRunning(true);
  }, [
    isRunning,
    isPaused,
    timeRemaining,
    totalDuration,
  ]);

  // Strict Focus cannot be paused.
  const pauseTimer = useCallback(() => {
    if (!isRunning || isPaused) return;

    if (isStrictSessionActive) {
      Alert.alert(
        'Strict Focus Active',
        'Pausing is disabled during Strict Focus. Continue focusing or finish the session early.'
      );
      return;
    }

    const pauseSession = () => setIsPaused(true);

    if (isStrict) {
      Alert.alert(
        'Study Session',
        'Are you sure you want to pause your session?',
        [
          { text: 'Keep Focusing', style: 'cancel' },
          { text: 'Pause', onPress: pauseSession },
        ]
      );

      return;
    }

    pauseSession();
  }, [
    isRunning,
    isPaused,
    isStrict,
    isStrictSessionActive,
  ]);

  // Resume is allowed for an already-paused session.
  const resumeTimer = useCallback(() => {
    if (!isRunning || !isPaused) return;

    setIsPaused(false);
  }, [isRunning, isPaused]);

  // Strict Focus cannot be reset while active, including while paused.
  const resetTimer = useCallback(() => {
    if (isStrictSessionActive) {
      Alert.alert(
        'Strict Focus Active',
        'Resetting is disabled during Strict Focus. Finish the session normally or choose to finish early.'
      );
      return;
    }

    const resetSession = () => {
      clearTimerInterval();
      completedRef.current = false;

      setIsRunning(false);
      setIsPaused(false);
      setTimeRemaining(totalDuration);
    };

    if (isRunning || isPaused) {
      Alert.alert(
        'Reset Focus Session',
        'Are you sure you want to reset the timer? Your unfinished session will not be recorded.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset Timer',
            style: 'destructive',
            onPress: resetSession,
          },
        ]
      );

      return;
    }

    resetSession();
  }, [
    isRunning,
    isPaused,
    isStrictSessionActive,
    totalDuration,
    clearTimerInterval,
  ]);

  // Early completion is allowed only after confirmation.
  const finishEarly = useCallback(() => {
    if (!isRunning) {
      Alert.alert(
        'No Active Session',
        'Start a session before trying to finish it.'
      );
      return;
    }

    if (isBreakMode) {
      Alert.alert(
        'End Break Early?',
        'Ending a break will not add focused study time.',
        [
          { text: 'Continue Break', style: 'cancel' },
          {
            text: 'End Break',
            onPress: () => {
              clearTimerInterval();
              completedRef.current = false;

              setIsRunning(false);
              setIsPaused(false);
              setTimeRemaining(totalDuration);
            },
          },
        ]
      );

      return;
    }

    const elapsedMinutes = Math.floor(
      (totalDuration - timeRemaining) / 60
    );

    if (elapsedMinutes < 5) {
      Alert.alert(
        'Session Too Short',
        'At least 5 minutes of focused study are required to record an early finish.'
      );
      return;
    }

    Alert.alert(
      'Finish Session Early',
      `Record ${elapsedMinutes} minutes of focused study for ${selectedSubject}?`,
      [
        { text: 'Keep Focusing', style: 'cancel' },
        {
          text: 'Complete & Log',
          onPress: () => {
            clearTimerInterval();
            completedRef.current = true;

            setIsRunning(false);
            setIsPaused(false);
            setTimeRemaining(totalDuration);

            setCompletedDurationMin(elapsedMinutes);
            setShowCompletionModal(true);

            void saveFocusSession(elapsedMinutes);
          },
        },
      ]
    );
  }, [
    isRunning,
    isBreakMode,
    totalDuration,
    timeRemaining,
    selectedSubject,
    clearTimerInterval,
    saveFocusSession,
  ]);

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }, []);

  const progressPercent =
    totalDuration > 0
      ? ((totalDuration - timeRemaining) / totalDuration) * 100
      : 0;

  return {
    currentMode,
    selectedSubject,
    setSelectedSubject: handleSetSelectedSubject,

    isStrict,
    setIsStrict: handleSetStrict,

    zenMode,
    setZenMode,

    ambientSound,
    setAmbientSound,

    timeRemaining,
    totalDuration,
    isRunning,
    isPaused,

    stats,
    sessionRecords,
    sessionsLoaded,

    showCompletionModal,
    setShowCompletionModal,
    completedDurationMin,

    affirmation: MOTIVATIONAL_AFFIRMATIONS[affirmationIndex],

      progressPercent,
      formattedTime: formatTime(timeRemaining),

      handleSelectMode,
      startTimer,
      pauseTimer,
      resumeTimer,
    resetTimer,
    finishEarly,
  };
}
