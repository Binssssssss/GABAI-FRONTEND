import React from 'react';
import { View } from 'react-native';
import NotesHeader from './NotesHeader';
import NotesSearchBar from './NotesSearchBar';
import NotesFilterTabs from './NotesFilterTabs';
import { NotesTheme } from '../../types';
import type { useNotesData } from '../../hooks/useNotesData';

interface NotesHeaderSectionProps {
  onOpenDrawer: () => void;
  notesData: ReturnType<typeof useNotesData>;
  theme: NotesTheme;
}

export default function NotesHeaderSection({
  onOpenDrawer,
  notesData,
  theme,
}: NotesHeaderSectionProps) {
  const activeCustomFiltersCount =
    Number(notesData.selectedCategory !== 'All') +
    Number(notesData.selectedTag !== 'All') +
    Number(notesData.sortOption !== 'recent_edit');

  return (
    <View>
      {/* 1. Top Header */}
      <NotesHeader
        totalNotesCount={notesData.notes.length}
        viewMode={notesData.viewMode}
        onToggleViewMode={() =>
          notesData.setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'))
        }
        onOpenDrawer={onOpenDrawer}
        onOpenTemplateModal={() => notesData.setIsTemplateModalOpen(true)}
        onOpenNewNote={() => notesData.handleOpenNewNote()}
        textPrimary={theme.textPrimary}
        textSecondary={theme.textSecondary}
        cardBg={theme.cardBg}
        borderCol={theme.borderCol}
        primaryBrown={theme.primaryBrown}
      />

      {/* 2. Search Bar */}
      <NotesSearchBar
        searchQuery={notesData.searchQuery}
        onSearchChange={notesData.setSearchQuery}
        cardBg={theme.cardBg}
        borderCol={theme.borderCol}
        textPrimary={theme.textPrimary}
        textSecondary={theme.textSecondary}
      />

      {/* 3. Filter Tabs & Category Scroll */}
      <NotesFilterTabs
        activeTabFilter={notesData.activeFilter}
        onSelectTabFilter={notesData.setActiveFilter}
        selectedCategory={notesData.selectedCategory}
        onSelectCategory={notesData.setSelectedCategory}
        selectedTag={
          notesData.selectedTag === 'All'
            ? null
            : notesData.selectedTag
        }
        onClearTag={() => notesData.setSelectedTag('All')}
        activeCustomFiltersCount={activeCustomFiltersCount}
        onOpenFilterSheet={() => notesData.setIsFilterSortSheetOpen(true)}
        cardBg={theme.cardBg}
        borderCol={theme.borderCol}
        textPrimary={theme.textPrimary}
        textSecondary={theme.textSecondary}
        primaryBrown={theme.primaryBrown}
      />
    </View>
  );
}
