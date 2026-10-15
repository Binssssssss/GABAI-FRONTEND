import React from 'react';
import { View, Text } from 'react-native';
import DefaultAvatar from '@/components/DefaultAvatar';
import { UserProfile } from '../types';
import { profileStyles as styles } from '../styles/profile.styles';

interface UserProfileCardProps {
  userProfile: UserProfile;
  cardTheme: string;
  borderTheme: string;
  textTheme: string;
  textSubTheme: string;
  /** Kept so callers don't need to change; the avatar is always the default one. */
  primaryAccent?: string;
}

export default function UserProfileCard({
  userProfile,
  cardTheme,
  borderTheme,
  textTheme,
  textSubTheme,
}: UserProfileCardProps) {
  return (
    <View
      style={[styles.profileCard, { backgroundColor: cardTheme, borderColor: borderTheme }]}
    >
      <View style={{ marginRight: 16 }}>
        <DefaultAvatar name={userProfile.name} size={64} />
      </View>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: textTheme }]}>{userProfile.name}</Text>
        <Text style={[styles.userEmail, { color: textSubTheme }]}>{userProfile.email}</Text>
      </View>
    </View>
  );
}
