import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { UserProfile } from '../types';
import { profileStyles as styles } from '../styles/profile.styles';

interface UserProfileCardProps {
  userProfile: UserProfile;
  cardTheme: string;
  borderTheme: string;
  textTheme: string;
  textSubTheme: string;
  primaryAccent: string;
  /** Opens the Edit Profile screen. */
  onEdit?: () => void;
}

export default function UserProfileCard({
  userProfile,
  cardTheme,
  borderTheme,
  textTheme,
  textSubTheme,
  primaryAccent,
  onEdit,
}: UserProfileCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onEdit}
      disabled={!onEdit}
      accessibilityRole="button"
      accessibilityLabel="Edit profile"
      style={[styles.profileCard, { backgroundColor: cardTheme, borderColor: borderTheme }]}
    >
      <View style={[styles.avatarContainer, { backgroundColor: primaryAccent, overflow: 'hidden' }]}>
        {userProfile.avatar ? (
          <Image source={{ uri: userProfile.avatar }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <Text style={styles.avatarText}>{userProfile.initials}</Text>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: textTheme }]}>{userProfile.name}</Text>
        <Text style={[styles.userEmail, { color: textSubTheme }]}>{userProfile.email}</Text>
      </View>
      {onEdit && (
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: borderTheme,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Feather name="edit-2" size={16} color={textTheme} />
        </View>
      )}
    </TouchableOpacity>
  );
}
