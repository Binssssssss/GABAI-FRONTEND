import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  TimerRingDisplay,
  FocusModeTabs,
  SubjectSelector,
  StrictControls,
  AmbientNoiseWidget,
  FocusStatsOverview,
  SessionCompletionModal,
} from './components';

import { useFocusTimer } from './hooks/useFocusTimer';
import { focusStyles as styles } from './styles/focus.styles';
import { useAppTheme } from '@/app/context/ThemeContext';

export default function StrictFocusSessionScreen() {
  const router = useRouter();

  const { colorScheme } = useAppTheme();
const isDark = colorScheme === 'dark';

const COLORS = {
  primary: '#A97C50',

  background: isDark ? '#121212' : '#FFFFFF',
  card: isDark ? '#1E1E1E' : '#F8FAFC',
  border: isDark ? '#2C2C2C' : '#E2E8F0',

  text: isDark ? '#F5F5F5' : '#11181C',
  subtext: isDark ? '#A1A1AA' : '#64748B',

  danger: '#EF4444',
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

  // ===================================
  // Zen Fullscreen Mode
  // ===================================
  if (zenMode) {
    return (
      <View
        style={[
          styles.zenContainer,
          { backgroundColor: COLORS.zenBackground },
        ]}
      >
        <StatusBar hidden />

        <TouchableOpacity
          style={[
            styles.zenExitBtn,
            { borderColor: '#2E384D' },
          ]}
          onPress={() => setZenMode(false)}
        >
          <Feather name="minimize-2" size={18} color="#9BA1A6" />
        </TouchableOpacity>

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
              color: isStrict
                ? COLORS.danger
                : '#9BA1A6',
            },
          ]}
        >
          {isStrict
            ? '🛡️ Strict Focus Locked'
            : 'Zen Focus Mode'}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            gap: 20,
            marginTop: 40,
          }}
        >
          {!isRunning ? (
            <TouchableOpacity
              style={[
                styles.controlMainBtn,
                { backgroundColor: COLORS.primary },
              ]}
              onPress={startTimer}
            >
              <Feather
                name="play"
                size={24}
                color="#FFF"
                style={{ marginLeft: 3 }}
              />
            </TouchableOpacity>
          ) : isPaused ? (
            <TouchableOpacity
              style={[
                styles.controlMainBtn,
                { backgroundColor: COLORS.primary },
              ]}
              onPress={resumeTimer}
            >
              <Feather
                name="play"
                size={24}
                color="#FFF"
                style={{ marginLeft: 3 }}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.controlMainBtn,
                { backgroundColor: COLORS.danger },
              ]}
              onPress={pauseTimer}
            >
              <Feather
                name="pause"
                size={24}
                color="#FFF"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // ===================================
  // Main Screen
  // ===================================
  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.container,
        { backgroundColor: COLORS.background },
      ]}
    >
      <StatusBar
        barStyle={
          isDark ? 'light-content' : 'dark-content'
        }
        backgroundColor={COLORS.background}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={[
              styles.backButton,
              { backgroundColor: COLORS.card },
            ]}
            onPress={() => {
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

        <TouchableOpacity
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
            "{affirmation}"
          </Text>
        </View>

        <FocusModeTabs
          currentMode={currentMode}
          onSelectMode={handleSelectMode}
          cardBg={COLORS.card}
          borderCol={COLORS.border}
          textPrimary={COLORS.text}
          textSecondary={COLORS.subtext}
          primaryAccent={COLORS.primary}
        />

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
        />

        <SubjectSelector
          selectedSubject={selectedSubject}
          onSelectSubject={setSelectedSubject}
          cardBg={COLORS.card}
          borderCol={COLORS.border}
          textPrimary={COLORS.text}
          textSecondary={COLORS.subtext}
          primaryAccent={COLORS.primary}
        />

        <AmbientNoiseWidget
          ambientSound={ambientSound}
          onSelectAmbientSound={setAmbientSound}
          cardBg={COLORS.card}
          borderCol={COLORS.border}
          textPrimary={COLORS.text}
          textSecondary={COLORS.subtext}
          primaryAccent={COLORS.primary}
        />

        <FocusStatsOverview
          stats={stats}
          cardBg={COLORS.card}
          borderCol={COLORS.border}
          textPrimary={COLORS.text}
          textSecondary={COLORS.subtext}
          primaryAccent={COLORS.primary}
        />
      </ScrollView>

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