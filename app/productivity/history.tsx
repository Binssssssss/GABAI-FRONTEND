import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useFocusEffect, useRouter } from 'expo-router';

import { useAppTheme } from '@/app/context/ThemeContext';
import { FOCUS_MODE_LABELS } from './constants/focusConfig';
import { FocusMode } from './types';

const FOCUS_SESSIONS_KEY = 'gabai.focus.sessions';
const ACCENT = '#A97C50';

type FocusSessionRecord = {
  id: string;
  subject: string;
  taskTitle?: string;
  durationMinutes: number;
  mode: string;
  completedAt: string;
  isStrict: boolean;
};

export default function FocusHistoryScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [sessions, setSessions] = useState<FocusSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(FOCUS_SESSIONS_KEY);
      const parsed: unknown = stored ? JSON.parse(stored) : [];

      setSessions(
        Array.isArray(parsed)
          ? parsed.filter(
              (item): item is FocusSessionRecord =>
                item !== null &&
                typeof item === 'object' &&
                typeof item.id === 'string' &&
                typeof item.subject === 'string' &&
                typeof item.durationMinutes === 'number' &&
                typeof item.completedAt === 'string',
            )
          : [],
      );
    } catch (error) {
      console.error('Failed to load focus history:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadSessions();
    }, [loadSessions]),
  );

  const totalMinutes = sessions.reduce(
    (total, session) => total + session.durationMinutes,
    0,
  );

  const strictCount = sessions.filter((session) => session.isStrict).length;

  const formatDate = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return 'Date unavailable';

    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/productivity');
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Feather name="arrow-left" size={18} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>Focus History</Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Your completed study sessions.
          </Text>
        </View>
      </View>

      <View style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.text }]}>{sessions.length}</Text>
          <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>Sessions</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>Total Focus</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: ACCENT }]}>{strictCount}</Text>
          <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>Strict</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={ACCENT}
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={[...sessions].sort(
            (a, b) =>
              new Date(b.completedAt).getTime() -
              new Date(a.completedAt).getTime(),
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            sessions.length === 0 ? styles.emptyList : styles.list
          }
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => {
                setLoading(true);
                loadSessions();
              }}
              tintColor={ACCENT}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="clock" size={44} color={ACCENT} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No sessions yet</Text>
              <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
                Complete a focus session and it will appear here.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.sessionCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.sessionTop}>
                <View style={styles.sessionInfo}>
                  <Text style={[styles.subject, { color: colors.text }]}>
                    {item.taskTitle ?? item.subject}
                  </Text>
                  {item.taskTitle ? (
                    <Text style={[styles.sessionMeta, { color: colors.secondaryText }]}>
                      {item.subject}
                    </Text>
                  ) : null}
                  <Text style={[styles.sessionMeta, { color: colors.secondaryText }]}>
                    {formatDate(item.completedAt)}
                  </Text>
                </View>
                <View style={[styles.durationBadge, { backgroundColor: ACCENT + '22' }]}>
                  <Text style={[styles.durationText, { color: ACCENT }]}>
                    {item.durationMinutes} min
                  </Text>
                </View>
              </View>

              <View style={styles.sessionBottom}>
                <Text style={[styles.mode, { color: colors.secondaryText }]}>
                  {FOCUS_MODE_LABELS[item.mode as FocusMode] ?? item.mode ?? 'Focus'}
                </Text>
                <View
                  style={[
                    styles.typeBadge,
                    { backgroundColor: item.isStrict ? ACCENT + '22' : colors.success + '22' },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeText,
                      { color: item.isStrict ? ACCENT : colors.success },
                    ]}
                  >
                    {item.isStrict ? 'Strict' : 'Casual'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 5,
  },
  summaryDivider: {
    width: 1,
    height: 38,
  },
  loader: {
    marginTop: 40,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  emptyList: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 21,
  },
  sessionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  sessionTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  sessionInfo: {
    flex: 1,
    paddingRight: 10,
  },
  subject: {
    fontSize: 16,
    fontWeight: '600',
  },
  sessionMeta: {
    fontSize: 12,
    marginTop: 4,
  },
  durationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sessionBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  mode: {
    fontSize: 13,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
