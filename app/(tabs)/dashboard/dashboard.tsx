import { RefreshControl, ScrollView, View } from 'react-native';
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

  const userName =
    fullUserName.trim().split(/\s+/)[0] || 'User';

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

  // ============================================================
  // EXPENSE DATA
  // ============================================================

  const {
    netBalance,
    totalIncome,
    totalExpenses,
    isLoading: isMoneyLoading,
  } = useExpensesData();

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
            onRefresh={onRefresh}
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
            tasks={tasks}
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
    tasks={tasks}
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