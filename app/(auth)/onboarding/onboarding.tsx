import React from 'react';
import { View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

import {
  OnboardingHeader,
  OnboardingSlideItem,
  OnboardingPagination,
  OnboardingControls,
} from './components';
import { useOnboarding } from './hooks';
import { onboardingStyles as styles } from './styles';

export default function OnboardingScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  // Theme Colors matching GabAi Design Language
  const primaryBrown = '#A97C50';
  const bgTheme = isDark ? '#121212' : '#FFFFFF';
  const cardBg = isDark ? '#1E1E1E' : '#F8FAFC';
  const borderCol = isDark ? '#2E2E2E' : '#E2E8F0';
  const textPrimary = isDark ? '#ECEDEE' : '#11181C';
  const textSecondary = isDark ? '#9BA1A6' : '#666666';
  const dotInactiveColor = isDark ? '#2E2E2E' : '#E2E8F0';

  const {
    currentIndex,
    isLastSlide,
    flatListRef,
    slides,
    onViewableItemsChanged,
    viewabilityConfig,
    handleNext,
    handleSkip,
    handleLogin,
  } = useOnboarding();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgTheme }]} edges={['top', 'bottom']}>
      {/* Top Header Bar */}
      <OnboardingHeader
        onSkip={handleSkip}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        primaryBrown={primaryBrown}
        isLastSlide={isLastSlide}
      />

      {/* Horizontal Carousel */}
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <OnboardingSlideItem
            slide={item}
            primaryBrown={primaryBrown}
            cardBg={cardBg}
            borderCol={borderCol}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
          />
        )}
        style={styles.slideList}
      />

      {/* Pagination Indicator */}
      <OnboardingPagination
        slides={slides}
        currentIndex={currentIndex}
        primaryBrown={primaryBrown}
        dotInactiveColor={dotInactiveColor}
      />

      {/* Bottom Action Controls */}
      <OnboardingControls
        isLastSlide={isLastSlide}
        onNext={handleNext}
        onLogin={handleLogin}
        primaryBrown={primaryBrown}
        textSecondary={textSecondary}
      />
    </SafeAreaView>
  );
}
