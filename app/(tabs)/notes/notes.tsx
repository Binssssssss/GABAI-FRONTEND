import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDrawer } from '@/app/(tabs)/_layout';

import {
  NotesHeaderSection,
  NotesSectionList,
  NotesFabMenu,
  NotesModalContainer,
} from './components';
import { useNotesData, useNotesTheme } from './hooks';
import { noteStyles as styles } from './styles/notes.styles';

export default function NotesScreen() {
  const { openDrawer } = useDrawer();
  const theme = useNotesTheme();
  const notesData = useNotesData();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgTheme }]} edges={['top']}>
      {/* 1. Header, Search & Filter Bar */}
      <NotesHeaderSection
        onOpenDrawer={openDrawer}
        notesData={notesData}
        theme={theme}
      />

      {/* 2. Scrollable Notes List & Grid */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <NotesSectionList
          notesData={notesData}
          theme={theme}
        />
      </ScrollView>

      {/* 3. Floating Speed Dial Action Button */}
      <NotesFabMenu
        isOpen={notesData.isFabMenuOpen}
        onToggle={() => notesData.setIsFabMenuOpen((prev) => !prev)}
        onNewBlankNote={() => notesData.handleOpenNewNote()}
        onQuickJot={notesData.handleOpenQuickNote}
        onOpenTemplates={() => {
          notesData.setIsFabMenuOpen(false);
          notesData.setIsTemplateModalOpen(true);
        }}
        cardBg={theme.cardBg}
        borderCol={theme.borderCol}
        textPrimary={theme.textPrimary}
        primaryBrown={theme.primaryBrown}
      />

      {/* 4. Notes Modals (Editor, Templates, Convert Task, Schedule, Filters) */}
      <NotesModalContainer
        notesData={notesData}
        theme={theme}
      />
    </SafeAreaView>
  );
}
