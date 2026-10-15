import React from 'react';

import NoteEditorModal from './NoteEditorModal';
import NoteTemplateModal from './NoteTemplateModal';
import ConvertToTaskModal from './ConvertToTaskModal';
import LinkToScheduleModal from './LinkToScheduleModal';
import FilterSortSheet from './FilterSortSheet';

import type { NotesTheme } from '../../types';
import type { Note as LocalNote } from '@/app/services/localDb';
import type { useNotesData } from '../../hooks/useNotesData';

interface NotesModalContainerProps {
  notesData: ReturnType<typeof useNotesData>;
  theme: NotesTheme;
}

export default function NotesModalContainer({
  notesData,
  theme,
}: NotesModalContainerProps) {
  const activeNoteId = notesData.editingNoteId;

  // Snapshot of the note currently open in the editor.
  const createEditorNote = (
    content: string = notesData.editorContent,
  ): LocalNote => ({
    id: activeNoteId || 'temp',
    title: notesData.editorTitle || 'Untitled Note',
    content,
    category: notesData.editorCategory,
    tags: notesData.editorTags || [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isFavorite: notesData.editorIsFavorite,
    isPinned: notesData.editorIsPinned,
    isArchived: notesData.editorIsArchived,
  });

  return (
    <>
      {/* =====================================================
          NOTE EDITOR
      ===================================================== */}
      <NoteEditorModal
        visible={notesData.isEditorOpen}
        onClose={notesData.handleCloseEditor}
        title={notesData.editorTitle}
        onTitleChange={notesData.handleTitleChange}
        content={notesData.editorContent}
        onContentChange={notesData.handleContentChange}
        category={notesData.editorCategory}
        onCategoryChange={notesData.setEditorCategory}
        tags={notesData.editorTags}
        tagInput={notesData.editorTagInput}
        onTagInputChange={notesData.setEditorTagInput}
        onAddTag={notesData.handleAddTag}
        onRemoveTag={notesData.handleRemoveTag}
        saveStatus={notesData.saveStatus}
        isPreviewMode={notesData.isPreviewMode}
        onTogglePreview={() => notesData.setIsPreviewMode((current) => !current)}
        isFavorite={notesData.editorIsFavorite}
        onToggleFavorite={() => {
          if (activeNoteId) {
            notesData.handleFavoriteToggle(activeNoteId, notesData.editorIsFavorite);
            return;
          }
          notesData.setEditorIsFavorite((prev) => !prev);
        }}
        isPinned={notesData.editorIsPinned}
        onTogglePin={() => {
          if (activeNoteId) {
            notesData.handlePinToggle(activeNoteId, notesData.editorIsPinned);
            return;
          }
          notesData.setEditorIsPinned((prev) => !prev);
        }}
        isArchived={notesData.editorIsArchived}
        onToggleArchive={() => {
          if (activeNoteId) {
            notesData.handleArchiveToggle(activeNoteId, notesData.editorIsArchived);
            return;
          }
          notesData.setEditorIsArchived((prev) => !prev);
        }}
        onDelete={() => {
          if (activeNoteId) {
            notesData.handleDeleteNote(activeNoteId);
            return;
          }
          // Unsaved new note: just close, nothing to delete.
          notesData.handleCloseEditor({ save: false });
        }}
        onShare={(content) =>
          notesData.handleShareNote(
            notesData.editorTitle || 'Untitled Note',
            content,
          )
        }
        onOpenConvertTask={(content) => {
          notesData.setConvertTargetNote(createEditorNote(content));
          notesData.setConvertTaskModalOpen(true);
        }}
        onOpenSchedule={(content) => {
          notesData.setScheduleTargetNote(createEditorNote(content));
          notesData.setScheduleModalOpen(true);
        }}
        onOpenTemplateModal={() => notesData.setIsTemplateModalOpen(true)}
        onUndo={notesData.handleUndo}
        onRedo={notesData.handleRedo}
        isMoreMenuOpen={notesData.isEditorMoreMenuOpen}
        onToggleMoreMenu={notesData.setIsEditorMoreMenuOpen}
        bgTheme={theme.bgTheme}
        cardBg={theme.cardBg}
        borderCol={theme.borderCol}
        inputBg={theme.inputBg}
        textPrimary={theme.textPrimary}
        textSecondary={theme.textSecondary}
        primaryBrown={theme.primaryBrown}
        successGreen={theme.successGreen}
      />

      {/* =====================================================
          NOTE TEMPLATE
      ===================================================== */}
      <NoteTemplateModal
        visible={notesData.isTemplateModalOpen}
        onClose={() =>
          notesData.setIsTemplateModalOpen(false)
        }
        onSelectTemplate={notesData.handleApplyTemplate}
        cardBg={theme.cardBg}
        borderCol={theme.borderCol}
        textPrimary={theme.textPrimary}
        textSecondary={theme.textSecondary}
        primaryBrown={theme.primaryBrown}
      />

      {/* =====================================================
          CONVERT NOTE TO TASK
      ===================================================== */}
      <ConvertToTaskModal
        visible={notesData.convertTaskModalOpen}
        onClose={() => {
          notesData.setConvertTaskModalOpen(false);
          notesData.setConvertTargetNote(null);
        }}
        note={notesData.convertTargetNote}
        subjectInput={notesData.taskSubjectInput}
        onSubjectChange={notesData.setTaskSubjectInput}
        priorityInput={
          notesData.taskPriorityInput
        }
        onPriorityChange={
          notesData.setTaskPriorityInput
        }
        categoryInput={
          notesData.taskCategoryInput
        }
        onCategoryChange={
          notesData.setTaskCategoryInput
        }
        cardBg={theme.cardBg}
        borderCol={theme.borderCol}
        inputBg={theme.inputBg}
        textPrimary={theme.textPrimary}
        textSecondary={theme.textSecondary}
        primaryBrown={theme.primaryBrown}
      />

      {/* =====================================================
          LINK NOTE TO SCHEDULE
      ===================================================== */}
      <LinkToScheduleModal
        visible={notesData.scheduleModalOpen}
        onClose={() => {
          notesData.setScheduleModalOpen(false);
          notesData.setScheduleTargetNote(null);
        }}
        note={notesData.scheduleTargetNote}
        dateInput={notesData.scheduleDateInput}
        onDateChange={notesData.setScheduleDateInput}
        timeInput={notesData.scheduleTimeInput}
        onTimeChange={notesData.setScheduleTimeInput}
        cardBg={theme.cardBg}
        borderCol={theme.borderCol}
        inputBg={theme.inputBg}
        textPrimary={theme.textPrimary}
        textSecondary={theme.textSecondary}
        primaryBrown={theme.primaryBrown}
      />

      {/* =====================================================
          FILTER + SORT
      ===================================================== */}
      <FilterSortSheet
        visible={notesData.isFilterSheetOpen}
        onClose={() =>
          notesData.setIsFilterSheetOpen(false)
        }
        selectedCategory={
          notesData.selectedCategory
        }
        onSelectCategory={
          notesData.setSelectedCategory
        }
        selectedTag={notesData.selectedTag}
        onSelectTag={notesData.setSelectedTag}
        allUniqueTags={notesData.allUniqueTags}
        sortBy={notesData.sortBy}
        onSelectSort={notesData.setSortBy}
        viewMode={notesData.viewMode}
        onSelectViewMode={notesData.setViewMode}
        onResetFilters={() => {
          notesData.setSelectedCategory('All');
          notesData.setSelectedTag(null);
          notesData.setActiveTabFilter('all');
          notesData.setSortBy('recent_edit');
        }}
        cardBg={theme.cardBg}
        borderCol={theme.borderCol}
        textPrimary={theme.textPrimary}
        textSecondary={theme.textSecondary}
        primaryBrown={theme.primaryBrown}
      />
    </>
  );
}
