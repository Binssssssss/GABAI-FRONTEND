import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { TaskTheme, Task } from '../../types';
import {
  sortByMostRecentlyCompleted,
  type useTaskData,
} from '../../hooks/useTaskData';

import TaskItemCard from './TaskItemCard';
import TaskFilterScroll from '../header/TaskFilterScroll';
import BulkActionBar from '../header/BulkActionBar';

import { taskStyles as styles } from '../../styles/task.styles';

// How many completed tasks show on the Tasks screen before "See all".
const RECENT_COMPLETED_COUNT = 5;

interface TaskTimelineViewProps {
  taskData: ReturnType<typeof useTaskData>;
  theme: TaskTheme;
}

export default function TaskTimelineView({
  taskData,
  theme,
}: TaskTimelineViewProps) {
  const { width } = useWindowDimensions();
  const router = useRouter();

  // Completed tasks stay folded away until the user asks for them.
  const [showCompleted, setShowCompleted] = useState(false);

  const horizontalPadding =
    width < 380 ? 16 : 24;

   
  const {
    activeFilter,
    setActiveFilter,

    sortOption,
    setSortOption,


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
    sortedTasks,


    toggleTask,
    toggleSubTask,
    handleDeleteTask,
    handleTogglePin,
    handleToggleFavorite,
    handleFocusOnTask,



    openEditTask,

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

  // ----------------------------------------------------
  // RENDER TASK CARD
  // ----------------------------------------------------

  const renderCard = (task: Task) => (<TaskItemCard
    key={task.id}
    task={task}
    onToggleTask={toggleTask}
    onToggleSubTask={toggleSubTask}
    onDeleteTask={handleDeleteTask}
    onTogglePin={handleTogglePin}
    onToggleFavorite={handleToggleFavorite}
    onFocusTask={handleFocusOnTask}
    onEditTask={openEditTask}
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

  // ----------------------------------------------------
  // EMPTY STATE
  // ----------------------------------------------------

  const renderEmptyState = (
    message: string,
    showSuccessIcon = false,
  ) => (<View style={styles.emptyContainer}>
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

  // ----------------------------------------------------
  // TIMELINE SECTIONS
  // ----------------------------------------------------

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
  ];

  // ----------------------------------------------------
  // COMPLETED (folded; only the 5 most recent show here)
  // ----------------------------------------------------

  const openCompletedHistory = () => {
    router.push('/completed-tasks');
  };

  const renderSeeAllButton = (total: number) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={openCompletedHistory}
      style={[localStyles.seeAllButton, { borderColor: primaryBrown }]}
      accessibilityRole="button"
    >
      <Text style={[localStyles.seeAllText, { color: primaryBrown }]}>
        See all {total} completed tasks
      </Text>
      <Feather name="arrow-right" size={16} color={primaryBrown} />
    </TouchableOpacity>
  );

  const renderCompletedSection = () => {
    const total = completedTasksList.length;

    if (total === 0) {
      return null;
    }

    if (!showCompleted) {
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowCompleted(true)}
          style={[
            localStyles.completedRow,
            { backgroundColor: cardBg, borderColor: borderCol },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Show ${total} completed tasks`}
        >
          <View
            style={[
              localStyles.completedIcon,
              { backgroundColor: 'rgba(34, 197, 94, 0.15)' },
            ]}
          >
            <Feather name="check" size={18} color={successGreen} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[localStyles.completedTitle, { color: textPrimary }]}>
              Completed
            </Text>
            <Text style={[localStyles.completedSub, { color: textSecondary }]}>
              {total} {total === 1 ? 'task' : 'tasks'} · tap to show
            </Text>
          </View>

          <Feather name="chevron-down" size={20} color={textSecondary} />
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.timelineSection}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowCompleted(false)}
          style={localStyles.completedHeader}
          accessibilityRole="button"
          accessibilityLabel="Hide completed tasks"
        >
          <Feather name="check-circle" size={18} color={successGreen} />
          <Text
            style={[
              styles.timelineSectionTitle,
              { color: successGreen, flex: 1 },
            ]}
          >
            Completed ({total})
          </Text>
          <Feather name="chevron-up" size={20} color={textSecondary} />
        </TouchableOpacity>

        {completedTasksList.slice(0, RECENT_COMPLETED_COUNT).map(renderCard)}

        {total > RECENT_COMPLETED_COUNT && renderSeeAllButton(total)}
      </View>
    );
  };

  // ----------------------------------------------------
  // CHECK TIMELINE TASKS
  // ----------------------------------------------------

  const hasTimelineTasks =
    overdueTasks.length > 0 ||
    todayTasks.length > 0 ||
    tomorrowTasks.length > 0 ||
    upcomingTasks.length > 0;

  // ----------------------------------------------------
  // FILTERED VIEW
  // ----------------------------------------------------

  if (activeFilter !== 'All') {
    return (
      <View
        style={[
          styles.timelineContainer,
          {
            paddingHorizontal:
              horizontalPadding,
          },
        ]}
      >
        <TaskFilterScroll
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          isMultiSelectMode={
            isMultiSelectMode
          }
          onToggleMultiSelect={() =>
            setIsMultiSelectMode(
              (prev) => !prev,
            )
          }
          sortOption={sortOption}
          onChangeSort={() => {
            const options = [
              'Due Date',
              'Priority',
              'Newest',
              'A-Z',
            ];

            const currentIndex =
              options.indexOf(sortOption);

            const nextIndex =
              (currentIndex + 1) % options.length;

            setSortOption(options[nextIndex]);
          }}

          cardBg={cardBg}
          borderCol={borderCol}
          textSecondary={textSecondary}
          primaryBrown={primaryBrown}
        />

        <BulkActionBar
          visible={isMultiSelectMode}
          selectedCount={
            selectedTaskIds.length
          }
          onBulkComplete={
            handleBulkComplete
          }
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
            {activeFilter} (
            {sortedTasks.length})
          </Text>

          {activeFilter === 'Completed' && sortedTasks.length > 0 ? (
            <>
              {sortByMostRecentlyCompleted(sortedTasks)
                .slice(0, RECENT_COMPLETED_COUNT)
                .map(renderCard)}

              {sortedTasks.length > RECENT_COMPLETED_COUNT &&
                renderSeeAllButton(sortedTasks.length)}
            </>
          ) : sortedTasks.length > 0 ? (
            sortedTasks.map(renderCard)
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

  // ----------------------------------------------------
  // DEFAULT ALL TASKS VIEW
  // ----------------------------------------------------

  return (
    <View
      style={[
        styles.timelineContainer,
        {
          paddingHorizontal:
            horizontalPadding,
        },
      ]}
    >
      <TaskFilterScroll
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
        isMultiSelectMode={
          isMultiSelectMode
        }
        onToggleMultiSelect={() =>
          setIsMultiSelectMode(
            (prev) => !prev,
          )
        }
        sortOption={sortOption}
        onChangeSort={() => {
          const options = [
            'Due Date',
            'Priority',
            'Newest',
            'A-Z',
          ];

          const currentIndex =
            options.indexOf(sortOption);

          const nextIndex =
            (currentIndex + 1) % options.length;

          setSortOption(options[nextIndex]);
        }}

        cardBg={cardBg}
        borderCol={borderCol}
        textSecondary={textSecondary}
        primaryBrown={primaryBrown}
      />

      <BulkActionBar
        visible={isMultiSelectMode}
        selectedCount={
          selectedTaskIds.length
        }
        onBulkComplete={
          handleBulkComplete
        }
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
                  {
                    color: section.color,
                  },
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

      {renderCompletedSection()}

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

const localStyles = StyleSheet.create({
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  completedIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  completedSub: {
    fontSize: 13,
    marginTop: 2,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    minHeight: 44,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderWidth: 1.5,
    borderRadius: 14,
    marginTop: 4,
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
