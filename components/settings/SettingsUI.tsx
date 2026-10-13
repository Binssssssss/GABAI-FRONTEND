import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import type { ProfileTheme } from '@/app/(tabs)/profile/types';

type FeatherName = React.ComponentProps<typeof Feather>['name'];

export function ScreenHeader({ title, theme }: { title: string; theme: ProfileTheme }) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
        <Feather name="arrow-left" size={22} color={theme.textTheme} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: theme.textTheme }]}>{title}</Text>
    </View>
  );
}

export function SectionLabel({ text, theme }: { text: string; theme: ProfileTheme }) {
  return <Text style={[styles.sectionLabel, { color: theme.textSubTheme }]}>{text}</Text>;
}

export function SettingsCard({
  theme,
  children,
}: {
  theme: ProfileTheme;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.cardTheme, borderColor: theme.borderTheme },
      ]}
    >
      {children}
    </View>
  );
}

export function Divider({ theme }: { theme: ProfileTheme }) {
  return <View style={[styles.divider, { backgroundColor: theme.borderTheme }]} />;
}

interface RowBaseProps {
  theme: ProfileTheme;
  icon: FeatherName;
  title: string;
  subtitle?: string;
}

export function SwitchRow({
  theme,
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  disabled,
}: RowBaseProps & {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={[styles.row, disabled && { opacity: 0.5 }]}>
      <View style={[styles.iconBg, { backgroundColor: theme.primaryAccent + '15' }]}>
        <Feather name={icon} size={16} color={theme.primaryAccent} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: theme.textTheme }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.rowSubtitle, { color: theme.textSubTheme }]}>{subtitle}</Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: theme.borderTheme, true: theme.primaryAccent }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

export function ActionRow({
  theme,
  icon,
  title,
  subtitle,
  onPress,
  danger,
  expanded,
}: RowBaseProps & { onPress: () => void; danger?: boolean; expanded?: boolean }) {
  const accent = danger ? theme.errorRed : theme.primaryAccent;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconBg, { backgroundColor: accent + '15' }]}>
        <Feather name={icon} size={16} color={accent} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: danger ? theme.errorRed : theme.textTheme }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.rowSubtitle, { color: theme.textSubTheme }]}>{subtitle}</Text>
        ) : null}
      </View>
      <Feather
        name={expanded ? 'chevron-down' : 'chevron-right'}
        size={18}
        color={theme.textSubTheme}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 22,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '500' },
  rowSubtitle: { fontSize: 12, marginTop: 2 },
});
