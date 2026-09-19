export interface UserProfile {
  name: string;
  email: string;
  course: string;
  initials: string;
}

export interface ProfileStatItem {
  id: string;
  label: string;
  value: string;
  icon: string;
}

export interface SettingItem {
  id: string;
  title: string;
  icon: string;
  iconType?: 'feather' | 'fontawesome';
  route?: string;
  badge?: string;
}

export interface SettingSection {
  id: string;
  title: string;
  items: SettingItem[];
}

export interface ProfileTheme {
  isDark: boolean;
  primaryAccent: string;
  errorRed: string;
  bgTheme: string;
  textTheme: string;
  textSubTheme: string;
  cardTheme: string;
  borderTheme: string;
}
