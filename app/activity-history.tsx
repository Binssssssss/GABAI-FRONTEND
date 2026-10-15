import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/app/context/ThemeContext';
import {
  ACTIVITY_KEEP_DAYS,
  type ActivityEntry,
  type ActivityType,
  useActivityLog,
} from '@/app/services/activityLog';
import {
  ACTIVITY_GROUP_TITLES,
  ACTIVITY_ICON,
  type ActivityGroup,
  activityText,
  formatActivityTime,
  getActivityColor,
  getActivityGroup,
} from '@/utils/activityFormat';

/**
 * Activity history: every task created, completed, restored or
 * deleted in the last 30 days, saved on this phone.
 */

const BROWN = '#A97C50';

type Filter = 'all' | Exclude<ActivityType, 'restored'>;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'created', label: 'Created' },
  { key: 'deleted', label: 'Deleted' },
];

const GROUP_ORDER: ActivityGroup[] = ['today', 'yesterday', 'week', 'earlier'];

export default function ActivityHistoryScreen() {
  const router = useRouter();
  const { colors, colorScheme } = useAppTheme();
  const isDark = colorScheme === 'dark';
  const red = isDark ? '#EF4444' : '#DC2626';

  const activity = useActivityLog();
  const [filter, setFilter] = useState<Filter>('all');

  const sections = useMemo(() => {
    const shown =
      filter === 'all'
        ? activity
        : activity.filter((entry) => entry.type === filter);

    const grouped: Record<ActivityGroup, ActivityEntry[]> = {
      today: [],
      yesterday: [],
      week: [],
      earlier: [],
    };

    shown.forEach((entry) => {
      grouped[getActivityGroup(entry.at)].push(entry);
    });

    return GROUP_ORDER.filter((key) => grouped[key].length > 0).map(
      (key) => ({ key, title: ACTIVITY_GROUP_TITLES[key], data: grouped[key] }),
    );
  }, [activity, filter]);

  const renderItem = ({
    item,
    index,
    section,
  }: {
    item: ActivityEntry;
    index: number;
    section: { data: readonly ActivityEntry[] };
  }) => {
    const isFirst = index === 0;
    const isLast = index === section.data.length - 1;
    const color = getActivityColor(item.type, BROWN, red);

    return (
      <View
        style={[
          styles.row,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderTopWidth: isFirst ? 1 : 0,
            borderBottomWidth: isLast ? 1 : 0,
            borderTopLeftRadius: isFirst ? 16 : 0,
            borderTopRightRadius: isFirst ? 16 : 0,
            borderBottomLeftRadius: isLast ? 16 : 0,
            borderBottomRightRadius: isLast ? 16 : 0,
            paddingTop: isFirst ? 14 : 10,
            paddingBottom: isLast ? 14 : 10,
          },
        ]}
      >
        <View
          style={[
            styles.icon,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          <Feather name={ACTIVITY_ICON[item.type]} size={16} color={color} />
        </View>

        <View style={styles.rowBody}>
          <Text numberOfLines={2} style={[styles.rowText, { color: colors.text }]}>
            {activityText(item)}
          </Text>
          <Text style={[styles.rowSub, { color: colors.secondaryText }]}>
            {item.subject || 'General'}
          </Text>
        </View>

        <Text style={[styles.rowTime, { color: colors.secondaryText }]}>
          {formatActivityTime(item.at)}
        </Text>
      </View>
    );
  };

  const header = (
    <View>
      <View
        style={[
          styles.banner,
          {
            backgroundColor: isDark
              ? 'rgba(169, 124, 80, 0.12)'
              : 'rgba(169, 124, 80, 0.10)',
            borderColor: 'rgba(169, 124, 80, 0.35)',
          },
        ]}
      >
        <Feather name="clock" size={16} color={BROWN} />
        <Text style={[styles.bannerText, { color: colors.text }]}>
          Activity is kept for{' '}
          <Text style={{ fontWeight: '800' }}>{ACTIVITY_KEEP_DAYS} days</Text>
          . Older activity is removed automatically.
        </Text>
      </View>

      <View style={styles.filters}>
        {FILTERS.map((item) => {
          const active = filter === item.key;

          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => setFilter(item.key)}
              style={[
                styles.chip,
                active
                  ? { backgroundColor: BROWN, borderColor: BROWN }
                  : { borderColor: colors.border },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? '#FFFFFF' : colors.secondaryText },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.screenTitle, { color: colors.text }]}>
          Activity history
        </Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {section.title}{' '}
            <Text style={{ color: colors.secondaryText, fontWeight: '500' }}>
              ({section.data.length})
            </Text>
          </Text>
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="activity" size={40} color={colors.secondaryText} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {filter === 'all' ? 'No activity yet' : 'Nothing here yet'}
            </Text>
            <Text style={[styles.emptySub, { color: colors.secondaryText }]}>
              Tasks you create, complete or delete will appear here.
            </Text>
          </View>
        }
        ListFooterComponent={
          sections.length > 0 ? (
            <Text style={[styles.footer, { color: colors.secondaryText }]}>
              Showing the last {ACTIVITY_KEEP_DAYS} days
            </Text>
          ) : null
        }
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={15}
        windowSize={7}
      />
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 4,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
  },
  rowText: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  rowSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  rowTime: {
    fontSize: 11.5,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    paddingVertical: 16,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 70,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 4,
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
  },
});
