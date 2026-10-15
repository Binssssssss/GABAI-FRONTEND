import React, { useState } from 'react';
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

const clampMinutes = (value: number) =>
  Math.min(
    CUSTOM_DURATION_LIMITS.max,
    Math.max(CUSTOM_DURATION_LIMITS.min, Math.round(value)),
  );

const modeLabel = (minutes: number) =>
  minutes === 25 ? 'Pomodoro' : minutes === 50 ? 'Deep Work' : 'Custom';

/**
 * Session length card: − [ 25 minutes ] + (tap the number to type any
 * length) and a 3 × 2 grid of quick picks.
 */
export default function DurationPicker({
  minutes,
  onChange,
  colors,
}: DurationPickerProps) {
  const { step, min, max } = CUSTOM_DURATION_LIMITS;

  // Text being typed; null when the number is not being edited.
  const [draft, setDraft] = useState<string | null>(null);

  const commit = (value: number) => {
    if (!Number.isFinite(value) || value <= 0) return;
    const next = clampMinutes(value);
    if (next !== minutes) onChange(next);
  };

  const commitDraft = () => {
    if (draft !== null) commit(Number(draft));
    setDraft(null);
  };

  // Snap to the 5-minute grid: 23 -> 25 (+) or 20 (−).
  const stepBy = (direction: 1 | -1) => {
    const next =
      direction === 1
        ? Math.floor(minutes / step) * step + step
        : Math.ceil(minutes / step) * step - step;
    commit(Math.max(min, next));
  };

  const stepButton = (direction: 1 | -1, disabled: boolean) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={direction === 1 ? 'Longer session' : 'Shorter session'}
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={6}
      onPress={() => stepBy(direction)}
      style={({ pressed }) => [
        s.stepBtn,
        { backgroundColor: colors.cardStrong, borderColor: colors.border },
        disabled && { opacity: 0.35 },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Feather name={direction === 1 ? 'plus' : 'minus'} size={20} color={colors.text} />
    </Pressable>
  );

  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={[s.label, { color: colors.subtext }]}>SESSION LENGTH</Text>
        <Text style={[s.mode, { color: colors.subtext }]}>{modeLabel(minutes)}</Text>
      </View>

      {/* − 25 + */}
      <View style={s.stepperRow}>
        {stepButton(-1, minutes <= min)}

        <View style={s.valueWrap}>
          <TextInput
            value={draft ?? String(minutes)}
            onChangeText={(text) => setDraft(text.replace(/[^0-9]/g, '').slice(0, 3))}
            onFocus={() => setDraft(String(minutes))}
            onBlur={commitDraft}
            onSubmitEditing={commitDraft}
            keyboardType="number-pad"
            returnKeyType="done"
            selectTextOnFocus
            maxLength={3}
            accessibilityLabel="Session length in minutes"
            style={[s.valueInput, { color: colors.text }]}
          />
          <Text style={[s.unit, { color: colors.subtext }]}>minutes</Text>
        </View>

        {stepButton(1, minutes >= max)}
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
                setDraft(null);
                commit(value);
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
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  stepBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueWrap: {
    alignItems: 'center',
  },
  valueInput: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    minWidth: 90,
    paddingVertical: 0,
  },
  unit: {
    fontSize: 12,
    marginTop: 2,
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
