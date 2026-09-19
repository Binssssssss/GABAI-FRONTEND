import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SUGGESTION_CHIPS, SUGGESTED_QUESTIONS } from '../constants';
import { assistantStyles as styles } from '../styles';

interface EmptyStateViewProps {
  primaryBrown: string;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  onSelectQuery: (text: string) => void;
}

export function EmptyStateView({
  primaryBrown,
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  onSelectQuery,
}: EmptyStateViewProps) {
  return (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.welcomeIconContainer,
          { backgroundColor: primaryBrown + '12', borderColor: borderCol },
        ]}
      >
        <Feather name="zap" size={28} color={primaryBrown} />
      </View>
      <Text style={[styles.welcomeTitle, { color: textPrimary }]}>
        Hello! I&apos;m your GabAi Assistant.
      </Text>
      <Text style={[styles.welcomeSubtitle, { color: textSecondary }]}>
        I can help you find information, manage your tasks, calculate spendings, and answer
        questions about your local academic data.
      </Text>

      {/* Onboarding Guide Card */}
      <View style={[styles.guideCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
        <Text style={[styles.guideTitle, { color: textPrimary }]}>
          💡 How to use your Study Companion
        </Text>
        <View style={styles.guideStep}>
          <Text style={styles.guideStepNum}>1</Text>
          <Text style={[styles.guideStepText, { color: textPrimary }]}>
            <Text style={{ fontWeight: 'bold' }}>Chat in plain English:</Text> Ask about tasks,
            classes, or weekly expenses (e.g., &quot;How much did I spend this week?&quot; or &quot;Do I have
            overdue tasks?&quot;).
          </Text>
        </View>
        <View style={styles.guideStep}>
          <Text style={styles.guideStepNum}>2</Text>
          <Text style={[styles.guideStepText, { color: textPrimary }]}>
            <Text style={{ fontWeight: 'bold' }}>Quick Actions:</Text> Tap the action buttons at the
            bottom to quickly view stats, open sections, or trigger focus stopwatches.
          </Text>
        </View>
        <View style={styles.guideStep}>
          <Text style={styles.guideStepNum}>3</Text>
          <Text style={[styles.guideStepText, { color: textPrimary }]}>
            <Text style={{ fontWeight: 'bold' }}>100% Offline:</Text> Changes you make here (like
            completing a task) instantly sync with your main tabs.
          </Text>
        </View>
      </View>

      {/* Suggestion Chips */}
      <View style={styles.suggestionGrid}>
        {SUGGESTION_CHIPS.map((chip, index) => (
          <TouchableOpacity
            key={index.toString()}
            style={[
              styles.suggestionChip,
              { backgroundColor: cardBg, borderColor: borderCol },
            ]}
            onPress={() => onSelectQuery(chip.text)}
          >
            <Feather
              name={chip.icon as any}
              size={13}
              color={primaryBrown}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.suggestionChipText, { color: textPrimary }]} numberOfLines={1}>
              {chip.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Suggested Questions */}
      <Text style={[styles.sectionHeading, { color: textSecondary, marginTop: 24 }]}>
        Suggested Questions
      </Text>
      <View style={styles.suggestedQuestionsContainer}>
        {SUGGESTED_QUESTIONS.map((q, index) => (
          <TouchableOpacity
            key={index.toString()}
            style={[styles.questionItem, { borderColor: borderCol }]}
            onPress={() => onSelectQuery(q)}
          >
            <Text style={[styles.questionItemText, { color: textPrimary }]}>{q}</Text>
            <Feather name="arrow-up-right" size={14} color={textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
