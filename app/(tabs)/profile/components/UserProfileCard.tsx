import React from 'react';
import { View, Text } from 'react-native';
import { UserProfile } from '../types';
import { profileStyles as styles } from '../styles/profile.styles';

interface UserProfileCardProps {
  userProfile: UserProfile;
  cardTheme: string;
  borderTheme: string;
  textTheme: string;
  textSubTheme: string;
  primaryAccent: string;
}

export default function UserProfileCard({
  userProfile,
  cardTheme,
  borderTheme,
  textTheme,
  textSubTheme,
  primaryAccent,
}: UserProfileCardProps) {
  return (
    <View style={[styles.profileCard, { backgroundColor: cardTheme, borderColor: borderTheme }]}>
      <View style={[styles.avatarContainer, { backgroundColor: primaryAccent }]}>
        <Text style={styles.avatarText}>{userProfile.initials}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: textTheme }]}>{userProfile.name}</Text>
        <Text style={[styles.userEmail, { color: textSubTheme }]}>{userProfile.email}</Text>
        <View style={[styles.badge, { backgroundColor: primaryAccent + '15' }]}>
          <Text style={[styles.badgeText, { color: primaryAccent }]}>{userProfile.course}</Text>
        </View>
      </View>
    </View>
  );
}
