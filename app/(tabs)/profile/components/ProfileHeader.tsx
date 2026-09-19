import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { profileStyles as styles } from '../styles/profile.styles';

interface ProfileHeaderProps {
  onOpenDrawer: () => void;
  textTheme: string;
}

export default function ProfileHeader({ onOpenDrawer, textTheme }: ProfileHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={onOpenDrawer} style={{ marginRight: 10, padding: 4 }}>
          <Feather name="menu" size={24} color={textTheme} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textTheme }]}>Profile</Text>
      </View>
    </View>
  );
}
