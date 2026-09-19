import React from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ACADEMIC_SUBJECTS } from '../constants/focusConfig';
import { focusStyles as styles } from '../styles/focus.styles';

interface SubjectSelectorProps {
  selectedSubject: string;
  onSelectSubject: (subject: string) => void;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  primaryAccent: string;
}

export default function SubjectSelector({
  selectedSubject,
  onSelectSubject,
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  primaryAccent,
}: SubjectSelectorProps) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[styles.sectionTitle, { color: textSecondary }]}>Study Target / Subject</Text>

      {/* Editable Subject Input Box */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: cardBg,
          borderColor: borderCol,
          borderWidth: 1,
          borderRadius: 14,
          paddingHorizontal: 14,
          height: 48,
          marginBottom: 12,
        }}
      >
        <Feather name="book-open" size={16} color={primaryAccent} style={{ marginRight: 10 }} />
        <TextInput
          value={selectedSubject}
          onChangeText={onSelectSubject}
          placeholder="Type any subject, exam, or topic..."
          placeholderTextColor={textSecondary}
          style={{
            flex: 1,
            color: textPrimary,
            fontSize: 14,
            fontWeight: '600',
            height: '100%',
          }}
        />
        {selectedSubject.length > 0 && (
          <TouchableOpacity onPress={() => onSelectSubject('')} style={{ padding: 4 }}>
            <Feather name="x-circle" size={16} color={textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Quick-pick Preset Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subjectsScroll}
      >
        {ACADEMIC_SUBJECTS.map((subject) => {
          const isSelected = selectedSubject.trim().toLowerCase() === subject.toLowerCase();
          return (
            <TouchableOpacity
              key={subject}
              onPress={() => onSelectSubject(subject)}
              style={[
                styles.subjectPill,
                {
                  backgroundColor: isSelected ? primaryAccent : cardBg,
                  borderColor: isSelected ? primaryAccent : borderCol,
                },
              ]}
            >
              <Text
                style={[
                  styles.subjectPillText,
                  { color: isSelected ? '#FFFFFF' : textPrimary },
                ]}
              >
                {subject}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
