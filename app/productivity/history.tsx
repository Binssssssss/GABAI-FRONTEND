import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

const FOCUS_SESSIONS_KEY = 'gabai.focus.sessions';
const ACCENT = '#A97C50';

type FocusSessionRecord = {
  id: string;
  subject: string;
  durationMinutes: number;
  mode: string;
  completedAt: string;
  isStrict: boolean;
};

const modeLabels: Record<string, string> = {
  pomodoro: 'Pomodoro',
  deepWork: 'Deep Work',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
  custom: 'Custom Focus',
};

export default function FocusHistoryScreen() {
  const router = useRouter();
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        
        <Text style={styles.title}>Focus History</Text>
        <Text style={styles.subtitle}>
          Review your completed focus sessions.
        </Text>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{sessions.length}</Text>
          <Text style={styles.summaryLabel}>Sessions</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </Text>
          <Text style={styles.summaryLabel}>Total Focus Time</Text>
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
              <Text style={styles.emptyIcon}>◷</Text>
              <Text style={styles.emptyTitle}>No sessions yet</Text>
              <Text style={styles.emptyText}>
                Complete a focus session and it will appear here.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.sessionCard}>
              <View style={styles.sessionTop}>
                <View style={styles.sessionInfo}>
                  <Text style={styles.subject}>{item.subject}</Text>
                  <Text style={styles.sessionDate}>
                    {formatDate(item.completedAt)}
                  </Text>
                </View>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>
                    {item.durationMinutes} min
                  </Text>
                </View>
              </View>

              <View style={styles.sessionBottom}>
                <Text style={styles.mode}>
                  {modeLabels[item.mode] ?? item.mode ?? 'Focus'}
                </Text>
                <View
                  style={[
                    styles.typeBadge,
                    item.isStrict ? styles.strictBadge : styles.casualBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeText,
                      item.isStrict
                        ? styles.strictText
                        : styles.casualText,
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
    backgroundColor: '#121212',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  backButton: {
    color: ACCENT,
    fontSize: 16,
    marginBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9BA1A6',
    fontSize: 14,
    marginTop: 6,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#1E1E1E',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  summaryLabel: {
    color: '#9BA1A6',
    fontSize: 12,
    marginTop: 5,
  },
  summaryDivider: {
    width: 1,
    height: 38,
    backgroundColor: '#333333',
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
  emptyIcon: {
    color: ACCENT,
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
  },
  emptyText: {
    color: '#9BA1A6',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 21,
  },
  sessionCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2E2E2E',
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionDate: {
    color: '#9BA1A6',
    fontSize: 12,
    marginTop: 6,
  },
  durationBadge: {
    backgroundColor: '#33271E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  durationText: {
    color: '#D8B18A',
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
    color: '#C3C6C8',
    fontSize: 13,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  strictBadge: {
    backgroundColor: '#3A2920',
  },
  casualBadge: {
    backgroundColor: '#242C25',
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  strictText: {
    color: '#D8B18A',
  },
  casualText: {
    color: '#9BC7A4',
  },
});