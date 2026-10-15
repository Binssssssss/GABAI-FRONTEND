import React, { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { FocusPalette } from '../types';
import { focusStyles as styles } from '../styles/focus.styles';

const TICK_COUNT = 60;

interface TimerRingDisplayProps {
  size: number;
  formattedTime: string;
  progress: number;
  statusLabel: string;
  isActive: boolean;
  accent: string;
  showZenHint: boolean;
  onPress: () => void;
  colors: FocusPalette;
}

export default function TimerRingDisplay({
  size,
  formattedTime,
  progress,
  statusLabel,
  isActive,
  accent,
  showZenHint,
  onPress,
  colors,
}: TimerRingDisplayProps) {
  const [pulse] = useState(() => new Animated.Value(1));

  // Gentle pulse on the status dot while the clock is ticking.
  useEffect(() => {
    if (!isActive) {
      pulse.stopAnimation();
      pulse.setValue(1);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.3,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [isActive, pulse]);

  const tickLength = Math.max(8, Math.round(size * 0.045));
  const filledTicks = Math.round(progress * TICK_COUNT);
  const innerSize = size - tickLength * 2 - 24;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${formattedTime} remaining, ${statusLabel}. Open fullscreen Zen Mode`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.ringWrapper,
        { width: size, height: size },
        pressed && { opacity: 0.9 },
      ]}
    >
      {Array.from({ length: TICK_COUNT }, (_, index) => (
        <View
          key={index}
          style={[
            styles.ringTick,
            {
              height: tickLength,
              left: size / 2 - 1.5,
              top: size / 2 - tickLength / 2,
              backgroundColor:
                index < filledTicks ? accent : colors.border,
              transform: [
                { rotate: `${(360 / TICK_COUNT) * index}deg` },
                { translateY: -(size / 2 - tickLength / 2) },
              ],
            },
          ]}
        />
      ))}

      <View
        style={[
          styles.ringInner,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[
            styles.ringDigits,
            {
              color: colors.text,
              fontSize: Math.round(size * 0.2),
              maxWidth: innerSize - 24,
            },
          ]}
        >
          {formattedTime}
        </Text>

        <View style={styles.ringStatusRow}>
          <Animated.View
            style={[
              styles.ringStatusDot,
              { backgroundColor: accent, opacity: pulse },
            ]}
          />
          <Text style={[styles.ringStatusText, { color: accent }]}>
            {statusLabel}
          </Text>
        </View>

        {showZenHint && (
          <Text style={[styles.ringHint, { color: colors.subtext }]}>
            Tap for Zen Mode
          </Text>
        )}
      </View>
    </Pressable>
  );
}
