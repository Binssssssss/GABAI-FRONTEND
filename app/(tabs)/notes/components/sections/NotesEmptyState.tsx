import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { noteStyles as styles } from '../../styles/notes.styles';

interface NotesEmptyStateProps {
  selectedCategory: string;
  selectedTag: string | null;
  onOpenNewNote: () => void;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
}

export default function NotesEmptyState({
  selectedCategory,
  selectedTag,
  onOpenNewNote,
  cardBg,
  textPrimary,
  textSecondary,
  primaryBrown,
}: NotesEmptyStateProps) {
  const isFiltered = Boolean(selectedCategory !== 'All' || selectedTag);

  return (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconCircle, { backgroundColor: cardBg, borderColor: primaryBrown + '25' }]}>
        <Feather name="file-text" size={32} color={primaryBrown} />
      </View>
      <Text style={[styles.emptyTitle, { color: textPrimary }]}>
        {isFiltered ? 'No matches found' : 'Start your note space'}
      </Text>
      <Text style={[styles.emptySubtitle, { color: textSecondary }]}>
        {isFiltered
          ? 'No notes in this filter yet. Tap All to see every note.'
          : 'Capture lecture ideas, review points, and study plans in one calm workspace.'}
      </Text>
      <TouchableOpacity
        onPress={onOpenNewNote}
        style={[styles.emptyPrimaryBtn, { backgroundColor: primaryBrown }]}
      >
        <Feather name="plus" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
        <Text style={styles.emptyPrimaryBtnText}>{isFiltered ? 'Create note' : 'Create first note'}</Text>
      </TouchableOpacity>
    </View>
  );
}
