
import React, { useState } from 'react';
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

interface AddTaskModalProps {
  taskData: ReturnType<typeof useTaskData>;
  theme: TaskTheme;
}

type Picker = 'date' | 'time' | null;
type Period = 'AM' | 'PM';

export default function AddTaskModal({
  taskData,
  theme,
}: AddTaskModalProps) {
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

  const [picker, setPicker] = useState<Picker>(null);

  const now = new Date();

  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  const [hour, setHour] = useState(6);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<Period>('PM');

  const priorities = ['High', 'Medium', 'Low'];

  /* ---------------- DATE ---------------- */

  const formatDate = (date: Date) => {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  };

  const selectedDate = newDueDate
    ? new Date(`${newDueDate}T12:00:00`)
    : now;

  const monthName = new Date(
    year,
    month
  ).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const days = Array.from(
    { length: firstDay + daysInMonth },
    (_, i) =>
      i < firstDay
        ? null
        : i - firstDay + 1
  );

  const selectDate = (day: number) => {
    const date = new Date(year, month, day);

    setNewDueDate(formatDate(date));
    setPicker(null);
  };

  /* ---------------- TIME ---------------- */

  const updateTime = (
    h: number,
    m: number,
    p: Period
  ) => {
    let normalized = h;

    if (p === 'PM' && h !== 12) {
      normalized += 12;
    }

    if (p === 'AM' && h === 12) {
      normalized = 0;
    }

    setNewDueTime(
      `${String(normalized).padStart(2, '0')}:${String(
        m
      ).padStart(2, '0')}`
    );
  };

  const changeHour = (amount: number) => {
    let next = hour + amount;

    if (next > 12) next = 1;
    if (next < 1) next = 12;

    setHour(next);
    updateTime(next, minute, period);
  };

  const changeMinute = (amount: number) => {
    let next = minute + amount;

    if (next > 59) next = 0;
    if (next < 0) next = 59;

    setMinute(next);
    updateTime(hour, next, period);
  };

  const changePeriod = (value: Period) => {
    setPeriod(value);
    updateTime(hour, minute, value);
  };

  /* ---------------- DISPLAY ---------------- */

  const dateLabel = selectedDate.toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );

  const timeLabel = newDueTime
    ? (() => {
      const [h, m] = newDueTime
        .split(':')
        .map(Number);

      const p = h >= 12 ? 'PM' : 'AM';
      const displayHour =
        h % 12 === 0 ? 12 : h % 12;

      return `${String(displayHour).padStart(
        2,
        '0'
      )}:${String(m).padStart(2, '0')} ${p}`;
    })()
    : '6:00 PM';

  return (
    <Modal
      visible={isAdding}
      transparent
      animationType="slide"
      onRequestClose={() => setIsAdding(false)}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
      >
        <KeyboardAvoidingView
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >
          <View
            style={{
              backgroundColor: cardBg,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: '90%',
              borderTopWidth: 1,
              borderColor: borderCol,
            }}
          >
            {/* HEADER */}

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 18,
                borderBottomWidth: 1,
                borderColor: borderCol,
              }}
            >
              <Text
                style={{
                  color: textPrimary,
                  fontSize: 20,
                  fontWeight: '700',
                }}
              >
                New Task
              </Text>

              <TouchableOpacity
                onPress={() => setIsAdding(false)}
              >
                <Feather
                  name="x"
                  size={21}
                  color={textSecondary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                padding: 18,
                paddingBottom: 30,
              }}
            >
              {/* TITLE */}

              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="Task title"
                placeholderTextColor={textSecondary}
                style={{
                  backgroundColor: inputBg,
                  color: textPrimary,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  height: 48,
                  fontSize: 15,
                  marginBottom: 16,
                }}
              />

              {/* SUBJECT */}

              <Text
                style={{
                  color: textSecondary,
                  fontSize: 11,
                  fontWeight: '700',
                  marginBottom: 8,
                }}
              >
                SUBJECT
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{
                  marginBottom: 16,
                }}
              >
                {SUBJECTS.map((subject) => {
                  const active =
                    newSubject === subject;

                  return (
                    <TouchableOpacity
                      key={subject}
                      onPress={() =>
                        setNewSubject(subject)
                      }
                      style={{
                        paddingHorizontal: 13,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: active
                          ? primaryBrown
                          : inputBg,
                        marginRight: 7,
                      }}
                    >
                      <Text
                        style={{
                          color: active
                            ? '#FFF'
                            : textPrimary,
                          fontSize: 12,
                          fontWeight: '600',
                        }}
                      >
                        {subject}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* PRIORITY */}

              <Text
                style={{
                  color: textSecondary,
                  fontSize: 11,
                  fontWeight: '700',
                  marginBottom: 8,
                }}
              >
                PRIORITY
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: 16,
                }}
              >
                {priorities.map((priority) => {
                  const active =
                    newPriority === priority;

                  return (
                    <TouchableOpacity
                      key={priority}
                      onPress={() =>
                        setNewPriority(
                          priority as any
                        )
                      }
                      style={{
                        flex: 1,
                        height: 38,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 10,
                        backgroundColor: active
                          ? primaryBrown
                          : inputBg,
                        marginRight:
                          priority !== 'Low'
                            ? 6
                            : 0,
                      }}
                    >
                      <Text
                        style={{
                          color: active
                            ? '#FFF'
                            : textSecondary,
                          fontSize: 12,
                          fontWeight: '600',
                        }}
                      >
                        {priority}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* DATE / TIME */}


              <Text
                style={{
                  color: textSecondary,
                  fontSize: 10,
                  fontWeight: '700',
                  letterSpacing: 0.8,
                  marginBottom: 8,
                }}
              >
                SCHEDULE
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                {/* DATE */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setPicker('date')}
                  style={{
                    flex: 1,
                    height: 52,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                    borderRadius: 10,
                    backgroundColor: inputBg,
                    borderWidth: 1,
                    borderColor: borderCol,
                  }}
                >
                  <Feather
                    name="calendar"
                    size={15}
                    color={primaryBrown}
                  />

                  <View style={{ marginLeft: 9, flex: 1 }}>
                    <Text
                      style={{
                        color: textSecondary,
                        fontSize: 9,
                        marginBottom: 2,
                      }}
                    >
                      DATE
                    </Text>

                    <Text
                      numberOfLines={1}
                      style={{
                        color: textPrimary,
                        fontSize: 12,
                        fontWeight: '600',
                      }}
                    >
                      {dateLabel}
                    </Text>
                  </View>

                  <Feather
                    name="chevron-down"
                    size={14}
                    color={textSecondary}
                  />
                </TouchableOpacity>

                {/* TIME */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setPicker('time')}
                  style={{
                    flex: 1,
                    height: 52,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                    borderRadius: 10,
                    backgroundColor: inputBg,
                    borderWidth: 1,
                    borderColor: borderCol,
                  }}
                >
                  <Feather
                    name="clock"
                    size={15}
                    color={primaryBrown}
                  />

                  <View style={{ marginLeft: 9, flex: 1 }}>
                    <Text
                      style={{
                        color: textSecondary,
                        fontSize: 9,
                        marginBottom: 2,
                      }}
                    >
                      TIME
                    </Text>

                    <Text
                      numberOfLines={1}
                      style={{
                        color: textPrimary,
                        fontSize: 12,
                        fontWeight: '600',
                      }}
                    >
                      {timeLabel}
                    </Text>
                  </View>

                  <Feather
                    name="chevron-down"
                    size={14}
                    color={textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {/* NOTES */}

              <Text
                style={{
                  color: textSecondary,
                  fontSize: 11,
                  fontWeight: '700',
                  marginBottom: 8,
                }}
              >
                NOTES
              </Text>

              <TextInput
                value={newDesc}
                onChangeText={setNewDesc}
                placeholder="Add a note..."
                placeholderTextColor={textSecondary}
                multiline
                textAlignVertical="top"
                style={{
                  backgroundColor: inputBg,
                  color: textPrimary,
                  borderRadius: 12,
                  padding: 13,
                  minHeight: 72,
                  fontSize: 14,
                  marginBottom: 16,
                }}
              />

              {/* CHECKLIST */}

              <TouchableOpacity
                onPress={() =>
                  setNewSubTaskInput('')
                }
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 5,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    color: textSecondary,
                    fontSize: 11,
                    fontWeight: '700',
                  }}
                >
                  CHECKLIST
                </Text>

                <Feather
                  name="plus"
                  size={18}
                  color={primaryBrown}
                />
              </TouchableOpacity>

              <View
                style={{
                  backgroundColor: inputBg,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <TextInput
                    value={newSubTaskInput}
                    onChangeText={setNewSubTaskInput}
                    placeholder="Add checklist item"
                    placeholderTextColor={
                      textSecondary
                    }
                    onSubmitEditing={
                      handleAddSubTaskToList
                    }
                    style={{
                      flex: 1,
                      height: 44,
                      color: textPrimary,
                      fontSize: 13,
                    }}
                  />

                  <TouchableOpacity
                    onPress={
                      handleAddSubTaskToList
                    }
                  >
                    <Feather
                      name="plus-circle"
                      size={19}
                      color={primaryBrown}
                    />
                  </TouchableOpacity>
                </View>

                {newSubTasksList.map(
                  (item, index) => (
                    <View
                      key={`${item}-${index}`}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 9,
                        borderTopWidth: 1,
                        borderColor: borderCol,
                      }}
                    >
                      <Feather
                        name="circle"
                        size={14}
                        color={primaryBrown}
                      />

                      <Text
                        style={{
                          flex: 1,
                          marginLeft: 8,
                          color: textPrimary,
                          fontSize: 13,
                        }}
                      >
                        {item}
                      </Text>

                      <TouchableOpacity
                        onPress={() =>
                          handleRemoveSubTaskFromList(
                            index
                          )
                        }
                      >
                        <Feather
                          name="trash-2"
                          size={15}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                    </View>
                  )
                )}
              </View>

              {/* REMINDER */}

              <TouchableOpacity
                onPress={() =>
                  setNewHasReminder(
                    !newHasReminder
                  )
                }
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 5,
                  marginBottom: 18,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Feather
                    name="bell"
                    size={17}
                    color={primaryBrown}
                  />

                  <Text
                    style={{
                      color: textPrimary,
                      marginLeft: 9,
                      fontSize: 14,
                    }}
                  >
                    Reminder
                  </Text>
                </View>

                <View
                  style={{
                    width: 38,
                    height: 22,
                    borderRadius: 20,
                    backgroundColor:
                      newHasReminder
                        ? primaryBrown
                        : borderCol,
                    padding: 2,
                    justifyContent: 'center',
                  }}
                >
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      backgroundColor: '#FFF',
                      alignSelf:
                        newHasReminder
                          ? 'flex-end'
                          : 'flex-start',
                    }}
                  />
                </View>
              </TouchableOpacity>

              {/* SAVE */}

              <TouchableOpacity
                onPress={handleCreateTask}
                style={{
                  height: 48,
                  borderRadius: 13,
                  backgroundColor: primaryBrown,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    color: '#FFF',
                    fontSize: 14,
                    fontWeight: '700',
                  }}
                >
                  Create Task
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* =================================================
                DATE PICKER
            ================================================= */}

            {picker === 'date' && (
              <View
                style={{
                  position: 'absolute',
                  left: 18,
                  right: 18,
                  top: 70,
                  backgroundColor: cardBg,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: borderCol,
                  padding: 14,
                  elevation: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 14,
                  }}
                >
                  <Text
                    style={{
                      color: textPrimary,
                      fontSize: 15,
                      fontWeight: '700',
                    }}
                  >
                    {monthName}
                  </Text>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        const date = new Date(
                          year,
                          month - 1,
                          1
                        );

                        setMonth(
                          date.getMonth()
                        );
                        setYear(
                          date.getFullYear()
                        );
                      }}
                      style={{
                        padding: 5,
                      }}
                    >
                      <Feather
                        name="chevron-left"
                        size={17}
                        color={textSecondary}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        const date = new Date(
                          year,
                          month + 1,
                          1
                        );

                        setMonth(
                          date.getMonth()
                        );
                        setYear(
                          date.getFullYear()
                        );
                      }}
                      style={{
                        padding: 5,
                      }}
                    >
                      <Feather
                        name="chevron-right"
                        size={17}
                        color={textSecondary}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setPicker(null)}
                      accessibilityRole="button"
                      accessibilityLabel="Close date picker"
                      style={{ padding: 5, marginLeft: 4 }}
                    >
                      <Feather
                        name="x"
                        size={20}
                        color={textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    marginBottom: 5,
                  }}
                >
                  {[
                    'S',
                    'M',
                    'T',
                    'W',
                    'T',
                    'F',
                    'S',
                  ].map((day, index) => (
                    <Text
                      key={index}
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        color: textSecondary,
                        fontSize: 10,
                        fontWeight: '700',
                      }}
                    >
                      {day}
                    </Text>
                  ))}
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                  }}
                >
                  {days.map((day, index) => {
                    if (day === null) {
                      return (
                        <View
                          key={`empty-${index}`}
                          style={{
                            width: '14.285%',
                            height: 34,
                          }}
                        />
                      );
                    }

                    const selected =
                      selectedDate.getDate() ===
                      day &&
                      selectedDate.getMonth() ===
                      month &&
                      selectedDate.getFullYear() ===
                      year;

                    return (
                      <TouchableOpacity
                        key={`day-${day}`}
                        onPress={() =>
                          selectDate(day)
                        }
                        style={{
                          width: '14.285%',
                          height: 34,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <View
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 9,
                            alignItems:
                              'center',
                            justifyContent:
                              'center',
                            backgroundColor:
                              selected
                                ? primaryBrown
                                : 'transparent',
                          }}
                        >
                          <Text
                            style={{
                              color: selected
                                ? '#FFF'
                                : textPrimary,
                              fontSize: 12,
                              fontWeight:
                                selected
                                  ? '700'
                                  : '500',
                            }}
                          >
                            {day}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* =================================================
                TIME PICKER
            ================================================= */}

            {picker === 'time' && (
              <View
                style={{
                  position: 'absolute',
                  left: 18,
                  right: 18,
                  top: 70,
                  backgroundColor: cardBg,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: borderCol,
                  padding: 18,
                  elevation: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      color: textSecondary,
                      fontSize: 10,
                      fontWeight: '700',
                    }}
                  >
                    TIME
                  </Text>
                  
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 18,
                  }}
                >
                  <TouchableOpacity
                    onPress={() =>
                      changeHour(-1)
                    }
                  >
                    <Feather
                      name="chevron-left"
                      size={20}
                      color={textSecondary}
                    />
                  </TouchableOpacity>

                  <Text
                    style={{
                      color: textPrimary,
                      fontSize: 30,
                      fontWeight: '700',
                      marginHorizontal: 12,
                    }}
                  >
                    {String(hour).padStart(
                      2,
                      '0'
                    )}
                  </Text>

                  <Text
                    style={{
                      color: primaryBrown,
                      fontSize: 28,
                      fontWeight: '700',
                    }}
                  >
                    :
                  </Text>

                  <Text
                    style={{
                      color: textPrimary,
                      fontSize: 30,
                      fontWeight: '700',
                      marginHorizontal: 12,
                    }}
                  >
                    {String(minute).padStart(
                      2,
                      '0'
                    )}
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      changeMinute(1)
                    }
                  >
                    <Feather
                      name="chevron-right"
                      size={20}
                      color={textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: inputBg,
                    borderRadius: 10,
                    padding: 3,
                  }}
                >
                  {(['AM', 'PM'] as Period[]).map(
                    (value) => {
                      const active =
                        period === value;

                      return (
                        <TouchableOpacity
                          key={value}
                          onPress={() =>
                            changePeriod(
                              value
                            )
                          }
                          style={{
                            flex: 1,
                            paddingVertical: 8,
                            alignItems:
                              'center',
                            borderRadius: 8,
                            backgroundColor:
                              active
                                ? primaryBrown
                                : 'transparent',
                          }}
                        >
                          <Text
                            style={{
                              color: active
                                ? '#FFF'
                                : textSecondary,
                              fontSize: 11,
                              fontWeight:
                                '700',
                            }}
                          >
                            {value}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => setPicker(null)}
                  style={{
                    marginTop: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: primaryBrown,
                      fontSize: 20,
                      fontWeight: '700',
                      
                    }}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

