import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { CalendarEvent } from '../types';
import { CATEGORY_COLORS } from '../constants/calendarConfig';
import { getPriorityColors } from '../utils/calendarHelpers';
import { calendarStyles as styles } from '../styles/calendar.styles';

interface EventDetailModalProps {
  visible: boolean;
  event: CalendarEvent | null;
  onClose: () => void;
  onToggleChecklistItem: (eventId: string, itemId: string) => void;
  onStartRescheduling: (eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
  cardTheme: string;
  borderTheme: string;
  textTheme: string;
  textSubTheme: string;
}

export default function EventDetailModal({
  visible,
  event,
  onClose,
  onToggleChecklistItem,
  onStartRescheduling,
  onDeleteEvent,
  cardTheme,
  borderTheme,
  textTheme,
  textSubTheme,
}: EventDetailModalProps) {
  if (!event) return null;

  const priorityColors = getPriorityColors(event.priority);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.detailModalContainer, { backgroundColor: cardTheme }]}>
          {/* Modal Header Ribbon */}
          <View style={[styles.modalHeaderRibbon, { backgroundColor: CATEGORY_COLORS[event.category] }]} />

          <View style={styles.modalHeaderClose}>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={textTheme} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
            <View style={styles.modalMetaRow}>
              <View style={[styles.modalCategoryBadge, { backgroundColor: borderTheme }]}>
                <Text style={[styles.modalCategoryText, { color: CATEGORY_COLORS[event.category] }]}>
                  {event.category}
                </Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: priorityColors.bg }]}>
                <Text style={[styles.priorityBadgeText, { color: priorityColors.text }]}>
                  {event.priority} Priority
                </Text>
              </View>
            </View>

            <Text style={[styles.modalTitleText, { color: textTheme }]}>{event.title}</Text>

            {/* Date & Time info */}
            <View style={styles.modalInfoCard}>
              <View style={styles.infoRowItem}>
                <Feather name="calendar" size={16} color={textSubTheme} />
                <Text style={[styles.infoRowText, { color: textTheme }]}>
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              <View style={[styles.infoRowItem, { marginTop: 8 }]}>
                <Feather name="clock" size={16} color={textSubTheme} />
                <Text style={[styles.infoRowText, { color: textTheme }]}>
                  {event.isAllDay ? 'All Day Event' : `${event.time} (${event.duration} minutes)`}
                </Text>
              </View>
              {event.isRecurring && (
                <View style={[styles.infoRowItem, { marginTop: 8 }]}>
                  <Feather name="refresh-cw" size={16} color={textSubTheme} />
                  <Text style={[styles.infoRowText, { color: textTheme }]}>
                    Repeats {event.recurrenceRule}
                  </Text>
                </View>
              )}
              {event.hasReminder && (
                <View style={[styles.infoRowItem, { marginTop: 8 }]}>
                  <Feather name="bell" size={16} color={textSubTheme} />
                  <Text style={[styles.infoRowText, { color: textTheme }]}>
                    Reminder set: {event.reminderTime}
                  </Text>
                </View>
              )}
            </View>

            {/* Description */}
            {event.description ? (
              <View style={styles.modalDescContainer}>
                <Text style={[styles.descTitle, { color: textSubTheme }]}>Description</Text>
                <Text style={[styles.descBodyText, { color: textTheme }]}>{event.description}</Text>
              </View>
            ) : null}

            {/* Checklist task manager */}
            {event.checklist.length > 0 ? (
              <View style={styles.modalChecklistContainer}>
                <Text style={[styles.checklistTitleText, { color: textSubTheme }]}>
                  Task Checklist ({event.progress}%)
                </Text>

                {/* Progress tracking bar */}
                <View style={[styles.modalProgressBarBg, { backgroundColor: borderTheme }]}>
                  <View
                    style={[
                      styles.modalProgressBarFill,
                      { backgroundColor: CATEGORY_COLORS[event.category], width: `${event.progress}%` },
                    ]}
                  />
                </View>

                <View style={styles.checklistsList}>
                  {event.checklist.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => onToggleChecklistItem(event.id, item.id)}
                      style={[styles.checklistRow, { borderBottomColor: borderTheme }]}
                    >
                      <MaterialCommunityIcons
                        name={item.completed ? 'checkbox-marked' : 'checkbox-blank-outline'}
                        size={22}
                        color={item.completed ? CATEGORY_COLORS[event.category] : textSubTheme}
                      />
                      <Text
                        style={[
                          styles.checklistRowText,
                          {
                            color: item.completed ? textSubTheme : textTheme,
                            textDecorationLine: item.completed ? 'line-through' : 'none',
                          },
                        ]}
                      >
                        {item.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Action buttons */}
            <View style={styles.modalActionButtonsRow}>
              <TouchableOpacity
                style={[styles.actionBtn, { borderColor: borderTheme, borderWidth: 1 }]}
                onPress={() => onStartRescheduling(event.id)}
              >
                <Feather name="move" size={16} color={textTheme} style={{ marginRight: 8 }} />
                <Text style={[styles.actionBtnText, { color: textTheme }]}>Reschedule</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#7F1D1D' }]}
                onPress={() => onDeleteEvent(event.id)}
              >
                <Feather name="trash-2" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
