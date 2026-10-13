import type { ComponentProps } from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { FocusPalette } from '../types';
import { focusStyles as styles } from '../styles/focus.styles';

interface StrictControlsProps {
  isReady: boolean;
  isRunning: boolean;
  isPaused: boolean;
  isLocked: boolean;
  isBreak: boolean;
  accent: string;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onEnd: () => void;
  colors: FocusPalette;
}

type FeatherName = ComponentProps<typeof Feather>['name'];

function SecondaryControl({
  icon,
  label,
  disabled,
  dimmed,
  onPress,
  colors,
}: {
  icon: FeatherName;
  label: string;
  disabled: boolean;
  dimmed?: boolean;
  onPress: () => void;
  colors: FocusPalette;
}) {
  return (
    <View style={[styles.controlColumn, (disabled || dimmed) && { opacity: 0.4 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        hitSlop={6}
        style={({ pressed }) => [
          styles.controlSecondaryBtn,
          { backgroundColor: colors.card, borderColor: colors.border },
          pressed && styles.pressed,
        ]}
      >
        <Feather name={icon} size={20} color={colors.text} />
      </Pressable>
      <Text style={[styles.controlLabel, { color: colors.subtext }]}>
        {label}
      </Text>
    </View>
  );
}

export default function StrictControls({
  isReady,
  isRunning,
  isPaused,
  isLocked,
  isBreak,
  accent,
  onStart,
  onPause,
  onResume,
  onReset,
  onEnd,
  colors,
}: StrictControlsProps) {
  // While locked the main button stays tappable and explains why
  // pausing is unavailable instead of silently doing nothing.
  const main: {
    label: string;
    icon: FeatherName;
    onPress: () => void;
    outlined: boolean;
  } = !isRunning
    ? { label: isBreak ? 'Start Break' : 'Start Focus', icon: 'play', onPress: onStart, outlined: false }
    : isPaused
      ? { label: 'Resume', icon: 'play', onPress: onResume, outlined: false }
      : isLocked
        ? { label: 'Locked In', icon: 'lock', onPress: onPause, outlined: true }
        : { label: 'Pause', icon: 'pause', onPress: onPause, outlined: false };

  return (
    <View style={styles.controlsRow}>
      <SecondaryControl
        icon={isLocked ? 'lock' : 'rotate-ccw'}
        label="Reset"
        disabled={!isRunning}
        dimmed={isLocked}
        onPress={onReset}
        colors={colors}
      />

      <View style={styles.controlColumn}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={main.label}
          accessibilityState={{ disabled: !isReady }}
          disabled={!isReady}
          onPress={main.onPress}
          style={({ pressed }) => [
            styles.controlMainBtn,
            main.outlined
              ? { backgroundColor: colors.card, borderWidth: 1.5, borderColor: accent }
              : { backgroundColor: accent },
            !isReady && { opacity: 0.5 },
            pressed && styles.pressed,
          ]}
        >
          <Feather
            name={main.icon}
            size={20}
            color={main.outlined ? accent : colors.onPrimary}
          />
          <Text
            style={[
              styles.controlMainText,
              { color: main.outlined ? accent : colors.onPrimary },
            ]}
          >
            {main.label}
          </Text>
        </Pressable>
      </View>

      <SecondaryControl
        icon={isBreak ? 'skip-forward' : 'square'}
        label={isBreak ? 'Skip' : 'End'}
        disabled={!isRunning}
        onPress={onEnd}
        colors={colors}
      />
    </View>
  );
}
