import { useState, useRef, useCallback } from 'react';
import { FlatList, ViewToken, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ONBOARDING_SLIDES } from '../constants';

const { width } = Dimensions.get('window');

export function useOnboarding() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const isLastSlide = currentIndex === ONBOARDING_SLIDES.length - 1;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const handleNext = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (currentIndex < ONBOARDING_SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    } else {
      router.replace('/(auth)/register/register');
    }
  }, [currentIndex, router]);

  const handleSkip = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.replace('/(auth)/register/register');
  }, [router]);

  const handleLogin = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
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
