import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { noteStyles as styles } from '../../styles/notes.styles';

interface NotesSearchBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
}

export default function NotesSearchBar({
  searchQuery,
  onSearchChange,
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
}: NotesSearchBarProps) {
  return (
    <View style={styles.searchSection}>
      <View style={[styles.searchBar, { backgroundColor: cardBg, borderColor: borderCol }]}>
        <Feather name="search" size={16} color={textSecondary} style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search title, content, or #tags..."
          placeholderTextColor={textSecondary}
          style={[styles.searchInput, { color: textPrimary }]}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} style={{ padding: 4 }}>
            <Feather name="x" size={16} color={textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
