import api from './api';

export interface ApiNote {
  id: string;
  title: string;
  content: string;
  type?: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string | number;
  updatedAt: string | number;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  total?: number;
}

function normalizeNote(note: ApiNote): ApiNote & {
  createdAt: number;
  updatedAt: number;
} {
  return {
    ...note,
    tags: Array.isArray(note.tags) ? note.tags : [],
    isFavorite: Boolean(note.isFavorite),
    isPinned: Boolean(note.isPinned),
    isArchived: Boolean(note.isArchived),
    createdAt: new Date(note.createdAt).getTime(),
    updatedAt: new Date(note.updatedAt).getTime(),
  };
}

export async function fetchNotes(): Promise<
  ReturnType<typeof normalizeNote>[]
> {
  const response = await api.get<ApiResponse<ApiNote[]>>('/notes');

  return (response.data.data ?? []).map(normalizeNote);
}

export async function createNote(data: {
  title: string;
  content: string;
  category: string;
  tags: string[];
}): Promise<ReturnType<typeof normalizeNote>> {
  const response = await api.post<ApiResponse<ApiNote>>('/notes', {
    ...data,
    type: 'BLANK',
  });

  return normalizeNote(response.data.data);
}

export async function updateNote(
  id: string,
  data: Partial<{
    title: string;
    content: string;
    category: string;
    tags: string[];
    isFavorite: boolean;
    isPinned: boolean;
    isArchived: boolean;
  }>,
): Promise<ReturnType<typeof normalizeNote>> {
  const response = await api.patch<ApiResponse<ApiNote>>(
    `/notes/${encodeURIComponent(id)}`,
    data,
  );

  return normalizeNote(response.data.data);
}

export async function deleteNote(id: string): Promise<void> {
  await api.delete(`/notes/${encodeURIComponent(id)}`);
}

export async function setNotePinned(
  id: string,
  isPinned: boolean,
): Promise<ReturnType<typeof normalizeNote>> {
  const response = await api.patch<ApiResponse<ApiNote>>(
    `/notes/${encodeURIComponent(id)}/pin`,
    { isPinned },
  );

  return normalizeNote(response.data.data);
}

export async function setNoteFavorite(
  id: string,
  isFavorite: boolean,
): Promise<ReturnType<typeof normalizeNote>> {
  const response = await api.patch<ApiResponse<ApiNote>>(
    `/notes/${encodeURIComponent(id)}/favorite`,
    { isFavorite },
  );

  return normalizeNote(response.data.data);
}

export async function setNoteArchived(
  id: string,
  isArchived: boolean,
): Promise<ReturnType<typeof normalizeNote>> {
  const response = await api.patch<ApiResponse<ApiNote>>(
    `/notes/${encodeURIComponent(id)}/${isArchived ? 'archive' : 'unarchive'}`,
  );

  return normalizeNote(response.data.data);
}