import React, { useEffect } from 'react';
import {
  Image,
  StyleSheet,
  View,
} from 'react-native';

import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  onFinish: () => void;
};

const ORBIT_SIZE = 150;
const ORBIT_RADIUS = 67;
const DOT_SIZE = 9;

export default function AnimatedLogoIntro({
  onFinish,
}: Props) {
  const rotation = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.85);
  const screenOpacity = useSharedValue(1);

  useEffect(() => {
    // Logo fade in
    logoOpacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });

    // Logo scale in
    logoScale.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.back(1.2)),
    });

    // Orbiting dot
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1100,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Finish launch animation
    screenOpacity.value = withDelay(
      1800,
      withTiming(
        0,
        {
          duration: 350,
          easing: Easing.out(Easing.cubic),
        },
        (finished) => {
          if (finished) {
            runOnJS(onFinish)();
          }
        }
      )
    );
  }, []);

  // Logo animation
  const logoStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [
        {
          scale: logoScale.value,
        },
      ],
    };
  });

  // Whole screen fade
  const screenStyle = useAnimatedStyle(() => {
    return {
      opacity: screenOpacity.value,
    };
  });

  // Orbiting dot
  const dotStyle = useAnimatedStyle(() => {
    const angle =
      (rotation.value * Math.PI) / 180;

    const x =
      Math.cos(angle) * ORBIT_RADIUS;

    const y =
      Math.sin(angle) * ORBIT_RADIUS;

    return {
      transform: [
        {
          translateX: x,
        },
        {
          translateY: y,
        },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        screenStyle,
      ]}
    >
      <View style={styles.logoArea}>

        {/* GabAi Logo */}
        <Animated.View style={logoStyle}>
          <Image
            source={require(
              '../../assets/images/GABAI-LOGO-WHITE.png'
            )}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Orbit */}
        <View style={styles.orbit}>

          {/* Circular track */}
          <View style={styles.circle} />

          {/* Moving dot */}
          <Animated.View
            style={[
              styles.dot,
              dotStyle,
            ]}
          />

        </View>

      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: '#121212',

    alignItems: 'center',
    justifyContent: 'center',

    zIndex: 9999,
  },

  logoArea: {
    width: ORBIT_SIZE,
    height: ORBIT_SIZE,

    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 105,
    height: 105,
  },

  orbit: {
    position: 'absolute',

    width: ORBIT_SIZE,
    height: ORBIT_SIZE,

    alignItems: 'center',
    justifyContent: 'center',
  },

  circle: {
    position: 'absolute',

    width: ORBIT_SIZE,
    height: ORBIT_SIZE,

    borderRadius: ORBIT_SIZE / 2,

    borderWidth: 1,
    borderColor: '#2E2E2E',
  },

  dot: {
    position: 'absolute',

    width: DOT_SIZE,
    height: DOT_SIZE,

    borderRadius: DOT_SIZE / 2,

    backgroundColor: '#A97C50',
  },
});