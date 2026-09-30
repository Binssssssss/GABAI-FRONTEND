import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import api from '@/app/services/api';

import {
  FocusMode,
  AmbientSound,
  FocusStats,
} from '../types';

import {
  FOCUS_MODE_DURATIONS,
  MOTIVATIONAL_AFFIRMATIONS,
  ACADEMIC_SUBJECTS,
} from '../constants/focusConfig';

interface FocusSessionResponse {
  id: string;
  duration: number;
  remainingTime: number;
  targetHours: number;
  status:
    | 'IDLE'
    | 'RUNNING'
    | 'PAUSED'
    | 'COMPLETED'
    | 'CANCELLED';
  ambientSound: string;
  isStrict: boolean;
  subject: string | null;
  focusMode: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const AMBIENT_SOUND_MAP: Record<string, string> = {
  none: 'NONE',
  rain: 'RAIN',
  library: 'LIBRARY',
  cafe: 'CAFE',
  waves: 'WAVES',
  whitenoise: 'WHITENOISE',
};

const BACKEND_TO_FRONTEND_AMBIENT: Record<string, AmbientSound> = {
  NONE: 'none',
  RAIN: 'rain',
  LIBRARY: 'library',
  CAFE: 'cafe',
  WAVES: 'waves',
  WHITENOISE: 'whitenoise',
};

export function useFocusTimer() {
  // ==========================================
  // Focus Session States
  // ==========================================

  const [currentMode, setCurrentMode] =
    useState<FocusMode>('pomodoro');

  const [selectedSubject, setSelectedSubject] =
    useState<string>(ACADEMIC_SUBJECTS[0]);

  const [isStrict, setIsStrict] =
    useState<boolean>(true);

  const [zenMode, setZenMode] =
    useState<boolean>(false);

  const [ambientSound, setAmbientSound] =
    useState<AmbientSound>('none');

  // Backend session ID
  const [sessionId, setSessionId] =
    useState<string | null>(null);

  // ==========================================
  // Time States
  // ==========================================

  const defaultDuration =
    FOCUS_MODE_DURATIONS[currentMode];

  const [totalDuration, setTotalDuration] =
    useState<number>(defaultDuration);

  const [timeRemaining, setTimeRemaining] =
    useState<number>(defaultDuration);

  const [isRunning, setIsRunning] =
    useState<boolean>(false);

  const [isPaused, setIsPaused] =
    useState<boolean>(false);

  // ==========================================
  // Stats
  // ==========================================

  const [stats, setStats] =
    useState<FocusStats>({
      todayMinutes: 0,
      todaySessions: 0,
      streakDays: 0,
      totalHours: 0,
    });

  // ==========================================
  // Completion Modal
  // ==========================================

  const [showCompletionModal, setShowCompletionModal] =
    useState<boolean>(false);

  const [completedDurationMin, setCompletedDurationMin] =
    useState<number>(0);

  // ==========================================
  // Motivation
  // ==========================================

  const [affirmationIndex, setAffirmationIndex] =
    useState<number>(0);

  // ==========================================
  // Refs
  // ==========================================

  const timerRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  const sessionIdRef =
    useRef<string | null>(null);

  const completingRef =
    useRef<boolean>(false);

  // Keep ref synchronized
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // ==========================================
  // Helpers
  // ==========================================

  const showApiError = useCallback(
    (error: any, fallbackMessage: string) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        fallbackMessage;

      console.error(fallbackMessage, error);

      Alert.alert('Focus Session', message);
    },
    [],
  );

  const normalizeAmbientSound = useCallback(
    (sound: string): AmbientSound => {
      return (
        BACKEND_TO_FRONTEND_AMBIENT[sound] ||
        'none'
      );
    },
    [],
  );

  // ==========================================
  // Load Stats
  // ==========================================

  const loadStats = useCallback(async () => {
    try {
      const response =
        await api.get<ApiResponse<FocusStats>>(
          '/api/focus-sessions/stats',
        );

      if (
        response.data.success &&
        response.data.data
      ) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error(
        'Failed to load focus statistics:',
        error,
      );
    }
  }, []);

  // ==========================================
  // Load Current Session
  // ==========================================

