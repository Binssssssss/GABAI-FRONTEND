import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDrawer } from '@/app/(tabs)/_layout';

import {
  ProfileHeader,
  UserProfileCard,
  ProfileStatsRow,
  ProfileSettingsGroup,
  LogoutButton,
  ProfileFooter,
} from './components';
import { useProfileData, useProfileTheme } from './hooks';
import { profileStyles as styles } from './styles/profile.styles';

export default function ProfileScreen() {
  const { openDrawer } = useDrawer();
  const theme = useProfileTheme();
  const { userProfile, stats, handleLogout } = useProfileData();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgTheme }]} edges={['top']}>
      {/* 1. Header Bar */}
      <ProfileHeader onOpenDrawer={openDrawer} textTheme={theme.textTheme} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 2. User Info Card */}
        <UserProfileCard
          userProfile={userProfile}
          cardTheme={theme.cardTheme}
          borderTheme={theme.borderTheme}
          textTheme={theme.textTheme}
          textSubTheme={theme.textSubTheme}
          primaryAccent={theme.primaryAccent}
        />

        {/* 3. Live Stats Row */}
        <ProfileStatsRow
          stats={stats}
          cardTheme={theme.cardTheme}
          borderTheme={theme.borderTheme}
          textTheme={theme.textTheme}
          textSubTheme={theme.textSubTheme}
          primaryAccent={theme.primaryAccent}
        />

        {/* 4. Settings Sections */}
        <ProfileSettingsGroup
          cardTheme={theme.cardTheme}
          borderTheme={theme.borderTheme}
          textTheme={theme.textTheme}
          textSubTheme={theme.textSubTheme}
          primaryAccent={theme.primaryAccent}
        />

        {/* 5. Logout Action Button */}
        <LogoutButton onLogout={handleLogout} errorRed={theme.errorRed} />

        {/* 6. Footer Info */}
        <ProfileFooter textSubTheme={theme.textSubTheme} />
      </ScrollView>
    </SafeAreaView>
  );
}
