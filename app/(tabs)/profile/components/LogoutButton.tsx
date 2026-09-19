import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { profileStyles as styles } from '../styles/profile.styles';

interface LogoutButtonProps {
  onLogout: () => void;
  errorRed: string;
}

export default function LogoutButton({ onLogout, errorRed }: LogoutButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.logoutButton, { borderColor: errorRed }]}
      onPress={onLogout}
      activeOpacity={0.8}
    >
      <Feather name="log-out" size={18} color={errorRed} style={{ marginRight: 8 }} />
      <Text style={[styles.logoutButtonText, { color: errorRed }]}>Log Out of GabAi</Text>
    </TouchableOpacity>
  );
}
