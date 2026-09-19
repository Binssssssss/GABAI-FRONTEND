import React from 'react';
import NoteEditorModal from './NoteEditorModal';
import NoteTemplateModal from './NoteTemplateModal';
import ConvertToTaskModal from './ConvertToTaskModal';
import LinkToScheduleModal from './LinkToScheduleModal';
import FilterSortSheet from './FilterSortSheet';
import { NotesTheme } from '../../types';
import type { useNotesData } from '../../hooks/useNotesData';

interface NotesModalContainerProps {
  notesData: ReturnType<typeof useNotesData>;
  theme: NotesTheme;
}

export default function NotesModalContainer({
  notesData,
  theme,
}: NotesModalContainerProps) {
  return (
    <>
      {/* Rich Note Editor Modal */}
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
        onTogglePreview={() => notesData.setIsPreviewMode((prev) => !prev)}
        isFavorite={notesData.editorIsFavorite}
        onToggleFavorite={() => {
          if (notesData.filteredNotes.length > 0) {
            notesData.handleFavoriteToggle(notesData.editorTitle, notesData.editorIsFavorite);
          }
        }}
        isPinned={notesData.editorIsPinned}
        onTogglePin={() => {
          if (notesData.filteredNotes.length > 0) {
            notesData.handlePinToggle(notesData.editorTitle, notesData.editorIsPinned);
          }
        }}
        isArchived={notesData.editorIsArchived}
        onToggleArchive={() => {
          if (notesData.filteredNotes.length > 0) {
            notesData.handleArchiveToggle(notesData.editorTitle, notesData.editorIsArchived);
          }
        }}
        onDelete={() => {
          if (notesData.editorTitle || notesData.editorContent) {
            notesData.handleCloseEditor();
          }
        }}
        onShare={() => notesData.handleShareNote(notesData.editorTitle, notesData.editorContent)}
        onOpenConvertTask={() => {
          notesData.setConvertTargetNote({
            id: 'temp',
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
            id: 'temp',
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
        onInsertFormatting={notesData.insertFormatting}
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

      {/* Note Template Modal */}
      <NoteTemplateModal
        visible={notesData.isTemplateModalOpen}
        onClose={() => notesData.setIsTemplateModalOpen(false)}
        onSelectTemplate={notesData.handleApplyTemplate}
        cardBg={theme.cardBg}
        borderCol={theme.borderCol}
        textPrimary={theme.textPrimary}
        textSecondary={theme.textSecondary}
        primaryBrown={theme.primaryBrown}
      />

      {/* Convert Note to Task Modal */}
      <ConvertToTaskModal
        visible={notesData.convertTaskModalOpen}
        onClose={() => notesData.setConvertTaskModalOpen(false)}
        note={notesData.convertTargetNote}
        subjectInput={notesData.taskSubjectInput}
        onSubjectChange={notesData.setTaskSubjectInput}
        priorityInput={notesData.taskPriorityInput}
        onPriorityChange={notesData.setTaskPriorityInput}
        categoryInput={notesData.taskCategoryInput}
        onCategoryChange={notesData.setTaskCategoryInput}
        cardBg={theme.cardBg}
        borderCol={theme.borderCol}
        inputBg={theme.inputBg}
        textPrimary={theme.textPrimary}
        textSecondary={theme.textSecondary}
        primaryBrown={theme.primaryBrown}
      />

      {/* Link Note to Schedule Modal */}
      <LinkToScheduleModal
        visible={notesData.scheduleModalOpen}
        onClose={() => notesData.setScheduleModalOpen(false)}
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

      {/* Filters & Sort Sheet Modal */}
      <FilterSortSheet
        visible={notesData.isFilterSheetOpen}
        onClose={() => notesData.setIsFilterSheetOpen(false)}
        selectedCategory={notesData.selectedCategory}
        onSelectCategory={notesData.setSelectedCategory}
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
