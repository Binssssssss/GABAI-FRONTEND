import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { TaskTheme } from '../../types';
import type { useTaskData } from '../../hooks/useTaskData';
import { SUBJECTS } from '../../constants/taskConfig';
import { taskStyles as styles } from '../../styles/task.styles';

interface AddTaskModalProps {
  taskData: ReturnType<typeof useTaskData>;
  theme: TaskTheme;
}

export default function AddTaskModal({ taskData, theme }: AddTaskModalProps) {
  const {
    isAdding,
    setIsAdding,

    newTitle,
    setNewTitle,

    newDesc,
    setNewDesc,

    newSubject,
    setNewSubject,

    newPriority,
    setNewPriority,

    newDueDate,
    setNewDueDate,

    newDueTime,
    setNewDueTime,

    newHasReminder,
    setNewHasReminder,

    newSubTaskInput,
    setNewSubTaskInput,

    newSubTasksList,
    handleAddSubTaskToList,
    handleRemoveSubTaskFromList,

    handleCreateTask,
  } = taskData;

  const {
    cardBg,
    inputBg,
    borderCol,
    textPrimary,
    textSecondary,
    primaryBrown,
  } = theme;

  const priorities = ['High', 'Medium', 'Low'];

  return (
    <Modal
      visible={isAdding}
      transparent
      animationType="slide"
      onRequestClose={() => setIsAdding(false)}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <View
            style={{
              backgroundColor: cardBg,
              borderRadius: 28,
              padding: 20,
              borderWidth: 1,
              borderColor: borderCol,
              maxHeight: '92%',
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 22,
              }}
            >
              <View>
                <Text
                  style={{
                    color: textPrimary,
                    fontSize: 24,
                    fontWeight: '700',
                  }}
                >
                  Create Task
                </Text>
                <Text
                  style={{
                    color: textSecondary,
                    marginTop: 2,
                    fontSize: 13,
                  }}
                >
                  Stay organized with GabAI.
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setIsAdding(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: inputBg,
                }}
              >
                <Feather name="x" size={18} color={textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Task Title */}
              <View
                style={{
                  backgroundColor: inputBg,
                  borderRadius: 18,
                  paddingHorizontal: 16,
                  height: 58,
                  justifyContent: 'center',
                  marginBottom: 18,
                }}
              >
                <TextInput
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="Task title"
                  placeholderTextColor={textSecondary}
                  style={{
                    color: textPrimary,
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                />
              </View>

              {/* Subject */}
              <Text
                style={{
                  color: textSecondary,
                  fontSize: 11,
                  marginBottom: 10,
                  fontWeight: '600',
                }}
              >
                SUBJECT
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 20 }}
              >
                {SUBJECTS.map((subject) => {
                  const active = newSubject === subject;

                  return (
                    <TouchableOpacity
                      key={subject}
                      onPress={() => setNewSubject(subject)}
                      style={{
                        backgroundColor: active ? primaryBrown : inputBg,
                        paddingHorizontal: 18,
                        paddingVertical: 10,
                        borderRadius: 99,
                        marginRight: 10,
                      }}
                    >
                      <Text
                        style={{
                          color: active ? '#FFF' : textPrimary,
                          fontWeight: '600',
                          fontSize: 13,
                        }}
                      >
                        {subject}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Due */}
              <Text
                style={{
                  color: textSecondary,
                  fontSize: 11,
                  marginBottom: 10,
                  fontWeight: '600',
                }}
              >
                DUE DATE & TIME
              </Text>

              <View
                style={{
                  backgroundColor: inputBg,
                  borderRadius: 18,
                  padding: 16,
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 14,
                  }}
                >
                  <Feather name="calendar" size={16} color={primaryBrown} />
                  <TextInput
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={textSecondary}
                    value={newDueDate}
                    onChangeText={setNewDueDate}
                    style={{
                      color: textPrimary,
                      marginLeft: 12,
                      flex: 1,
                      fontSize: 15,
                    }}
                  />
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Feather name="clock" size={16} color={primaryBrown} />
                  <TextInput
                    placeholder="HH:MM"
                    placeholderTextColor={textSecondary}
                    value={newDueTime}
                    onChangeText={setNewDueTime}
                    style={{
                      color: textPrimary,
                      marginLeft: 12,
                      flex: 1,
                      fontSize: 15,
                    }}
                  />
                </View>
              </View>

              {/* Priority */}
              <Text
                style={{
                  color: textSecondary,
                  fontSize: 11,
                  marginBottom: 10,
                  fontWeight: '600',
                }}
              >
                PRIORITY
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 22,
                }}
              >
                {priorities.map((priority) => {
                  const active = newPriority === priority;

                  return (
                    <TouchableOpacity
                      key={priority}
                      onPress={() => setNewPriority(priority as any)}
                      style={{
                        flex: 1,
                        marginHorizontal: 4,
                        backgroundColor: active ? primaryBrown : inputBg,
                        borderRadius: 20,
                        paddingVertical: 11,
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          color: active ? '#FFF' : textSecondary,
                          fontWeight: '600',
                          fontSize: 13,
                        }}
                      >
                        {priority}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Notes */}
              <Text
                style={{
                  color: textSecondary,
                  fontSize: 11,
                  marginBottom: 10,
                  fontWeight: '600',
                }}
              >
                NOTES
              </Text>

              <View
                style={{
                  backgroundColor: inputBg,
                  borderRadius: 18,
                  paddingHorizontal: 16,
                  paddingTop: 14,
                  paddingBottom: 14,
                  marginBottom: 22,
                  minHeight: 110,
                }}
              >
                <TextInput
                  value={newDesc}
                  onChangeText={setNewDesc}
                  placeholder="Add notes or instructions..."
                  placeholderTextColor={textSecondary}
                  multiline
                  textAlignVertical="top"
                  style={{
                    color: textPrimary,
                    fontSize: 15,
                    minHeight: 90,
                  }}
                />
              </View>

              {/* Checklist */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    color: textSecondary,
                    fontSize: 11,
                    fontWeight: '600',
                  }}
                >
                  CHECKLIST
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: inputBg,
                  borderRadius: 18,
                  padding: 14,
                  marginBottom: 22,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 14,
                  }}
                >
                  <TextInput
                    value={newSubTaskInput}
                    onChangeText={setNewSubTaskInput}
                    placeholder="Add checklist item"
                    placeholderTextColor={textSecondary}
                    style={{
                      flex: 1,
                      color: textPrimary,
                      fontSize: 15,
                    }}
                    onSubmitEditing={handleAddSubTaskToList}
                  />

                  <TouchableOpacity onPress={handleAddSubTaskToList}>
                    <Feather name="plus-circle" size={24} color={primaryBrown} />
                  </TouchableOpacity>
                </View>

                {newSubTasksList.map((task, index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 10,
                      borderTopWidth: index === 0 ? 1 : 0,
                      borderColor: borderCol,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        flex: 1,
                      }}
                    >
                      <Feather name="circle" size={16} color={primaryBrown} />
                      <Text
                        style={{
                          color: textPrimary,
                          marginLeft: 10,
                          fontSize: 14,
                        }}
                      >
                        {task}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleRemoveSubTaskFromList(index)}
                    >
                      <Feather name="trash-2" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Reminder */}
              <TouchableOpacity
                onPress={() => setNewHasReminder(!newHasReminder)}
                style={{
                  backgroundColor: inputBg,
                  borderRadius: 18,
                  padding: 16,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 28,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Feather name="bell" size={18} color={primaryBrown} />
                  <Text
                    style={{
                      color: textPrimary,
                      marginLeft: 12,
                      fontSize: 15,
                      fontWeight: '600',
                    }}
                  >
                    Reminder
                  </Text>
                </View>

                <View
                  style={{
                    width: 46,
                    height: 26,
                    borderRadius: 20,
                    padding: 3,
                    backgroundColor: newHasReminder
                      ? primaryBrown
                      : borderCol,
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: '#FFF',
                      alignSelf: newHasReminder
                        ? 'flex-end'
                        : 'flex-start',
                    }}
                  />
                </View>
              </TouchableOpacity>

              {/* Save */}
              <TouchableOpacity
                onPress={handleCreateTask}
                style={{
                  backgroundColor: primaryBrown,
                  borderRadius: 22,
                  paddingVertical: 17,
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Feather name="check-circle" size={18} color="#FFF" />
                  <Text
                    style={{
                      color: '#FFF',
                      fontSize: 16,
                      fontWeight: '700',
                      marginLeft: 8,
                    }}
                  >
                    Save Task
                  </Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}