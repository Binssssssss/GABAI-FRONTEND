import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { taskStyles as styles } from '../../styles/task.styles';

interface TaskSearchBarProps {
  visible: boolean;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onClose: () => void;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
}

export default function TaskSearchBar({
  visible,
  searchQuery,
  onSearchChange,
  onClose,
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
}: TaskSearchBarProps) {
  if (!visible) return null;

  return (
    <View style={[styles.searchBar, { backgroundColor: cardBg, borderColor: borderCol }]}>
      <Feather name="search" size={16} color={textSecondary} style={{ marginRight: 8 }} />
      <TextInput
        style={[styles.searchInput, { color: textPrimary }]}
        placeholder="Search tasks, descriptions, or subjects..."
        placeholderTextColor={textSecondary}
        value={searchQuery}
        onChangeText={onSearchChange}
        autoFocus
      />
      {searchQuery.length > 0 ? (
        <TouchableOpacity onPress={() => onSearchChange('')}>
          <Feather name="x" size={16} color={textSecondary} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onClose}>
          <Feather name="x" size={16} color={textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}
