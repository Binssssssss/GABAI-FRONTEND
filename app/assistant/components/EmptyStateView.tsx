import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useAuth } from '@/app/context/AuthContext';
import api from '@/app/services/api';
import { fetchFocusHistory } from '@/app/services/focusSessionApi';

import { GAB_STARTERS } from '../constants';
import { assistantStyles as styles } from '../styles';
import { GabAvatar } from './GabAvatar';

interface EmptyStateViewProps {
  primaryBrown: string;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  onSelectQuery: (text: string) => void;
}

/** Calendar events are tasks whose subject is one of these. */
const CALENDAR_CATEGORIES = ['Assignment', 'Exam', 'Class', 'Focus Session', 'Meeting', 'Personal'];

const localDate = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

/** "3 tasks due · 1 class · 🔥 3-day focus streak" */
function useTodaySnapshot() {
  const [snapshot, setSnapshot] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const today = localDate(new Date());
        const [tasksResponse, focus] = await Promise.all([
          api.get('/tasks'),
          fetchFocusHistory().catch(() => ({ records: [] as { completedAt: string; mode: string }[] })),
        ]);

        const raw = tasksResponse.data?.data ?? tasksResponse.data ?? [];
        const items: any[] = Array.isArray(raw) ? raw : [];
        const dueToday = items.filter((item) => !item.completed && String(item.dueDate ?? '').slice(0, 10) === today);
        const tasks = dueToday.filter((item) => !CALENDAR_CATEGORIES.includes(String(item.subject)));
        const events = dueToday.filter((item) => CALENDAR_CATEGORIES.includes(String(item.subject)));

        // Focus streak: days in a row with a focus session (today or up to yesterday).
        const days = new Set(
          focus.records
            .filter((record) => record.mode !== 'shortBreak' && record.mode !== 'longBreak')
            .map((record) => localDate(new Date(record.completedAt))),
        );
        const cursor = new Date();
        if (!days.has(localDate(cursor))) cursor.setDate(cursor.getDate() - 1);
        let streak = 0;
        while (days.has(localDate(cursor))) {
          streak += 1;
          cursor.setDate(cursor.getDate() - 1);
        }

        const parts = [
          tasks.length ? `${plural(tasks.length, 'task')} due` : 'No tasks due',
          events.length ? plural(events.length, 'event') : null,
          streak > 0 ? `🔥 ${streak}-day focus streak` : null,
        ].filter(Boolean);

        if (active) setSnapshot(parts.join(' · '));
      } catch {
        if (active) setSnapshot(null);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return snapshot;
}

export function EmptyStateView({
  primaryBrown,
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  onSelectQuery,
}: EmptyStateViewProps) {
  const { user } = useAuth();
  const firstName = String(user?.fullName ?? user?.name ?? '').trim().split(/\s+/)[0];
  const snapshot = useTodaySnapshot();

  return (
    <View style={styles.emptyContainer}>
      <View style={{ marginTop: 12, marginBottom: 14 }}>
        <GabAvatar size={104} />
      </View>

      <Text style={[styles.welcomeTitle, { color: textPrimary }]}>
        Hi{firstName ? ` ${firstName}` : ''}! I&apos;m Gab 👋
      </Text>
      <Text style={[styles.welcomeSubtitle, { color: textSecondary, marginBottom: 16 }]}>
        Your study buddy in GabAi. I know your tasks, schedule, wallet and focus streak. Ask me
        anything, or just tell me how your day is going.
      </Text>

      {/* Today at a glance */}
      {snapshot && (
        <View
          style={{
            width: '100%',
            borderWidth: 1,
            borderColor: borderCol,
            backgroundColor: cardBg,
            borderRadius: 14,
            paddingVertical: 10,
            paddingHorizontal: 12,
            marginBottom: 14,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Feather name="sun" size={13} color={primaryBrown} />
            <Text style={{ color: primaryBrown, fontSize: 11.5, fontWeight: '700' }}>Today</Text>
          </View>
          <Text style={{ color: textPrimary, fontSize: 13.5, fontWeight: '700', marginTop: 3 }}>
            {snapshot}
          </Text>
        </View>
      )}

      {/* Conversation starters */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '100%' }}>
        {GAB_STARTERS.map((starter) => (
          <TouchableOpacity
            key={starter.label}
            activeOpacity={0.8}
            onPress={() => onSelectQuery(starter.message)}
            accessibilityRole="button"
            style={{
              borderWidth: 1,
              borderColor: borderCol,
              backgroundColor: cardBg,
              borderRadius: 18,
              paddingVertical: 9,
              paddingHorizontal: 12,
            }}
          >
            <Text style={{ color: textPrimary, fontSize: 13, fontWeight: '600' }}>
              {starter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
