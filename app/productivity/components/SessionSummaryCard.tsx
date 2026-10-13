import React, { type ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FocusPalette, FocusTaskRef } from '../types';
import { focusStyles as styles } from '../styles/focus.styles';

interface SessionSummaryCardProps {
  task: FocusTaskRef | null;
  subject: string;
  durationLabel: string;
  isBreak: boolean;
  isEditable: boolean;
  onEdit: () => void;
  colors: FocusPalette;
}

function SummaryRow({
  icon,
  label,
  value,
  muted,
  colors,
}: {
  icon: ComponentProps<typeof Feather>['name'];
  label: string;
  value: string;
  muted?: boolean;
  colors: FocusPalette;
}) {
  return (
    <View style={styles.sessionRow}>
      <View style={[styles.sessionRowIcon, { backgroundColor: colors.primary + '1A' }]}>
        <Feather name={icon} size={15} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.sessionRowLabel, { color: colors.subtext }]}>{label}</Text>
        <Text
          numberOfLines={1}
          style={[styles.sessionRowValue, { color: muted ? colors.subtext : colors.text }]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

/** Shows what the timer is set up for and opens the setup modal. */
export default function SessionSummaryCard({
  task,
  subject,
  durationLabel,
  isBreak,
  isEditable,
  onEdit,
  colors,
}: SessionSummaryCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isEditable ? 'Edit session setup' : 'Session setup is locked during an active session'}
      accessibilityState={{ disabled: !isEditable }}
      disabled={!isEditable}
      onPress={onEdit}
      style={({ pressed }) => [
        styles.sessionCard,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={styles.sessionCardHeader}>
        <Text style={[styles.sectionTitle, { color: colors.subtext }]}>
          {isBreak ? 'Break' : 'This session'}
        </Text>
        <View style={styles.sessionCardAction}>
          <Feather
            name={isEditable ? 'sliders' : 'lock'}
            size={13}
            color={isEditable ? colors.primary : colors.subtext}
          />
          <Text
            style={[
              styles.sessionCardActionText,
              { color: isEditable ? colors.primary : colors.subtext },
            ]}
          >
            {isEditable ? 'Set up' : 'In progress'}
          </Text>
        </View>
      </View>

      {isBreak ? (
        <SummaryRow
          icon="coffee"
          label="Duration"
          value={`${durationLabel} · step away from your desk`}
          colors={colors}
        />
      ) : (
        <>
          <SummaryRow
            icon="check-square"
            label="Task"
            value={task?.title ?? 'No task selected'}
            muted={!task}
            colors={colors}
          />
          <SummaryRow
            icon="book-open"
            label="Subject"
            value={subject.trim() || 'General Study'}
            colors={colors}
          />
        </>
      )}
    </Pressable>
  );
}
