
import React from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/app/context/ThemeContext';
import { useDrawer } from '@/app/(tabs)/_layout';

import {
  DashboardHeader,
  QuickActions,
  SmartReminders,
  AcademicPressure,
  TodaysFocus,
  QuickOverview,
  TodaysSchedule,
  FocusSessionWidget,
  UpcomingDeadlines,
  SubjectProgress,
  RecentActivity,
  Footer,
  DashboardTask,
} from './components';

import { useDashboardData } from './hooks/useDashboardData';
import {
  getPriorityColor,
  getTimelineIcon,
} from './utils/dashboardHelpers';

import { dashboardStyles as styles } from './styles/dashboard.styles';

export default function DashboardScreen() {
  /*
   * GabAi Theme
   *
   * Uses the selected theme from ThemeContext:
   * System / Light / Dark
   */
  const { colorScheme } = useAppTheme();

  const isDark = colorScheme === 'dark';

  // GabAi Theme Colors
  const primaryBrown = '#A97C50';
  const successGreen = '#10B981';
  const errorRed = '#EF4444';
  const warningOrange = '#F59E0B';

  const bgTheme = isDark
    ? '#121212'
    : '#FFFFFF';

  const textPrimary = isDark
    ? '#ECEDEE'
    : '#11181C';

  const textSecondary = isDark
    ? '#9BA1A6'
    : '#666666';

  const cardBg = isDark
    ? '#1E1E1E'
    : '#F8FAFC';

  const borderCol = isDark
    ? '#2E2E2E'
    : '#E2E8F0';

  // Drawer
  const { openDrawer } = useDrawer();

  // Dashboard Data
  const {
    greeting,
    focusTasks,
    deadlines,
    subjects,
    timelineItems,
    isRefreshing,
    onRefresh,
    handleToggleComplete,
  } = useDashboardData();

  // Priority Color Helper
  const priorityColorHelper = (
    pr: DashboardTask['priority']
  ) =>
    getPriorityColor(pr, {
      errorRed,
      warningOrange,
      successGreen,
    });

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
      {/* 1. Header Bar */}
      <DashboardHeader
        onOpenDrawer={openDrawer}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[primaryBrown]}
          />
        }
      >
        {/* 2. Quick Actions */}
        <QuickActions
          primaryBrown={primaryBrown}
          borderCol={borderCol}
        />

        {/* 3. Smart Reminders */}
        <SmartReminders
          warningOrange={warningOrange}
          textPrimary={textPrimary}
        />

        {/* 4. Academic Pressure Widget */}
        <AcademicPressure
  cardBg={cardBg}
  borderCol={borderCol}
  textPrimary={textPrimary}
  textSecondary={textSecondary}
  errorRed={errorRed}
  primaryBrown={primaryBrown}
/>

        {/* 5. Today's Focus Card */}
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

        {/* 6. Quick Overview Stats */}
        <QuickOverview
          cardBg={cardBg}
          borderCol={borderCol}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          tasksCount={4}
          deadlinesCount={5}
          classesCount={2}
          weeklySpend="₱1,250"
        />

        {/* 7. Today's Schedule Timeline */}
        <TodaysSchedule
          items={timelineItems}
          getTimelineIcon={getTimelineIcon}
          cardBg={cardBg}
          borderCol={borderCol}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          primaryBrown={primaryBrown}
        />

        {/* 8. Focus Session */}
        <FocusSessionWidget
          cardBg={cardBg}
          borderCol={borderCol}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          primaryBrown={primaryBrown}
        />

        {/* 9. Upcoming Deadlines */}
        <UpcomingDeadlines
          deadlines={deadlines}
          getPriorityColor={priorityColorHelper}
          cardBg={cardBg}
          borderCol={borderCol}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          primaryBrown={primaryBrown}
        />

        {/* 10. Subject Progress */}
        <SubjectProgress
          subjects={subjects}
          cardBg={cardBg}
          borderCol={borderCol}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          primaryBrown={primaryBrown}
        />

        {/* 12. Recent Activity */}
        <RecentActivity
          cardBg={cardBg}
          borderCol={borderCol}
          textSecondary={textSecondary}
          primaryBrown={primaryBrown}
        />

        {/* 13. Footer */}
        <Footer
          textSecondary={textSecondary}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
