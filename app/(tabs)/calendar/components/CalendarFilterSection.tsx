import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
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

export default function CalendarFilterSection({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  cardTheme,
  borderTheme,
  textTheme,
  textSubTheme,
  primaryAccent,
}: CalendarFilterSectionProps) {
  return (
    <View style={styles.filterSection}>
      <View style={[styles.searchBarContainer, { backgroundColor: cardTheme, borderColor: borderTheme }]}>
        <Feather name="search" size={18} color={textSubTheme} style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search academic planner..."
          placeholderTextColor={textSubTheme}
          style={[styles.searchInput, { color: textTheme }]}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Feather name="x" size={16} color={textSubTheme} />
          </TouchableOpacity>
        ) : null}
      </View>

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
                  backgroundColor: isSelected ? primaryAccent : cardTheme,
                  borderColor: borderTheme,
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
