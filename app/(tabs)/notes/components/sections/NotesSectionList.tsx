import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NotesTheme } from '../../types';
import type { useNotesData } from '../../hooks/useNotesData';
import NoteCard from './NoteCard';
import NotesEmptyState from './NotesEmptyState';
import { noteStyles as styles } from '../../styles/notes.styles';

interface NotesSectionListProps {
  notesData: ReturnType<typeof useNotesData>;
  theme: NotesTheme;
}

export default function NotesSectionList({
  notesData,
  theme,
}: NotesSectionListProps) {
  const {
    filteredNotes,
    viewMode,
    searchQuery,
    selectedCategory,
    selectedTag,
    handleOpenNote,
    handlePinToggle,
    handleFavoriteToggle,
    handleArchiveToggle,
    handleDeleteNote,
    handleOpenNewNote,
  } = notesData;

  const pinnedNotes = filteredNotes.filter((note) => note.isPinned);
  const unpinnedNotes = filteredNotes.filter((note) => !note.isPinned);

  const { cardBg, borderCol, textPrimary, textSecondary, primaryBrown } = theme;

  if (filteredNotes.length === 0) {
    return (
      <NotesEmptyState
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        selectedTag={selectedTag}
        onOpenNewNote={() => handleOpenNewNote()}
        cardBg={cardBg}
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        primaryBrown={primaryBrown}
      />
    );
  }

  return (
    <View style={styles.notesContainer}>
      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && (
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Feather name="bookmark" size={13} color={primaryBrown} style={{ marginRight: 6 }} />
            <Text style={[styles.sectionHeaderText, { color: primaryBrown }]}>PINNED NOTES</Text>
          </View>

          <View style={styles.notesGridWrapper}>
            <View style={viewMode === 'grid' ? styles.notesGridLayout : styles.notesListLayout}>
              {pinnedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  viewMode={viewMode}
                  onPress={() => handleOpenNote(note)}
                  onTogglePin={() => handlePinToggle(note)}
                  onToggleFavorite={() => handleFavoriteToggle(note)}
                  onToggleArchive={() => handleArchiveToggle(note)}
                  onDelete={() => handleDeleteNote(note.id)}
                  cardBg={cardBg}
                  borderCol={borderCol}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  primaryBrown={primaryBrown}
                />
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Unpinned / All Notes Section */}
      {unpinnedNotes.length > 0 && (
        <View style={styles.sectionBlock}>
          {pinnedNotes.length > 0 && (
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeaderText, { color: textSecondary }]}>ALL NOTES</Text>
            </View>
          )}

          <View style={styles.notesGridWrapper}>
            <View style={viewMode === 'grid' ? styles.notesGridLayout : styles.notesListLayout}>
              {unpinnedNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  viewMode={viewMode}
                  onPress={() => handleOpenNote(note)}
                  onTogglePin={() => handlePinToggle(note)}
                  onToggleFavorite={() => handleFavoriteToggle(note)}
                  onToggleArchive={() => handleArchiveToggle(note)}
                  onDelete={() => handleDeleteNote(note.id)}
                  cardBg={cardBg}
                  borderCol={borderCol}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  primaryBrown={primaryBrown}
                />
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
