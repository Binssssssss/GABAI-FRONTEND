import { View } from 'react-native';
import type { useTaskData } from '../../hooks/useTaskData';
import { TaskTheme } from '../../types';
import TaskHeader from './TaskHeader';
import TaskSubNavTabs from './TaskSubNavTabs';

interface TaskHeaderSectionProps {
  onOpenDrawer: () => void;
  taskData: ReturnType<typeof useTaskData>;
  theme: TaskTheme;
}

export default function TaskHeaderSection({
  onOpenDrawer,
  taskData,
  theme,
}: TaskHeaderSectionProps) {
  return (
    <View>
      {/* 1. Header Bar */}
      <TaskHeader
        onOpenDrawer={onOpenDrawer}
        onOpenAdd={() => taskData.setIsAdding(true)}
        textPrimary={theme.textPrimary}
        textSecondary={theme.textSecondary}
        primaryBrown={theme.primaryBrown}
        cardBg={theme.cardBg}
        borderCol={theme.borderCol}
      />

      {/* 2. Sub-Navigation Tabs */}
      <TaskSubNavTabs
        activeSubTab={taskData.activeSubTab}
        onSelectSubTab={taskData.setActiveSubTab}
        borderCol={theme.borderCol}
        textPrimary={theme.textPrimary}
        textSecondary={theme.textSecondary}
        primaryBrown={theme.primaryBrown}
      />
    </View>
  );
}
