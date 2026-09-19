import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TEMPLATES } from '../../constants/notesConfig';
import { NoteTemplateItem } from '../../types';
import { noteStyles as styles } from '../../styles/notes.styles';

interface NoteTemplateModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectTemplate: (template: NoteTemplateItem) => void;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
}

export default function NoteTemplateModal({
  visible,
  onClose,
  onSelectTemplate,
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  primaryBrown,
}: NoteTemplateModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={styles.sheetBackdrop}
      >
        <View style={[styles.bottomSheetCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <View style={styles.sheetHandleBar}>
            <View style={[styles.sheetHandle, { backgroundColor: borderCol }]} />
          </View>

          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderLeft}>
              <Feather name="layout" size={18} color={primaryBrown} style={{ marginRight: 8 }} />
              <Text style={[styles.sheetTitle, { color: textPrimary }]}>Note Templates</Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={20} color={textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
            {TEMPLATES.map((tmpl) => (
              <TouchableOpacity
                key={tmpl.id}
                onPress={() => onSelectTemplate(tmpl)}
                style={[
                  styles.templateCardItem,
                  { backgroundColor: cardBg, borderColor: borderCol },
                ]}
              >
                <View style={styles.templateCardTop}>
                  <Text style={[styles.templateCardTitle, { color: textPrimary }]}>
                    {tmpl.title}
                  </Text>
                  <View style={[styles.categoryBadge, { backgroundColor: primaryBrown + '20' }]}>
                    <Text style={[styles.categoryBadgeText, { color: primaryBrown }]}>
                      {tmpl.category}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.templateCardDesc, { color: textSecondary }]}>
                  {tmpl.description}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
