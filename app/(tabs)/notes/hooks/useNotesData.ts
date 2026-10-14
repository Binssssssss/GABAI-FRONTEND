
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Alert, Share } from 'react-native';
import * as Haptics from 'expo-haptics';

import { localDb, Note, Task } from '@/app/services/localDb';
import {
  fetchNotes,
  createNote as createNoteApi,
  updateNote as updateNoteApi,
  deleteNote as deleteNoteApi,
  setNoteArchived,
  setNoteFavorite,
  setNotePinned,
} from '@/app/services/notesApi';

import { NoteFilterTab, NoteSortOption, NoteViewMode } from '../types';
import { getNotePlainText, triggerHaptic } from '../utils/noteHelpers';

type NoteDraftSession = {
  key: string;
  noteId: string | null;
  queue: Promise<void>;
};

function createDraftSession(noteId: string | null = null): NoteDraftSession {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    noteId,
    queue: Promise.resolve(),
  };
}

function upsertLocalNote(note: Note) {
  const currentNotes = localDb.getNotes();
  const exists = currentNotes.some((item) => item.id === note.id);

  if (exists) {
    localDb.setNotes(
      currentNotes.map((item) => (item.id === note.id ? note : item)),
    );
  } else {
    localDb.setNotes([note, ...currentNotes]);
  }
}

export function useNotesData() {
  // Notes state and backend loading
  const [notes, setNotesState] = useState<Note[]>(() => localDb.getNotes());
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);

  const mountedRef = useRef(true);
  const loadRequestRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;

    const unsubscribe = localDb.subscribe(() => {
      if (mountedRef.current) {
        setNotesState([...localDb.getNotes()]);
      }
    });

    const requestId = ++loadRequestRef.current;

    const loadNotes = async () => {
      try {
        const serverNotes = await fetchNotes();

        if (
          mountedRef.current &&
          requestId === loadRequestRef.current
        ) {
          localDb.setNotes(serverNotes);
        }
      } catch (error) {
        console.error('Failed to load notes:', error);

        if (mountedRef.current) {
          Alert.alert(
            'Unable to Load Notes',
            'GabAi could not load your notes. Check your connection and try again.',
          );
        }
      } finally {
        if (
          mountedRef.current &&
          requestId === loadRequestRef.current
        ) {
          setIsLoadingNotes(false);
        }
      }
    };

    void loadNotes();

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, []);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTabFilter, setActiveTabFilter] =
    useState<NoteFilterTab>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<NoteSortOption>('recent_edit');
  const [viewMode, setViewMode] = useState<NoteViewMode>('grid');

  // Bottom sheets and popups
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [isEditorMoreMenuOpen, setIsEditorMoreMenuOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Editor state
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

  // Each editing session has its own ID and sequential save queue.
  const draftSessionRef = useRef<NoteDraftSession>(createDraftSession());
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Undo and redo history
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);

  // Convert note to task state
  const [convertTaskModalOpen, setConvertTaskModalOpen] = useState(false);
  const [convertTargetNote, setConvertTargetNote] = useState<Note | null>(null);
  const [taskSubjectInput, setTaskSubjectInput] = useState('General');
  const [taskPriorityInput, setTaskPriorityInput] =
    useState<Task['priority']>('Medium');
  const [taskCategoryInput, setTaskCategoryInput] =
    useState<Task['category']>('Academic');

  // Link to schedule state
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleTargetNote, setScheduleTargetNote] = useState<Note | null>(null);
  const [scheduleDateInput, setScheduleDateInput] = useState(
    () => new Date().toISOString().split('T')[0],
  );
  const [scheduleTimeInput, setScheduleTimeInput] = useState('14:00');

  // Collect unique tags
  const allUniqueTags = useMemo(() => {
    const tagSet = new Set<string>();

    notes.forEach((note) => {
      if (!note.isArchived) {
        note.tags?.forEach((tag) => tagSet.add(tag));
      }
    });

    return Array.from(tagSet);
  }, [notes]);

  // Count active custom filters
  const activeCustomFiltersCount = useMemo(() => {
    let count = 0;

    if (selectedCategory !== 'All') count++;
    if (selectedTag !== null) count++;
    if (sortBy !== 'recent_edit') count++;

    return count;
  }, [selectedCategory, selectedTag, sortBy]);

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        if (activeTabFilter === 'archived') {
          if (!note.isArchived) return false;
        } else {
          if (note.isArchived) return false;
          if (activeTabFilter === 'pinned' && !note.isPinned) return false;
          if (activeTabFilter === 'favorites' && !note.isFavorite) return false;
        }

        if (
          selectedCategory !== 'All' &&
          note.category !== selectedCategory
        ) {
          return false;
        }

        if (selectedTag && !note.tags?.includes(selectedTag)) {
          return false;
        }

        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = note.title?.toLowerCase().includes(query);
          const matchContent = getNotePlainText(note.content)
            .toLowerCase()
            .includes(query);
          const matchCategory = note.category?.toLowerCase().includes(query);
          const matchTags = note.tags?.some((tag) =>
            tag.toLowerCase().includes(query),
          );

          if (
            !matchTitle &&
            !matchContent &&
            !matchCategory &&
            !matchTags
          ) {
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
  }, [
    notes,
    activeTabFilter,
    selectedCategory,
    selectedTag,
    searchQuery,
    sortBy,
  ]);

  const pinnedNotes = useMemo(() => {
    if (
      activeTabFilter === 'archived' ||
      activeTabFilter === 'pinned'
    ) {
      return [];
    }

    return filteredNotes.filter((note) => note.isPinned);
  }, [filteredNotes, activeTabFilter]);

  const unpinnedNotes = useMemo(() => {
    if (
      activeTabFilter === 'archived' ||
      activeTabFilter === 'pinned'
    ) {
      return filteredNotes;
    }

    return filteredNotes.filter((note) => !note.isPinned);
  }, [filteredNotes, activeTabFilter]);

  // Save through the backend. Saves for one editing session are serialized.
