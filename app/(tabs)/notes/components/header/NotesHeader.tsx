import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { NoteViewMode } from '../../types';
import { noteStyles as styles } from '../../styles/notes.styles';

interface NotesHeaderProps {
  totalNotesCount: number;
  viewMode: NoteViewMode;
  onToggleViewMode: () => void;
  onOpenDrawer: () => void;
  onOpenTemplateModal: () => void;
  onOpenNewNote: () => void;
  textPrimary: string;
  textSecondary: string;
  cardBg: string;
  borderCol: string;
  primaryBrown: string;
}

export default function NotesHeader({
  totalNotesCount,
  viewMode,
  onToggleViewMode,
  onOpenDrawer,
  onOpenTemplateModal,
  onOpenNewNote,
  textPrimary,
  textSecondary,
  cardBg,
  borderCol,
  primaryBrown,
}: NotesHeaderProps) {
  return (
    <View style={[styles.header, { borderColor: borderCol }]}>
      <View style={styles.headerLeft}>
        <TouchableOpacity
          onPress={onOpenDrawer}
          style={[styles.menuButton, { backgroundColor: cardBg, borderColor: borderCol }]}
        >
          <Feather name="menu" size={18} color={textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleBlock}>
          <View style={styles.titleRow}>
            <Text style={[styles.headerTitle, { color: textPrimary }]}>My Notes</Text>
            <View style={[styles.counterBadge, { backgroundColor: primaryBrown + '20' }]}>
              <Text style={[styles.counterText, { color: primaryBrown }]}>{totalNotesCount}</Text>
            </View>
          </View>
          <Text style={[styles.headerSubtitle, { color: textSecondary }]}>
            Your ideas, organized.
          </Text>
        </View>
      </View>

      <View style={styles.headerRight}>
        <TouchableOpacity
          onPress={onOpenTemplateModal}
          style={[styles.menuButton, { backgroundColor: cardBg, borderColor: borderCol, marginRight: 0 }]}
        >
          <Feather name="layout" size={17} color={primaryBrown} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onToggleViewMode}
          style={[styles.menuButton, { backgroundColor: cardBg, borderColor: borderCol, marginRight: 0 }]}
        >
          <Feather name={viewMode === 'grid' ? 'list' : 'grid'} size={17} color={textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onOpenNewNote}
          style={[styles.primaryHeaderBtn, { backgroundColor: primaryBrown }]}
        >
          <Feather name="plus" size={17} color="#FFFFFF" />
          <Text style={styles.primaryHeaderBtnText}>New</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
