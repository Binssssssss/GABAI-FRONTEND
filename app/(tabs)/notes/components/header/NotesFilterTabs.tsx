import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NoteFilterTab } from '../../types';
import { CATEGORIES } from '../../constants/notesConfig';
import { noteStyles as styles } from '../../styles/notes.styles';

interface NotesFilterTabsProps {
  activeTabFilter: NoteFilterTab;
  onSelectTabFilter: (tab: NoteFilterTab) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedTag: string | null;
  onClearTag: () => void;
  activeCustomFiltersCount: number;
  onOpenFilterSheet: () => void;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
}

export default function NotesFilterTabs({
  activeTabFilter,
  onSelectTabFilter,
  selectedCategory,
  onSelectCategory,
  selectedTag,
  onClearTag,
  activeCustomFiltersCount,
  onOpenFilterSheet,
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  primaryBrown,
}: NotesFilterTabsProps) {
  const tabs: { id: NoteFilterTab; label: string; icon: string }[] = [
    { id: 'all', label: 'All Notes', icon: 'file-text' },
    { id: 'pinned', label: 'Pinned', icon: 'bookmark' },
    { id: 'favorites', label: 'Favorites', icon: 'star' },
    { id: 'archived', label: 'Archived', icon: 'archive' },
  ];

  return (
    <View style={styles.smartFilterStrip}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.smartFilterScroll}
      >
        {/* Filter Sheet Trigger */}
        <TouchableOpacity
          onPress={onOpenFilterSheet}
          style={[
            styles.compactTab,
            styles.filterSheetTrigger,
            {
              backgroundColor: activeCustomFiltersCount > 0 ? primaryBrown + '18' : cardBg,
              borderColor: activeCustomFiltersCount > 0 ? primaryBrown : borderCol,
              borderWidth: 1,
            },
          ]}
        >
          <Feather
            name="sliders"
            size={13}
            color={activeCustomFiltersCount > 0 ? primaryBrown : textSecondary}
          />
          {activeCustomFiltersCount > 0 && (
            <View style={[styles.filterBadgeCount, { backgroundColor: primaryBrown }]}>
              <Text style={styles.filterBadgeCountText}>{activeCustomFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Tab Filters */}
        {tabs.map((tab) => {
          const isSelected = activeTabFilter === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onSelectTabFilter(tab.id)}
              style={[
                styles.compactTab,
                {
                  backgroundColor: isSelected ? primaryBrown : cardBg,
                  borderColor: isSelected ? primaryBrown : borderCol,
                  borderWidth: 1,
                },
              ]}
            >
              <Feather
                name={tab.icon as any}
                size={12}
                color={isSelected ? '#FFFFFF' : textSecondary}
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.compactTabText,
                  { color: isSelected ? '#FFFFFF' : textPrimary },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Categories scroll */}
        {CATEGORIES.filter((c) => c.name !== 'All').map((cat) => {
          const isSelected = selectedCategory === cat.name;
          return (
            <TouchableOpacity
              key={cat.name}
              onPress={() => onSelectCategory(isSelected ? 'All' : cat.name)}
              style={[
                styles.compactTab,
                {
                  backgroundColor: isSelected ? cat.color : cardBg,
                  borderColor: isSelected ? cat.color : borderCol,
                  borderWidth: 1,
                },
              ]}
            >
              <Feather
                name={cat.icon as any}
                size={12}
                color={isSelected ? '#FFFFFF' : cat.color}
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.compactTabText,
                  { color: isSelected ? '#FFFFFF' : textPrimary },
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Active Selected Tag Banner */}
      {selectedTag && (
        <View
          style={[
            styles.activeFiltersBanner,
            { backgroundColor: primaryBrown + '12', borderColor: primaryBrown + '40' },
          ]}
        >
          <Text style={[styles.activeFiltersText, { color: textPrimary }]}>
            Filtered by Tag: <Text style={{ fontWeight: '700', color: primaryBrown }}>{selectedTag}</Text>
          </Text>
          <TouchableOpacity onPress={onClearTag}>
            <Text style={[styles.clearFiltersBtnText, { color: primaryBrown }]}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
