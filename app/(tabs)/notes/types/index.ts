import { Note } from '@/app/services/localDb';

export type { Note };

export type NoteFilterTab = 'all' | 'pinned' | 'favorites' | 'archived';

export type NoteSortOption = 'recent_edit' | 'recent_create' | 'title' | 'category';

export type NoteViewMode = 'grid' | 'list';

export interface NoteCategoryItem {
  name: string;
  icon: string;
  color: string;
}

export interface NoteTemplateItem {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
}

export interface NotesTheme {
  isDark: boolean;
  primaryBrown: string;
  successGreen: string;
  bgTheme: string;
  textPrimary: string;
  textSecondary: string;
  cardBg: string;
  borderCol: string;
  inputBg: string;
}
