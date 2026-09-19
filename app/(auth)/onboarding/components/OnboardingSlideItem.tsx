import React from 'react';
import { View, Text } from 'react-native';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { OnboardingSlide } from '../types';
import { onboardingStyles as styles } from '../styles';

interface OnboardingSlideItemProps {
  slide: OnboardingSlide;
  primaryBrown: string;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
}

export function OnboardingSlideItem({
  slide,
  primaryBrown,
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
}: OnboardingSlideItemProps) {
  return (
    <View style={styles.slideWrapper}>
      {/* Category / Feature Badge */}
      <View
        style={[
          styles.badgeContainer,
          {
            backgroundColor: primaryBrown + '18',
            borderColor: primaryBrown + '40',
          },
        ]}
      >
        <Text style={[styles.badgeText, { color: primaryBrown }]}>{slide.badge}</Text>
      </View>

      {/* Large Icon Circular Container */}
      <View
        style={[
          styles.iconWrapper,
          {
            backgroundColor: cardBg,
            borderColor: primaryBrown + '30',
          },
        ]}
      >
        {slide.iconFamily === 'FontAwesome5' ? (
          <FontAwesome5 name={slide.icon} size={60} color={primaryBrown} />
        ) : (
          <Feather name={slide.icon as any} size={64} color={primaryBrown} />
        )}
      </View>

      {/* Main Title & Highlighted text */}
      <Text style={[styles.titleText, { color: textPrimary }]}>{slide.title}</Text>
      <Text style={[styles.highlightText, { color: primaryBrown }]}>{slide.highlight}</Text>

      {/* Description text */}
      <Text style={[styles.descriptionText, { color: textSecondary }]}>
        {slide.description}
      </Text>
    </View>
  );
}
