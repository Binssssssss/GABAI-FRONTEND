import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { EventCategory, EventPriority } from '../types';
import { CATEGORY_COLORS, REMINDER_OPTIONS } from '../constants/calendarConfig';
import { getPriorityColors } from '../utils/calendarHelpers';
import { calendarStyles as styles } from '../styles/calendar.styles';

interface QuickAddEventModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  onTitleChange: (val: string) => void;
  category: EventCategory;
  onCategoryChange: (cat: EventCategory) => void;
  priority: EventPriority;
  onPriorityChange: (prio: EventPriority) => void;
  date: string;
  onDateChange: (val: string) => void;
  time: string;
  onTimeChange: (val: string) => void;
  duration: string;
  onDurationChange: (val: string) => void;
  isAllDay: boolean;
  onIsAllDayChange: (val: boolean) => void;
  hasReminder: boolean;
  onHasReminderChange: (val: boolean) => void;
  reminderTime: string;
  onReminderTimeChange: (val: string) => void;
  isRecurring: boolean;
  onIsRecurringChange: (val: boolean) => void;
  recurrenceRule: 'Daily' | 'Weekly';
  onRecurrenceRuleChange: (rule: 'Daily' | 'Weekly') => void;
  description: string;
  onDescriptionChange: (val: string) => void;
  checklistText: string;
  onChecklistTextChange: (val: string) => void;
  checklistItems: string[];
  onAddChecklistItem: () => void;
  onRemoveChecklistItem: (idx: number) => void;
  onSave: () => void;
  cardTheme: string;
  borderTheme: string;
  textTheme: string;
  textSubTheme: string;
  bgTheme: string;
  primaryAccent: string;
}

const CATEGORIES_LIST: EventCategory[] = ['Assignment', 'Exam', 'Class', 'Meeting', 'Personal'];
const PRIORITIES_LIST: EventPriority[] = ['Low', 'Medium', 'High'];

