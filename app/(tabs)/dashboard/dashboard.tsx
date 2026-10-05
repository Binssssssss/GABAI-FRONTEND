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
  // QuickActions,
  QuickOverview,
  RecentActivity,
  SmartReminders,
  SubjectProgress,
  TodaysFocus,
  TodaysSchedule,
  UpcomingDeadlines,
} from './components';

import { useDashboardData } from './hooks/useDashboardData';

import {
  getPriorityColor,
  getTimelineIcon,
} from './utils/dashboardHelpers';

import { dashboardStyles as styles } from './styles/dashboard.styles';

export default function DashboardScreen() {
  const { colorScheme } = useAppTheme();

  const isDark = colorScheme === 'dark';

  // GabAi Theme Colors
  const primaryBrown = '#A97C50';
  const successGreen = '#10B981';
  const errorRed = '#EF4444';
  const warningOrange = '#F59E0B';

  const bgTheme = isDark ? '#121212' : '#FFFFFF';

  const textPrimary = isDark ? '#ECEDEE' : '#11181C';

  const textSecondary = isDark ? '#9BA1A6' : '#666666';

  const cardBg = isDark ? '#1E1E1E' : '#F8FAFC';

  const borderCol = isDark ? '#2E2E2E' : '#E2E8F0';

  // Drawer + Auth
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
      {/* HEADER */}
      <DashboardHeader
        greeting={greeting}
        userName={userName}
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
            tintColor={primaryBrown}
          />
        }
      >
        {/* QUICK ACTIONS
        <View style={styles.section}>
          <QuickActions
            primaryBrown={primaryBrown}
            borderCol={borderCol}
          />
        </View> */}

        {/* SMART REMINDERS */}
        <View style={styles.sectionSmall}>
          <SmartReminders
            warningOrange={warningOrange}
            textPrimary={textPrimary}
          />
        </View>

        {/* TODAY'S FOCUS */}
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

        {/* ACADEMIC PRESSURE */}
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

        {/* QUICK OVERVIEW */}
        <View style={styles.section}>
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
        </View>

        {/* TODAY'S SCHEDULE */}
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

        {/* FOCUS SESSION */}
        <View style={styles.section}>
          <FocusSessionWidget
            cardBg={cardBg}
            borderCol={borderCol}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            primaryBrown={primaryBrown}
          />
        </View>

        {/* UPCOMING DEADLINES */}
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

        {/* SUBJECT PROGRESS */}
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

        {/* RECENT ACTIVITY */}
        <View style={styles.section}>
          <RecentActivity
            cardBg={cardBg}
            borderCol={borderCol}
            textSecondary={textSecondary}
            primaryBrown={primaryBrown}
          />
        </View>

        {/* FOOTER */}
        <Footer textSecondary={textSecondary} />
      </ScrollView>
    </SafeAreaView>
  );
}