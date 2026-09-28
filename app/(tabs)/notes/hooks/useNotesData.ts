import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { Alert, Share } from 'react-native';
import { isAxiosError } from 'axios';
import type { Task } from '@/app/services/localDb';

import api from '@/app/services/api';

import {
  Note,
  NoteFilterTab,
  NoteSortOption,
  NoteViewMode,
} from '../types';

import {
  triggerSuccessHaptic,
} from '../utils/noteHelpers';

interface BackendNote {
  id: string;
  title: string;
  content: string;
  type: string;
  category: string;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface NotesApiResponse {
  success: boolean;
  data: BackendNote[];
  total: number;
  message?: string;
}

interface NoteApiResponse {
  success: boolean;
  data: BackendNote;
  message?: string;
}

interface CreateNoteInput {
  title: string;
  content: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  isArchived: boolean;
}

interface UpdateNoteInput {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  isFavorite?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
}

const mapBackendNote = (
  note: BackendNote,
): Note => ({
  id: note.id,
  title: note.title,
  content: note.content,
  type: note.type,
  category: note.category,
  tags: note.tags ?? [],
  isPinned: note.isPinned,
  isFavorite: note.isFavorite,
  isArchived: note.isArchived,
  createdAt: new Date(note.createdAt).getTime(),
  updatedAt: new Date(note.updatedAt).getTime(),
});

export function useNotesData() {
  const [notes, setNotes] = useState<Note[]>([]);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState('');

  const [activeFilter, setActiveFilter] =
    useState<NoteFilterTab>('all');

  const [sortOption, setSortOption] =
    useState<NoteSortOption>('recent_edit');

  const [viewMode, setViewMode] =
    useState<NoteViewMode>('grid');

  const [selectedCategory, setSelectedCategory] =
    useState<string>('All');

  const [selectedTag, setSelectedTag] =
    useState<string>('All');

  const [isFabMenuOpen, setIsFabMenuOpen] =
    useState(false);

  const [isTemplateModalOpen, setIsTemplateModalOpen] =
    useState(false);

  const [isEditorModalOpen, setIsEditorModalOpen] =
    useState(false);

  const [isConvertTaskModalOpen, setIsConvertTaskModalOpen] =
    useState(false);

  const [isScheduleModalOpen, setIsScheduleModalOpen] =
    useState(false);

  const [isFilterSortSheetOpen, setIsFilterSortSheetOpen] =
    useState(false);

  const [editingNoteId, setEditingNoteId] =
    useState<string | null>(null);

  const [editorTitle, setEditorTitle] =
    useState('');

  const [editorContent, setEditorContent] =
    useState('');

  const [editorCategory, setEditorCategory] =
    useState('General');

  const [editorTags, setEditorTags] =
    useState<string[]>([]);

  const [editorIsFavorite, setEditorIsFavorite] =
    useState(false);

  const [editorIsPinned, setEditorIsPinned] =
    useState(false);

  const [editorIsArchived, setEditorIsArchived] =
    useState(false);

  const [taskPriorityInput, setTaskPriorityInput] =
    useState<Task['priority']>('Medium');

  const [taskCategoryInput, setTaskCategoryInput] =
    useState<Task['category']>('Academic');

  const [dueDate, setDueDate] =
    useState('');

  const [linkTaskTitle, setLinkTaskTitle] =
    useState('');

  const autoSaveTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * =========================================================
   * FETCH NOTES
   * =========================================================
   */

  const fetchNotes = useCallback(
    async () => {
      try {
        setIsLoading(true);

        const response =
          await api.get<NotesApiResponse>(
            '/api/notes',
          );

        if (!response.data.success) {
          throw new Error(
            response.data.message ||
              'Failed to fetch notes',
          );
        }

        const mappedNotes =
          response.data.data.map(
            mapBackendNote,
          );

        setNotes(mappedNotes);
      } catch (error) {
        console.error(
          'Fetch notes error:',
          error,
        );

        Alert.alert(
          'Unable to Load Notes',
          'Please check your connection and try again.',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const loadTimer = setTimeout(() => {
      void fetchNotes();
    }, 0);

    return () => clearTimeout(loadTimer);
  }, [fetchNotes]);

  /**
   * =========================================================
   * FILTERED / SORTED NOTES
   * =========================================================
   */

  const filteredNotes = useMemo(() => {
    let result = [...notes];

    if (activeFilter === 'pinned') {
      result = result.filter(
        (note) => note.isPinned,
      );
    }

    if (activeFilter === 'favorites') {
      result = result.filter(
        (note) => note.isFavorite,
      );
    }

    if (activeFilter === 'archived') {
      result = result.filter(
        (note) => note.isArchived,
      );
    }

    if (activeFilter !== 'archived') {
      result = result.filter(
        (note) => !note.isArchived,
      );
    }

    if (
      selectedCategory !== 'All'
    ) {
      result = result.filter(
        (note) =>
          note.category ===
          selectedCategory,
      );
    }

    if (selectedTag !== 'All') {
      result = result.filter(
        (note) =>
          note.tags.includes(
            selectedTag,
          ),
      );
    }

    const query =
      searchQuery.trim().toLowerCase();

    if (query) {
      result = result.filter(
        (note) =>
          note.title
            .toLowerCase()
            .includes(query) ||
          note.content
            .toLowerCase()
            .includes(query) ||
          note.category
            .toLowerCase()
            .includes(query) ||
          note.tags.some((tag) =>
            tag
              .toLowerCase()
              .includes(query),
          ),
      );
    }

    switch (sortOption) {
      case 'recent_edit':
        result.sort(
          (a, b) =>
            b.updatedAt -
            a.updatedAt,
        );
        break;

      case 'recent_create':
        result.sort(
          (a, b) =>
            b.createdAt -
            a.createdAt,
        );
        break;

      case 'title':
        result.sort((a, b) =>
          a.title.localeCompare(
            b.title,
          ),
        );
        break;

      case 'category':
        result.sort((a, b) =>
          a.category.localeCompare(
            b.category,
          ),
        );
        break;
    }

    return result;
  }, [
    notes,
    activeFilter,
    selectedCategory,
    selectedTag,
    searchQuery,
    sortOption,
  ]);

  /**
   * =========================================================
   * COUNTS
   * =========================================================
   */

  const totalNotes =
    notes.filter(
      (note) => !note.isArchived,
    ).length;

  const pinnedNotes =
    notes.filter(
      (note) =>
        note.isPinned &&
        !note.isArchived,
    ).length;

  const favoriteNotes =
    notes.filter(
      (note) =>
        note.isFavorite &&
        !note.isArchived,
    ).length;

  const archivedNotes =
    notes.filter(
      (note) => note.isArchived,
    ).length;

  /**
   * =========================================================
   * CREATE NOTE
   * =========================================================
   */

  const createNote = useCallback(
    async (
      title: string,
      content: string,
      category: string,
      tags: string[],
      isFavorite: boolean,
      isPinned: boolean,
      isArchived: boolean,
    ) => {
      try {
        setIsSaving(true);

        const cleanTitle =
          title.trim() ||
          'Untitled Note';

        const payload: CreateNoteInput = {
          title: cleanTitle,
          content,
          category,
          tags,
          isFavorite,
          isPinned,
          isArchived,
        };

        const response =
          await api.post<NoteApiResponse>(
            '/api/notes',
            payload,
          );

        if (!response.data.success) {
          throw new Error(
            response.data.message ||
              'Failed to create note',
          );
        }

        const createdNote =
          mapBackendNote(
            response.data.data,
          );

        setNotes((current) => [
          createdNote,
          ...current,
        ]);

        setEditingNoteId(
          createdNote.id,
        );

        return createdNote;
      } catch (error) {
        console.error(
          'Create note error:',
          error,
        );

        Alert.alert(
          'Save Failed',
          'Unable to create the note. Please try again.',
        );

        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  /**
   * =========================================================
   * UPDATE NOTE
   * =========================================================
   *
   * IMPORTANT:
   * This function expects the REAL UUID.
   *
   * Correct:
   * updateNote(note.id, {...})
   *
   * Wrong:
   * updateNote(note.title, {...})
   */

  const updateNote = useCallback(
    async (
      noteId: string,
      updates: UpdateNoteInput,
    ) => {
      try {
        if (!noteId) {
          console.error(
            'Update note failed: missing note ID',
          );

          return null;
        }

        console.log(
          'Updating note:',
          noteId,
        );

        setIsSaving(true);

        const response =
          await api.patch<NoteApiResponse>(
            `/api/notes/${noteId}`,
            updates,
          );

        if (!response.data.success) {
          throw new Error(
            response.data.message ||
              'Failed to update note',
          );
        }

        const updatedNote =
          mapBackendNote(
            response.data.data,
          );

        setNotes((current) =>
          current.map((note) =>
            note.id === noteId
              ? updatedNote
              : note,
          ),
        );

        return updatedNote;
      } catch (error) {
        if (isAxiosError(error)) {
          console.error(
            '==============================',
          );

          console.error(
            'UPDATE NOTE ERROR',
          );

          console.error(
            'URL:',
            `${error.config?.baseURL ?? ''}${error.config?.url ?? ''}`,
          );

          console.error(
            'METHOD:',
            error.config?.method,
          );

          console.error(
            'STATUS:',
            error.response?.status,
          );

          console.error(
            'RESPONSE:',
            error.response?.data,
          );

          console.error(
            'NOTE ID:',
            noteId,
          );

          console.error(
            'UPDATES:',
            updates,
          );

          console.error(
            '==============================',
          );
        } else {
          console.error(
            'Update note error:',
            error,
          );
        }

        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  /**
   * =========================================================
   * DELETE NOTE
   * =========================================================
   */

  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      try {
        if (!noteId) {
          return false;
        }

        await api.delete(
          `/api/notes/${noteId}`,
        );

        setNotes((current) =>
          current.filter(
            (note) =>
              note.id !== noteId,
          ),
        );

        if (
          editingNoteId === noteId
        ) {
          setEditingNoteId(null);
          setIsEditorModalOpen(false);
        }

        triggerSuccessHaptic();

        return true;
      } catch (error) {
        console.error(
          'Delete note error:',
          error,
        );

        Alert.alert(
          'Delete Failed',
          'Unable to delete the note.',
        );

        return false;
      }
    },
    [editingNoteId],
  );

  /**
   * =========================================================
   * FAVORITE
   * =========================================================
   */

  const handleFavoriteToggle = useCallback(
    async (note: Note) => {
      const updatedNote =
        await updateNote(
          note.id,
          {
            isFavorite:
              !note.isFavorite,
          },
        );

      if (updatedNote) {
        triggerSuccessHaptic();
      }
    },
    [updateNote],
  );

  /**
   * =========================================================
   * PIN
   * =========================================================
   */

  const handlePinToggle = useCallback(
    async (note: Note) => {
      const updatedNote =
        await updateNote(
          note.id,
          {
            isPinned:
              !note.isPinned,
          },
        );

      if (updatedNote) {
        triggerSuccessHaptic();
      }
    },
    [updateNote],
  );

  /**
   * =========================================================
   * ARCHIVE
   * =========================================================
   */

  const handleArchiveToggle =
    useCallback(
      async (note: Note) => {
        const updatedNote =
          await updateNote(
            note.id,
            {
              isArchived:
                !note.isArchived,
            },
          );

        if (updatedNote) {
          triggerSuccessHaptic();
        }
      },
      [updateNote],
    );

  /**
   * =========================================================
   * OPEN NEW NOTE
   * =========================================================
   */

  const handleOpenNewNote =
    useCallback(() => {
      setIsFabMenuOpen(false);

      setEditingNoteId(null);
      setEditorTitle('');
      setEditorContent('');
      setEditorCategory('General');
      setEditorTags([]);
      setEditorIsFavorite(false);
      setEditorIsPinned(false);
      setEditorIsArchived(false);

      setIsEditorModalOpen(true);
    }, []);

  /**
   * =========================================================
   * OPEN EXISTING NOTE
   * =========================================================
   */

  const handleOpenNote = useCallback(
    (note: Note) => {
      /*
       * IMPORTANT:
       * Always store note.id here.
       * Never use note.title as editingNoteId.
       */

      setEditingNoteId(note.id);

      setEditorTitle(note.title);
      setEditorContent(note.content);
      setEditorCategory(
        note.category,
      );
      setEditorTags(note.tags ?? []);
      setEditorIsFavorite(
        note.isFavorite,
      );
      setEditorIsPinned(
        note.isPinned,
      );
      setEditorIsArchived(
        note.isArchived,
      );

      setIsEditorModalOpen(true);
    },
    [],
  );

  /**
   * =========================================================
   * SAVE CURRENT NOTE
   * =========================================================
   */

  const saveCurrentNote =
    useCallback(async () => {
      const cleanTitle =
        editorTitle.trim();

      const cleanContent =
        editorContent;

      if (
        !cleanTitle &&
        !cleanContent.trim()
      ) {
        return null;
      }

      if (editingNoteId) {
        /*
         * Existing note:
         * editingNoteId MUST be UUID.
         */

        return updateNote(
          editingNoteId,
          {
            title:
              cleanTitle ||
              'Untitled Note',
            content: cleanContent,
            category:
              editorCategory ||
              'General',
            tags: editorTags,
            isFavorite:
              editorIsFavorite,
            isPinned:
              editorIsPinned,
            isArchived:
              editorIsArchived,
          },
        );
      }

      return createNote(
        cleanTitle ||
          'Untitled Note',
        cleanContent,
        editorCategory ||
          'General',
        editorTags,
        editorIsFavorite,
        editorIsPinned,
        editorIsArchived,
      );
    }, [
      editorTitle,
      editorContent,
      editorCategory,
      editorTags,
      editorIsFavorite,
      editorIsPinned,
      editorIsArchived,
      editingNoteId,
      updateNote,
      createNote,
    ]);

  /**
   * =========================================================
   * AUTO SAVE
   * =========================================================
   */

  useEffect(() => {
    if (!isEditorModalOpen) {
      return;
    }

    if (!editingNoteId) {
      return;
    }

    if (
      !editorTitle.trim() &&
      !editorContent.trim()
    ) {
      return;
    }

    if (autoSaveTimer.current) {
      clearTimeout(
        autoSaveTimer.current,
      );
    }

    autoSaveTimer.current =
      setTimeout(() => {
        updateNote(
          editingNoteId,
          {
            title:
              editorTitle.trim() ||
              'Untitled Note',
            content:
              editorContent,
            category:
              editorCategory ||
              'General',
            tags: editorTags,
            isFavorite:
              editorIsFavorite,
            isPinned:
              editorIsPinned,
            isArchived:
              editorIsArchived,
          },
        );
      }, 600);

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(
          autoSaveTimer.current,
        );
      }
    };
  }, [
    editorTitle,
    editorContent,
    editorCategory,
    editorTags,
    editorIsFavorite,
    editorIsPinned,
    editorIsArchived,
    editingNoteId,
    isEditorModalOpen,
    updateNote,
  ]);

  /**
   * =========================================================
   * CLOSE EDITOR
   * =========================================================
   */

  const handleCloseEditor =
    useCallback(async () => {
      if (autoSaveTimer.current) {
        clearTimeout(
          autoSaveTimer.current,
        );
      }

      await saveCurrentNote();

      setIsEditorModalOpen(false);
      setEditingNoteId(null);

      setEditorTitle('');
      setEditorContent('');
      setEditorCategory('General');
      setEditorTags([]);
      setEditorIsFavorite(false);
      setEditorIsPinned(false);
      setEditorIsArchived(false);
    }, [saveCurrentNote]);

  /**
   * =========================================================
   * QUICK JOT
   * =========================================================
   */

  const handleOpenQuickNote =
    useCallback(() => {
      setIsFabMenuOpen(false);

      setEditingNoteId(null);

      setEditorTitle('');
      setEditorContent('');
      setEditorCategory('Quick Jot');
      setEditorTags([]);
      setEditorIsFavorite(false);
      setEditorIsPinned(false);
      setEditorIsArchived(false);

      setIsEditorModalOpen(true);
    }, []);

  /**
   * =========================================================
   * TEMPLATE
   * =========================================================
   */

  const handleOpenTemplate =
    useCallback(
      (
        title: string,
        content: string,
        category: string,
      ) => {
        setIsTemplateModalOpen(false);
        setIsFabMenuOpen(false);

        setEditingNoteId(null);

        setEditorTitle(title);
        setEditorContent(content);
        setEditorCategory(
          category || 'General',
        );
        setEditorTags([]);
        setEditorIsFavorite(false);
        setEditorIsPinned(false);
        setEditorIsArchived(false);

        setIsEditorModalOpen(true);
      },
      [],
    );

  /**
   * =========================================================
   * CONVERT NOTE TO TASK
   * =========================================================
   */

  const handleConvertNoteToTask =
    useCallback(async () => {
      if (!editingNoteId) {
        return false;
      }

      try {
        const title =
          editorTitle.trim() ||
          'Untitled Task';

        const response =
          await api.post(
            '/api/tasks',
            {
              title,
              description:
                editorContent,
              subject:
                editorCategory ||
                'General',
              priority:
                taskPriorityInput,
              dueDate:
                dueDate || undefined,
              dueTime:
                '18:00',
              completed: false,
              hasReminder: false,
              subTasks: [],
            },
          );

        if (
          response.data?.success === false
        ) {
          throw new Error(
            response.data?.message ||
              'Failed to convert note',
          );
        }

        setIsConvertTaskModalOpen(
          false,
        );

        Alert.alert(
          'Task Created',
          'The note has been converted into a task.',
        );

        triggerSuccessHaptic();

        return true;
      } catch (error) {
        console.error(
          'Convert note to task error:',
          error,
        );

        Alert.alert(
          'Conversion Failed',
          'Unable to convert this note into a task.',
        );

        return false;
      }
    }, [
      editingNoteId,
      editorTitle,
      editorContent,
      editorCategory,
      taskPriorityInput,
      dueDate,
    ]);

  /**
   * =========================================================
   * LINK TO SCHEDULE / TASK
   * =========================================================
   */

  const handleLinkToSchedule =
    useCallback(async () => {
      if (!linkTaskTitle.trim()) {
        Alert.alert(
          'Missing Title',
          'Please enter a task title.',
        );

        return false;
      }

      try {
        await api.post(
          '/api/tasks',
          {
            title:
              linkTaskTitle.trim(),
            description:
              editorContent,
            subject:
              editorCategory ||
              'General',
            priority: 'Medium',
            dueDate:
              dueDate || undefined,
            dueTime:
              '18:00',
            completed: false,
            hasReminder: false,
            subTasks: [],
          },
        );

        setIsScheduleModalOpen(
          false,
        );

        setLinkTaskTitle('');

        Alert.alert(
          'Added to Schedule',
          'The note has been linked to your schedule.',
        );

        triggerSuccessHaptic();

        return true;
      } catch (error) {
        console.error(
          'Link note to schedule error:',
          error,
        );

        Alert.alert(
          'Failed',
          'Unable to link the note to your schedule.',
        );

        return false;
      }
    }, [
      linkTaskTitle,
      editorContent,
      editorCategory,
      dueDate,
    ]);

  /**
   * =========================================================
   * SHARE NOTE
   * =========================================================
   */

  const handleShareNote =
    useCallback(async (note: Note) => {
      try {
        await Share.share({
          title:
            note.title ||
            'GabAi Note',
          message:
            `${note.title}\n\n${note.content}`,
        });
      } catch (error) {
        console.error(
          'Share note error:',
          error,
        );
      }
    }, []);

  /**
   * =========================================================
   * REFRESH
   * =========================================================
   */

  const refreshNotes =
    useCallback(async () => {
      await fetchNotes();
    }, [fetchNotes]);

  /**
   * =========================================================
   * RETURN
   * =========================================================
   */

  return {
    // Data
    notes,
    filteredNotes,

    // Loading
    isLoading,
    isSaving,

    // Counts
    totalNotes,
    pinnedNotes,
    favoriteNotes,
    archivedNotes,

    // Search
    searchQuery,
    setSearchQuery,

    // Filters
    activeFilter,
    setActiveFilter,

    selectedCategory,
    setSelectedCategory,

    selectedTag,
    setSelectedTag,

    // Sort
    sortOption,
    setSortOption,

    // View
    viewMode,
    setViewMode,

    // FAB
    isFabMenuOpen,
    setIsFabMenuOpen,

    // Modals
    isTemplateModalOpen,
    setIsTemplateModalOpen,

    isEditorModalOpen,
    setIsEditorModalOpen,

    isConvertTaskModalOpen,
    setIsConvertTaskModalOpen,

    isScheduleModalOpen,
    setIsScheduleModalOpen,

    isFilterSortSheetOpen,
    setIsFilterSortSheetOpen,

    // Editor
    editingNoteId,

    editorTitle,
    setEditorTitle,

    editorContent,
    setEditorContent,

    editorCategory,
    setEditorCategory,

    editorTags,
    setEditorTags,

    editorIsFavorite,
    setEditorIsFavorite,

    editorIsPinned,
    setEditorIsPinned,

    editorIsArchived,
    setEditorIsArchived,

    // Task conversion
    taskPriorityInput,
    setTaskPriorityInput,

    taskCategoryInput,
    setTaskCategoryInput,

    dueDate,
    setDueDate,

    // Schedule
    linkTaskTitle,
    setLinkTaskTitle,

    // API operations
    fetchNotes,
    refreshNotes,
    createNote,
    updateNote,
    handleDeleteNote,

    // Note actions
    handleFavoriteToggle,
    handlePinToggle,
    handleArchiveToggle,

    // Editor actions
    handleOpenNewNote,
    handleOpenNote,
    handleOpenQuickNote,
    handleOpenTemplate,
    saveCurrentNote,
    handleCloseEditor,

    // Task / schedule
    handleConvertNoteToTask,
    handleLinkToSchedule,

    // Share
    handleShareNote,
  };
}