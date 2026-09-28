import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { Alert, Share } from 'react-native';
import * as Haptics from 'expo-haptics';

import api from '@/app/services/api';
import { Task } from '@/app/services/localDb';

import {
  NoteFilterTab,
  NoteSortOption,
  NoteViewMode,
} from '../types';

import { triggerHaptic } from '../utils/noteHelpers';

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

export interface AppNote {
  id: string;
  title: string;
  content: string;
  type: string;
  category: string;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
  userId: string;
}

const mapBackendNote = (
  note: BackendNote,
): AppNote => ({
  id: note.id,
  title: note.title,
  content: note.content,
  type: note.type,
  category: note.category,
  tags: note.tags || [],
  isPinned: note.isPinned,
  isFavorite: note.isFavorite,
  isArchived: note.isArchived,
  createdAt: new Date(
    note.createdAt,
  ).getTime(),
  updatedAt: new Date(
    note.updatedAt,
  ).getTime(),
  userId: note.userId,
});

export function useNotesData() {
  // ============================================================
  // NOTES DATABASE STATE
  // ============================================================

  const [notes, setNotes] =
    useState<AppNote[]>([]);

  const [isLoadingNotes, setIsLoadingNotes] =
    useState(true);

  const [notesError, setNotesError] =
    useState<string | null>(null);

  // ============================================================
  // FETCH NOTES
  // ============================================================

  const fetchNotes = useCallback(
    async () => {
      try {
        setNotesError(null);

        const response =
          await api.get<NotesApiResponse>(
            '/api/notes',
          );

        if (response.data.success) {
          const mappedNotes =
            response.data.data.map(
              mapBackendNote,
            );

          setNotes(mappedNotes);
        }
      } catch (error) {
        console.error(
          'Failed to fetch notes:',
          error,
        );

        setNotesError(
          'Failed to load notes.',
        );
      } finally {
        setIsLoadingNotes(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // ============================================================
  // FILTER & SEARCH STATES
  // ============================================================

  const [searchQuery, setSearchQuery] =
    useState('');

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState('All');

  const [
    activeTabFilter,
    setActiveTabFilter,
  ] = useState<NoteFilterTab>('all');

  const [
    selectedTag,
    setSelectedTag,
  ] = useState<string | null>(null);

  const [sortBy, setSortBy] =
    useState<NoteSortOption>(
      'recent_edit',
    );

  const [viewMode, setViewMode] =
    useState<NoteViewMode>('grid');

  // ============================================================
  // BOTTOM SHEETS & POPUPS
  // ============================================================

  const [
    isFilterSheetOpen,
    setIsFilterSheetOpen,
  ] = useState(false);

  const [
    isFabMenuOpen,
    setIsFabMenuOpen,
  ] = useState(false);

  const [
    isEditorMoreMenuOpen,
    setIsEditorMoreMenuOpen,
  ] = useState(false);

  const [
    isTemplateModalOpen,
    setIsTemplateModalOpen,
  ] = useState(false);

  // ============================================================
  // EDITOR STATE
  // ============================================================

  const [
    isEditorOpen,
    setIsEditorOpen,
  ] = useState(false);

  const [
    editingNoteId,
    setEditingNoteId,
  ] = useState<string | null>(null);

  const [editorTitle, setEditorTitle] =
    useState('');

  const [
    editorContent,
    setEditorContent,
  ] = useState('');

  const [
    editorCategory,
    setEditorCategory,
  ] = useState('School');

  const [
    editorTags,
    setEditorTags,
  ] = useState<string[]>([]);

  const [
    editorTagInput,
    setEditorTagInput,
  ] = useState('');

  const [
    editorIsFavorite,
    setEditorIsFavorite,
  ] = useState(false);

  const [
    editorIsPinned,
    setEditorIsPinned,
  ] = useState(false);

  const [
    editorIsArchived,
    setEditorIsArchived,
  ] = useState(false);

  const [saveStatus, setSaveStatus] =
    useState<'saved' | 'saving'>(
      'saved',
    );

  const [
    isPreviewMode,
    setIsPreviewMode,
  ] = useState(false);

  // ============================================================
  // UNDO / REDO
  // ============================================================

  const historyRef = useRef<string[]>([]);

  const historyIndexRef =
    useRef<number>(-1);

  // ============================================================
  // AUTOSAVE
  // ============================================================

  const autoSaveTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

  const isSavingRef =
    useRef(false);

  // ============================================================
  // CONVERT TO TASK
  // ============================================================

  const [
    convertTaskModalOpen,
    setConvertTaskModalOpen,
  ] = useState(false);

  const [
    convertTargetNote,
    setConvertTargetNote,
  ] = useState<AppNote | null>(null);

  const [
    taskSubjectInput,
    setTaskSubjectInput,
  ] = useState('General');

  const [
    taskPriorityInput,
    setTaskPriorityInput,
  ] = useState<Task['priority']>(
    'Medium',
  );

  const [
    taskCategoryInput,
    setTaskCategoryInput,
  ] = useState<Task['category']>(
    'Academic',
  );

  // ============================================================
  // CONVERT NOTE TO TASK
  // ============================================================

  const handleConvertNoteToTask =
    useCallback(async () => {
      if (!convertTargetNote) {
        Alert.alert(
          'No Note Selected',
          'Please select a note first.',
        );

        return false;
      }

      try {
        triggerHaptic(
          Haptics.ImpactFeedbackStyle.Medium,
        );

        const title =
          `Review Note: ${convertTargetNote.title}`;

        const description =
          convertTargetNote.content.slice(
            0,
            200,
          );

        const subject =
          taskSubjectInput.trim() ||
          convertTargetNote.category ||
          'General';

        const dueDate = new Date(
          Date.now() +
            86400000 * 2,
        )
          .toISOString()
          .split('T')[0];

        const response =
          await api.post(
            '/api/tasks',
            {
              title,
              description,
              subject,
              priority:
                taskPriorityInput,
              category:
                taskCategoryInput,
              difficulty: 'Medium',
              duration: 1.0,
              dueDate,
              dueTime: '18:00',
              completed: false,
              hasReminder: false,
              repeat: 'None',
              isPinned: false,
              isFavorite: false,
              attachments: 0,
              subTasks: [],
            },
          );

        if (!response.data?.success) {
          throw new Error(
            response.data?.message ||
              'Failed to create task',
          );
        }

        Alert.alert(
          'Task Created',
          'The note has been converted into a task successfully.',
        );

        setConvertTaskModalOpen(false);

        setConvertTargetNote(null);

        return true;
      } catch (error) {
        console.error(
          'Convert note to task error:',
          error,
        );

        Alert.alert(
          'Create Task Failed',
          'Unable to create the task. Please try again.',
        );

        return false;
      }
    }, [
      convertTargetNote,
      taskSubjectInput,
      taskPriorityInput,
      taskCategoryInput,
    ]);

  // ============================================================
  // LINK TO SCHEDULE
  // ============================================================

  const [
    scheduleModalOpen,
    setScheduleModalOpen,
  ] = useState(false);

  const [
    scheduleTargetNote,
    setScheduleTargetNote,
  ] = useState<AppNote | null>(
    null,
  );

  const [
    scheduleDateInput,
    setScheduleDateInput,
  ] = useState(
    () =>
      new Date()
        .toISOString()
        .split('T')[0],
  );

  const [
    scheduleTimeInput,
    setScheduleTimeInput,
  ] = useState('14:00');

  // ============================================================
  // UNIQUE TAGS
  // ============================================================

  const allUniqueTags = useMemo(() => {
    const tagSet =
      new Set<string>();

    notes.forEach((note) => {
      if (!note.isArchived) {
        note.tags?.forEach((tag) => {
          tagSet.add(tag);
        });
      }
    });

    return Array.from(tagSet);
  }, [notes]);

  // ============================================================
  // ACTIVE CUSTOM FILTER COUNT
  // ============================================================

  const activeCustomFiltersCount =
    useMemo(() => {
      let count = 0;

      if (
        selectedCategory !== 'All'
      ) {
        count++;
      }

      if (selectedTag !== null) {
        count++;
      }

      if (
        sortBy !== 'recent_edit'
      ) {
        count++;
      }

      return count;
    }, [
      selectedCategory,
      selectedTag,
      sortBy,
    ]);

  // ============================================================
  // FILTERED & SORTED NOTES
  // ============================================================

  const filteredNotes =
    useMemo(() => {
      return notes
        .filter((note) => {
          // ----------------------------
          // Tab Filter
          // ----------------------------

          if (
            activeTabFilter ===
            'archived'
          ) {
            if (!note.isArchived) {
              return false;
            }
          } else {
            if (note.isArchived) {
              return false;
            }

            if (
              activeTabFilter ===
                'pinned' &&
              !note.isPinned
            ) {
              return false;
            }

            if (
              activeTabFilter ===
                'favorites' &&
              !note.isFavorite
            ) {
              return false;
            }
          }

          // ----------------------------
          // Category
          // ----------------------------

          if (
            selectedCategory !==
              'All' &&
            note.category !==
              selectedCategory
          ) {
            return false;
          }

          // ----------------------------
          // Tag
          // ----------------------------

          if (
            selectedTag &&
            (!note.tags ||
              !note.tags.includes(
                selectedTag,
              ))
          ) {
            return false;
          }

          // ----------------------------
          // Search
          // ----------------------------

          if (searchQuery.trim()) {
            const q =
              searchQuery
                .toLowerCase()
                .trim();

            const matchTitle =
              note.title
                ?.toLowerCase()
                .includes(q);

            const matchContent =
              note.content
                ?.toLowerCase()
                .includes(q);

            const matchCategory =
              note.category
                ?.toLowerCase()
                .includes(q);

            const matchTags =
              note.tags?.some(
                (tag) =>
                  tag
                    .toLowerCase()
                    .includes(q),
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
          if (
            sortBy ===
            'recent_edit'
          ) {
            return (
              b.updatedAt -
              a.updatedAt
            );
          }

          if (
            sortBy ===
            'recent_create'
          ) {
            return (
              b.createdAt -
              a.createdAt
            );
          }

          if (
            sortBy === 'title'
          ) {
            return a.title.localeCompare(
              b.title,
            );
          }

          if (
            sortBy ===
            'category'
          ) {
            return a.category.localeCompare(
              b.category,
            );
          }

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

  // ============================================================
  // PINNED / UNPINNED
  // ============================================================

  const pinnedNotes =
    useMemo(() => {
      if (
        activeTabFilter ===
          'archived' ||
        activeTabFilter ===
          'pinned'
      ) {
        return [];
      }

      return filteredNotes.filter(
        (note) => note.isPinned,
      );
    }, [
      filteredNotes,
      activeTabFilter,
    ]);

  const unpinnedNotes =
    useMemo(() => {
      if (
        activeTabFilter ===
          'archived' ||
        activeTabFilter ===
          'pinned'
      ) {
        return filteredNotes;
      }

      return filteredNotes.filter(
        (note) => !note.isPinned,
      );
    }, [
      filteredNotes,
      activeTabFilter,
    ]);

  // ============================================================
  // CREATE NOTE
  // ============================================================

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
        const cleanTitle =
          title.trim() ||
          'Untitled Note';

        const response =
          await api.post<NoteApiResponse>(
            '/api/notes',
            {
              title: cleanTitle,
              content,
              type: 'BLANK',
              category,
              tags,
              isFavorite,
              isPinned,
              isArchived,
            },
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
      }
    },
    [],
  );

  // ============================================================
  // UPDATE NOTE
  // ============================================================

  const updateNote = useCallback(
    async (
      noteId: string,
      updates: {
        title?: string;
        content?: string;
        category?: string;
        tags?: string[];
        isFavorite?: boolean;
        isPinned?: boolean;
        isArchived?: boolean;
      },
    ) => {
      try {
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
        console.error(
          'Update note error:',
          error,
        );

        return null;
      }
    },
    [],
  );

  // ============================================================
  // SAVE CURRENT NOTE
  // ============================================================

  const saveCurrentNote =
    useCallback(
      async (
        title = editorTitle,
        content = editorContent,
        category = editorCategory,
        tags = editorTags,
        isFav = editorIsFavorite,
        isPin = editorIsPinned,
        isArch = editorIsArchived,
      ) => {
        if (
          !title.trim() &&
          !content.trim()
        ) {
          return;
        }

        if (isSavingRef.current) {
          return;
        }

        isSavingRef.current = true;

        setSaveStatus('saving');

        try {
          // ----------------------------
          // CREATE
          // ----------------------------

          if (!editingNoteId) {
            await createNote(
              title,
              content,
              category,
              tags,
              isFav,
              isPin,
              isArch,
            );

            setSaveStatus('saved');

            return;
          }

          // ----------------------------
          // UPDATE
          // ----------------------------

          await updateNote(
            editingNoteId,
            {
              title:
                title.trim() ||
                'Untitled Note',
              content,
              category,
              tags,
              isFavorite: isFav,
              isPinned: isPin,
              isArchived: isArch,
            },
          );

          setSaveStatus('saved');
        } finally {
          isSavingRef.current =
            false;
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
        editingNoteId,
        createNote,
        updateNote,
      ],
    );

  // ============================================================
  // OPEN NEW NOTE
  // ============================================================

  const handleOpenNewNote =
    useCallback(
      (
        category = 'School',
        templateContent?: string,
        templateTitle?: string,
      ) => {
        triggerHaptic(
          Haptics.ImpactFeedbackStyle.Medium,
        );

        setIsFabMenuOpen(false);

        setEditingNoteId(null);

        setEditorTitle(
          templateTitle || '',
        );

        setEditorContent(
          templateContent || '',
        );

        setEditorCategory(
          category,
        );

        setEditorTags([]);

        setEditorTagInput('');

        setEditorIsFavorite(false);

        setEditorIsPinned(false);

        setEditorIsArchived(false);

        setSaveStatus('saved');

        setIsPreviewMode(false);

        historyRef.current = [
          templateContent || '',
        ];

        historyIndexRef.current = 0;

        setIsEditorOpen(true);
      },
      [],
    );

  // ============================================================
  // QUICK NOTE
  // ============================================================

  const handleOpenQuickNote =
    useCallback(() => {
      const timeString =
        new Date().toLocaleTimeString(
          [],
          {
            hour: '2-digit',
            minute: '2-digit',
          },
        );

      const dateString =
        new Date().toLocaleDateString(
          [],
          {
            month: 'short',
            day: 'numeric',
          },
        );

      handleOpenNewNote(
        'Ideas',
        `## Quick Jot (${timeString})\n- `,
        `Quick Note - ${dateString}`,
      );
    }, [
      handleOpenNewNote,
    ]);

  // ============================================================
  // OPEN EXISTING NOTE
  // ============================================================

  const handleOpenNote =
    useCallback(
      (note: AppNote) => {
        triggerHaptic();

        setEditingNoteId(
          note.id,
        );

        setEditorTitle(
          note.title,
        );

        setEditorContent(
          note.content,
        );

        setEditorCategory(
          note.category,
        );

        setEditorTags(
          note.tags || [],
        );

        setEditorTagInput('');

        setEditorIsFavorite(
          note.isFavorite,
        );

        setEditorIsPinned(
          note.isPinned,
        );

        setEditorIsArchived(
          note.isArchived,
        );

        setSaveStatus('saved');

        setIsPreviewMode(false);

        historyRef.current = [
          note.content,
        ];

        historyIndexRef.current = 0;

        setIsEditorOpen(true);
      },
      [],
    );

  // ============================================================
  // CONTENT CHANGE
  // ============================================================

  const handleContentChange =
    useCallback(
      (newContent: string) => {
        setEditorContent(
          newContent,
        );

        setSaveStatus('saving');

        if (
          historyIndexRef.current <
          historyRef.current.length -
            1
        ) {
          historyRef.current =
            historyRef.current.slice(
              0,
              historyIndexRef.current +
                1,
            );
        }

        if (
          historyRef.current[
            historyRef.current.length -
              1
          ] !== newContent
        ) {
          historyRef.current.push(
            newContent,
          );

          historyIndexRef.current =
            historyRef.current.length -
            1;
        }

        if (
          autoSaveTimerRef.current
        ) {
          clearTimeout(
            autoSaveTimerRef.current,
          );
        }

        autoSaveTimerRef.current =
          setTimeout(() => {
            saveCurrentNote(
              editorTitle,
              newContent,
            );
          }, 600);
      },
      [
        editorTitle,
        saveCurrentNote,
      ],
    );

  // ============================================================
  // TITLE CHANGE
  // ============================================================

  const handleTitleChange =
    useCallback(
      (newTitle: string) => {
        setEditorTitle(
          newTitle,
        );

        setSaveStatus('saving');

        if (
          autoSaveTimerRef.current
        ) {
          clearTimeout(
            autoSaveTimerRef.current,
          );
        }

        autoSaveTimerRef.current =
          setTimeout(() => {
            saveCurrentNote(
              newTitle,
              editorContent,
            );
          }, 600);
      },
      [
        editorContent,
        saveCurrentNote,
      ],
    );

  // ============================================================
  // CLOSE EDITOR
  // ============================================================

  const handleCloseEditor =
    useCallback(() => {
      triggerHaptic();

      if (
        autoSaveTimerRef.current
      ) {
        clearTimeout(
          autoSaveTimerRef.current,
        );
      }

      if (
        editorTitle.trim() ||
        editorContent.trim()
      ) {
        saveCurrentNote();
      }

      setIsEditorOpen(false);

      setIsEditorMoreMenuOpen(false);
    }, [
      editorTitle,
      editorContent,
      saveCurrentNote,
    ]);

  // ============================================================
  // FORMATTING
  // ============================================================

  const insertFormatting =
    useCallback(
      (
        prefix: string,
        suffix = '',
        placeholder = '',
      ) => {
        triggerHaptic();

        const updated =
          editorContent +
          `\n${prefix}${placeholder}${suffix}`;

        handleContentChange(
          updated,
        );
      },
      [
        editorContent,
        handleContentChange,
      ],
    );

  // ============================================================
  // UNDO
  // ============================================================

  const handleUndo =
    useCallback(() => {
      if (
        historyIndexRef.current >
        0
      ) {
        triggerHaptic();

        historyIndexRef.current -=
          1;

        const prevContent =
          historyRef.current[
            historyIndexRef.current
          ];

        setEditorContent(
          prevContent,
        );

        saveCurrentNote(
          editorTitle,
          prevContent,
        );
      }
    }, [
      editorTitle,
      saveCurrentNote,
    ]);

  // ============================================================
  // REDO
  // ============================================================

  const handleRedo =
    useCallback(() => {
      if (
        historyIndexRef.current <
        historyRef.current.length -
          1
      ) {
        triggerHaptic();

        historyIndexRef.current +=
          1;

        const nextContent =
          historyRef.current[
            historyIndexRef.current
          ];

        setEditorContent(
          nextContent,
        );

        saveCurrentNote(
          editorTitle,
          nextContent,
        );
      }
    }, [
      editorTitle,
      saveCurrentNote,
    ]);

  // ============================================================
  // ADD TAG
  // ============================================================

  const handleAddTag =
    useCallback(() => {
      if (
        !editorTagInput.trim()
      ) {
        return;
      }

      let tag =
        editorTagInput.trim();

      if (!tag.startsWith('#')) {
        tag = `#${tag}`;
      }

      if (
        !editorTags.includes(tag)
      ) {
        const updated = [
          ...editorTags,
          tag,
        ];

        setEditorTags(
          updated,
        );

        saveCurrentNote(
          editorTitle,
          editorContent,
          editorCategory,
          updated,
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

  // ============================================================
  // REMOVE TAG
  // ============================================================

  const handleRemoveTag =
    useCallback(
      (tagToRemove: string) => {
        const updated =
          editorTags.filter(
            (tag) =>
              tag !==
              tagToRemove,
          );

        setEditorTags(updated);

        saveCurrentNote(
          editorTitle,
          editorContent,
          editorCategory,
          updated,
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

  // ============================================================
  // DELETE NOTE
  // ============================================================

  const handleDeleteNote =
    useCallback(
      (noteId: string) => {
        Alert.alert(
          'Delete Note',
          'Are you sure you want to permanently delete this note?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Delete',
              style: 'destructive',

              onPress: async () => {
                triggerHaptic(
                  Haptics.ImpactFeedbackStyle.Medium,
                );

                try {
                  await api.delete(
                    `/api/notes/${noteId}`,
                  );

                  setNotes(
                    (current) =>
                      current.filter(
                        (note) =>
                          note.id !==
                          noteId,
                      ),
                  );

                  setIsEditorOpen(
                    false,
                  );

                  setIsEditorMoreMenuOpen(
                    false,
                  );
                } catch (error) {
                  console.error(
                    'Delete note error:',
                    error,
                  );

                  Alert.alert(
                    'Delete Failed',
                    'Unable to delete the note.',
                  );
                }
              },
            },
          ],
        );
      },
      [],
    );

  // ============================================================
  // ARCHIVE
  // ============================================================

  const handleArchiveToggle =
    useCallback(
      async (
        noteId: string,
        currentVal: boolean,
      ) => {
        triggerHaptic();

        const newValue =
          !currentVal;

        const updated =
          await updateNote(
            noteId,
            {
              isArchived:
                newValue,
            },
          );

        if (updated) {
          if (
            editingNoteId ===
            noteId
          ) {
            setEditorIsArchived(
              newValue,
            );
          }
        }
      },
      [
        editingNoteId,
        updateNote,
      ],
    );

  // ============================================================
  // FAVORITE
  // ============================================================

  const handleFavoriteToggle =
    useCallback(
      async (
        noteId: string,
        currentVal: boolean,
      ) => {
        triggerHaptic();

        const newValue =
          !currentVal;

        const updated =
          await updateNote(
            noteId,
            {
              isFavorite:
                newValue,
            },
          );

        if (updated) {
          if (
            editingNoteId ===
            noteId
          ) {
            setEditorIsFavorite(
              newValue,
            );
          }
        }
      },
      [
        editingNoteId,
        updateNote,
      ],
    );

  // ============================================================
  // PIN
  // ============================================================

  const handlePinToggle =
    useCallback(
      async (
        noteId: string,
        currentVal: boolean,
      ) => {
        triggerHaptic();

        const newValue =
          !currentVal;

        const updated =
          await updateNote(
            noteId,
            {
              isPinned:
                newValue,
            },
          );

        if (updated) {
          if (
            editingNoteId ===
            noteId
          ) {
            setEditorIsPinned(
              newValue,
            );
          }
        }
      },
      [
        editingNoteId,
        updateNote,
      ],
    );

  // ============================================================
  // DUPLICATE NOTE
  // ============================================================

  const handleDuplicateNote =
    useCallback(
      async (note: AppNote) => {
        triggerHaptic();

        await createNote(
          `${note.title} (Copy)`,
          note.content,
          note.category,
          note.tags,
          false,
          false,
          false,
        );
      },
      [createNote],
    );

  // ============================================================
  // SHARE
  // ============================================================

  const handleShareNote =
    useCallback(
      async (
        title: string,
        content: string,
      ) => {
        try {
          await Share.share({
            title,
            message:
              `${title}\n\n${content}`,
          });
        } catch {
          // Intentionally ignored
        }
      },
      [],
    );

  // ============================================================
  // APPLY TEMPLATE
  // ============================================================

  const handleApplyTemplate =
    useCallback(
      (template: {
        title: string;
        category: string;
        content: string;
      }) => {
        setIsTemplateModalOpen(
          false,
        );

        handleOpenNewNote(
          template.category,
          template.content,
          template.title,
        );
      },
      [handleOpenNewNote],
    );

  // ============================================================
  // CLEANUP AUTOSAVE TIMER
  // ============================================================

  useEffect(() => {
    return () => {
      if (
        autoSaveTimerRef.current
      ) {
        clearTimeout(
          autoSaveTimerRef.current,
        );
      }
    };
  }, []);

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // Notes
    notes,
    filteredNotes,
    pinnedNotes,
    unpinnedNotes,

    // Loading/Error
    isLoadingNotes,
    notesError,
    refreshNotes: fetchNotes,

    // Tags / Filters
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

    // Bottom sheets
    isFilterSheetOpen,
    setIsFilterSheetOpen,

    isFabMenuOpen,
    setIsFabMenuOpen,

    isEditorMoreMenuOpen,
    setIsEditorMoreMenuOpen,

    isTemplateModalOpen,
    setIsTemplateModalOpen,

    // Editor
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

    // Convert Task
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

    handleConvertNoteToTask,

    // Schedule
    scheduleModalOpen,
    setScheduleModalOpen,

    scheduleTargetNote,
    setScheduleTargetNote,

    scheduleDateInput,
    setScheduleDateInput,

    scheduleTimeInput,
    setScheduleTimeInput,

    // Actions
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