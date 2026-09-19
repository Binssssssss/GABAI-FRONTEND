import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

interface FooterProps {
  textSecondary: string;
  version?: string;
}

export default function Footer({
  textSecondary,
  version = 'GabAi Dashboard v1.0.0',
}: FooterProps) {
  return (
    <View style={styles.footer}>
      <Text style={[styles.footerText, { color: textSecondary }]}>{version}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  footerText: {
    fontSize: 11,
  },
});
