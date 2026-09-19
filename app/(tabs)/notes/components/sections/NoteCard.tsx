import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Note, NoteViewMode } from '../../types';
import { CATEGORIES } from '../../constants/notesConfig';
import { cleanMarkdownSnippet, formatNoteDate } from '../../utils/noteHelpers';
import { noteStyles as styles } from '../../styles/notes.styles';

interface NoteCardProps {
  note: Note;
  viewMode: NoteViewMode;
  onPress: () => void;
  onTogglePin: () => void;
  onToggleFavorite: () => void;
  onToggleArchive: () => void;
  onDelete: () => void;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
}

export default function NoteCard({
  note,
  viewMode,
  onPress,
  onTogglePin,
  onToggleFavorite,
  onToggleArchive,
  onDelete,
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  primaryBrown,
}: NoteCardProps) {
  const isGrid = viewMode === 'grid';
  const screenWidth = Dimensions.get('window').width;
  const gridItemWidth = (screenWidth - 42) / 2;

  const categoryItem = CATEGORIES.find((c) => c.name === note.category) || CATEGORIES[0];
  const catColor = categoryItem.color || primaryBrown;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.noteCard,
        {
          backgroundColor: cardBg,
          borderColor: note.isPinned ? primaryBrown + '80' : borderCol,
          width: isGrid ? gridItemWidth : '100%',
        },
      ]}
    >
      {/* Card Header: Category Badge & Indicators */}
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: catColor + '18' }]}>
          <View style={[styles.categoryDot, { backgroundColor: catColor }]} />
          <Text style={[styles.categoryBadgeText, { color: catColor }]}>{note.category}</Text>
        </View>

        <View style={styles.cardHeaderIcons}>
          {note.isPinned && (
            <View style={[styles.cardIconIndicator, { backgroundColor: primaryBrown + '18' }]}>
              <Feather name="bookmark" size={11} color={primaryBrown} />
            </View>
          )}
          {note.isFavorite && (
            <View style={[styles.cardIconIndicator, { backgroundColor: '#F59E0B18' }]}>
              <Feather name="star" size={11} color="#F59E0B" />
            </View>
          )}
          {note.isArchived && (
            <View style={[styles.cardIconIndicator, { backgroundColor: '#6B728018' }]}>
              <Feather name="archive" size={11} color="#6B7280" />
            </View>
          )}
        </View>
      </View>

      {/* Note Title */}
      <Text style={[styles.cardTitle, { color: textPrimary }]} numberOfLines={isGrid ? 2 : 1}>
        {note.title || 'Untitled Note'}
      </Text>

      {/* Snippet Preview */}
      <Text style={[styles.cardSnippet, { color: textSecondary }]} numberOfLines={isGrid ? 3 : 2}>
        {cleanMarkdownSnippet(note.content, isGrid ? 80 : 140) || 'Empty note...'}
      </Text>

      {/* Tags Row */}
      {note.tags && note.tags.length > 0 && (
        <View style={styles.cardTagsRow}>
          {note.tags.slice(0, isGrid ? 2 : 4).map((tag, idx) => (
            <View
              key={idx}
              style={[styles.cardTagChip, { backgroundColor: primaryBrown + '12' }]}
            >
              <Text style={[styles.cardTagText, { color: primaryBrown }]}>{tag}</Text>
            </View>
          ))}
          {note.tags.length > (isGrid ? 2 : 4) && (
            <Text style={[styles.cardMoreTags, { color: textSecondary }]}>
              +{note.tags.length - (isGrid ? 2 : 4)}
            </Text>
          )}
        </View>
      )}

      {/* Card Footer: Timestamp & Quick Action Buttons */}
      <View style={[styles.cardFooter, { borderColor: borderCol }]}>
        <View style={styles.timestampRow}>
          <Feather name="clock" size={10} color={textSecondary} />
          <Text style={[styles.timestampText, { color: textSecondary }]}>
            {formatNoteDate(note.updatedAt || note.createdAt)}
          </Text>
        </View>

        <View style={styles.cardQuickActions}>
          <TouchableOpacity onPress={onTogglePin} style={styles.cardActionIconBtn}>
            <Feather
              name="bookmark"
              size={13}
              color={note.isPinned ? primaryBrown : textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onToggleFavorite} style={styles.cardActionIconBtn}>
            <Feather
              name="star"
              size={13}
              color={note.isFavorite ? '#F59E0B' : textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.cardActionIconBtn}>
            <Feather name="trash-2" size={13} color={textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
