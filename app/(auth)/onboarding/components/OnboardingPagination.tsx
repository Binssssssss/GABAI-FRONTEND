import React from 'react';
import { View } from 'react-native';
import { OnboardingSlide } from '../types';
import { getDotWidth } from '../utils';
import { onboardingStyles as styles } from '../styles';

interface OnboardingPaginationProps {
  slides: OnboardingSlide[];
  currentIndex: number;
  primaryBrown: string;
  dotInactiveColor: string;
}

export function OnboardingPagination({
  slides,
  currentIndex,
  primaryBrown,
  dotInactiveColor,
}: OnboardingPaginationProps) {
  return (
    <View style={styles.paginationContainer}>
      {slides.map((_, index) => {
        const isActive = index === currentIndex;
        return (
          <View
            key={index.toString()}
            style={[
              styles.paginationDot,
              {
                width: getDotWidth(index, currentIndex),
                backgroundColor: isActive ? primaryBrown : dotInactiveColor,
              },
            ]}
          />
        );
      })}
    </View>
  );
}
