import React from 'react';
import { ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useDrawer } from '@/app/(tabs)/_layout';

import {
  TaskHeaderSection,
  TaskMainViewsContainer,
  TasksModalContainer,
} from './components';
import { useTaskData, useTaskTheme } from './hooks';
import { taskStyles as styles } from './styles/task.styles';

export default function TaskScreen() {
  const { openDrawer } = useDrawer();
  const theme = useTaskTheme();
  const taskData = useTaskData();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgTheme }]} edges={['top']}>
      {/* 1. Header, Search & Sub-Nav Bar */}
      <TaskHeaderSection
        onOpenDrawer={openDrawer}
        taskData={taskData}
        theme={theme}
      />

      {/* 2. Scrollable Active Tab View (Overview / Timeline / Subjects / Analytics) */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={taskData.isRefreshing}
            onRefresh={taskData.handleRefresh}
            tintColor={theme.primaryBrown}
          />
        }
      >
        <TaskMainViewsContainer taskData={taskData} theme={theme} />
      </ScrollView>

      {/* 3. Floating Action Button for New Task */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primaryBrown }]}
        onPress={() => taskData.setIsAdding(true)}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* 4. Task Modals (Add Task & Focus Mode) */}
      <TasksModalContainer taskData={taskData} theme={theme} />
    </SafeAreaView>
  );
}
