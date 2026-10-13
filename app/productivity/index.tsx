
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  Alert,
  BackHandler,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AmbientNoiseWidget,
  FocusModeTabs,
  FocusStatsOverview,
  SessionCompletionModal,
  StrictControls,
  SubjectSelector,
  TimerRingDisplay,
} from './components';

import { useAppTheme } from '@/app/context/ThemeContext';
import { useFocusLock } from '@/app/context/FocusLockContext';
import { useFocusTimer } from './hooks/useFocusTimer';
import { focusStyles as styles } from './styles/focus.styles';

export default function StrictFocusSessionScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { isFocusLocked } = useFocusLock();

  const { colors, colorScheme } = useAppTheme();
  const isDark = colorScheme === 'dark';

  const COLORS = {
    primary: '#A97C50',
    background: colors.background,
    card: colors.surface,
    border: colors.border,
    text: colors.text,
    subtext: colors.icon,
    danger: colors.danger,
    zenBackground: '#0B0F19',
  };

  const {
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
  } = useFocusTimer();

  // Prevent Android hardware Back while Strict Focus is locked.
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (!navigation.isFocused() || !isFocusLocked) {
          return false;
        }

        Alert.alert(
          'Strict Focus Active',
          'You cannot leave while Strict Focus is active. Finish your session first.',
          [
            {
              text: 'Continue Focusing',
              style: 'cancel',
            },
          ]
        );

        return true;
      }
    );

    return () => subscription.remove();
  }, [isFocusLocked, navigation]);

  // Zen Fullscreen Mode
  if (zenMode) {
    return (
      <View
        style={[
          styles.zenContainer,
          { backgroundColor: COLORS.zenBackground },
        ]}
      >
        <StatusBar hidden />

        {!isFocusLocked && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Exit Zen Mode"
            style={[
              styles.zenExitBtn,
              { borderColor: '#2E384D' },
            ]}
            onPress={() => setZenMode(false)}
          >
            <Feather
              name="minimize-2"
              size={18}
              color="#9BA1A6"
            />
          </TouchableOpacity>
        )}

        <Text
          style={[
            styles.zenSubjectText,
            { color: COLORS.primary },
          ]}
        >
          📚 {selectedSubject.trim() || 'General Study'}
        </Text>

        <Text
          style={[
            styles.zenTimerDigits,
            { color: '#FFFFFF' },
          ]}
        >
          {formattedTime}
        </Text>

        <Text
          style={[
            styles.zenStrictNotice,
            {
              color: isFocusLocked
                ? COLORS.danger
                : '#9BA1A6',
            },
          ]}
        >
          {isFocusLocked
            ? '🛡️ Strict Focus Locked'
            : 'Zen Focus Mode'}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            gap: 20,
            marginTop: 40,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {!isRunning ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Start focus timer"
              style={[
                styles.controlMainBtn,
                { backgroundColor: COLORS.primary },
              ]}
              onPress={startTimer}
            >
              <Feather
                name="play"
                size={24}
                color="#FFFFFF"
                style={{ marginLeft: 3 }}
              />
            </TouchableOpacity>
          ) : isPaused ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Resume focus timer"
              style={[
                styles.controlMainBtn,
                { backgroundColor: COLORS.primary },
              ]}
              onPress={resumeTimer}
            >
              <Feather
                name="play"
                size={24}
                color="#FFFFFF"
                style={{ marginLeft: 3 }}
              />
            </TouchableOpacity>
          ) : isFocusLocked ? (
            <View
              accessibilityRole="image"
              accessibilityLabel="Strict Focus is locked"
              style={[
                styles.controlMainBtn,
                {
                  backgroundColor: '#1E1E1E',
                  borderWidth: 1,
                  borderColor: COLORS.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
              ]}
            >
              <Feather
                name="shield"
                size={24}
                color={COLORS.primary}
              />
            </View>
          ) : (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Pause focus timer"
              style={[
                styles.controlMainBtn,
                { backgroundColor: COLORS.danger },
              ]}
              onPress={pauseTimer}
            >
              <Feather
                name="pause"
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Main Screen
  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.container,
        { backgroundColor: COLORS.background },
      ]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={COLORS.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={[
              styles.backButton,
              { backgroundColor: COLORS.card },
            ]}
            onPress={() => {
              if (isFocusLocked) {
                Alert.alert(
                  'Strict Focus Active',
                  'You cannot leave while Strict Focus is active. Finish your session first.',
                  [
                    {
                      text: 'Continue Focusing',
                      style: 'cancel',
                    },
                  ]
                );
                return;
              }

              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)/dashboard/dashboard');
              }
            }}
          >
            <Feather
              name="arrow-left"
              size={20}
              color={COLORS.text}
            />
          </TouchableOpacity>

          <Text
            style={[
              styles.headerTitle,
              { color: COLORS.text },
            ]}
          >
            Strict Study Timer
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {/* Focus History */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="View focus history"
            onPress={() => {
              if (isFocusLocked) {
                Alert.alert(
                  'Strict Focus Active',
                  'Focus History is unavailable while Strict Focus is active. Finish your session first.',
                  [
                    {
                      text: 'Continue Focusing',
                      style: 'cancel',
                    },
                  ]
                );
                return;
              }

              router.push('/productivity/history');
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingHorizontal: 10,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: COLORS.card,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Feather
              name="clock"
              size={15}
              color={COLORS.primary}
            />

            <Text
              style={{
                color: COLORS.text,
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              History
            </Text>
          </TouchableOpacity>

          {/* Zen Mode */}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Enter Zen Mode"
            style={[
              styles.iconButton,
              {
                backgroundColor: COLORS.card,
                borderColor: COLORS.border,
              },
            ]}
            onPress={() => setZenMode(true)}
          >
            <Feather
              name="maximize-2"
              size={16}
              color={COLORS.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Motivation */}
        <View
          style={[
            styles.affirmationBox,
            {
              backgroundColor: COLORS.card,
              borderColor: COLORS.border,
            },
          ]}
        >
          <Feather
            name="zap"
            size={15}
            color={COLORS.primary}
          />

          <Text
            style={[
              styles.affirmationText,
              { color: COLORS.text },
            ]}
          >
            &quot;{affirmation}&quot;
          </Text>
        </View>

        {/* Focus Modes */}
        <FocusModeTabs
          currentMode={currentMode}
          onSelectMode={handleSelectMode}
          cardBg={COLORS.card}
          borderCol={COLORS.border}
          textPrimary={COLORS.text}
          textSecondary={COLORS.subtext}
          primaryAccent={COLORS.primary}
        />

        {/* Timer */}
        <TimerRingDisplay
          formattedTime={formattedTime}
          progressPercent={progressPercent}
          selectedSubject={selectedSubject}
          isStrict={isStrict}
          isRunning={isRunning}
          isPaused={isPaused}
          onEnterZen={() => setZenMode(true)}
          cardBg={COLORS.card}
          borderCol={COLORS.border}
          textPrimary={COLORS.text}
          textSecondary={COLORS.subtext}
          primaryAccent={COLORS.primary}
        />

        {/* Timer Controls */}
        <StrictControls
          isRunning={isRunning}
          isPaused={isPaused}
          isStrict={isStrict}
          onToggleStrict={setIsStrict}
          onStart={startTimer}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onReset={resetTimer}
          onFinishEarly={finishEarly}
          cardBg={COLORS.card}
          borderCol={COLORS.border}
          textPrimary={COLORS.text}
          textSecondary={COLORS.subtext}
          primaryAccent={COLORS.primary}
          isFocusLocked={isFocusLocked}
        />

        {/* Subject Selection */}
        <SubjectSelector
          selectedSubject={selectedSubject}
          onSelectSubject={setSelectedSubject}
          cardBg={COLORS.card}
          borderCol={COLORS.border}
          textPrimary={COLORS.text}
          textSecondary={COLORS.subtext}
          primaryAccent={COLORS.primary}
        />

        {/* Ambient Sounds */}
        <AmbientNoiseWidget
          ambientSound={ambientSound}
          onSelectAmbientSound={setAmbientSound}
          cardBg={COLORS.card}
          borderCol={COLORS.border}
          textPrimary={COLORS.text}
          textSecondary={COLORS.subtext}
          primaryAccent={COLORS.primary}
        />

        {/* Focus Statistics */}
        <FocusStatsOverview
          stats={stats}
          cardBg={COLORS.card}
          borderCol={COLORS.border}
          textPrimary={COLORS.text}
          textSecondary={COLORS.subtext}
          primaryAccent={COLORS.primary}
        />
      </ScrollView>

      {/* Session Completion */}
      <SessionCompletionModal
        visible={showCompletionModal}
        subject={selectedSubject}
        durationMinutes={completedDurationMin}
        isStrict={isStrict}
        onDismiss={() => setShowCompletionModal(false)}
        cardBg={COLORS.card}
        borderCol={COLORS.border}
        textPrimary={COLORS.text}
        textSecondary={COLORS.subtext}
        primaryAccent={COLORS.primary}
      />
    </SafeAreaView>
  );
}
