import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { expenseStyles as styles } from '../styles/expenses.styles';

interface WalletHeaderProps {
  onOpenDrawer: () => void;
  onOpenAddModal: () => void;
  textPrimary: string;
  primaryBrown: string;
}

export default function WalletHeader({
  onOpenDrawer,
  onOpenAddModal,
  textPrimary,
  primaryBrown,
}: WalletHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={onOpenDrawer} style={{ marginRight: 10, padding: 4 }}>
          <Feather name="menu" size={24} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textPrimary }]}>Wallet</Text>
      </View>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: primaryBrown }]}
        onPress={onOpenAddModal}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