  const loadCurrentSession =
    useCallback(async () => {
      try {
        const response =
          await api.get<
            ApiResponse<FocusSessionResponse | null>
          >('/api/focus-sessions/current');

        const session = response.data.data;

        if (!session) {
          return;
        }

        setSessionId(session.id);
        sessionIdRef.current = session.id;

        const backendMode =
          session.focusMode as FocusMode | null;

        if (
          backendMode &&
          FOCUS_MODE_DURATIONS[backendMode]
        ) {
          setCurrentMode(backendMode);
        }

        setSelectedSubject(
          session.subject || 'General Study',
        );

        setIsStrict(session.isStrict);

        setAmbientSound(
          normalizeAmbientSound(
            session.ambientSound,
          ),
        );

        setTotalDuration(session.duration);
        setTimeRemaining(session.remainingTime);

        if (session.status === 'RUNNING') {
          setIsRunning(true);
          setIsPaused(false);
        } else if (
          session.status === 'PAUSED'
        ) {
          setIsRunning(true);
          setIsPaused(true);
        }
      } catch (error) {
        console.error(
          'Failed to load current focus session:',
          error,
        );
      }
    }, [normalizeAmbientSound]);

  // ==========================================
  // Initial Load
  // ==========================================

  useEffect(() => {
    void Promise.resolve().then(() =>
      Promise.all([loadStats(), loadCurrentSession()]),
    );
  }, [loadStats, loadCurrentSession]);

  // ==========================================
  // Rotate Affirmations
  // ==========================================

  useEffect(() => {
    const interval = setInterval(() => {
      setAffirmationIndex(
        (prev) =>
          (prev + 1) %
          MOTIVATIONAL_AFFIRMATIONS.length,
      );
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // Complete Session
  // ==========================================

  const completeBackendSession =
    useCallback(
      async (durationMinutes: number) => {
        const currentSessionId =
          sessionIdRef.current;

        if (
          !currentSessionId ||
          completingRef.current
        ) {
          return;
        }

        completingRef.current = true;

        try {
          await api.patch<
            ApiResponse<FocusSessionResponse>
          >(
            `/api/focus-sessions/${currentSessionId}/complete`,
          );

          setCompletedDurationMin(
            durationMinutes,
          );

          setShowCompletionModal(true);

          await loadStats();

          setSessionId(null);
          sessionIdRef.current = null;
        } catch (error) {
          showApiError(
            error,
            'Failed to complete the focus session.',
          );
        } finally {
          completingRef.current = false;
        }
      },
      [loadStats, showApiError],
    );

  // ==========================================
  // Timer Tick Engine
  // ==========================================

  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }

            setIsRunning(false);
            setIsPaused(false);

            const minutesCompleted =
              Math.round(totalDuration / 60);

            void completeBackendSession(
              minutesCompleted,
            );

            return 0;
          }

          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    isRunning,
    isPaused,
    totalDuration,
    completeBackendSession,
  ]);

  // ==========================================
  // Switch Mode
  // ==========================================

  const handleSelectMode =
    useCallback(
      (mode: FocusMode) => {
        if (isRunning) {
          Alert.alert(
            'Active Session in Progress',
            'Changing modes will cancel your current focus session. Proceed?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Change Mode',
                style: 'destructive',
                onPress: async () => {
                  const currentSessionId =
                    sessionIdRef.current;

                  try {
                    if (timerRef.current) {
                      clearInterval(
                        timerRef.current,
                      );
                      timerRef.current = null;
                    }

                    if (currentSessionId) {
                      await api.patch(
                        `/api/focus-sessions/${currentSessionId}/cancel`,
                      );
                    }

                    setSessionId(null);
                    sessionIdRef.current = null;

                    setIsRunning(false);
                    setIsPaused(false);

                    setCurrentMode(mode);

                    const duration =
                      FOCUS_MODE_DURATIONS[mode];

                    setTotalDuration(duration);
                    setTimeRemaining(duration);
                  } catch (error) {
                    showApiError(
                      error,
                      'Failed to change focus mode.',
                    );
                  }
                },
              },
            ],
          );

          return;
        }

        setCurrentMode(mode);

        const duration =
          FOCUS_MODE_DURATIONS[mode];

