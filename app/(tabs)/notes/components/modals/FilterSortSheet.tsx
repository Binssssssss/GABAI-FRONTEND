import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CATEGORIES, SORT_OPTIONS } from '../../constants/notesConfig';
import { NoteSortOption, NoteViewMode } from '../../types';
import { noteStyles as styles } from '../../styles/notes.styles';

interface FilterSortSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  allUniqueTags: string[];
  sortBy: NoteSortOption;
  onSelectSort: (sort: NoteSortOption) => void;
  viewMode: NoteViewMode;
  onSelectViewMode: (mode: NoteViewMode) => void;
  onResetFilters: () => void;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
}

export default function FilterSortSheet({
  visible,
  onClose,
  selectedCategory,
  onSelectCategory,
  selectedTag,
  onSelectTag,
  allUniqueTags,
  sortBy,
  onSelectSort,
  viewMode,
  onSelectViewMode,
  onResetFilters,
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  primaryBrown,
}: FilterSortSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.sheetBackdrop}>
        <View style={[styles.bottomSheetCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <View style={styles.sheetHandleBar}>
            <View style={[styles.sheetHandle, { backgroundColor: borderCol }]} />
          </View>

          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: textPrimary }]}>Filters & Sort</Text>
            <TouchableOpacity onPress={onResetFilters}>
              <Text style={[styles.sheetResetBtn, { color: primaryBrown }]}>Reset All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
            {/* View Mode Layout */}
            <Text style={[styles.sheetSectionTitle, { color: textSecondary }]}>LAYOUT</Text>
            <View style={styles.sheetViewModeRow}>
              <TouchableOpacity
                onPress={() => onSelectViewMode('grid')}
                style={[
                  styles.sheetViewModeBtn,
                  {
                    backgroundColor: viewMode === 'grid' ? primaryBrown : borderCol + '30',
                  },
                ]}
              >
                <Feather
                  name="grid"
                  size={14}
                  color={viewMode === 'grid' ? '#FFFFFF' : textPrimary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.sheetViewModeText,
                    { color: viewMode === 'grid' ? '#FFFFFF' : textPrimary },
                  ]}
                >
                  Grid View
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onSelectViewMode('list')}
                style={[
                  styles.sheetViewModeBtn,
                  {
                    backgroundColor: viewMode === 'list' ? primaryBrown : borderCol + '30',
                  },
                ]}
              >
                <Feather
                  name="list"
                  size={14}
                  color={viewMode === 'list' ? '#FFFFFF' : textPrimary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.sheetViewModeText,
                    { color: viewMode === 'list' ? '#FFFFFF' : textPrimary },
                  ]}
                >
                  List View
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sort Options */}
            <Text style={[styles.sheetSectionTitle, { color: textSecondary, marginTop: 16 }]}>
              SORT BY
            </Text>
            <View style={styles.sheetPillsGrid}>
              {SORT_OPTIONS.map((opt) => {
                const isSelected = sortBy === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => onSelectSort(opt.id)}
                    style={[
                      styles.sheetSortChip,
                      {
                        backgroundColor: isSelected ? primaryBrown : borderCol + '30',
                        borderColor: isSelected ? primaryBrown : borderCol,
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.sheetSortText,
                        { color: isSelected ? '#FFFFFF' : textPrimary, fontWeight: isSelected ? '700' : '500' },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Categories */}
            <Text style={[styles.sheetSectionTitle, { color: textSecondary, marginTop: 16 }]}>
              CATEGORY
            </Text>
            <View style={styles.sheetPillsGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <TouchableOpacity
                    key={cat.name}
                    onPress={() => onSelectCategory(cat.name)}
                    style={[
                      styles.sheetCategoryChip,
                      {
                        backgroundColor: isSelected ? primaryBrown : borderCol + '30',
                        borderColor: isSelected ? primaryBrown : borderCol,
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <Feather
                      name={cat.icon as any}
                      size={12}
                      color={isSelected ? '#FFFFFF' : cat.color}
                    />
                    <Text
                      style={[
                        styles.sheetCategoryChipText,
                        { color: isSelected ? '#FFFFFF' : textPrimary, fontWeight: isSelected ? '700' : '500' },
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Tags */}
            {allUniqueTags.length > 0 && (
              <>
                <Text style={[styles.sheetSectionTitle, { color: textSecondary, marginTop: 16 }]}>
                  TAGS
                </Text>
                <View style={styles.sheetPillsGrid}>
                  {allUniqueTags.map((tag) => {
                    const isSelected = selectedTag === tag;
                    return (
                      <TouchableOpacity
                        key={tag}
                        onPress={() => onSelectTag(isSelected ? null : tag)}
                        style={[
                          styles.sheetTagChip,
                          {
                            backgroundColor: isSelected ? primaryBrown : borderCol + '30',
                            borderColor: isSelected ? primaryBrown : borderCol,
                            borderWidth: 1,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.sheetTagText,
                            { color: isSelected ? '#FFFFFF' : textPrimary, fontWeight: isSelected ? '700' : '500' },
                          ]}
                        >
                          {tag}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </ScrollView>

          <TouchableOpacity
            onPress={onClose}
            style={[styles.sheetDoneBtn, { backgroundColor: primaryBrown }]}
          >
            <Text style={styles.sheetDoneBtnText}>Apply & Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
