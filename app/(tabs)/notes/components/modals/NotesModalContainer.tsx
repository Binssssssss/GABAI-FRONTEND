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
  const [tagInput, setTagInput] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [scheduleTargetNote, setScheduleTargetNote] =
    useState<LocalNote | null>(null);
  const [convertTargetNote, setConvertTargetNote] =
    useState<LocalNote | null>(null);
  const [scheduleTimeInput, setScheduleTimeInput] =
    useState('18:00');
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const allUniqueTags = useMemo(
    () => [...new Set(notesData.notes.flatMap((note) => note.tags))],
    [notesData.notes],
  );

  const createEditorNote = (): Note => ({
    id: notesData.editingNoteId ?? 'draft',
    type: 'BLANK',
    title: notesData.editorTitle.trim() || 'Untitled Note',
    content: notesData.editorContent,
    category: notesData.editorCategory || 'General',
    tags: notesData.editorTags,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isFavorite: notesData.editorIsFavorite,
    isPinned: notesData.editorIsPinned,
    isArchived: notesData.editorIsArchived,
  });

  const handleContentChange = (content: string) => {
    if (content !== notesData.editorContent) {
      setUndoStack((current) =>
        [...current, notesData.editorContent].slice(-100),
      );
      setRedoStack([]);
    }
    notesData.setEditorContent(content);
  };

  const handleUndo = () => {
    const previous = undoStack.at(-1);
    if (previous === undefined) return;

    setUndoStack(undoStack.slice(0, -1));
    setRedoStack([...redoStack, notesData.editorContent]);
    notesData.setEditorContent(previous);
  };

  const handleRedo = () => {
    const next = redoStack.at(-1);
    if (next === undefined) return;

    setRedoStack(redoStack.slice(0, -1));
    setUndoStack([...undoStack, notesData.editorContent]);
    notesData.setEditorContent(next);
  };

  const handleInsertFormatting = (
    prefix: string,
    suffix = '',
    placeholder = '',
  ) => {
    handleContentChange(
      `${notesData.editorContent}${prefix}${placeholder}${suffix}`,
    );
  };

  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (!newTag) return;

    notesData.setEditorTags((current) =>
      current.includes(newTag) ? current : [...current, newTag],
    );
    setTagInput('');
  };

  const closeEditor = () => {
    setTagInput('');
    setUndoStack([]);
    setRedoStack([]);
    void notesData.handleCloseEditor();
  };

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
        onToggleFavorite={() =>
          notesData.setEditorIsFavorite((current) => !current)
        }
        isPinned={notesData.editorIsPinned}
        onTogglePin={() =>
          notesData.setEditorIsPinned((current) => !current)
        }
        isArchived={notesData.editorIsArchived}
        onToggleArchive={() =>
          notesData.setEditorIsArchived((current) => !current)
        }
        onDelete={() => {
          if (notesData.editingNoteId) {
            void notesData.handleDeleteNote(notesData.editingNoteId);
          } else {
            closeEditor();
          }
        }}
        onShare={() => notesData.handleShareNote(createEditorNote())}
        onOpenConvertTask={() => {
          setConvertTargetNote(createEditorNote());
          notesData.setIsConvertTaskModalOpen(true);
        }}
        onOpenSchedule={() => {
          setScheduleTargetNote(createEditorNote());
          if (!notesData.dueDate) {
            notesData.setDueDate(new Date().toISOString().split('T')[0]);
          }
          notesData.setIsScheduleModalOpen(true);
        }}
        onOpenTemplateModal={() =>
          notesData.setIsTemplateModalOpen(true)
        }
        onInsertFormatting={handleInsertFormatting}
        onUndo={handleUndo}
        onRedo={handleRedo}
        isMoreMenuOpen={isMoreMenuOpen}
        onToggleMoreMenu={setIsMoreMenuOpen}
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