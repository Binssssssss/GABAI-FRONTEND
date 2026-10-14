import { useState, useRef, useCallback, useMemo } from 'react';
import { FlatList, ViewToken, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ONBOARDING_SLIDES } from '../constants';

const { width } = Dimensions.get('window');

/** Remember that onboarding was shown, so it only appears once. */
const markOnboardingSeen = () => {
  AsyncStorage.setItem('gabai.onboarding.seen', 'true').catch(() => {});
};

export function useOnboarding() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const index = viewableItems[0]?.index;
      if (index !== null && index !== undefined) {
        setCurrentIndex(index);
      }
    },
    []
  );

  const viewabilityConfig = useMemo(
    () => ({
      viewAreaCoveragePercentThreshold: 50,
    }),
    []
  );

  // "Continue" on each slide, "Get Started" on the last slide
  const handleNext = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      markOnboardingSeen();
      router.replace('/(auth)/register/register');
    }
  }, [currentIndex, router]);

  const handleSkip = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    markOnboardingSeen();
    router.replace('/(auth)/register/register');
  }, [router]);

  const handleLogin = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    markOnboardingSeen();
    router.replace('/(auth)/login/login');
  }, [router]);

  return {
    currentIndex,
    isLastSlide,
    flatListRef,
    slides: ONBOARDING_SLIDES,
    slideWidth: width,
    onViewableItemsChanged,
    viewabilityConfig,
    handleNext,
    handleSkip,
    handleLogin,
  };
}