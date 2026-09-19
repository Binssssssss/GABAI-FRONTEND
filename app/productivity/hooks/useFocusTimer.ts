import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import { FocusMode, AmbientSound, FocusStats } from '../types';
import {
  FOCUS_MODE_DURATIONS,
  MOTIVATIONAL_AFFIRMATIONS,
  ACADEMIC_SUBJECTS,
} from '../constants/focusConfig';

export function useFocusTimer() {
  const [currentMode, setCurrentMode] = useState<FocusMode>('pomodoro');
  const [selectedSubject, setSelectedSubject] = useState<string>(ACADEMIC_SUBJECTS[0]);
  const [isStrict, setIsStrict] = useState<boolean>(true);
  const [zenMode, setZenMode] = useState<boolean>(false);
  const [ambientSound, setAmbientSound] = useState<AmbientSound>('none');

  // Time States
  const totalDuration = FOCUS_MODE_DURATIONS[currentMode];
  const [timeRemaining, setTimeRemaining] = useState<number>(totalDuration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Stats
  const [stats, setStats] = useState<FocusStats>({
    todayMinutes: 45,
    todaySessions: 2,
    streakDays: 5,
    totalHours: 18.5,
  });

  // Completion Modal
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [completedDurationMin, setCompletedDurationMin] = useState<number>(25);

  // Motivational quote
  const [affirmationIndex, setAffirmationIndex] = useState<number>(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Switch Mode
  const handleSelectMode = useCallback((mode: FocusMode) => {
    if (isRunning) {
      Alert.alert(
        'Active Session in Progress',
        'Changing modes will reset your current focus timer. Proceed?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Change Mode',
            style: 'destructive',
            onPress: () => {
              if (timerRef.current) clearInterval(timerRef.current);
              setIsRunning(false);
              setIsPaused(false);
              setCurrentMode(mode);
              setTimeRemaining(FOCUS_MODE_DURATIONS[mode]);
            },
          },
        ]
      );
      return;
    }
    setCurrentMode(mode);
    setTimeRemaining(FOCUS_MODE_DURATIONS[mode]);
  }, [isRunning]);

  // Rotate affirmations
  useEffect(() => {
    const interval = setInterval(() => {
      setAffirmationIndex((prev) => (prev + 1) % MOTIVATIONAL_AFFIRMATIONS.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Timer Tick Engine
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setIsPaused(false);

            // Log completion
            const minutesCompleted = Math.round(totalDuration / 60);
            setCompletedDurationMin(minutesCompleted);
            setStats((s) => ({
              ...s,
              todayMinutes: s.todayMinutes + minutesCompleted,
              todaySessions: s.todaySessions + 1,
              totalHours: parseFloat((s.totalHours + minutesCompleted / 60).toFixed(1)),
            }));
            setShowCompletionModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused, totalDuration]);

  // Start Session
  const startTimer = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  // Pause Session (Strict check)
  const pauseTimer = useCallback(() => {
    if (isStrict) {
      Alert.alert(
        '⚠️ Strict Study Mode Active',
        'Pausing breaks uninterrupted concentration flow. Are you sure you want to pause?',
        [
          { text: 'Keep Focusing', style: 'cancel' },
          {
            text: 'Pause',
            onPress: () => setIsPaused(true),
          },
        ]
      );
    } else {
      setIsPaused(true);
    }
  }, [isStrict]);

  // Resume
  const resumeTimer = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Reset Session
  const resetTimer = useCallback(() => {
    if (isRunning || isPaused) {
      Alert.alert(
        'Reset Focus Session',
        isStrict
          ? 'Strict Mode: Resetting will cancel progress for this session.'
          : 'Are you sure you want to reset the timer?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset Timer',
            style: 'destructive',
            onPress: () => {
              if (timerRef.current) clearInterval(timerRef.current);
              setIsRunning(false);
              setIsPaused(false);
              setTimeRemaining(totalDuration);
            },
          },
        ]
      );
    } else {
      setTimeRemaining(totalDuration);
    }
  }, [isRunning, isPaused, isStrict, totalDuration]);

  // Finish Early
  const finishEarly = useCallback(() => {
    const elapsedSeconds = totalDuration - timeRemaining;
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);

    if (elapsedMinutes < 5) {
      Alert.alert('Session Too Short', 'Sessions under 5 minutes are not recorded.');
      return;
    }

    Alert.alert(
      'Finish Session Early',
      `Log ${elapsedMinutes} minutes of focused study for ${selectedSubject}?`,
      [
        { text: 'Keep Going', style: 'cancel' },
        {
          text: 'Complete & Log',
          onPress: () => {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsRunning(false);
            setIsPaused(false);
            setTimeRemaining(totalDuration);
            setCompletedDurationMin(elapsedMinutes);
            setStats((s) => ({
              ...s,
              todayMinutes: s.todayMinutes + elapsedMinutes,
              todaySessions: s.todaySessions + 1,
              totalHours: parseFloat((s.totalHours + elapsedMinutes / 60).toFixed(1)),
            }));
            setShowCompletionModal(true);
          },
        },
      ]
    );
  }, [totalDuration, timeRemaining, selectedSubject]);

  // Format Helper: MM:SS
  const formatTime = useCallback((secs: number): string => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const progressPercent = totalDuration > 0 ? ((totalDuration - timeRemaining) / totalDuration) * 100 : 0;

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
