import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { taskStyles as styles } from '../../styles/task.styles';

interface TaskHeaderProps {
  onOpenDrawer: () => void;
  onToggleSearch: () => void;
  onOpenAdd: () => void;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
}

export default function TaskHeader({
  onOpenDrawer,
  onToggleSearch,
  onOpenAdd,
  textPrimary,
  textSecondary,
  primaryBrown,
}: TaskHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={onOpenDrawer} style={{ marginRight: 10, padding: 4 }}>
          <Feather name="menu" size={24} color={textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerGreeting, { color: textPrimary }]}>Today&apos;s Focus</Text>
          <Text style={[styles.headerDate, { color: textSecondary }]}>Academic Planner</Text>
        </View>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerBtn} onPress={onToggleSearch}>
          <Feather name="search" size={20} color={textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerBtn} onPress={onOpenAdd}>
          <Feather name="plus-circle" size={22} color={primaryBrown} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
