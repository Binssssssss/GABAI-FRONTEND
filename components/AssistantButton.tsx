import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Haptics from 'expo-haptics';

interface AssistantButtonProps {
  hasSuggestions?: boolean;
  hasNotifications?: boolean;
  colorOverride?: string;
}

export default function AssistantButton({
  hasSuggestions = true,
  hasNotifications = true,
  colorOverride,
}: AssistantButtonProps) {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  // Colors
  const primaryBrown = '#A97C50';
  const textPrimary = isDark ? '#ECEDEE' : '#11181C';
  const iconColor = colorOverride || textPrimary;
  const buttonBg = isDark ? 'rgba(169, 124, 80, 0.15)' : 'rgba(169, 124, 80, 0.1)';
  const borderCol = isDark ? 'rgba(169, 124, 80, 0.3)' : 'rgba(169, 124, 80, 0.2)';

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation looping
  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (hasSuggestions) {
      pulseAnim.setValue(0);
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      pulseAnim.setValue(0);
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [hasSuggestions, pulseAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignored if haptics fail or on web
    }
    router.push('/assistant');
  };

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.45],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.6, 0.4, 0],
  });

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <View style={styles.container}>
        {/* Ambient Suggestion Pulse */}
        {hasSuggestions && (
          <Animated.View
            style={[
              styles.pulseCircle,
              {
                borderColor: primaryBrown,
                opacity: pulseOpacity,
                transform: [{ scale: pulseScale }],
              },
            ]}
          />
        )}

        {/* Main Icon Button */}
        <Animated.View
          style={[
            styles.button,
            {
              backgroundColor: buttonBg,
              borderColor: borderCol,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Feather name="zap" size={16} color={iconColor} />

          {/* Notification Dot */}
          {hasNotifications && (
            <View style={[styles.badge, { backgroundColor: '#10B981' }]} />
          )}
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 36,
    marginRight: 8,
  },
  button: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  pulseCircle: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2.5,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
});
