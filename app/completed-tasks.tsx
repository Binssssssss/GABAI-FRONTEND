import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  getCompletedTime,
  normalizeBackendTask,
  sortByMostRecentlyCompleted,
} from '@/app/(tabs)/tasks/hooks/useTaskData';
import { useAppTheme } from '@/app/context/ThemeContext';
import api from '@/app/services/api';
import type { Task } from '@/app/services/localDb';
import { taskService } from '@/app/services/task.services';
import { AppAlert } from '@/components/AppAlert';
import { formatClock } from '@/utils/time';

/**
 * Completed tasks history.
 * The Tasks screen only shows the 5 most recent completed tasks;
 * this screen has all of them, grouped by when they were finished,
 * 20 at a time. Tap "Select" (or long-press a task) to pick
 * some or all of them and delete them.
 */

const PAGE_SIZE = 20;
const DAY_MS = 24 * 60 * 60 * 1000;
const CLEAR_AFTER_DAYS = 30;
const BROWN = '#A97C50';

type GroupKey = 'today' | 'week' | 'earlier';

const GROUP_TITLES: Record<GroupKey, string> = {
  today: 'Today',
  week: 'This week',
  earlier: 'Earlier',
};

const startOfToday = () => {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
};

const getGroup = (time: number, todayStart: number): GroupKey => {
  if (time >= todayStart) return 'today';
  if (time >= todayStart - 6 * DAY_MS) return 'week';
  return 'earlier';
};

// "Oct 14", or "Oct 14, 2025" for another year.
const formatDay = (time: number) => {
  const date = new Date(time);
  const sameYear = date.getFullYear() === new Date().getFullYear();

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
};

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.message || fallback;

