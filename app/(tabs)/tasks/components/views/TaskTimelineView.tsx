import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TaskTheme, Task } from '../../types';
import type { useTaskData } from '../../hooks/useTaskData';
import TaskItemCard from './TaskItemCard';
import TaskFilterScroll from '../header/TaskFilterScroll';
import BulkActionBar from '../header/BulkActionBar';
import { taskStyles as styles } from '../../styles/task.styles';

interface TaskTimelineViewProps {
  taskData: ReturnType<typeof useTaskData>;
  theme: TaskTheme;
}

export default function TaskTimelineView({ taskData, theme }: TaskTimelineViewProps) {
  const {
    activeFilter,
    setActiveFilter,
    isMultiSelectMode,
    setIsMultiSelectMode,
    selectedTaskIds,
    toggleSelectTask,
    handleBulkComplete,
    handleBulkDelete,
    overdueTasks,
    todayTasks,
    tomorrowTasks,
    upcomingTasks,
    completedTasksList,
    filteredTasks,
    toggleTask,
    toggleSubTask,
    handleDeleteTask,
    handleTogglePin,
    handleToggleFavorite,
    handleFocusOnTask,
  } = taskData;

  const {
    cardBg,
    borderCol,
    textPrimary,
    textSecondary,
    primaryBrown,
    successGreen,
    errorRed,
    warningOrange,
  } = theme;

  const renderCard = (task: Task) => (
    <TaskItemCard
      key={task.id}
      task={task}
      onToggleTask={toggleTask}
      onToggleSubTask={toggleSubTask}
      onDeleteTask={handleDeleteTask}
      onTogglePin={handleTogglePin}
      onToggleFavorite={handleToggleFavorite}
      onFocusTask={handleFocusOnTask}
      isMultiSelectMode={isMultiSelectMode}
      isSelected={selectedTaskIds.includes(task.id)}
      onSelectTask={toggleSelectTask}
      cardBg={cardBg}
      borderCol={borderCol}
      textPrimary={textPrimary}
      textSecondary={textSecondary}
      primaryBrown={primaryBrown}
      successGreen={successGreen}
      errorRed={errorRed}
      warningOrange={warningOrange}
    />
  );

  return (
    <View style={styles.timelineContainer}>
      {/* Filter Pills */}
      <TaskFilterScroll
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
        isMultiSelectMode={isMultiSelectMode}
        onToggleMultiSelect={() => setIsMultiSelectMode((prev) => !prev)}
        cardBg={cardBg}
        borderCol={borderCol}
        textSecondary={textSecondary}
        primaryBrown={primaryBrown}
      />

      {/* Bulk Action Bar */}
      <BulkActionBar
        visible={isMultiSelectMode}
        selectedCount={selectedTaskIds.length}
        onBulkComplete={handleBulkComplete}
        onBulkDelete={handleBulkDelete}
        cardBg={cardBg}
        borderCol={borderCol}
        textPrimary={textPrimary}
        successGreen={successGreen}
        errorRed={errorRed}
      />

      {/* If a custom filter is selected (like Priority, Difficulty, Completed), show direct filteredTasks */}
      {activeFilter !== 'All' ? (
        <View style={styles.timelineSection}>
          <Text style={[styles.timelineSectionTitle, { color: textPrimary }]}>
            {activeFilter} Tasks ({filteredTasks.length})
          </Text>
          {filteredTasks.length > 0 ? (
            filteredTasks.map(renderCard)
          ) : (
            <Text style={[styles.emptyTimelineText, { color: textSecondary }]}>
              No tasks found for &quot;{activeFilter}&quot;.
            </Text>
          )}
        </View>
      ) : (
        <>
          {/* Overdue */}
          {overdueTasks.length > 0 && (
            <View style={styles.timelineSection}>
              <Text style={[styles.timelineSectionTitle, { color: errorRed }]}>
                ⚠️ Overdue Deadlines
              </Text>
              {overdueTasks.map(renderCard)}
            </View>
          )}

          {/* Today */}
          <View style={styles.timelineSection}>
            <Text style={[styles.timelineSectionTitle, { color: textPrimary }]}>📅 Today</Text>
            {todayTasks.length > 0 ? (
              todayTasks.map(renderCard)
            ) : (
              <Text style={[styles.emptyTimelineText, { color: textSecondary }]}>
                No tasks scheduled for today.
              </Text>
            )}
          </View>

          {/* Tomorrow */}
          <View style={styles.timelineSection}>
            <Text style={[styles.timelineSectionTitle, { color: textPrimary }]}>📅 Tomorrow</Text>
            {tomorrowTasks.length > 0 ? (
              tomorrowTasks.map(renderCard)
            ) : (
              <Text style={[styles.emptyTimelineText, { color: textSecondary }]}>
                No tasks scheduled for tomorrow.
              </Text>
            )}
          </View>

          {/* Upcoming */}
          {upcomingTasks.length > 0 && (
            <View style={styles.timelineSection}>
              <Text style={[styles.timelineSectionTitle, { color: textPrimary }]}>
                📅 Upcoming & Later
              </Text>
              {upcomingTasks.map(renderCard)}
            </View>
          )}

          {/* Completed */}
          {completedTasksList.length > 0 && (
            <View style={styles.timelineSection}>
              <Text style={[styles.timelineSectionTitle, { color: successGreen }]}>
                ✅ Completed ({completedTasksList.length})
              </Text>
              {completedTasksList.map(renderCard)}
            </View>
          )}

          {/* Empty state when everything caught up */}
          {overdueTasks.length === 0 &&
            todayTasks.length === 0 &&
            tomorrowTasks.length === 0 &&
            upcomingTasks.length === 0 && (
              <View style={styles.emptyContainer}>
                <Feather
                  name="check-circle"
                  size={48}
                  color={successGreen}
                  style={{ marginBottom: 12 }}
                />
                <Text style={[styles.emptyTitleText, { color: textPrimary }]}>
                  🎉 You&apos;re all caught up!
                </Text>
                <Text style={[styles.emptySubText, { color: textSecondary }]}>
                  Enjoy your free study time.
                </Text>
              </View>
            )}
        </>
      )}
    </View>
  );
}
