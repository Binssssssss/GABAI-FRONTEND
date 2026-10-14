import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import {
  CUSTOM_DURATION_LIMITS,
  CUSTOM_DURATION_PRESETS,
} from '../constants/focusConfig';
import { focusStyles as styles } from '../styles/focus.styles';
import { FocusPalette } from '../types';

interface DurationPickerProps {
  /** Current session length in minutes. */
  minutes: number;
  onChange: (minutes: number) => void;
  colors: FocusPalette;
}

// Pomodoro (25) and Deep Work (50) plus the custom presets, in order.
const PRESET_MINUTES = Array.from(
  new Set([25, 50, ...CUSTOM_DURATION_PRESETS]),
).sort((a, b) => a - b);

const clampMinutes = (value: number) =>
  Math.min(
    CUSTOM_DURATION_LIMITS.max,
    Math.max(CUSTOM_DURATION_LIMITS.min, value),
  );

/** Lets the user pick any session length before starting the timer. */
export default function DurationPicker({
  minutes,
  onChange,
  colors,
}: DurationPickerProps) {
  const { step, min, max } = CUSTOM_DURATION_LIMITS;

  const stepButton = (
    icon: 'minus' | 'plus',
    nextValue: number,
    disabled: boolean,
    label: string,
  ) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => onChange(clampMinutes(nextValue))}
      style={({ pressed }) => [
        {
          width: 40,
          height: 40,
          borderRadius: 20,
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: disabled ? 0.4 : 1,
        },
        pressed && styles.pressed,
      ]}
    >
      <Feather name={icon} size={18} color={colors.text} />
    </Pressable>
  );

  return (
    <View style={{ marginTop: 16, gap: 12 }}>
      {/* Fine adjust: - [ 25 min ] + */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        {stepButton('minus', minutes - step, minutes <= min, 'Shorter session')}

        <Text
          accessibilityLiveRegion="polite"
          style={{
            minWidth: 90,
            textAlign: 'center',
            fontSize: 18,
            fontWeight: '700',
            color: colors.text,
          }}
        >
          {minutes} min
        </Text>

        {stepButton('plus', minutes + step, minutes >= max, 'Longer session')}
      </View>

      {/* Quick presets */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}
      >
        {PRESET_MINUTES.map((preset) => {
          const isSelected = preset === minutes;

          return (
            <Pressable
              key={preset}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onChange(preset)}
              style={({ pressed }) => [
                styles.subjectPill,
                {
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.subjectPillText,
                  { color: isSelected ? colors.onPrimary : colors.text },
                ]}
              >
                {preset} min
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