const saveCurrentNote = useCallback(
  async (
    title = editorTitle,
    content = editorContent,
    category = editorCategory,
    tags = editorTags,
    isFav = editorIsFavorite,
    isPin = editorIsPinned,
    isArch = editorIsArchived,
  ) => {
    const cleanTitle = title.trim() || 'Untitled Note';
    const session = draftSessionRef.current;

    try {
      const operation = session.queue.then(async () => {
        // Create only once per editing session.
        if (!session.noteId) {
          const created = await createNoteApi({
            title: cleanTitle,
            content,
            category,
            tags,
          });

          session.noteId = created.id;

          if (draftSessionRef.current === session && mountedRef.current) {
            setEditingNoteId(created.id);
          }

          upsertLocalNote(created);
        }

        // Update the existing note.
        const updated = await updateNoteApi(session.noteId!, {
          title: cleanTitle,
          content,
          category,
          tags,
          isFavorite: isFav,
          isPinned: isPin,
          isArchived: isArch,
        });

        upsertLocalNote(updated);

        if (draftSessionRef.current === session && mountedRef.current) {
          setSaveStatus('saved');
        }
      });

      // Keep the queue usable after a failed save.
      session.queue = operation.then(
        () => undefined,
        () => undefined,
      );

      await operation;
    } catch (error) {
      console.error('Failed to save note:', error);

      if (draftSessionRef.current === session && mountedRef.current) {
        setSaveStatus('saving');

        Alert.alert(
          'Save Failed',
          'Your note could not be saved. Check your connection and try again.',
        );
      }
    }
  },
  [
    editorTitle,
    editorContent,
    editorCategory,
    editorTags,
    editorIsFavorite,
    editorIsPinned,
    editorIsArchived,
  ],
);
  // Open a new note
  const handleOpenNewNote = useCallback(
    (
      category = 'School',
      templateContent?: string,
      templateTitle?: string,
    ) => {
      triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }

      draftSessionRef.current = createDraftSession();

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
    },
    [],
  );

  // Open a quick note
  const handleOpenQuickNote = useCallback(() => {
    const timeString = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const dateString = new Date().toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });

    handleOpenNewNote(
      'Ideas',
      `<h2>Quick Jot (${timeString})</h2><ul><li><br></li></ul>`,
      `Quick Note - ${dateString}`,
    );
  }, [handleOpenNewNote]);

  // Open an existing note
  const handleOpenNote = useCallback((note: Note) => {
    triggerHaptic();

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    draftSessionRef.current = createDraftSession(note.id);

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

  // Content change (no autosave: notes are saved only when the user saves)
const handleContentChange = useCallback(
  (newContent: string) => {
    setEditorContent(newContent);

    // Update undo/redo history.
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(
        0,
        historyIndexRef.current + 1,
      );
    }

    if (historyRef.current[historyRef.current.length - 1] !== newContent) {
      historyRef.current.push(newContent);
      historyIndexRef.current = historyRef.current.length - 1;
    }

  },
  [],
);


  // Title change (no autosave)
  const handleTitleChange = useCallback((newTitle: string) => {
    setEditorTitle(newTitle);
  }, []);

  // Close the editor. Saves only when the user chose to save.
  const handleCloseEditor = useCallback(
    (options?: { content?: string; save?: boolean }) => {
      triggerHaptic();

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }

      const content = options?.content ?? editorContent;
      const shouldSave = options?.save !== false;

      if (
        shouldSave &&
        (editorTitle.trim() || getNotePlainText(content).trim())
      ) {
        setEditorContent(content);
        void saveCurrentNote(editorTitle, content);
      }

      setIsEditorOpen(false);
      setIsEditorMoreMenuOpen(false);
    },
    [editorTitle, editorContent, saveCurrentNote],
  );

  // Insert formatting
  const insertFormatting = useCallback(
    (prefix: string, suffix = '', placeholder = '') => {
      triggerHaptic();

      const updated = editorContent + `\n${prefix}${placeholder}${suffix}`;
      handleContentChange(updated);
    },
    [editorContent, handleContentChange],
  );

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      triggerHaptic();

      historyIndexRef.current -= 1;

      const previousContent =
        historyRef.current[historyIndexRef.current];

      setEditorContent(previousContent);
      setSaveStatus('saving');

      void saveCurrentNote(editorTitle, previousContent);
    }
  }, [editorTitle, saveCurrentNote]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      triggerHaptic();

      historyIndexRef.current += 1;

      const nextContent = historyRef.current[historyIndexRef.current];

      setEditorContent(nextContent);
      setSaveStatus('saving');

      void saveCurrentNote(editorTitle, nextContent);
    }
  }, [editorTitle, saveCurrentNote]);

  // Add tag
  const handleAddTag = useCallback(() => {
    if (!editorTagInput.trim()) return;

    let tag = editorTagInput.trim();

    if (!tag.startsWith('#')) {
      tag = `#${tag}`;
    }

    if (!editorTags.includes(tag)) {
      const updatedTags = [...editorTags, tag];

      setEditorTags(updatedTags);
      setSaveStatus('saving');

      void saveCurrentNote(
        editorTitle,
        editorContent,
        editorCategory,
        updatedTags,
      );
    }

    setEditorTagInput('');
  }, [
    editorTagInput,
    editorTags,
    editorTitle,
    editorContent,
    editorCategory,
    saveCurrentNote,
  ]);

  // Remove tag
  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      const updatedTags = editorTags.filter((tag) => tag !== tagToRemove);

      setEditorTags(updatedTags);
      setSaveStatus('saving');

      void saveCurrentNote(
        editorTitle,
        editorContent,
        editorCategory,
        updatedTags,
      );
    },
    [
      editorTags,
      editorTitle,
      editorContent,
      editorCategory,
      saveCurrentNote,
    ],
  );

  // Delete note (permanent deletion with the current backend)
  const handleDeleteNote = useCallback((noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to permanently delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);

              await deleteNoteApi(noteId);

              localDb.deleteNote(noteId);

              if (draftSessionRef.current.noteId === noteId) {
                draftSessionRef.current = createDraftSession();
              }

              setIsEditorOpen(false);
              setIsEditorMoreMenuOpen(false);
            } catch (error) {
              console.error('Failed to delete note:', error);

              Alert.alert(
                'Delete Failed',
                'The note could not be deleted. Please try again.',
              );
            }
          },
        },
      ],
    );
  }, []);

  // Archive / unarchive
  const handleArchiveToggle = useCallback(
    async (noteId: string, currentVal: boolean) => {
      try {
        triggerHaptic();

        const updated = await setNoteArchived(noteId, !currentVal);
        upsertLocalNote(updated);

        if (editingNoteId === noteId) {
          setEditorIsArchived(updated.isArchived);
        }
      } catch (error) {
        console.error('Failed to archive note:', error);

        Alert.alert(
          'Action Failed',
          'Could not update the note archive. Please try again.',
        );
      }
    },
    [editingNoteId],
  );

  // Favorite / unfavorite
  const handleFavoriteToggle = useCallback(
    async (noteId: string, currentVal: boolean) => {
      try {
        triggerHaptic();

        // The current backend endpoint toggles this value.
        const updated = await setNoteFavorite(noteId, !currentVal);
        upsertLocalNote(updated);

        if (editingNoteId === noteId) {
          setEditorIsFavorite(updated.isFavorite);
        }
      } catch (error) {
        console.error('Failed to favorite note:', error);

        Alert.alert(
          'Action Failed',
          'Could not update the note favorite. Please try again.',
        );
      }
    },
    [editingNoteId],
  );

  // Pin / unpin
  const handlePinToggle = useCallback(
    async (noteId: string, currentVal: boolean) => {
      try {
        triggerHaptic();

        // The current backend endpoint toggles this value.
        const updated = await setNotePinned(noteId, !currentVal);
        upsertLocalNote(updated);

        if (editingNoteId === noteId) {
          setEditorIsPinned(updated.isPinned);
        }
      } catch (error) {
        console.error('Failed to pin note:', error);

        Alert.alert(
          'Action Failed',
          'Could not update the note pin. Please try again.',
        );
      }
    },
    [editingNoteId],
  );

  // Duplicate note
  const handleDuplicateNote = useCallback(async (note: Note) => {
    try {
      triggerHaptic();

      const created = await createNoteApi({
        title: `${note.title} (Copy)`,
        content: note.content,
        category: note.category,
        tags: note.tags || [],
      });

      upsertLocalNote(created);
    } catch (error) {
      console.error('Failed to duplicate note:', error);

      Alert.alert(
        'Duplicate Failed',
        'Could not duplicate this note. Please try again.',
      );
    }
  }, []);

  // Share note
  const handleShareNote = useCallback(
    async (title: string, content: string) => {
      try {
        await Share.share({
          title,
          message: `${title}\n\n${getNotePlainText(content)}`,
        });
      } catch {
        // Share cancelled or unavailable.
      }
    },
    [],
  );

  // Apply template
  const handleApplyTemplate = useCallback(
    (template: { title: string; category: string; content: string }) => {
      setIsTemplateModalOpen(false);

      handleOpenNewNote(
        template.category,
        template.content,
        template.title,
      );
    },
    [handleOpenNewNote],
  );

  return {
    // Data
    notes,
    isLoadingNotes,
    filteredNotes,
    pinnedNotes,
    unpinnedNotes,
    allUniqueTags,
    activeCustomFiltersCount,

    // Filters, sort and view
    searchQuery,
    setSearchQuery,
    activeTabFilter,
    setActiveTabFilter,
    selectedCategory,
    setSelectedCategory,
    selectedTag,
    setSelectedTag,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,

    // Sheets and menus
    isFilterSheetOpen,
    setIsFilterSheetOpen,
    isFabMenuOpen,
    setIsFabMenuOpen,
    isEditorMoreMenuOpen,
    setIsEditorMoreMenuOpen,
    isTemplateModalOpen,
    setIsTemplateModalOpen,

    // Editor state
    isEditorOpen,
    editingNoteId,
    editorTitle,
    setEditorTitle,
    editorContent,
    setEditorContent,
    editorCategory,
    setEditorCategory,
    editorTags,
    setEditorTags,
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

    // Convert to task
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

    // Link to schedule
    scheduleModalOpen,
    setScheduleModalOpen,
    scheduleTargetNote,
    setScheduleTargetNote,
    scheduleDateInput,
    setScheduleDateInput,
    scheduleTimeInput,
    setScheduleTimeInput,

    // Editor actions
    handleOpenNewNote,
    handleOpenQuickNote,
    handleOpenNote,
    handleApplyTemplate,
    saveCurrentNote,
    handleCloseEditor,
    handleContentChange,
    handleTitleChange,
    insertFormatting,
    handleUndo,
    handleRedo,
    handleAddTag,
    handleRemoveTag,

    // Note actions
    handleDeleteNote,
    handleFavoriteToggle,
    handlePinToggle,
    handleArchiveToggle,
    handleDuplicateNote,
    handleShareNote,
  };
}
