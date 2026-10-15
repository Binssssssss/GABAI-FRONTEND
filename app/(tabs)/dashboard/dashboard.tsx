import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDrawer } from '@/app/(tabs)/_layout';
import { useAuth } from '@/app/context/AuthContext';
import { useAppTheme } from '@/app/context/ThemeContext';

import {
  AcademicPressure,
  DashboardHeader,
  DashboardTask,
  FocusSessionWidget,
  Footer,
  QuickOverview,
  RecentActivity,
  SmartReminders,
  SubjectProgress,
  TodaysFocus,
  TodaysSchedule,
  UpcomingDeadlines,
  WhatShouldIDoNow,
} from './components';

import { useExpensesData } from '../expenses/hooks/useExpensesData';
import { useDashboardData } from './hooks/useDashboardData';

import {
  getPriorityColor,
  getTimelineIcon,
} from './utils/dashboardHelpers';

import { dashboardStyles as styles } from './styles/dashboard.styles';

export default function DashboardScreen() {
  const { colors } = useAppTheme();

  // ============================================================
  // THEME
  // ============================================================

  const primaryBrown = '#A97C50';

  const successGreen = colors.success;
  const errorRed = colors.danger;
  const warningOrange = colors.warning;

  const bgTheme = colors.background;
  const textPrimary = colors.text;
  const textSecondary = colors.icon;
  const cardBg = colors.surface;
  const borderCol = colors.border;

  // ============================================================
  // DRAWER + AUTH
  // ============================================================

  const { openDrawer } = useDrawer();
  const { user } = useAuth();

  const fullUserName = String(
    user?.name ||
      user?.fullName ||
      user?.userName ||
      user?.username ||
      user?.preferred_username ||
      user?.firstName ||
      user?.first_name ||
      user?.email ||
      'User'
  );

  // Name in title case, first + last word only so it fits the header:
  // "juan dela cruz" -> "Juan Cruz", "arjay reyes" -> "Arjay Reyes"
  // (an email is shown as-is).
  const nameWords = fullUserName
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));

  const userName = fullUserName.includes('@')
    ? fullUserName.trim()
    : (nameWords.length > 2
        ? `${nameWords[0]} ${nameWords[nameWords.length - 1]}`
        : nameWords.join(' ')) || 'User';


  // ============================================================
  // DASHBOARD DATA
  // ============================================================

  const {
    greeting,
    tasks,
    focusTasks,
    deadlines,
    subjects,
    timelineItems,
    isRefreshing,
    onRefresh,
    handleToggleComplete,
  } = useDashboardData();

  // Smart reminders need a real due date; skip tasks without one.
  const reminderTasks = tasks
    .filter((task) => Boolean(task.dueDate))
    .map((task) => ({
      ...task,
      dueDate: task.dueDate as string,
    }));

  // ============================================================
  // EXPENSE DATA
  // ============================================================

  const {
    netBalance,
    totalIncome,
    totalExpenses,
    isLoading: isMoneyLoading,
    refreshWallet,
  } = useExpensesData();

  // ============================================================
  // KEEP EVERY CARD UP TO DATE
  // ============================================================

  // The dashboard tab stays open in the background, so cards that load
  // their own data (wallet, academic pressure, recommendation) reload
  // whenever the dashboard is shown again or pulled to refresh.
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((key) => key + 1);
      void refreshWallet();
    }, [refreshWallet]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshKey((key) => key + 1);
    await Promise.all([onRefresh(), refreshWallet()]);
  }, [onRefresh, refreshWallet]);

  // ============================================================
  // PRIORITY COLOR HELPER
  // ============================================================

  const priorityColorHelper = (
    priority: DashboardTask['priority']
  ) =>
    getPriorityColor(priority, {
      errorRed,
      warningOrange,
      successGreen,
    });

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: bgTheme,
        },
      ]}
      edges={['top']}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <DashboardHeader
        greeting={greeting}
        userName={userName}
        onOpenDrawer={openDrawer}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
      />

      {/* ======================================================
          MAIN DASHBOARD
      ====================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[primaryBrown]}
            tintColor={primaryBrown}
          />
        }
      >
        {/* ====================================================
            SMART REMINDERS
        ==================================================== */}

        <View style={styles.sectionSmall}>
          <SmartReminders
            tasks={reminderTasks}
            primaryBrown={primaryBrown}
            textColor={textPrimary}
            secondaryText={textSecondary}
            cardColor={cardBg}
            borderColor={borderCol}
          />
        </View>

        {/* ====================================================
            TODAY'S FOCUS
        ==================================================== */}

        <View style={styles.sectionLarge}>
          <TodaysFocus
            tasks={focusTasks}
            onToggleComplete={handleToggleComplete}
            getPriorityColor={priorityColorHelper}
            cardBg={cardBg}
            borderCol={borderCol}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            primaryBrown={primaryBrown}
          />
        </View>

        {/* SMART RECOMMENDATION */}
<View style={styles.section}>
  <WhatShouldIDoNow
    refreshKey={refreshKey}
    primaryBrown={primaryBrown}
    textColor={textPrimary}
    secondaryText={textSecondary}
    cardColor={cardBg}
    borderColor={borderCol}
  />
</View>

        {/* ====================================================
            ACADEMIC PRESSURE
        ==================================================== */}

        <View style={styles.section}>
          <AcademicPressure
            refreshKey={refreshKey}
            cardBg={cardBg}
            borderCol={borderCol}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            errorRed={errorRed}
            primaryBrown={primaryBrown}
          />
        </View>

        {/* ====================================================
            QUICK OVERVIEW
        ==================================================== */}

        <View style={styles.section}>
          <QuickOverview
            cardBg={cardBg}
            borderCol={borderCol}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            successGreen={successGreen}
            errorRed={errorRed}
            balance={netBalance}
            income={totalIncome}
            expenses={totalExpenses}
            isLoading={isMoneyLoading}
          />
        </View>

        {/* ====================================================
            TODAY'S SCHEDULE
        ==================================================== */}

        <View style={styles.sectionLarge}>
          <TodaysSchedule
            items={timelineItems}
            getTimelineIcon={getTimelineIcon}
            cardBg={cardBg}
            borderCol={borderCol}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            primaryBrown={primaryBrown}
          />
        </View>

        {/* ====================================================
            FOCUS SESSION
        ==================================================== */}

        <View style={styles.section}>
          <FocusSessionWidget
            cardBg={cardBg}
            borderCol={borderCol}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            primaryBrown={primaryBrown}
          />
        </View>

        {/* ====================================================
            UPCOMING DEADLINES
        ==================================================== */}

        <View style={styles.sectionLarge}>
          <UpcomingDeadlines
            deadlines={deadlines}
            getPriorityColor={priorityColorHelper}
            cardBg={cardBg}
            borderCol={borderCol}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            primaryBrown={primaryBrown}
          />
        </View>

        {/* ====================================================
            SUBJECT PROGRESS
        ==================================================== */}

        <View style={styles.sectionLarge}>
          <SubjectProgress
            subjects={subjects}
            cardBg={cardBg}
            borderCol={borderCol}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            primaryBrown={primaryBrown}
          />
        </View>

        {/* ====================================================
            RECENT ACTIVITY
        ==================================================== */}

        <View style={styles.section}>
          <RecentActivity
            tasks={tasks}
            primaryBrown={primaryBrown}
            textColor={textPrimary}
            secondaryText={textSecondary}
            cardColor={cardBg}
            borderColor={borderCol}
          />
        </View>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <Footer textSecondary={textSecondary} />
      </ScrollView>
    </SafeAreaView>
  );
}