import React from 'react';
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ACADEMIC_SUBJECTS } from '../constants/focusConfig';
import { FocusPalette } from '../types';
import { focusStyles as styles } from '../styles/focus.styles';

interface SubjectSelectorProps {
  selectedSubject: string;
  onSelectSubject: (subject: string) => void;
  colors: FocusPalette;
}

export default function SubjectSelector({
  selectedSubject,
  onSelectSubject,
  colors,
}: SubjectSelectorProps) {
  return (
    <View>
      {/* Editable Subject Input Box */}
      <View
        style={[
          styles.subjectInput,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Feather name="book-open" size={16} color={colors.primary} style={{ marginRight: 10 }} />
        <TextInput
          value={selectedSubject}
          onChangeText={onSelectSubject}
          placeholder="Type any subject, exam, or topic..."
          placeholderTextColor={colors.subtext}
          returnKeyType="done"
          maxLength={60}
          style={{
            flex: 1,
            color: colors.text,
            fontSize: 14,
            fontWeight: '600',
            height: '100%',
          }}
        />
        {selectedSubject.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear subject"
            onPress={() => onSelectSubject('')}
            hitSlop={10}
            style={{ padding: 4 }}
          >
            <Feather name="x-circle" size={16} color={colors.subtext} />
          </Pressable>
        )}
      </View>

      {/* Quick-pick Preset Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.subjectsScroll}
      >
        {ACADEMIC_SUBJECTS.map((subject) => {
          const isSelected = selectedSubject.trim().toLowerCase() === subject.toLowerCase();
          return (
            <Pressable
              key={subject}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelectSubject(subject)}
              style={({ pressed }) => [
                styles.subjectPill,
                {
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.subjectPillText,
                  { color: isSelected ? colors.onPrimary : colors.text },
                ]}
              >
                {subject}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
