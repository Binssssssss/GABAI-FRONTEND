import { SettingSection } from '../types';

export const PROFILE_SECTIONS: SettingSection[] = [
  {
    id: 'preferences',
    title: 'PREFERENCES',
    items: [
      {
        id: 'notifications',
        title: 'Notification Settings',
        icon: 'bell',
        iconType: 'feather',
        route: '/settings/notifications',
      },
      {
        id: 'privacy',
        title: 'Privacy & Security',
        icon: 'lock',
        iconType: 'feather',
        route: '/settings/privacy',
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
