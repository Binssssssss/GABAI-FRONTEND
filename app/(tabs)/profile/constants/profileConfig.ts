
import { UserProfile, SettingSection } from '../types';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Ruenz Vience B. Baylosis',
  email: 'vience@gabai.edu.ph',
  course: 'BS in Computer Science',
  initials: 'SV',
};

export const PROFILE_SECTIONS: SettingSection[] = [
  {
    id: 'academic',
    title: 'ACADEMIC SUMMARY',
    items: [
      {
        id: 'academic_progress',
        title: 'Academic Progress',
        icon: 'graduation-cap',
        iconType: 'fontawesome',
      },
      {
        id: 'grades',
        title: 'Grades & Achievements',
        icon: 'award',
        iconType: 'feather',
      },
    ],
  },
  {
    id: 'preferences',
    title: 'PREFERENCES',
    items: [
      {
        id: 'notifications',
        title: 'Notification Settings',
        icon: 'bell',
        iconType: 'feather',
      },
      {
        id: 'privacy',
        title: 'Privacy & Security',
        icon: 'lock',
        iconType: 'feather',
      },
      {
        id: 'appearance',
        title: 'Appearance',
        icon: 'moon',
        iconType: 'feather',
      },
    ],
  },
];
