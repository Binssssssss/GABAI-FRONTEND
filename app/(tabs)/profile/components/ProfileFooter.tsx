import React from 'react';
import { View, Text } from 'react-native';
import { profileStyles as styles } from '../styles/profile.styles';

interface ProfileFooterProps {
  textSubTheme: string;
}

export default function ProfileFooter({ textSubTheme }: ProfileFooterProps) {
  return (
    <View style={styles.footer}>
      <Text style={[styles.footerText, { color: textSubTheme }]}>GabAi App v1.0.0</Text>
      <Text style={[styles.footerText, { color: textSubTheme, marginTop: 4 }]}>
        Offline Student Productivity Platform
      </Text>
    </View>
  );
}
