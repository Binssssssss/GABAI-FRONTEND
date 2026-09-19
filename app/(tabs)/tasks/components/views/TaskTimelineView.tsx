
import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
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

export default function TaskTimelineView({
  taskData,
  theme,
}: TaskTimelineViewProps) {
  const { width } = useWindowDimensions();

  const horizontalPadding = width < 380 ? 16 : 24;

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

  /**
   * Render a single task card.
   * All task information comes from the Task object.
   */
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

  /**
   * Generic empty-state component.
   * No task-specific information is hardcoded here.
   */
  const renderEmptyState = (
    message: string,
    showSuccessIcon = false
  ) => (
    <View style={styles.emptyContainer}>
      {showSuccessIcon && (
        <Feather
          name="check-circle"
          size={48}
          color={successGreen}
          style={{ marginBottom: 12 }}
        />
      )}

      <Text
        style={[
          showSuccessIcon
            ? styles.emptyTitleText
            : styles.emptyTimelineText,
          {
            color: showSuccessIcon
              ? textPrimary
              : textSecondary,
          },
        ]}
      >
        {message}
      </Text>
    </View>
  );

  /**
   * Timeline sections are generated from the actual task arrays.
   *
   * This keeps the rendering logic consistent and makes it easier
   * to add more task categories later.
   */
  const timelineSections = [
    {
      key: 'overdue',
      tasks: overdueTasks,
      title: 'Overdue',
      color: errorRed,
      icon: 'alert-circle' as const,
      showWhenEmpty: false,
      emptyMessage: 'No overdue tasks.',
    },
    {
      key: 'today',
      tasks: todayTasks,
      title: 'Today',
      color: textPrimary,
      icon: 'calendar' as const,
      showWhenEmpty: true,
      emptyMessage: 'No tasks scheduled for today.',
    },
    {
      key: 'tomorrow',
      tasks: tomorrowTasks,
      title: 'Tomorrow',
      color: textPrimary,
      icon: 'calendar' as const,
      showWhenEmpty: true,
      emptyMessage: 'No tasks scheduled for tomorrow.',
    },
    {
      key: 'upcoming',
      tasks: upcomingTasks,
      title: 'Upcoming',
      color: textPrimary,
      icon: 'calendar' as const,
      showWhenEmpty: false,
      emptyMessage: 'No upcoming tasks.',
    },
    {
      key: 'completed',
      tasks: completedTasksList,
      title: 'Completed',
      color: successGreen,
      icon: 'check-circle' as const,
      showWhenEmpty: false,
      emptyMessage: 'No completed tasks.',
    },
  ];

  /**
   * Check whether there are any active/incomplete tasks
   * in the timeline.
   */
  const hasTimelineTasks =
    overdueTasks.length > 0 ||
    todayTasks.length > 0 ||
    tomorrowTasks.length > 0 ||
    upcomingTasks.length > 0;

  /**
   * Custom filter view.
   */
  if (activeFilter !== 'All') {
    return (
      <View
        style={[
          styles.timelineContainer,
          { paddingHorizontal: horizontalPadding },
        ]}
      >
        <TaskFilterScroll
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          isMultiSelectMode={isMultiSelectMode}
          onToggleMultiSelect={() =>
            setIsMultiSelectMode((prev) => !prev)
          }
          cardBg={cardBg}
          borderCol={borderCol}
          textSecondary={textSecondary}
          primaryBrown={primaryBrown}
        />

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

        <View style={styles.timelineSection}>
          <Text
            style={[
              styles.timelineSectionTitle,
              { color: textPrimary },
            ]}
          >
            {activeFilter} ({filteredTasks.length})
          </Text>

          {filteredTasks.length > 0 ? (
            filteredTasks.map(renderCard)
          ) : (
            <Text
              style={[
                styles.emptyTimelineText,
                { color: textSecondary },
              ]}
            >
              No tasks found.
            </Text>
          )}
        </View>
      </View>
    );
  }

  /**
   * Default "All" timeline view.
   */
  return (
    <View
      style={[
        styles.timelineContainer,
        { paddingHorizontal: horizontalPadding },
      ]}
    >
      <TaskFilterScroll
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
        isMultiSelectMode={isMultiSelectMode}
        onToggleMultiSelect={() =>
          setIsMultiSelectMode((prev) => !prev)
        }
        cardBg={cardBg}
        borderCol={borderCol}
        textSecondary={textSecondary}
        primaryBrown={primaryBrown}
      />

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

      {timelineSections.map((section) => {
        const shouldRender =
          section.tasks.length > 0 ||
          section.showWhenEmpty;

        if (!shouldRender) {
          return null;
        }

        return (
          <View
            key={section.key}
            style={styles.timelineSection}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginBottom: 10,
              }}
            >
              <Feather
                name={section.icon}
                size={18}
                color={section.color}
              />

              <Text
                style={[
                  styles.timelineSectionTitle,
                  { color: section.color },
                ]}
              >
                {section.title}
                {section.tasks.length > 0
                  ? ` (${section.tasks.length})`
                  : ''}
              </Text>
            </View>

            {section.tasks.length > 0 ? (
              section.tasks.map(renderCard)
            ) : (
              <Text
                style={[
                  styles.emptyTimelineText,
                  { color: textSecondary },
                ]}
              >
                {section.emptyMessage}
              </Text>
            )}
          </View>
        );
      })}

      {!hasTimelineTasks && (
        <View style={styles.emptyContainer}>
          <Feather
            name="check-circle"
            size={48}
            color={successGreen}
            style={{ marginBottom: 12 }}
          />

          <Text
            style={[
              styles.emptyTitleText,
              { color: textPrimary },
            ]}
          >
            All tasks are up to date
          </Text>

          <Text
            style={[
              styles.emptySubText,
              { color: textSecondary },
            ]}
          >
            No pending tasks at the moment.
          </Text>
        </View>
      )}
    </View>
  );
}

