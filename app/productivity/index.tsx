import { Feather } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  FocusSetupModal,
  FocusStatsOverview,
  SessionCompletionModal,
  SessionSummaryCard,
  StrictControls,
  TimerRingDisplay,
} from './components';

import StandaloneDrawer from '@/components/drawer/StandaloneDrawer';
import { useAppTheme } from '@/app/context/ThemeContext';
import { useFocusLock } from '@/app/context/FocusLockContext';
import { FOCUS_MODE_LABELS } from './constants/focusConfig';
import DurationPicker from './components/DurationPicker';
import { useFocusTimer } from './hooks/useFocusTimer';
import { focusStyles as styles } from './styles/focus.styles';
import { FocusPalette } from './types';

const LOCKED_TITLE = 'Strict Focus Active';

export default function FocusSessionScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { isFocusLocked } = useFocusLock();

  const { colors, colorScheme } = useAppTheme();
  const isDark = colorScheme === 'dark';

  const COLORS: FocusPalette = {
    primary: '#A97C50',
    onPrimary: '#FFFFFF',
    background: colors.background,
    card: colors.surface,
    cardStrong: colors.surfaceStrong,
    border: colors.border,
    text: colors.text,
    subtext: colors.secondaryText,
    danger: colors.danger,
    success: colors.success,
  };

  const zenBackground = '#0B0F19';

  const [showSetup, setShowSetup] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {
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
    stats,
    completion,
    dismissCompletion,
    startBreak,
    affirmation,
    progress,
    formattedTime,
    applyConfig,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    endSession,
  } = useFocusTimer();

  const accent = isBreak ? COLORS.success : COLORS.primary;
  const durationMinutes = Math.round(totalDuration / 60);

  const statusLabel = !isHydrated
    ? 'Loading'
    : isPaused
      ? 'Paused'
      : isRunning
        ? isBreak
          ? 'On break'
          : isStrictSessionActive
            ? 'Locked in'
            : 'Focusing'
        : isBreak
          ? 'Break ready'
          : 'Ready';

  // Keep the ring large but leave room for controls on short screens.
  const ringSize = Math.round(
    Math.min(300, width - 80, Math.max(200, height * 0.34))
  );

  const showLockedAlert = (message: string) =>
    Alert.alert(LOCKED_TITLE, message, [
      { text: 'Continue Focusing', style: 'cancel' },
    ]);

  // Prevent Android hardware Back while Strict Focus is locked.
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (!navigation.isFocused() || !isFocusLocked) {
          return false;
        }

        Alert.alert(
          LOCKED_TITLE,
          'You cannot leave while Strict Focus is active. Finish your session first.',
          [{ text: 'Continue Focusing', style: 'cancel' }]
        );

        return true;
      }
    );

    return () => subscription.remove();
  }, [isFocusLocked, navigation]);

  // Same menu button as the other main screens (Wallet, Calendar...).
  const openMenu = () => {
    if (isFocusLocked) {
      showLockedAlert(
        'You cannot leave while Strict Focus is active. Finish your session first.'
      );
      return;
    }

    setIsMenuOpen(true);
  };

  const openHistory = () => {
    if (isFocusLocked) {
      showLockedAlert(
        'Focus History is unavailable while Strict Focus is active. Finish your session first.'
      );
      return;
    }

    router.push('/productivity/history');
  };

  const mainControl = !isRunning
    ? { icon: 'play' as const, label: 'Start', onPress: startTimer, color: accent }
    : isPaused
      ? { icon: 'play' as const, label: 'Resume', onPress: resumeTimer, color: accent }
      : isStrictSessionActive
        ? { icon: 'lock' as const, label: 'Locked in', onPress: pauseTimer, color: '#2E384D' }
        : { icon: 'pause' as const, label: 'Pause', onPress: pauseTimer, color: '#2E384D' };

  // Shown in both layouts so a session finishing in Zen Mode is visible.
  const completionModal = (
    <SessionCompletionModal
      completion={completion}
      todayMinutes={stats.todayMinutes}
      onStartBreak={startBreak}
      onDismiss={dismissCompletion}
      colors={COLORS}
    />
  );

  // Zen Fullscreen Mode
  if (zenMode) {
    return (
      <View style={[styles.zenContainer, { backgroundColor: zenBackground }]}>
        <StatusBar hidden />

        {/* Zen is only a view; exiting never affects the session. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Exit Zen Mode"
          hitSlop={8}
          style={({ pressed }) => [
            styles.zenExitBtn,
            { borderColor: '#2E384D', top: insets.top + 12 },
            pressed && styles.pressed,
          ]}
          onPress={() => setZenMode(false)}
        >
          <Feather name="minimize-2" size={18} color="#9BA1A6" />
        </Pressable>

        <Text numberOfLines={2} style={[styles.zenSubjectText, { color: accent }]}>
          {isBreak
            ? FOCUS_MODE_LABELS[currentMode]
            : selectedTask?.title ?? (selectedSubject.trim() || 'General Study')}
        </Text>

        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[styles.zenTimerDigits, { color: '#FFFFFF' }]}
        >
          {formattedTime}
        </Text>

        <Text
          style={[
            styles.zenStrictNotice,
            { color: isStrictSessionActive ? COLORS.primary : '#9BA1A6' },
          ]}
        >
          {isStrictSessionActive ? 'Strict Focus · Locked' : statusLabel}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={mainControl.label}
          disabled={!isHydrated}
          onPress={mainControl.onPress}
          style={({ pressed }) => [
            styles.controlMainBtn,
            { backgroundColor: mainControl.color, marginTop: 40 },
            pressed && styles.pressed,
          ]}
        >
          <Feather name={mainControl.icon} size={20} color="#FFFFFF" />
          <Text style={[styles.controlMainText, { color: '#FFFFFF' }]}>
            {mainControl.label}
          </Text>
        </Pressable>

        {completionModal}
      </View>
    );
  }

  // Main Screen
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.container, { backgroundColor: COLORS.background }]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={COLORS.background}
      />

      {/* Header (same layout as Calendar) */}
      <View style={[styles.header, { paddingHorizontal: 24, paddingVertical: 16 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            onPress={openMenu}
            style={{ marginRight: 10, padding: 4, opacity: isFocusLocked ? 0.5 : 1 }}
          >
            <Feather
              name="menu"
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>

          <Text
            numberOfLines={1}
            style={{
              color: COLORS.text,
              fontSize: 28,
              fontWeight: 'bold',
              flexShrink: 1,
            }}
          >
            Focus Session
          </Text>
        </View>

        <View style={styles.headerRightActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View focus history"
            onPress={openHistory}
            style={({ pressed }) => [
              styles.iconButton,
              {
                backgroundColor: COLORS.card,
                borderColor: COLORS.border,
                opacity: isFocusLocked ? 0.5 : 1,
              },
              pressed && styles.pressed,
            ]}
          >
            <Feather name="bar-chart-2" size={17} color={COLORS.primary} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enter Zen Mode"
            onPress={() => setZenMode(true)}
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: COLORS.card, borderColor: COLORS.border },
              pressed && styles.pressed,
            ]}
          >
            <Feather name="maximize-2" size={16} color={COLORS.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Mode and strictness */}
        <View style={styles.chipRow}>
          <View
            style={[
              styles.chip,
              { backgroundColor: accent + '1A', borderColor: accent + '55' },
            ]}
          >
            <Feather
              name={isBreak ? 'coffee' : 'clock'}
              size={12}
              color={accent}
            />
            <Text style={[styles.chipText, { color: accent }]}>
              {FOCUS_MODE_LABELS[currentMode]} · {durationMinutes} min
            </Text>
          </View>

          {!isBreak && (
            <View
              style={[
                styles.chip,
                {
                  backgroundColor: isStrict ? COLORS.primary + '1A' : COLORS.card,
                  borderColor: isStrict ? COLORS.primary + '55' : COLORS.border,
                },
              ]}
            >
              <Feather
                name={isStrict ? 'shield' : 'unlock'}
                size={12}
                color={isStrict ? COLORS.primary : COLORS.subtext}
              />
              <Text
                style={[
                  styles.chipText,
                  { color: isStrict ? COLORS.primary : COLORS.subtext },
                ]}
              >
                {isStrict ? 'Strict mode' : 'Casual mode'}
              </Text>
            </View>
          )}
        </View>

        {/* Motivation */}
        <View
          style={[
            styles.affirmationBox,
            { backgroundColor: COLORS.card, borderColor: COLORS.border },
          ]}
        >
          <Feather name="zap" size={15} color={COLORS.primary} />
          <Text style={[styles.affirmationText, { color: COLORS.text }]}>
            &quot;{affirmation}&quot;
          </Text>
        </View>

        {/* Timer */}
        <TimerRingDisplay
          size={ringSize}
          formattedTime={formattedTime}
          progress={progress}
          statusLabel={statusLabel}
          isActive={isRunning && !isPaused}
          accent={accent}
          showZenHint={!isRunning}
          onPress={() => setZenMode(true)}
          colors={COLORS}
        />

        {isStrictSessionActive && (
          <View
            style={[
              styles.strictBanner,
              {
                backgroundColor: COLORS.primary + '14',
                borderColor: COLORS.primary + '55',
              },
            ]}
          >
            <Feather name="shield" size={16} color={COLORS.primary} />
            <Text style={[styles.strictBannerText, { color: COLORS.text }]}>
              Strict session in progress. Pausing, resetting and leaving are
              locked until you finish or end the session.
            </Text>
          </View>
        )}

        {/* Choose any length before starting */}
        {isHydrated && !isRunning && !isBreak && (
          <DurationPicker
            minutes={durationMinutes}
            colors={COLORS}
            onChange={(minutes) =>
              applyConfig({
                mode:
                  minutes === 25
                    ? 'pomodoro'
                    : minutes === 50
                      ? 'deepWork'
                      : 'custom',
                customMinutes: minutes,
                subject: selectedSubject,
                task: selectedTask,
                isStrict,
              })
            }
          />
        )}

        {/* Timer Controls */}
        <StrictControls
          isReady={isHydrated}
          isRunning={isRunning}
          isPaused={isPaused}
          isLocked={isStrictSessionActive}
          isBreak={isBreak}
          accent={accent}
          onStart={startTimer}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onReset={resetTimer}
          onEnd={endSession}
          colors={COLORS}
        />

        {/* Session setup */}
        <SessionSummaryCard
          task={selectedTask}
          subject={selectedSubject}
          durationLabel={`${durationMinutes} min`}
          isBreak={isBreak}
          isEditable={isHydrated && !isRunning}
          onEdit={() => setShowSetup(true)}
          colors={COLORS}
        />

        {/* Focus Statistics */}
        <FocusStatsOverview
          stats={stats}
          isLoading={!isHydrated}
          onOpenHistory={openHistory}
          colors={COLORS}
        />

      </ScrollView>

      {showSetup && (
        <FocusSetupModal
          initialConfig={{
            mode: currentMode,
            customMinutes,
            subject: selectedSubject,
            task: selectedTask,
            isStrict,
          }}
          onClose={() => setShowSetup(false)}
          onSave={(config) => {
            if (applyConfig(config)) setShowSetup(false);
          }}
          onStart={(config) => {
            if (applyConfig(config, { start: true })) setShowSetup(false);
          }}
          colors={COLORS}
        />
      )}

      {completionModal}
    </SafeAreaView>

      {/* Side menu (same as the main tabs) */}
      <StandaloneDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </View>
  );
}