        setTotalDuration(duration);
        setTimeRemaining(duration);
      },
      [isRunning, showApiError],
    );

  // ==========================================
  // Start Session
  // ==========================================

  const startTimer = useCallback(
    async () => {
      if (sessionIdRef.current) {
        return;
      }

      try {
        const duration =
          FOCUS_MODE_DURATIONS[currentMode];

        const response =
          await api.post<
            ApiResponse<FocusSessionResponse>
          >('/api/focus-sessions/start', {
            duration,
            targetHours: 1.5,
            ambientSound:
              AMBIENT_SOUND_MAP[
                ambientSound
              ] || 'NONE',
            isStrict,
            subject:
              selectedSubject.trim() ||
              'General Study',
            focusMode: currentMode,
          });

        const session =
          response.data.data;

        setSessionId(session.id);
        sessionIdRef.current = session.id;

        setTotalDuration(
          session.duration,
        );

        setTimeRemaining(
          session.remainingTime,
        );

        setIsRunning(true);
        setIsPaused(false);

        setIsStrict(session.isStrict);

        setAmbientSound(
          normalizeAmbientSound(
            session.ambientSound,
          ),
        );
      } catch (error) {
        showApiError(
          error,
          'Failed to start the focus session.',
        );
      }
    },
    [
      currentMode,
      ambientSound,
      isStrict,
      selectedSubject,
      normalizeAmbientSound,
      showApiError,
    ],
  );

  // ==========================================
  // Pause Session
  // ==========================================

  const pauseTimer = useCallback(() => {
    if (!sessionIdRef.current) {
      return;
    }

    const executePause = async () => {
      try {
        await api.patch<
          ApiResponse<FocusSessionResponse>
        >(
          `/api/focus-sessions/${sessionIdRef.current}/pause`,
          {
            remainingTime: timeRemaining,
          },
        );

        setIsPaused(true);
      } catch (error) {
        showApiError(
          error,
          'Failed to pause the focus session.',
        );
      }
    };

    if (isStrict) {
      Alert.alert(
        '⚠️ Strict Study Mode Active',
        'Pausing breaks uninterrupted concentration flow. Are you sure you want to pause?',
        [
          {
            text: 'Keep Focusing',
            style: 'cancel',
          },
          {
            text: 'Pause',
            onPress: executePause,
          },
        ],
      );
    } else {
      void executePause();
    }
  }, [
    isStrict,
    timeRemaining,
    showApiError,
  ]);

  // ==========================================
  // Resume Session
  // ==========================================

  const resumeTimer = useCallback(
    async () => {
      const currentSessionId =
        sessionIdRef.current;

      if (!currentSessionId) {
        return;
      }

      try {
        await api.patch<
          ApiResponse<FocusSessionResponse>
        >(
          `/api/focus-sessions/${currentSessionId}/resume`,
        );

        setIsPaused(false);
        setIsRunning(true);
      } catch (error) {
        showApiError(
          error,
          'Failed to resume the focus session.',
        );
      }
    },
    [showApiError],
  );

  // ==========================================
  // Reset / Cancel Session
  // ==========================================

  const resetTimer = useCallback(() => {
    if (isRunning || isPaused) {
      Alert.alert(
        'Reset Focus Session',
        isStrict
          ? 'Strict Mode: Resetting will cancel progress for this session.'
          : 'Are you sure you want to reset the timer?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Reset Timer',
            style: 'destructive',
            onPress: async () => {
              const currentSessionId =
                sessionIdRef.current;

              try {
                if (timerRef.current) {
                  clearInterval(
                    timerRef.current,
                  );
                  timerRef.current = null;
                }

                if (currentSessionId) {
                  await api.patch(
                    `/api/focus-sessions/${currentSessionId}/cancel`,
                  );
                }

                setSessionId(null);
                sessionIdRef.current = null;

                setIsRunning(false);
                setIsPaused(false);

                setTimeRemaining(
                  totalDuration,
                );
              } catch (error) {
                showApiError(
                  error,
                  'Failed to reset the focus session.',
                );
              }
            },
          },
        ],
      );
    } else {
      setTimeRemaining(totalDuration);
    }
  }, [
    isRunning,
    isPaused,
    isStrict,
    totalDuration,
    showApiError,
  ]);

  // ==========================================
  // Finish Early
  // ==========================================

  const finishEarly = useCallback(() => {
    if (!sessionIdRef.current) {
      return;
    }

    const elapsedSeconds =
      totalDuration - timeRemaining;

    const elapsedMinutes =
      Math.floor(elapsedSeconds / 60);

    if (elapsedMinutes < 5) {
      Alert.alert(
        'Session Too Short',
        'Sessions under 5 minutes are not recorded.',
      );
      return;
    }

    Alert.alert(
      'Finish Session Early',
      `Log ${elapsedMinutes} minutes of focused study for ${selectedSubject}?`,
      [
        {
          text: 'Keep Going',
          style: 'cancel',
        },
        {
          text: 'Complete & Log',
          onPress: async () => {
            const currentSessionId =
              sessionIdRef.current;

            try {
              if (timerRef.current) {
                clearInterval(
                  timerRef.current,
                );
                timerRef.current = null;
              }

              await api.patch<
                ApiResponse<FocusSessionResponse>
              >(
                `/api/focus-sessions/${currentSessionId}/complete`,
              );

              setIsRunning(false);
              setIsPaused(false);

              setTimeRemaining(
                totalDuration,
              );

              setCompletedDurationMin(
                elapsedMinutes,
              );

              setShowCompletionModal(true);

              setSessionId(null);
              sessionIdRef.current = null;

              await loadStats();
            } catch (error) {
              showApiError(
                error,
                'Failed to complete the focus session.',
              );
            }
          },
        },
      ],
    );
  }, [
    totalDuration,
    timeRemaining,
    selectedSubject,
    loadStats,
    showApiError,
  ]);

  // ==========================================
  // Strict Mode
  // ==========================================

  const handleSetStrict =
    useCallback(
      async (value: boolean) => {
        const currentSessionId =
          sessionIdRef.current;

        // If there is no active backend session,
        // just update local state.
        if (!currentSessionId) {
          setIsStrict(value);
          return;
        }

        try {
          await api.patch<
            ApiResponse<FocusSessionResponse>
          >(
            `/api/focus-sessions/${currentSessionId}/strict`,
            {
              isStrict: value,
            },
          );

          setIsStrict(value);
        } catch (error) {
          showApiError(
            error,
            'Failed to update strict mode.',
          );
        }
      },
      [showApiError],
    );

  // ==========================================
  // Ambient Sound
  // ==========================================

  const handleSetAmbientSound =
    useCallback(
      async (value: AmbientSound) => {
        const currentSessionId =
          sessionIdRef.current;

        // If no active session,
        // update local preference only.
        if (!currentSessionId) {
          setAmbientSound(value);
          return;
        }

        try {
          await api.patch<
            ApiResponse<FocusSessionResponse>
          >(
            `/api/focus-sessions/${currentSessionId}`,
            {
              ambientSound:
                AMBIENT_SOUND_MAP[value] ||
                'NONE',
            },
          );

          setAmbientSound(value);
        } catch (error) {
          showApiError(
            error,
            'Failed to update ambient sound.',
          );
        }
      },
      [showApiError],
    );

  // ==========================================
  // Format Time
  // ==========================================

  const formatTime = useCallback(
    (secs: number): string => {
      const minutes = Math.floor(
        secs / 60,
      );

      const seconds = secs % 60;

      return `${minutes
        .toString()
        .padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
    },
    [],
  );

  // ==========================================
  // Progress
  // ==========================================

  const progressPercent =
    totalDuration > 0
      ? ((totalDuration - timeRemaining) /
          totalDuration) *
        100
      : 0;

  // ==========================================
  // Cleanup
  // ==========================================

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // ==========================================
  // Return
  // ==========================================

  return {
    currentMode,

    selectedSubject,
    setSelectedSubject,

    isStrict,
    setIsStrict: handleSetStrict,

    zenMode,
    setZenMode,

    ambientSound,
    setAmbientSound:
      handleSetAmbientSound,

    timeRemaining,
    totalDuration,

    isRunning,
    isPaused,

    stats,

    showCompletionModal,
    setShowCompletionModal,

    completedDurationMin,

    affirmation:
      MOTIVATIONAL_AFFIRMATIONS[
        affirmationIndex
      ],

    progressPercent,

    formattedTime:
      formatTime(timeRemaining),

    handleSelectMode,

    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    finishEarly,
  };
}