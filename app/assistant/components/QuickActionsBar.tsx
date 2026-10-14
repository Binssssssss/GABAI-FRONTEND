import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { QUICK_ACTIONS } from '../constants';
import { QuickActionKey } from '../types';
import { assistantStyles as styles } from '../styles';

interface QuickActionsBarProps {
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  primaryBrown: string;
  activeKey?: QuickActionKey | null;
  onSelectAction: (key: QuickActionKey, label: string) => void;
}

/* Tasks · Schedule · Wallet · Focus Session · Notes (always this order). */
export function QuickActionsBar({
  cardBg,
  borderCol,
  textPrimary,
  primaryBrown,
  activeKey,
  onSelectAction,
}: QuickActionsBarProps) {
  return (
    <View style={[styles.quickActionsContainer, { borderTopColor: borderCol }]}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        data={QUICK_ACTIONS}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => {
          const isActive = item.key === activeKey;
          return (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`${item.label} summary`}
              style={[
                styles.actionChip,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: isActive ? primaryBrown + '22' : cardBg,
                  borderColor: isActive ? primaryBrown : borderCol,
                },
              ]}
              onPress={() => onSelectAction(item.key, item.label)}
            >
              <Feather name={item.icon as any} size={14} color={primaryBrown} />
              <Text style={[styles.actionChipText, { color: textPrimary }]}>{item.label}</Text>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.quickActionsContent}
      />
    </View>
  );
}