import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  FOCUS_MODE_DURATIONS,
  MOTIVATIONAL_AFFIRMATIONS,
} from '../constants/focusConfig';
import { FocusMode, AmbientSound, FocusStats } from '../types';

export function useFocusTimer() {
  const [currentMode, setCurrentMode] = useState<FocusMode>('pomodoro');
  const [selectedSubject, setSelectedSubject] = useState('General Study');
  const [isStrict, setIsStrict] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [ambientSound, setAmbientSound] = useState<AmbientSound>('none');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MODE_DURATIONS.pomodoro);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedDurationMin, setCompletedDurationMin] = useState(0);
  const [affirmationIndex, setAffirmationIndex] = useState(0);

  const stats: FocusStats = useMemo(
    () => ({
      todayMinutes: completedDurationMin,
      todaySessions: completedDurationMin > 0 ? 1 : 0,
      streakDays: 1,
      totalHours: Number((completedDurationMin / 60).toFixed(2)),
    }),
    [completedDurationMin],
  );

  const affirmation = MOTIVATIONAL_AFFIRMATIONS[
    affirmationIndex % MOTIVATIONAL_AFFIRMATIONS.length
  ];

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [secondsLeft]);

  const progressPercent = useMemo(() => {
    const totalSeconds = FOCUS_MODE_DURATIONS[currentMode];

    if (totalSeconds === 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(0, ((totalSeconds - secondsLeft) / totalSeconds) * 100),
    );
  }, [currentMode, secondsLeft]);

  useEffect(() => {
    if (!isRunning || isPaused) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          setIsRunning(false);
          setIsPaused(false);
          setCompletedDurationMin(
            (minutes) => minutes + Math.round(FOCUS_MODE_DURATIONS[currentMode] / 60),
          );
          setShowCompletionModal(true);
          setAffirmationIndex(
            (index) => (index + 1) % MOTIVATIONAL_AFFIRMATIONS.length,
          );
          return FOCUS_MODE_DURATIONS[currentMode];
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentMode, isPaused, isRunning]);

  const handleSelectMode = useCallback((mode: FocusMode) => {
    setCurrentMode(mode);
  }, []);

  const startTimer = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setSecondsLeft(FOCUS_MODE_DURATIONS[currentMode]);
  }, [currentMode]);

  const finishEarly = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setSecondsLeft(FOCUS_MODE_DURATIONS[currentMode]);
    setShowCompletionModal(true);
  }, [currentMode]);

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
    isRunning,
    isPaused,
    stats,
    showCompletionModal,
    setShowCompletionModal,
    completedDurationMin,
    affirmation,
    progressPercent,
    formattedTime,
    handleSelectMode,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    finishEarly,
  };
}
