import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { FocusPalette } from '../types';
import { focusStyles as styles } from '../styles/focus.styles';

/** A subject from the user's own tasks and how many tasks use it. */
export interface SubjectOption {
  name: string;
  count: number;
}

interface SubjectSelectorProps {
  selectedSubject: string;
  onSelectSubject: (subject: string) => void;
  /** Subjects taken from the user's tasks (most used first). */
  subjects: SubjectOption[];
  isLoading: boolean;
  /** True when the subject was filled in from the selected task. */
  isFromTask: boolean;
  colors: FocusPalette;
}

const FALLBACK_SUBJECT = 'General Study';

export default function SubjectSelector({
  selectedSubject,
  onSelectSubject,
  subjects,
  isLoading,
  isFromTask,
  colors,
}: SubjectSelectorProps) {
  const current = selectedSubject.trim().toLowerCase();

  const chip = (label: string, count?: number, dashed?: boolean) => {
    const isSelected = current === label.toLowerCase();

    return (
      <Pressable
        key={label}
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected }}
        onPress={() => onSelectSubject(label)}
        style={({ pressed }) => [
          styles.subjectPill,
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: isSelected ? colors.primary : colors.card,
            borderColor: isSelected ? colors.primary : colors.border,
            borderStyle: dashed && !isSelected ? 'dashed' : 'solid',
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
          {label}
        </Text>
        {count !== undefined && (
          <Text
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: isSelected ? colors.onPrimary : colors.subtext,
              opacity: 0.8,
            }}
          >
            {count}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <View>
      {/* Type any subject */}
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
          placeholder="Type a subject, e.g. Math"
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

      {isFromTask && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <Feather name="link" size={12} color={colors.primary} />
          <Text style={{ fontSize: 12, color: colors.subtext }}>
            Filled in from the selected task
          </Text>
        </View>
      )}

      {!isLoading && subjects.length === 0 && (
        <View
          style={{
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: colors.border,
            borderRadius: 14,
            padding: 14,
            marginTop: 10,
          }}
        >
          <Text style={{ fontSize: 12, lineHeight: 18, color: colors.subtext, textAlign: 'center' }}>
            You have no subjects yet.{'\n'}Subjects you add to your tasks will show up here.
          </Text>
        </View>
      )}

      {/* Subjects from the user's tasks + General Study */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
        {subjects.map((subject) => chip(subject.name, subject.count))}
        {chip(FALLBACK_SUBJECT, undefined, subjects.length > 0)}
      </View>
    </View>
  );
}