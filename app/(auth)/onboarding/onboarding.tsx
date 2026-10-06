import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/app/context/ThemeContext';
import {
  OnboardingControls,
  OnboardingHeader,
  OnboardingPagination,
  OnboardingSlideItem,
} from './components';
import { useOnboarding } from './hooks';
import { onboardingStyles as styles } from './styles';

export default function OnboardingScreen() {
  const { colors } = useAppTheme();

  const primaryBrown = colors.primary;
  const bgTheme = colors.background;
  const cardBg = colors.card;
  const borderCol = colors.border;
  const textPrimary = colors.text;
  const textSecondary = colors.secondaryText;
  const dotInactiveColor = colors.border;

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