export default function QuickAddEventModal({
  visible,
  onClose,
  title,
  onTitleChange,
  category,
  onCategoryChange,
  priority,
  onPriorityChange,
  date,
  onDateChange,
  time,
  onTimeChange,
  duration,
  onDurationChange,
  isAllDay,
  onIsAllDayChange,
  hasReminder,
  onHasReminderChange,
  reminderTime,
  onReminderTimeChange,
  isRecurring,
  onIsRecurringChange,
  recurrenceRule,
  onRecurrenceRuleChange,
  description,
  onDescriptionChange,
  checklistText,
  onChecklistTextChange,
  checklistItems,
  onAddChecklistItem,
  onRemoveChecklistItem,
  onSave,
  cardTheme,
  borderTheme,
  textTheme,
  textSubTheme,
  bgTheme,
  primaryAccent,
}: QuickAddEventModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.addModalContainer, { backgroundColor: cardTheme }]}>
          <View style={styles.addModalHeader}>
            <Text style={[styles.modalHeaderTitle, { color: textTheme }]}>Quick Add Academic Event</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={textTheme} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.addFormScroll} showsVerticalScrollIndicator={false}>
            {/* Event Title */}
            <Text style={[styles.formLabel, { color: textSubTheme }]}>Event Title</Text>
            <TextInput
              placeholder="e.g. Study Chemistry Chapters 3-4"
              placeholderTextColor={textSubTheme}
              style={[styles.formInput, { color: textTheme, borderColor: borderTheme }]}
              value={title}
              onChangeText={onTitleChange}
            />

            {/* Category selector */}
            <Text style={[styles.formLabel, { color: textSubTheme, marginTop: 16 }]}>Category</Text>
            <View style={styles.rowSelector}>
              {CATEGORIES_LIST.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => onCategoryChange(cat)}
                    style={[
                      styles.selectorPill,
                      {
                        backgroundColor: isSelected ? CATEGORY_COLORS[cat] : bgTheme,
                        borderColor: borderTheme,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: isSelected ? '#000000' : textTheme,
                        fontWeight: isSelected ? 'bold' : 'normal',
                        fontSize: 12,
                      }}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Priority Selector */}
            <Text style={[styles.formLabel, { color: textSubTheme, marginTop: 16 }]}>Priority Level</Text>
            <View style={styles.rowSelector}>
              {PRIORITIES_LIST.map((prio) => {
                const isSelected = priority === prio;
                const colors = getPriorityColors(prio);
                return (
                  <TouchableOpacity
                    key={prio}
                    onPress={() => onPriorityChange(prio)}
                    style={[
                      styles.selectorPill,
                      {
                        backgroundColor: isSelected ? colors.bg : bgTheme,
                        borderColor: borderTheme,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: isSelected ? colors.text : textTheme,
                        fontWeight: isSelected ? 'bold' : 'normal',
                      }}
                    >
                      {prio}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Date & Time fields */}
            <View style={styles.formRowFields}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.formLabel, { color: textSubTheme, marginTop: 16 }]}>Date (YYYY-MM-DD)</Text>
                <TextInput
                  placeholder="2026-07-24"
                  placeholderTextColor={textSubTheme}
                  style={[styles.formInput, { color: textTheme, borderColor: borderTheme }]}
                  value={date}
                  onChangeText={onDateChange}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.formLabel, { color: textSubTheme, marginTop: 16 }]}>Time (HH:MM)</Text>
                <TextInput
                  placeholder="09:00"
                  placeholderTextColor={textSubTheme}
                  style={[styles.formInput, { color: textTheme, borderColor: borderTheme }]}
                  value={time}
                  onChangeText={onTimeChange}
                />
              </View>
            </View>

            {/* Duration and toggle fields */}
            <View style={styles.formRowFields}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.formLabel, { color: textSubTheme, marginTop: 16 }]}>Duration (Minutes)</Text>
                <TextInput
                  placeholder="60"
                  placeholderTextColor={textSubTheme}
                  style={[styles.formInput, { color: textTheme, borderColor: borderTheme }]}
                  value={duration}
                  keyboardType="numeric"
                  onChangeText={onDurationChange}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8, justifyContent: 'center', paddingTop: 16 }}>
                <View style={styles.switchRowItem}>
                  <Text style={{ color: textTheme, marginRight: 8 }}>All Day</Text>
                  <Switch
                    value={isAllDay}
                    onValueChange={onIsAllDayChange}
                    trackColor={{ false: '#767577', true: primaryAccent }}
                  />
                </View>
              </View>
            </View>

            {/* Reminders Toggle */}
            <View style={[styles.switchRowItem, { marginTop: 16, justifyContent: 'space-between' }]}>
              <View>
                <Text style={{ color: textTheme }}>Set Reminder Alert</Text>
                <Text style={{ color: textSubTheme, fontSize: 12 }}>Receive notification check</Text>
              </View>
              <Switch
                value={hasReminder}
                onValueChange={onHasReminderChange}
                trackColor={{ false: '#767577', true: primaryAccent }}
              />
            </View>

            {hasReminder && (
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.formLabel, { color: textSubTheme }]}>Reminder Timing</Text>
                <View style={styles.rowSelector}>
                  {REMINDER_OPTIONS.map((rem) => {
                    const isSelected = reminderTime === rem;
                    return (
                      <TouchableOpacity
                        key={rem}
                        onPress={() => onReminderTimeChange(rem)}
                        style={[
                          styles.selectorPill,
                          {
                            backgroundColor: isSelected ? primaryAccent : bgTheme,
                            borderColor: borderTheme,
                            paddingVertical: 6,
                            paddingHorizontal: 10,
                          },
                        ]}
                      >
                        <Text style={{ color: isSelected ? '#FFFFFF' : textTheme, fontSize: 11 }}>{rem}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Recurrence Toggle */}
            <View style={[styles.switchRowItem, { marginTop: 16, justifyContent: 'space-between' }]}>
              <View>
                <Text style={{ color: textTheme }}>Recurring Event</Text>
                <Text style={{ color: textSubTheme, fontSize: 12 }}>Schedule recurring routines</Text>
              </View>
              <Switch
                value={isRecurring}
                onValueChange={onIsRecurringChange}
                trackColor={{ false: '#767577', true: primaryAccent }}
              />
            </View>

            {isRecurring && (
              <View style={{ marginTop: 8 }}>
                <Text style={[styles.formLabel, { color: textSubTheme }]}>Recurrence Interval</Text>
                <View style={styles.rowSelector}>
                  {(['Daily', 'Weekly'] as const).map((rule) => {
                    const isSelected = recurrenceRule === rule;
                    return (
                      <TouchableOpacity
                        key={rule}
                        onPress={() => onRecurrenceRuleChange(rule)}
                        style={[
                          styles.selectorPill,
                          {
                            backgroundColor: isSelected ? primaryAccent : bgTheme,
                            borderColor: borderTheme,
                          },
                        ]}
                      >
                        <Text style={{ color: isSelected ? '#FFFFFF' : textTheme }}>{rule}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Description */}
            <Text style={[styles.formLabel, { color: textSubTheme, marginTop: 16 }]}>Description / Notes</Text>
            <TextInput
              placeholder="Write any class codes, exam format notes, or details..."
              placeholderTextColor={textSubTheme}
              multiline
              numberOfLines={3}
              style={[
                styles.formInput,
                { color: textTheme, borderColor: borderTheme, height: 80, textAlignVertical: 'top' },
              ]}
              value={description}
              onChangeText={onDescriptionChange}
            />

            {/* Checklist adding section */}
            <Text style={[styles.formLabel, { color: textSubTheme, marginTop: 16 }]}>
              Task Checklist Items ({checklistItems.length} items)
            </Text>
            <View style={styles.checklistBuilderRow}>
              <TextInput
                placeholder="Add a milestone to this event..."
                placeholderTextColor={textSubTheme}
                style={[styles.formInput, { color: textTheme, borderColor: borderTheme, flex: 1, marginBottom: 0 }]}
                value={checklistText}
                onChangeText={onChecklistTextChange}
              />
              <TouchableOpacity
                style={[styles.addChecklistBtn, { backgroundColor: primaryAccent }]}
                onPress={onAddChecklistItem}
              >
                <Feather name="plus" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {checklistItems.length > 0 && (
              <View style={[styles.builderItemsContainer, { backgroundColor: bgTheme, borderColor: borderTheme }]}>
                {checklistItems.map((item, idx) => (
                  <View key={idx} style={[styles.builderItemRow, { borderBottomColor: borderTheme }]}>
                    <Text style={{ color: textTheme, flex: 1 }}>{item}</Text>
                    <TouchableOpacity onPress={() => onRemoveChecklistItem(idx)}>
                      <Feather name="trash-2" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Form Save Button */}
            <TouchableOpacity
              style={[styles.saveFormBtn, { backgroundColor: primaryAccent }]}
              onPress={onSave}
            >
              <Text style={styles.saveFormBtnText}>Save Event & Schedule</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
