import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Alert, Share } from 'react-native';
import * as Haptics from 'expo-haptics';
import { localDb, Note, Task } from '@/app/services/localDb';
import { NoteFilterTab, NoteSortOption, NoteViewMode } from '../types';
import { triggerHaptic } from '../utils/noteHelpers';

export function useNotesData() {
  // Central Database Notes State
  const [notes, setNotesState] = useState<Note[]>(() => localDb.getNotes());

  useEffect(() => {
    const unsubscribe = localDb.subscribe(() => {
      setNotesState(localDb.getNotes());
    });
    return unsubscribe;
  }, []);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTabFilter, setActiveTabFilter] = useState<NoteFilterTab>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<NoteSortOption>('recent_edit');
  const [viewMode, setViewMode] = useState<NoteViewMode>('grid');

  // Bottom Sheets & Popups
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [isEditorMoreMenuOpen, setIsEditorMoreMenuOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorCategory, setEditorCategory] = useState('School');
  const [editorTags, setEditorTags] = useState<string[]>([]);
  const [editorTagInput, setEditorTagInput] = useState('');
  const [editorIsFavorite, setEditorIsFavorite] = useState(false);
  const [editorIsPinned, setEditorIsPinned] = useState(false);
  const [editorIsArchived, setEditorIsArchived] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Undo / Redo History
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);

  // Convert to Task State
  const [convertTaskModalOpen, setConvertTaskModalOpen] = useState(false);
  const [convertTargetNote, setConvertTargetNote] = useState<Note | null>(null);
  const [taskSubjectInput, setTaskSubjectInput] = useState('General');
  const [taskPriorityInput, setTaskPriorityInput] = useState<Task['priority']>('Medium');
  const [taskCategoryInput, setTaskCategoryInput] = useState<Task['category']>('Academic');

  // Link to Schedule State
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleTargetNote, setScheduleTargetNote] = useState<Note | null>(null);
  const [scheduleDateInput, setScheduleDateInput] = useState(() => new Date().toISOString().split('T')[0]);
  const [scheduleTimeInput, setScheduleTimeInput] = useState('14:00');

  // Collect all unique tags
  const allUniqueTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((n) => {
      if (!n.isArchived) {
        n.tags?.forEach((t) => tagSet.add(t));
      }
    });
    return Array.from(tagSet);
  }, [notes]);

  // Check active custom filters count
  const activeCustomFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'All') count++;
    if (selectedTag !== null) count++;
    if (sortBy !== 'recent_edit') count++;
    return count;
  }, [selectedCategory, selectedTag, sortBy]);

  // Filtered & Sorted Notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        // Tab Filter
        if (activeTabFilter === 'archived') {
          if (!note.isArchived) return false;
        } else {
          if (note.isArchived) return false;
          if (activeTabFilter === 'pinned' && !note.isPinned) return false;
          if (activeTabFilter === 'favorites' && !note.isFavorite) return false;
        }

        // Category Filter
        if (selectedCategory !== 'All' && note.category !== selectedCategory) {
          return false;
        }

        // Tag Filter
        if (selectedTag && (!note.tags || !note.tags.includes(selectedTag))) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = note.title?.toLowerCase().includes(q);
          const matchContent = note.content?.toLowerCase().includes(q);
          const matchCategory = note.category?.toLowerCase().includes(q);
          const matchTags = note.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchContent && !matchCategory && !matchTags) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recent_edit') return b.updatedAt - a.updatedAt;
        if (sortBy === 'recent_create') return b.createdAt - a.createdAt;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'category') return a.category.localeCompare(b.category);
        return 0;
      });
  }, [notes, activeTabFilter, selectedCategory, selectedTag, searchQuery, sortBy]);

  const pinnedNotes = useMemo(() => {
    if (activeTabFilter === 'archived' || activeTabFilter === 'pinned') return [];
    return filteredNotes.filter((n) => n.isPinned);
  }, [filteredNotes, activeTabFilter]);

  const unpinnedNotes = useMemo(() => {
    if (activeTabFilter === 'archived' || activeTabFilter === 'pinned') return filteredNotes;
    return filteredNotes.filter((n) => !n.isPinned);
  }, [filteredNotes, activeTabFilter]);

  // Open New Note
  const handleOpenNewNote = useCallback((category = 'School', templateContent?: string, templateTitle?: string) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setIsFabMenuOpen(false);
    setEditingNoteId(null);
    setEditorTitle(templateTitle || '');
    setEditorContent(templateContent || '');
    setEditorCategory(category);
    setEditorTags([]);
    setEditorTagInput('');
    setEditorIsFavorite(false);
    setEditorIsPinned(false);
    setEditorIsArchived(false);
    setSaveStatus('saved');
    setIsPreviewMode(false);
    historyRef.current = [templateContent || ''];
    historyIndexRef.current = 0;
    setIsEditorOpen(true);
  }, []);

  // Open Quick Note
  const handleOpenQuickNote = useCallback(() => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
    handleOpenNewNote('Ideas', `## Quick Jot (${timeString})\n- `, `Quick Note - ${dateString}`);
  }, [handleOpenNewNote]);

  // Open Existing Note
  const handleOpenNote = useCallback((note: Note) => {
    triggerHaptic();
    setEditingNoteId(note.id);
    setEditorTitle(note.title);
    setEditorContent(note.content);
    setEditorCategory(note.category);
    setEditorTags(note.tags || []);
    setEditorTagInput('');
    setEditorIsFavorite(note.isFavorite);
    setEditorIsPinned(note.isPinned);
    setEditorIsArchived(note.isArchived);
    setSaveStatus('saved');
    setIsPreviewMode(false);
    historyRef.current = [note.content];
    historyIndexRef.current = 0;
    setIsEditorOpen(true);
  }, []);

  // Debounced auto-save timer
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveCurrentNote = useCallback(
    (
      title = editorTitle,
      content = editorContent,
      category = editorCategory,
      tags = editorTags,
      isFav = editorIsFavorite,
      isPin = editorIsPinned,
      isArch = editorIsArchived
    ) => {
      if (!title.trim() && !content.trim()) return;

      const cleanTitle = title.trim() || 'Untitled Note';

      if (editingNoteId) {
        localDb.updateNote(editingNoteId, {
          title: cleanTitle,
          content,
          category,
          tags,
          isFavorite: isFav,
          isPinned: isPin,
          isArchived: isArch,
        });
      } else {
        const created = localDb.addNote({
          title: cleanTitle,
          content,
          category,
          tags,
          isFavorite: isFav,
          isPinned: isPin,
          isArchived: isArch,
        });
        setEditingNoteId(created.id);
      }
      setSaveStatus('saved');
    },
    [editingNoteId, editorTitle, editorContent, editorCategory, editorTags, editorIsFavorite, editorIsPinned, editorIsArchived]
  );

  const handleContentChange = useCallback(
    (newContent: string) => {
      setEditorContent(newContent);
      setSaveStatus('saving');

      // Add to history stack
      if (historyIndexRef.current < historyRef.current.length - 1) {
        historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      }
      if (historyRef.current[historyRef.current.length - 1] !== newContent) {
        historyRef.current.push(newContent);
        historyIndexRef.current = historyRef.current.length - 1;
      }

      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        saveCurrentNote(editorTitle, newContent);
      }, 600);
    },
    [editorTitle, saveCurrentNote]
  );

  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setEditorTitle(newTitle);
      setSaveStatus('saving');
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        saveCurrentNote(newTitle, editorContent);
      }, 600);
    },
    [editorContent, saveCurrentNote]
  );

  const handleCloseEditor = useCallback(() => {
    triggerHaptic();
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    if (editorTitle.trim() || editorContent.trim()) {
      saveCurrentNote();
    }
    setIsEditorOpen(false);
    setIsEditorMoreMenuOpen(false);
  }, [editorTitle, editorContent, saveCurrentNote]);

  const insertFormatting = useCallback(
    (prefix: string, suffix = '', placeholder = '') => {
      triggerHaptic();
      const updated = editorContent + `\n${prefix}${placeholder}${suffix}`;
      handleContentChange(updated);
    },
    [editorContent, handleContentChange]
  );

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      triggerHaptic();
      historyIndexRef.current -= 1;
      const prevContent = historyRef.current[historyIndexRef.current];
      setEditorContent(prevContent);
      saveCurrentNote(editorTitle, prevContent);
    }
  }, [editorTitle, saveCurrentNote]);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      triggerHaptic();
      historyIndexRef.current += 1;
      const nextContent = historyRef.current[historyIndexRef.current];
      setEditorContent(nextContent);
      saveCurrentNote(editorTitle, nextContent);
    }
  }, [editorTitle, saveCurrentNote]);

  const handleAddTag = useCallback(() => {
    if (!editorTagInput.trim()) return;
    let tag = editorTagInput.trim();
    if (!tag.startsWith('#')) tag = `#${tag}`;
    if (!editorTags.includes(tag)) {
      const updated = [...editorTags, tag];
      setEditorTags(updated);
      saveCurrentNote(editorTitle, editorContent, editorCategory, updated);
    }
    setEditorTagInput('');
  }, [editorTagInput, editorTags, editorTitle, editorContent, editorCategory, saveCurrentNote]);

  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      const updated = editorTags.filter((t) => t !== tagToRemove);
      setEditorTags(updated);
      saveCurrentNote(editorTitle, editorContent, editorCategory, updated);
    },
    [editorTags, editorTitle, editorContent, editorCategory, saveCurrentNote]
  );

  // Note Action Handlers
  const handleDeleteNote = useCallback((noteId: string) => {
    Alert.alert('Delete Note', 'Are you sure you want to permanently delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
          localDb.deleteNote(noteId);
          setIsEditorOpen(false);
          setIsEditorMoreMenuOpen(false);
        },
      },
    ]);
  }, []);

  const handleArchiveToggle = useCallback(
    (noteId: string, currentVal: boolean) => {
      triggerHaptic();
      localDb.updateNote(noteId, { isArchived: !currentVal });
      if (editingNoteId === noteId) {
        setEditorIsArchived(!currentVal);
      }
    },
    [editingNoteId]
  );

  const handleFavoriteToggle = useCallback(
    (noteId: string, currentVal: boolean) => {
      triggerHaptic();
      localDb.updateNote(noteId, { isFavorite: !currentVal });
      if (editingNoteId === noteId) {
        setEditorIsFavorite(!currentVal);
      }
    },
    [editingNoteId]
  );

  const handlePinToggle = useCallback(
    (noteId: string, currentVal: boolean) => {
      triggerHaptic();
      localDb.updateNote(noteId, { isPinned: !currentVal });
      if (editingNoteId === noteId) {
        setEditorIsPinned(!currentVal);
      }
    },
    [editingNoteId]
  );

  const handleDuplicateNote = useCallback((note: Note) => {
    triggerHaptic();
    localDb.addNote({
      title: `${note.title} (Copy)`,
      content: note.content,
      category: note.category,
      tags: note.tags,
      isFavorite: false,
      isPinned: false,
      isArchived: false,
    });
  }, []);

  const handleShareNote = useCallback(async (title: string, content: string) => {
    try {
      await Share.share({
        title,
        message: `${title}\n\n${content}`,
      });
    } catch {
      // Ignored
    }
  }, []);

  const handleApplyTemplate = useCallback(
    (template: { title: string; category: string; content: string }) => {
      setIsTemplateModalOpen(false);
      handleOpenNewNote(template.category, template.content, template.title);
    },
    [handleOpenNewNote]
  );

  return {
    notes,
    filteredNotes,
    pinnedNotes,
    unpinnedNotes,
    allUniqueTags,
    activeCustomFiltersCount,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    activeTabFilter,
    setActiveTabFilter,
    selectedTag,
    setSelectedTag,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    isFilterSheetOpen,
    setIsFilterSheetOpen,
    isFabMenuOpen,
    setIsFabMenuOpen,
    isEditorMoreMenuOpen,
    setIsEditorMoreMenuOpen,
    isTemplateModalOpen,
    setIsTemplateModalOpen,
    isEditorOpen,
    editingNoteId,
    editorTitle,
    editorContent,
    editorCategory,
    setEditorCategory,
    editorTags,
    editorTagInput,
    setEditorTagInput,
    editorIsFavorite,
    setEditorIsFavorite,
    editorIsPinned,
    setEditorIsPinned,
    editorIsArchived,
    setEditorIsArchived,
    saveStatus,
    isPreviewMode,
    setIsPreviewMode,
    convertTaskModalOpen,
    setConvertTaskModalOpen,
    convertTargetNote,
    setConvertTargetNote,
    taskSubjectInput,
    setTaskSubjectInput,
    taskPriorityInput,
    setTaskPriorityInput,
    taskCategoryInput,
    setTaskCategoryInput,
    scheduleModalOpen,
    setScheduleModalOpen,
    scheduleTargetNote,
    setScheduleTargetNote,
    scheduleDateInput,
    setScheduleDateInput,
    scheduleTimeInput,
    setScheduleTimeInput,
    handleOpenNewNote,
    handleOpenQuickNote,
    handleOpenNote,
    handleCloseEditor,
    handleContentChange,
    handleTitleChange,
    insertFormatting,
    handleUndo,
    handleRedo,
    handleAddTag,
    handleRemoveTag,
    handleDeleteNote,
    handleArchiveToggle,
    handleFavoriteToggle,
    handlePinToggle,
    handleDuplicateNote,
    handleShareNote,
    handleApplyTemplate,
  };
}
