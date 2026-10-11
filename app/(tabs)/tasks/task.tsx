import { useDrawer } from '@/app/(tabs)/_layout';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  TaskHeaderSection,
  TaskMainViewsContainer,
  TasksModalContainer,
} from './components';
import { useTaskData, useTaskTheme } from './hooks';
import { taskStyles as styles } from './styles/task.styles';

export default function TaskScreen() {
  const { openDrawer } = useDrawer();
  const router = useRouter();
  const theme = useTaskTheme();
  const taskData = useTaskData();

  const {
    taskId,
    focusTaskId,
  } = useLocalSearchParams<{
    taskId?: string;
    focusTaskId?: string;
  }>();

  console.log('OPENED TASK ID:', taskId);

  const openedFocusTaskId = useRef<string | null>(null);

  const {
    tasks,
    isLoading,
    handleFocusOnTask,
  } = taskData;

  useEffect(() => {
    if (
      !focusTaskId ||
      isLoading ||
      openedFocusTaskId.current === focusTaskId
    ) {
      return;
    }

    const task = tasks.find(
      (item) => item.id === focusTaskId
    );

    if (task) {
      openedFocusTaskId.current = focusTaskId;

      handleFocusOnTask(task);

      router.setParams({
        focusTaskId: undefined,
      });
    }
  }, [
    focusTaskId,
    isLoading,
    tasks,
    handleFocusOnTask,
    router,
  ]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: theme.bgTheme,
        },
      ]}
      edges={['top']}
    >
      {/* Header, Search & Sub-Nav Bar */}
      <TaskHeaderSection
        onOpenDrawer={openDrawer}
        taskData={taskData}
        theme={theme}
      />

      {/* Scrollable Active Tab View */}
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
        <TaskMainViewsContainer
          taskData={taskData}
          theme={theme}
        />
      </ScrollView>

      {/* Add Task & Focus Mode Modals */}
      <TasksModalContainer
        taskData={taskData}
        theme={theme}
      />
    </SafeAreaView>
  );
}