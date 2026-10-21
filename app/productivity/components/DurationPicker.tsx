import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { CUSTOM_DURATION_LIMITS } from '../constants/focusConfig';
import { FocusPalette } from '../types';

interface DurationPickerProps {
  /** Current session length in minutes. */
  minutes: number;
  onChange: (minutes: number) => void;
  colors: FocusPalette;
}

/* Quick picks shown as a 3 × 2 grid. */
const QUICK_MINUTES = [15, 25, 30, 45, 60, 90];

const MAX_HOURS = Math.floor(CUSTOM_DURATION_LIMITS.max / 60);

const clampMinutes = (value: number) =>
  Math.min(
    CUSTOM_DURATION_LIMITS.max,
    Math.max(CUSTOM_DURATION_LIMITS.min, Math.round(value)),
  );

const modeLabel = (minutes: number) =>
  minutes === 25 ? 'Pomodoro' : minutes === 50 ? 'Deep Work' : 'Custom';

/* "12:18 AM" */
const clockLabel = (date: Date) => {
  const h = date.getHours();
  return `${h % 12 || 12}:${String(date.getMinutes()).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

/* 80 -> "1h 20m", 25 -> "25 min" */
const totalLabel = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

/**
 * Session length card: type Hours : Minutes (1 min to 3 hours), or tap
 * a quick pick. Shows the total and when the session would end.
 */
export default function DurationPicker({
  minutes,
  onChange,
  colors,
}: DurationPickerProps) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  // Text being typed; null when that box is not being edited.
  const [hourDraft, setHourDraft] = useState<string | null>(null);
  const [minuteDraft, setMinuteDraft] = useState<string | null>(null);

  // Keep "ends at" fresh while the screen is open.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const commit = (h: number, m: number) => {
    const total = h * 60 + m;
    if (!Number.isFinite(total) || total <= 0) return;
    const next = clampMinutes(total);
    if (next !== minutes) onChange(next);
  };

  // Typing updates the length right away.
  const typeHours = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, 1);
    setHourDraft(digits);
    if (digits) {
      const h = Math.min(MAX_HOURS, Number(digits));
      commit(h, h === MAX_HOURS ? 0 : mins);
    }
  };

  const typeMinutes = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, 2);
    setMinuteDraft(digits);
    if (digits) commit(hours, Math.min(59, Number(digits)));
  };

  // Leaving a box shows the saved value again.
  const finishTyping = () => {
    setHourDraft(null);
    setMinuteDraft(null);
  };

  const parts = [
    {
      key: 'hours',
      label: 'Hours',
      text: hourDraft ?? String(hours),
      isEditing: hourDraft !== null,
      maxLength: 1,
      onChange: typeHours,
      onFocus: () => setHourDraft(''),
    },
    {
      key: 'minutes',
      label: 'Minutes',
      text: minuteDraft ?? String(mins).padStart(2, '0'),
      isEditing: minuteDraft !== null,
      maxLength: 2,
      onChange: typeMinutes,
      onFocus: () => setMinuteDraft(''),
    },
  ];

  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={[s.label, { color: colors.subtext }]}>SESSION LENGTH</Text>
        <Text style={[s.mode, { color: colors.subtext }]}>{modeLabel(minutes)}</Text>
      </View>

      {/* Hours : Minutes */}
      <View style={s.clockRow}>
        {parts.map((part, index) => (
          <View key={part.key} style={s.clockPart}>
            {index === 1 && (
              <Text style={[s.colon, { color: colors.primary }]}>:</Text>
            )}
            <View style={s.boxWrap}>
              <TextInput
                value={part.text}
                onChangeText={part.onChange}
                onFocus={part.onFocus}
                onBlur={finishTyping}
                keyboardType="number-pad"
                returnKeyType="done"
                maxLength={part.maxLength}
                selectTextOnFocus
                accessibilityLabel={`Session ${part.label.toLowerCase()}`}
                style={[
                  s.box,
                  {
                    color: colors.text,
                    backgroundColor: colors.cardStrong,
                    borderColor: part.isEditing ? colors.primary : colors.border,
                  },
                ]}
              />
              <Text style={[s.unit, { color: colors.subtext }]}>{part.label}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Total and end time */}
      <View style={s.totalRow}>
        <Feather name="clock" size={13} color={colors.subtext} />
        <Text style={[s.totalText, { color: colors.subtext }]}>
          Total:{' '}
          <Text style={{ color: colors.text, fontWeight: '700' }}>{totalLabel(minutes)}</Text>
          {' · ends at '}
          <Text style={{ color: colors.text, fontWeight: '700' }}>
            {clockLabel(new Date(now + minutes * 60000))}
          </Text>
        </Text>
      </View>

      {/* Quick picks: 3 × 2 grid */}
      <View style={s.grid}>
        {QUICK_MINUTES.map((value) => {
          const isSelected = value === minutes;

          return (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              onPress={() => {
                finishTyping();
                const next = clampMinutes(value);
                if (next !== minutes) onChange(next);
              }}
              style={({ pressed }) => [
                s.chip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.cardStrong,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text
                style={[
                  s.chipText,
                  { color: isSelected ? colors.onPrimary : colors.text },
                ]}
              >
                {value} min
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  mode: {
    fontSize: 12,
    fontWeight: '600',
  },
  clockRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: 14,
  },
  clockPart: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  colon: {
    fontSize: 30,
    fontWeight: '800',
    marginHorizontal: 10,
    marginTop: 12,
  },
  boxWrap: {
    alignItems: 'center',
  },
  box: {
    width: 84,
    height: 66,
    borderRadius: 16,
    borderWidth: 1.5,
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    padding: 0,
  },
  unit: {
    fontSize: 12,
    marginTop: 6,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    marginBottom: 14,
  },
  totalText: {
    fontSize: 12.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  chip: {
    width: '31.5%',
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
