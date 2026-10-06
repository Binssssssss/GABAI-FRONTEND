import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect, useMemo } from 'react';
import { Animated, View } from 'react-native';
import { assistantStyles as styles } from '../styles';

function BouncingDot({ delay }: { delay: number }) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: -6,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(150),
        ])
      ).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [animatedValue, delay]);

  return (
    <Animated.View
      style={[
        styles.typingDot,
        { transform: [{ translateY: animatedValue }] },
      ]}
    />
  );
}

export function TypingIndicator() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const palette = isDark ? Colors.dark : Colors.light;
  const cardBg = palette.surface;
  const borderCol = palette.border;

  return (
    <View style={styles.assistantMessageContainer}>
      <View
        style={[
          styles.messageBubble,
          styles.assistantBubble,
          { backgroundColor: cardBg, borderColor: borderCol },
        ]}
      >
        <View style={styles.typingContainer}>
          <BouncingDot delay={0} />
          <BouncingDot delay={150} />
          <BouncingDot delay={300} />
        </View>
      </View>
    </View>
  );
}
