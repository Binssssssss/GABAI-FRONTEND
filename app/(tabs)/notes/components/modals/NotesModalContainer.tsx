import React, { useMemo, useState } from 'react';

import NoteEditorModal from './NoteEditorModal';
import NoteTemplateModal from './NoteTemplateModal';
import ConvertToTaskModal from './ConvertToTaskModal';
import LinkToScheduleModal from './LinkToScheduleModal';
import FilterSortSheet from './FilterSortSheet';

import type { Note, NotesTheme } from '../../types';
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

  return (
    <>
      {/* =====================================================
          NOTE EDITOR
      ===================================================== */}
      <NoteEditorModal
        visible={notesData.isEditorModalOpen}
        onClose={closeEditor}
        title={notesData.editorTitle}
        onTitleChange={notesData.setEditorTitle}
        content={notesData.editorContent}
        onContentChange={handleContentChange}
        category={notesData.editorCategory}
        onCategoryChange={notesData.setEditorCategory}
        tags={notesData.editorTags}
        tagInput={tagInput}
        onTagInputChange={setTagInput}
        onAddTag={handleAddTag}
        onRemoveTag={(tag) =>
          notesData.setEditorTags((current) =>
            current.filter((currentTag) => currentTag !== tag),
          )
        }
        saveStatus={notesData.isSaving ? 'saving' : 'saved'}
        isPreviewMode={isPreviewMode}
        onTogglePreview={() => setIsPreviewMode((current) => !current)}
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
          notesData.handleCloseEditor();
        }}
        onShare={() => notesData.handleShareNote(createEditorNote())}
        onOpenConvertTask={() => {
          notesData.setConvertTargetNote({
            id: activeNoteId || 'temp',
            title: notesData.editorTitle || 'Untitled Note',
            content: notesData.editorContent,
            category: notesData.editorCategory,
            tags: notesData.editorTags || [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isFavorite: notesData.editorIsFavorite,
            isPinned: notesData.editorIsPinned,
            isArchived: notesData.editorIsArchived,
          });
          notesData.setConvertTaskModalOpen(true);
        }}
        onOpenSchedule={() => {
          notesData.setScheduleTargetNote({
            id: activeNoteId || 'temp',
            title: notesData.editorTitle || 'Untitled Note',
            content: notesData.editorContent,
            category: notesData.editorCategory,
            tags: notesData.editorTags || [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isFavorite: notesData.editorIsFavorite,
            isPinned: notesData.editorIsPinned,
            isArchived: notesData.editorIsArchived,
          });
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
        onSelectTemplate={(template) => {
          setUndoStack([]);
          setRedoStack([]);
          notesData.handleOpenTemplate(
            template.title,
            template.content,
            template.category,
          );
        }}
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
        visible={notesData.isConvertTaskModalOpen}
        onClose={() => {
          notesData.setIsConvertTaskModalOpen(false);
          setConvertTargetNote(null);
        }}
        note={convertTargetNote}
        subjectInput={notesData.editorCategory}
        onSubjectChange={notesData.setEditorCategory}
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
        visible={notesData.isScheduleModalOpen}
        onClose={() => {
          notesData.setIsScheduleModalOpen(false);
          setScheduleTargetNote(null);
        }}
        note={scheduleTargetNote}
        dateInput={notesData.dueDate}
        onDateChange={notesData.setDueDate}
        timeInput={scheduleTimeInput}
        onTimeChange={setScheduleTimeInput}
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
        visible={notesData.isFilterSortSheetOpen}
        onClose={() =>
          notesData.setIsFilterSortSheetOpen(false)
        }
        selectedCategory={
          notesData.selectedCategory
        }
        onSelectCategory={
          notesData.setSelectedCategory
        }
        selectedTag={
          notesData.selectedTag === 'All'
            ? null
            : notesData.selectedTag
        }
        onSelectTag={(tag) =>
          notesData.setSelectedTag(tag ?? 'All')
        }
        allUniqueTags={allUniqueTags}
        sortBy={notesData.sortOption}
        onSelectSort={notesData.setSortOption}
        viewMode={notesData.viewMode}
        onSelectViewMode={notesData.setViewMode}
        onResetFilters={() => {
          notesData.setSelectedCategory('All');
          notesData.setSelectedTag('All');
          notesData.setActiveFilter('all');
          notesData.setSortOption('recent_edit');
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