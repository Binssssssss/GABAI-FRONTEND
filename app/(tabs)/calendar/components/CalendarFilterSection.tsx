import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { CALENDAR_CATEGORIES } from '../constants/calendarConfig';
import { calendarStyles as styles } from '../styles/calendar.styles';

interface CalendarFilterSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  cardTheme: string;
  borderTheme: string;
  textTheme: string;
  textSubTheme: string;
  primaryAccent: string;
}

// The search bar was removed; only the category chips remain.
export default function CalendarFilterSection({
  selectedCategory,
  onSelectCategory,
  borderTheme,
  textSubTheme,
  primaryAccent,
}: CalendarFilterSectionProps) {
  return (
    <View style={styles.filterSection}>
      {/* Categories filters scroll */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
        {CALENDAR_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => onSelectCategory(cat)}
              style={[
                styles.categoryPill,
                {
                  backgroundColor: isSelected ? primaryAccent : 'transparent',
                  borderColor: isSelected ? primaryAccent : borderTheme,
                },
              ]}
            >
              <Text style={[styles.categoryPillText, { color: isSelected ? '#FFFFFF' : textSubTheme }]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}