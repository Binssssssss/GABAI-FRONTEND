import { View } from 'react-native';
import type { useTaskData } from '../../hooks/useTaskData';
import { TaskTheme } from '../../types';
import TaskHeader from './TaskHeader';
import TaskSearchBar from './TaskSearchBar';
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
        onToggleSearch={() => taskData.setIsSearching((prev) => !prev)}
        onOpenAdd={() => taskData.setIsAdding(true)}
        textPrimary={theme.textPrimary}
        textSecondary={theme.textSecondary}
        primaryBrown={theme.primaryBrown}
        cardBg={theme.cardBg}
        borderCol={theme.borderCol}
      />

      {/* 2. Search Bar */}
      <TaskSearchBar
        visible={taskData.isSearching}
        searchQuery={taskData.searchQuery}
        onSearchChange={taskData.setSearchQuery}
        onClose={() => {
          taskData.setSearchQuery('');
          taskData.setIsSearching(false);
        }}
        cardBg={theme.cardBg}
        borderCol={theme.borderCol}
        textPrimary={theme.textPrimary}
        textSecondary={theme.textSecondary}
      />

      {/* 3. Sub-Navigation Tabs */}
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
