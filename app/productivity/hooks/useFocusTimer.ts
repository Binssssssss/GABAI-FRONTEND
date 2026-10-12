
import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';

import { FocusMode, AmbientSound, FocusStats } from '../types';
import {
  FOCUS_MODE_DURATIONS,
  MOTIVATIONAL_AFFIRMATIONS,
  ACADEMIC_SUBJECTS,
} from '../constants/focusConfig';

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

  // Real statistics will be connected to persistent storage later.
  const [stats, setStats] = useState<FocusStats>({
    todayMinutes: 0,
    todaySessions: 0,
    streakDays: 0,
    totalHours: 0,
  });

  const [showCompletionModal, setShowCompletionModal] =
    useState<boolean>(false);

  const [completedDurationMin, setCompletedDurationMin] =
    useState<number>(25);

  const [affirmationIndex, setAffirmationIndex] =
    useState<number>(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const isBreakMode =
    currentMode === 'shortBreak' ||
    currentMode === 'longBreak';

  const clearTimerInterval = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
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

  // Timer engine.
  useEffect(() => {
    if (!isRunning || isPaused) {
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((previous) =>
        Math.max(0, previous - 1)
      );
    }, 1000);

    return () => {
      clearTimerInterval();
    };
  }, [isRunning, isPaused, clearTimerInterval]);

  // Handle timer completion separately from the interval.
  useEffect(() => {
    if (!isRunning || timeRemaining > 0) {
      return;
    }

    clearTimerInterval();
    setIsRunning(false);
    setIsPaused(false);

    if (isBreakMode) {
      // Breaks never count as focused study time.
      Alert.alert(
        'Break Completed',
        'Your break is over. You can start another focus session when ready.'
      );

      return;
    }

    const minutesCompleted = Math.round(totalDuration / 60);

    setCompletedDurationMin(minutesCompleted);

    setStats((previous) => ({
      ...previous,
      todayMinutes: previous.todayMinutes + minutesCompleted,
      todaySessions: previous.todaySessions + 1,
      totalHours: Number(
        (previous.totalHours + minutesCompleted / 60).toFixed(2)
      ),
    }));

    setShowCompletionModal(true);
  }, [
    isRunning,
    timeRemaining,
    isBreakMode,
    totalDuration,
    clearTimerInterval,
  ]);

  // Switch modes. Active and paused sessions both require confirmation.
  const handleSelectMode = useCallback(
    (mode: FocusMode) => {
      if (mode === currentMode) {
        return;
      }

      const changeMode = () => {
        clearTimerInterval();
        setIsRunning(false);
        setIsPaused(false);
        setCurrentMode(mode);
        setTimeRemaining(FOCUS_MODE_DURATIONS[mode]);
      };

      if (isRunning || isPaused) {
        Alert.alert(
          'Active Session in Progress',
          'Changing modes will reset your current timer. Your unfinished session will not be recorded.',
          [
            {
              text: 'Keep Current Session',
              style: 'cancel',
            },
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
      clearTimerInterval,
    ]
  );

  // Start or restart the timer.
  const startTimer = useCallback(() => {
    if (isRunning && !isPaused) {
      return;
    }

    if (timeRemaining <= 0) {
      setTimeRemaining(totalDuration);
    }

    setIsPaused(false);
    setIsRunning(true);
  }, [
    isRunning,
    isPaused,
    timeRemaining,
    totalDuration,
  ]);

  // Pause with optional Strict Study Guard confirmation.
  const pauseTimer = useCallback(() => {
    if (!isRunning || isPaused) {
      return;
    }

    const pauseSession = () => {
      setIsPaused(true);
    };

    if (isStrict) {
      Alert.alert(
        'Strict Study Mode Active',
        'Are you sure you want to pause your focus session?',
        [
          {
            text: 'Keep Focusing',
            style: 'cancel',
          },
          {
            text: 'Pause',
            onPress: pauseSession,
          },
        ]
      );

      return;
    }

    pauseSession();
  }, [isRunning, isPaused, isStrict]);

  // Resume a paused timer.
  const resumeTimer = useCallback(() => {
    if (!isRunning || !isPaused) {
      return;
    }

    setIsPaused(false);
  }, [isRunning, isPaused]);

  // Reset or discard the current session.
  const resetTimer = useCallback(() => {
    const resetSession = () => {
      clearTimerInterval();
      setIsRunning(false);
      setIsPaused(false);
      setTimeRemaining(totalDuration);
    };

    if (isRunning || isPaused) {
      Alert.alert(
        'Reset Focus Session',
        isStrict
          ? 'Resetting will discard the current session progress.'
          : 'Are you sure you want to reset the timer?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
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
    isStrict,
    totalDuration,
    clearTimerInterval,
  ]);

  // Finish the current session early.
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
        'Ending a break will not add any focused study time.',
        [
          {
            text: 'Continue Break',
            style: 'cancel',
          },
          {
            text: 'End Break',
            onPress: () => {
              clearTimerInterval();
              setIsRunning(false);
              setIsPaused(false);
              setTimeRemaining(totalDuration);
            },
          },
        ]
      );

      return;
    }

    const elapsedSeconds = totalDuration - timeRemaining;
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);

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
        {
          text: 'Keep Focusing',
          style: 'cancel',
        },
        {
          text: 'Complete & Log',
          onPress: () => {
            clearTimerInterval();
            setIsRunning(false);
            setIsPaused(false);
            setTimeRemaining(totalDuration);

            setCompletedDurationMin(elapsedMinutes);

            setStats((previous) => ({
              ...previous,
              todayMinutes: previous.todayMinutes + elapsedMinutes,
              todaySessions: previous.todaySessions + 1,
              totalHours: Number(
                (
                  previous.totalHours +
                  elapsedMinutes / 60
                ).toFixed(2)
              ),
            }));

            setShowCompletionModal(true);
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
  ]);

  // Format seconds as MM:SS.
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
    setSelectedSubject,

    isStrict,
    setIsStrict,

    zenMode,
    setZenMode,

    ambientSound,
    setAmbientSound,

    timeRemaining,
    totalDuration,
    isRunning,
    isPaused,

    stats,

    showCompletionModal,
    setShowCompletionModal,
    completedDurationMin,

    affirmation:
      MOTIVATIONAL_AFFIRMATIONS[affirmationIndex],

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
