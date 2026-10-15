import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  PanResponder,
  Dimensions,
  Image,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/app/context/ThemeContext';

const GABAI_LOGO_WHITE = require('../assets/images/GABAI-LOGO-WHITE.png');
const GABAI_LOGO_BLACK = require('../assets/images/GABAI-LOGO-BLACK.png');

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
  // Follow the app's theme setting (not just the phone's), like other screens.
  const { colorScheme } = useAppTheme();
  const isDark = colorScheme === 'dark';

  const screenDimensions = Dimensions.get('window');
  const screenWidth = screenDimensions.width;
  const screenHeight = screenDimensions.height;

  // Don't display floating bubble when already on the assistant screen
  const isAssistantRoute = pathname?.includes('assistant');
  const isCalendarRoute = pathname?.includes('calendar');

  // Colors
  const primaryBrown = '#A97C50';
  const successGreen = '#10B981';

  // Initial Resting Position (bottom right, above bottom tabs/safe area)
  const initialX = screenWidth - BUTTON_SIZE - 18;
  const initialY = screenHeight - (insets.bottom || 20) - 130;

  const [pan] = useState(() => new Animated.ValueXY({ x: initialX, y: initialY }));
  const [scaleAnim] = useState(() => new Animated.Value(1));
  const [pulseAnim] = useState(() => new Animated.Value(0));

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

  const openAssistantChat = useCallback(() => {
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
  }, [router]);

  // The PanResponder below is created once, so read the open handler through a ref.
  const openAssistantChatRef = useRef(openAssistantChat);
  useEffect(() => {
    openAssistantChatRef.current = openAssistantChat;
  }, [openAssistantChat]);

  // Pan Responder for Dragging, Edge Docking & Tap Detection
  const [panResponder] = useState(() => {
    // Drag tracking (only read inside the gesture handlers)
    let isDragging = false;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only treat as drag if finger moves noticeably
        return Math.abs(gestureState.dx) > 6 || Math.abs(gestureState.dy) > 6;
      },
      // Don't let a scroll view take over the touch mid-press.
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        isDragging = false;

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
        // dx/dy are measured from where the finger went down.
        const dist = Math.hypot(gestureState.dx, gestureState.dy);
        if (dist > 8 && !isDragging) {
          isDragging = true;
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

        // A tap = the finger barely moved. (moveX/moveY are 0 when the
        // finger never moved, which used to turn quick taps into drags.)
        const isTap =
          !isDragging && Math.hypot(gestureState.dx, gestureState.dy) < 10;

        if (isTap) {
          // Open the chat right away, then settle the button.
          openAssistantChatRef.current();
          scaleAnim.setValue(1);
          return;
        }

        // Scale back to normal
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 30,
          bounciness: 6,
        }).start();

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
      // If the system cancels the touch, put the button back to normal.
      onPanResponderTerminate: () => {
        pan.flattenOffset();
        scaleAnim.setValue(1);
      },
    });
  });

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
            // Neutral circle + brown ring so the GabAi logo stands out.
            backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
            borderColor: primaryBrown,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Open GabAi assistant"
      >
        <Image
          source={isDark ? GABAI_LOGO_WHITE : GABAI_LOGO_BLACK}
          style={styles.logo}
          resizeMode="contain"
        />

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
    borderWidth: 2,
    shadowColor: '#A97C50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  logo: {
    width: 34,
    height: 34,
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
