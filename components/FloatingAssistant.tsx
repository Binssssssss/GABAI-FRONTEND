import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useColorScheme } from '@/hooks/use-color-scheme';

const BUTTON_SIZE = 52;

interface FloatingAssistantProps {
  hasSuggestions?: boolean;
  hasNotifications?: boolean;
}

export default function FloatingAssistant({
  hasSuggestions = true,
  hasNotifications = true,
}: FloatingAssistantProps) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const screenDimensions = Dimensions.get('window');
  const screenWidth = screenDimensions.width;
  const screenHeight = screenDimensions.height;

  // Don't display floating bubble when already on the assistant screen
  const isAssistantRoute = pathname?.includes('assistant');

  // Colors
  const primaryBrown = '#A97C50';
  const successGreen = '#10B981';

  // Initial Resting Position (bottom right, above bottom tabs/safe area)
  const initialX = screenWidth - BUTTON_SIZE - 18;
  const initialY = screenHeight - (insets.bottom || 20) - 130;

  const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Drag tracking refs
  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const pressStartTime = useRef<number>(0);

  // Breathing Pulse Animation
  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (hasSuggestions) {
      pulseAnim.setValue(0);
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2200,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    }
    return () => {
      if (animation) animation.stop();
    };
  }, [hasSuggestions, pulseAnim]);

  const openAssistantChat = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignored
    }
    try {
      router.push('/assistant');
    } catch {
      try {
        router.push('/assistant/index' as any);
      } catch {
        // Fallback
      }
    }
  };

  // Pan Responder for Dragging, Edge Docking & Tap Detection
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only treat as drag if finger moves noticeably
        return Math.abs(gestureState.dx) > 6 || Math.abs(gestureState.dy) > 6;
      },
      onPanResponderGrant: (_, gestureState) => {
        isDragging.current = false;
        pressStartTime.current = Date.now();
        dragStartPos.current = { x: gestureState.x0, y: gestureState.y0 };

        // Save current animated value offset
        pan.setOffset({
          // @ts-ignore
          x: pan.x._value,
          // @ts-ignore
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });

        // Scale up slightly for tactile feedback
        Animated.spring(scaleAnim, {
          toValue: 1.08,
          useNativeDriver: true,
          speed: 40,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        const dist = Math.hypot(
          gestureState.moveX - dragStartPos.current.x,
          gestureState.moveY - dragStartPos.current.y
        );
        if (dist > 8 && !isDragging.current) {
          isDragging.current = true;
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {
            // Ignored
          }
        }
        pan.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();

        // Scale back to normal
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 30,
          bounciness: 6,
        }).start();

        const pressDuration = Date.now() - pressStartTime.current;
        const dist = Math.hypot(
          gestureState.moveX - dragStartPos.current.x,
          gestureState.moveY - dragStartPos.current.y
        );

        // Tap detected (minimal movement or quick tap)
        const isTap = dist < 12 || (pressDuration < 350 && dist < 20);

        if (isTap) {
          openAssistantChat();
          return;
        }

        // Clamp & Dock to closest edge (Left or Right)
        // @ts-ignore
        const currentX = pan.x._value;
        // @ts-ignore
        const currentY = pan.y._value;

        const targetX =
          currentX + BUTTON_SIZE / 2 < screenWidth / 2
            ? 16 // Snap to left edge
            : screenWidth - BUTTON_SIZE - 16; // Snap to right edge

        // Keep within vertical safe bounds
        const minY = (insets.top || 40) + 10;
        const maxY = screenHeight - (insets.bottom || 20) - BUTTON_SIZE - 20;
        const clampedY = Math.max(minY, Math.min(currentY, maxY));

        Animated.spring(pan, {
          toValue: { x: targetX, y: clampedY },
          useNativeDriver: true,
          friction: 6,
          tension: 40,
        }).start();
      },
    })
  ).current;

  if (isAssistantRoute) {
    return null;
  }

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.45],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.55, 0.3, 0],
  });

  return (
    <Animated.View
      style={[
        styles.floatingContainer,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: scaleAnim },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Ambient Pulsing Halo */}
      {hasSuggestions && (
        <Animated.View
          style={[
            styles.pulseHalo,
            {
              borderColor: primaryBrown,
              opacity: pulseOpacity,
              transform: [{ scale: pulseScale }],
            },
          ]}
        />
      )}

      {/* Main Floating Assistant Bubble */}
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: primaryBrown,
            borderColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.45)',
          },
        ]}
      >
        <Feather name="zap" size={22} color="#FFFFFF" />

        {/* AI Ready / Online indicator badge */}
        {hasNotifications && (
          <View style={[styles.statusBadge, { backgroundColor: successGreen }]}>
            <View style={styles.statusInnerDot} />
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    zIndex: 998,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseHalo: {
    position: 'absolute',
    width: BUTTON_SIZE + 14,
    height: BUTTON_SIZE + 14,
    borderRadius: (BUTTON_SIZE + 14) / 2,
    borderWidth: 2,
  },
  bubble: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowColor: '#A97C50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  statusBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInnerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
});
