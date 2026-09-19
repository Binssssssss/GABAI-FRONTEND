import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { QUICK_ACTIONS } from '../constants';
import { assistantStyles as styles } from '../styles';

interface QuickActionsBarProps {
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  onSelectAction: (query: string) => void;
}

export function QuickActionsBar({
  cardBg,
  borderCol,
  textPrimary,
  onSelectAction,
}: QuickActionsBarProps) {
  return (
    <View style={[styles.quickActionsContainer, { borderTopColor: borderCol }]}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={QUICK_ACTIONS}
        keyExtractor={(item) => item.label}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.actionChip, { backgroundColor: cardBg, borderColor: borderCol }]}
            onPress={() => onSelectAction(item.query)}
          >
            <Text style={[styles.actionChipText, { color: textPrimary }]}>{item.label}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.quickActionsContent}
      />
    </View>
  );
}
