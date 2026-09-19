import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { noteStyles as styles } from '../../styles/notes.styles';

interface NotesFabMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewBlankNote: () => void;
  onQuickJot: () => void;
  onOpenTemplates: () => void;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  primaryBrown: string;
}

export default function NotesFabMenu({
  isOpen,
  onToggle,
  onNewBlankNote,
  onQuickJot,
  onOpenTemplates,
  cardBg,
  borderCol,
  textPrimary,
  primaryBrown,
}: NotesFabMenuProps) {
  return (
    <View style={styles.fabContainer}>
      {isOpen && (
        <View style={styles.fabSpeedDial}>
          {/* Templates Option */}
          <TouchableOpacity
            style={[styles.fabSpeedDialItem, { backgroundColor: cardBg, borderColor: borderCol }]}
            onPress={onOpenTemplates}
          >
            <Text style={[styles.fabSpeedDialLabel, { color: textPrimary }]}>From Template</Text>
            <View style={[styles.fabSpeedDialIconCircle, { backgroundColor: primaryBrown + '20' }]}>
              <Feather name="layout" size={14} color={primaryBrown} />
            </View>
          </TouchableOpacity>

          {/* Quick Jot Option */}
          <TouchableOpacity
            style={[styles.fabSpeedDialItem, { backgroundColor: cardBg, borderColor: borderCol }]}
            onPress={onQuickJot}
          >
            <Text style={[styles.fabSpeedDialLabel, { color: textPrimary }]}>Quick Jot</Text>
            <View style={[styles.fabSpeedDialIconCircle, { backgroundColor: '#F59E0B20' }]}>
              <Feather name="zap" size={14} color="#F59E0B" />
            </View>
          </TouchableOpacity>

          {/* Blank Note Option */}
          <TouchableOpacity
            style={[styles.fabSpeedDialItem, { backgroundColor: cardBg, borderColor: borderCol }]}
            onPress={onNewBlankNote}
          >
            <Text style={[styles.fabSpeedDialLabel, { color: textPrimary }]}>Blank Note</Text>
            <View style={[styles.fabSpeedDialIconCircle, { backgroundColor: '#10B98120' }]}>
              <Feather name="file-text" size={14} color="#10B981" />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Floating Action Button */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onToggle}
        style={[styles.fabMainBtn, { backgroundColor: primaryBrown }]}
      >
        <Feather name={isOpen ? 'x' : 'plus'} size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