export default function CompletedTasksScreen() {
  const router = useRouter();
  const { colors, colorScheme } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const red = isDark ? '#EF4444' : '#DC2626';
  const insets = useSafeAreaInsets();

  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Select mode: pick some (or all) completed tasks to delete.
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // ------------------------------------------------------
  // LOAD
  // ------------------------------------------------------

  const loadCompleted = useCallback(async () => {
    try {
      const response = await api.get('/tasks');
      const data = response.data;

      const list: any[] = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.tasks)
          ? data.tasks
          : Array.isArray(data)
            ? data
            : [];

      const done = list
        .filter((task) => task && typeof task.id === 'string')
        .map((task) => normalizeBackendTask(task))
        .filter((task) => task.completed);

      setCompletedTasks(sortByMostRecentlyCompleted(done));
    } catch (error) {
      console.error('Failed to load completed tasks:', error);
      AppAlert.alert(
        'Unable to Load Tasks',
        getErrorMessage(
          error,
          'Something went wrong while loading your completed tasks.',
        ),
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadCompleted();
  }, [loadCompleted]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    void loadCompleted();
  };

  // ------------------------------------------------------
  // GROUPS
  // ------------------------------------------------------

  const todayStart = startOfToday();

  // Full counts per group, so the headers show the real totals.
  const groupTotals = useMemo(() => {
    const totals: Record<GroupKey, number> = {
      today: 0,
      week: 0,
      earlier: 0,
    };

    completedTasks.forEach((task) => {
      totals[getGroup(getCompletedTime(task), todayStart)] += 1;
    });

    return totals;
  }, [completedTasks, todayStart]);

  const sections = useMemo(() => {
    const grouped: Record<GroupKey, Task[]> = {
      today: [],
      week: [],
      earlier: [],
    };

    completedTasks.slice(0, visibleCount).forEach((task) => {
      grouped[getGroup(getCompletedTime(task), todayStart)].push(task);
    });

    return (Object.keys(grouped) as GroupKey[])
      .filter((key) => grouped[key].length > 0)
      .map((key) => ({ key, title: GROUP_TITLES[key], data: grouped[key] }));
  }, [completedTasks, visibleCount, todayStart]);

  const oldTaskIds = useMemo(() => {
    const cutoff = Date.now() - CLEAR_AFTER_DAYS * DAY_MS;

    return completedTasks
      .filter((task) => getCompletedTime(task) < cutoff)
      .map((task) => task.id);
  }, [completedTasks]);

  const hasMore = visibleCount < completedTasks.length;

  // ------------------------------------------------------
  // ACTIONS
  // ------------------------------------------------------

  const restoreTask = (task: Task) => {
    AppAlert.alert(
      'Mark as not done?',
      `"${task.title}" will go back to your active tasks.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: async () => {
            try {
              await taskService.updateTask(task.id, { completed: false });
              setCompletedTasks((prev) =>
                prev.filter((item) => item.id !== task.id),
              );
            } catch (error) {
              AppAlert.alert(
                'Unable to Restore Task',
                getErrorMessage(error, 'Please try again.'),
              );
            }
          },
        },
      ],
    );
  };

  const startSelecting = (taskId?: string) => {
    setIsSelecting(true);
    setSelectedIds(taskId ? new Set([taskId]) : new Set());
  };

  const stopSelecting = useCallback(() => {
    setIsSelecting(false);
    setSelectedIds(new Set());
  }, []);

  const toggleSelected = (taskId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  // "Select all" picks every completed task, even ones not loaded yet.
  const allSelected =
    completedTasks.length > 0 && selectedIds.size === completedTasks.length;

  const toggleSelectAll = () => {
    setSelectedIds(
      allSelected ? new Set() : new Set(completedTasks.map((task) => task.id)),
    );
  };

  // Android back button leaves select mode first.
  useEffect(() => {
    if (!isSelecting) return;

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        stopSelecting();
        return true;
      },
    );

    return () => subscription.remove();
  }, [isSelecting, stopSelecting]);

  const deleteTasks = async (ids: string[]) => {
    // Send in chunks so one request never gets too big.
    for (let i = 0; i < ids.length; i += 100) {
      await api.delete('/tasks/bulk', {
        data: { taskIds: ids.slice(i, i + 100) },
      });
    }

    const removed = new Set(ids);
    setCompletedTasks((prev) => prev.filter((task) => !removed.has(task.id)));
  };

  const deleteSelected = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    const label = `${ids.length} ${ids.length === 1 ? 'task' : 'tasks'}`;

    AppAlert.alert(
      `Delete ${label}?`,
      ids.length === completedTasks.length
        ? 'All your completed tasks will be deleted. This cannot be undone.'
        : 'These completed tasks will be deleted. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);

            try {
              await deleteTasks(ids);
              stopSelecting();
            } catch (error) {
              console.error('Failed to delete selected tasks:', error);
              await loadCompleted();
              stopSelecting();
              AppAlert.alert(
                'Unable to Delete Tasks',
                getErrorMessage(
                  error,
                  'Some tasks could not be deleted. Your list has been refreshed.',
                ),
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  };

  const clearOldTasks = () => {
    const ids = oldTaskIds;
    if (ids.length === 0) return;

    AppAlert.alert(
      `Clear ${ids.length} old ${ids.length === 1 ? 'task' : 'tasks'}?`,
      `This deletes completed tasks finished more than ${CLEAR_AFTER_DAYS} days ago. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);

            try {
              await deleteTasks(ids);
            } catch (error) {
              console.error('Failed to clear old tasks:', error);
              await loadCompleted();
              AppAlert.alert(
                'Unable to Clear Tasks',
                getErrorMessage(
                  error,
                  'Some tasks could not be deleted. Your list has been refreshed.',
                ),
              );
            } finally {
              setIsClearing(false);
            }
          },
        },
      ],
    );
  };

  // ------------------------------------------------------
  // RENDER
  // ------------------------------------------------------

  const cardBg = colors.card;
  const borderCol = colors.border;

  const renderItem = ({ item, section }: { item: Task; section: { key: GroupKey } }) => {
    const time = getCompletedTime(item);
    const when =
      section.key === 'today' ? formatClock(new Date(time)) : formatDay(time);

    const isSelected = selectedIds.has(item.id);

    return (
      <TouchableOpacity
        activeOpacity={isSelecting ? 0.7 : 1}
        onPress={isSelecting ? () => toggleSelected(item.id) : undefined}
        onLongPress={isSelecting ? undefined : () => startSelecting(item.id)}
        delayLongPress={350}
        accessibilityState={isSelecting ? { selected: isSelected } : undefined}
        style={[
          styles.row,
          isSelected
            ? { backgroundColor: 'rgba(169, 124, 80, 0.12)', borderColor: BROWN }
            : { backgroundColor: cardBg, borderColor: borderCol },
        ]}
      >
        {isSelecting ? (
          <View
            style={[
              styles.selectCircle,
              isSelected
                ? { backgroundColor: BROWN, borderColor: BROWN }
                : { borderColor: isDark ? '#5A5A5A' : '#C4C4C4' },
            ]}
          >
            {isSelected && <Feather name="check" size={14} color="#FFFFFF" />}
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => restoreTask(item)}
            hitSlop={10}
            style={[styles.check, { borderColor: BROWN }]}
            accessibilityRole="button"
            accessibilityLabel={`Mark ${item.title} as not done`}
          >
            <Feather name="check" size={14} color={BROWN} />
          </TouchableOpacity>
        )}

        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            style={[styles.rowTitle, { color: colors.secondaryText }]}
          >
            {item.title}
          </Text>
          <Text style={[styles.rowSub, { color: colors.secondaryText }]}>
            {item.subject && item.subject !== 'General'
              ? `${item.subject} · ${when}`
              : when}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const header = (
    <View
      style={[styles.summary, { backgroundColor: cardBg, borderColor: borderCol }]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.summaryCount, { color: colors.text }]}>
          {completedTasks.length}
        </Text>
        <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>
          {completedTasks.length === 1 ? 'task completed' : 'tasks completed'}
        </Text>
      </View>

      {oldTaskIds.length > 0 && (
        <TouchableOpacity
          onPress={clearOldTasks}
          disabled={isClearing}
          style={[styles.clearButton, { borderColor: red }]}
          accessibilityRole="button"
        >
          {isClearing ? (
            <ActivityIndicator size="small" color={red} />
          ) : (
            <Text style={[styles.clearText, { color: red }]}>
              Clear older than {CLEAR_AFTER_DAYS} days
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {isSelecting ? (
        <View style={[styles.topBar, styles.topBarSelecting]}>
          <Text style={[styles.screenTitle, { color: colors.text, flex: 1 }]}>
            {selectedIds.size} selected
          </Text>

          <TouchableOpacity
            onPress={toggleSelectAll}
            style={styles.selectAllButton}
            accessibilityRole="button"
          >
            <View
              style={[
                styles.selectCircle,
                allSelected
                  ? { backgroundColor: BROWN, borderColor: BROWN }
                  : { borderColor: isDark ? '#5A5A5A' : '#C4C4C4' },
              ]}
            >
              {allSelected && <Feather name="check" size={14} color="#FFFFFF" />}
            </View>
            <Text style={styles.headerAction}>
              {allSelected ? 'Deselect all' : 'Select all'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.screenTitle, { color: colors.text, flex: 1 }]}>
            Completed tasks
          </Text>

          {completedTasks.length > 0 && (
            <TouchableOpacity
              onPress={() => startSelecting()}
              style={styles.selectButton}
              accessibilityRole="button"
            >
              <Text style={styles.headerAction}>Select</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={BROWN} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          // Re-draw rows when the selection changes.
          extraData={[isSelecting, selectedIds]}
          renderSectionHeader={({ section }) => (
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {section.title}{' '}
              <Text style={{ color: colors.secondaryText, fontWeight: '500' }}>
                ({groupTotals[section.key]})
              </Text>
            </Text>
          )}
          ListHeaderComponent={
            completedTasks.length > 0 && !isSelecting ? header : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="check-circle" size={44} color={colors.secondaryText} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No completed tasks yet
              </Text>
              <Text style={[styles.emptySub, { color: colors.secondaryText }]}>
                Tasks you finish will show up here.
              </Text>
            </View>
          }
          ListFooterComponent={
            hasMore ? (
              <TouchableOpacity
                onPress={() => setVisibleCount((count) => count + PAGE_SIZE)}
                style={styles.loadMore}
                accessibilityRole="button"
              >
                <Text style={styles.loadMoreText}>
                  Load {Math.min(PAGE_SIZE, completedTasks.length - visibleCount)} more
                </Text>
              </TouchableOpacity>
            ) : null
          }
          stickySectionHeadersEnabled={false}
          contentContainerStyle={[
            styles.listContent,
            isSelecting && { paddingBottom: 140 },
          ]}
          showsVerticalScrollIndicator={false}
          initialNumToRender={12}
          windowSize={7}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              enabled={!isSelecting}
              tintColor={BROWN}
            />
          }
        />
      )}

      {isSelecting && (
        <View
          style={[
            styles.selectBar,
            {
              backgroundColor: cardBg,
              borderColor: borderCol,
              paddingBottom: Math.max(insets.bottom, 12) + 8,
            },
          ]}
        >
          <TouchableOpacity
            onPress={stopSelecting}
            style={[
              styles.barButton,
              styles.barCancel,
              { borderColor: isDark ? '#3A3A3A' : '#E5E7EB' },
            ]}
            accessibilityRole="button"
          >
            <Text style={[styles.barText, { color: colors.text }]}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={deleteSelected}
            disabled={selectedIds.size === 0 || isDeleting}
            style={[
              styles.barButton,
              styles.barDelete,
              { backgroundColor: red, opacity: selectedIds.size === 0 ? 0.45 : 1 },
            ]}
            accessibilityRole="button"
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Feather name="trash-2" size={16} color="#FFFFFF" />
                <Text style={[styles.barText, { color: '#FFFFFF' }]}>
                  Delete ({selectedIds.size})
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  topBarSelecting: {
    paddingLeft: 20,
    minHeight: 60,
  },
  selectButton: {
    minHeight: 44,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 8,
  },
  headerAction: {
    color: BROWN,
    fontSize: 15,
    fontWeight: '700',
  },
  selectCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingTop: 14,
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  barButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barCancel: {
    flex: 1,
    borderWidth: 1,
  },
  barDelete: {
    flex: 1.4,
    flexDirection: 'row',
    gap: 8,
  },
  barText: {
    fontSize: 15,
    fontWeight: '700',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  summaryCount: {
    fontSize: 24,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  clearButton: {
    minHeight: 40,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    textDecorationLine: 'line-through',
  },
  rowSub: {
    fontSize: 13,
    marginTop: 2,
  },
  loadMore: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loadMoreText: {
    color: BROWN,
    fontSize: 15,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 4,
  },
  emptySub: {
    fontSize: 14,
  },
});
