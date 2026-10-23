import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import FieldError from '@/components/FieldError';
import { LIMITS, checkLength } from '@/utils/formValidation';

import type { useTaskData } from '../../hooks/useTaskData';
import { TaskTheme } from '../../types';

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


    editingTask,
    setEditingTask,

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

    handleCreateTask,
    handleUpdateTask,


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


  // Text being typed in the hour / minute boxes (null = not editing).
  const [hourDraft, setHourDraft] = useState<string | null>(null);
  const [minuteDraft, setMinuteDraft] = useState<string | null>(null);

  /**
  
  * Sync the calendar and clock picker with the current task.
  *
  * This is important when opening the modal for editing because
  * the task already has an existing due date and time.
  *
  * Done during render (not in an effect) whenever the modal opens,
  * closes or switches task, so the picker never shows stale values.
    */
  /* Inline validation: shown after the title is left or Save is tapped. */
  const [titleTouched, setTitleTouched] = useState(false);
  const [subjectTouched, setSubjectTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [syncedFor, setSyncedFor] = useState<{
    isAdding: boolean;
    editingTask: typeof editingTask;
  } | null>(null);

  if (
    syncedFor === null ||
    syncedFor.isAdding !== isAdding ||
    syncedFor.editingTask !== editingTask
  ) {
    setSyncedFor({ isAdding, editingTask });
    setPicker(null);
    setTitleTouched(false);
    setSubjectTouched(false);
    setSubmitted(false);

    if (isAdding) {
      const parsedDate = newDueDate
        ? new Date(`${newDueDate}T12:00:00`)
        : new Date();

      if (!Number.isNaN(parsedDate.getTime())) {
        setMonth(parsedDate.getMonth());
        setYear(parsedDate.getFullYear());
      }

      const [rawHour, rawMinute] = (
        newDueTime || '18:00'
      )
        .split(':')
        .map(Number);

      const h24 = Number.isFinite(rawHour)
        ? rawHour
        : 18;

      const m = Number.isFinite(rawMinute)
        ? Math.max(0, Math.min(59, rawMinute))
        : 0;

      setHour(
        h24 % 12 === 0
          ? 12
          : h24 % 12
      );

      setMinute(m);

      setPeriod(
        h24 >= 12
          ? 'PM'
          : 'AM'
      );
    }
  }

  /* ---------------- CLOSE ---------------- */

  const handleClose = () => {
    setIsAdding(false);
    setEditingTask(null);
    setPicker(null);
  };

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
    const date = new Date(
      year,
      month,
      day
    );


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
      `${String(normalized).padStart(
        2,
        '0'
      )}:${String(m).padStart(
        2,
        '0'
      )}`
    );


  };

  // Typing updates the time right away (hour 1-12, minute 0-59).
  const typeHour = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, 2);
    setHourDraft(digits);
    const n = Number(digits);
    if (digits && n >= 1) {
      const next = Math.min(12, n);
      setHour(next);
      updateTime(next, minute, period);
    }
  };

  const typeMinute = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, 2);
    setMinuteDraft(digits);
    if (digits) {
      const next = Math.min(59, Number(digits));
      setMinute(next);
      updateTime(hour, next, period);
    }
  };

  // Leaving a box: show the saved value again (empty or "0" falls back).
  const finishTyping = () => {
    setHourDraft(null);
    setMinuteDraft(null);
  };

  const changePeriod = (
    value: Period
  ) => {
    finishTyping();
    setPeriod(value);
    updateTime(
      hour,
      minute,
      value
    );
  };

  /* ---------------- DISPLAY ---------------- */

  const dateLabel =
    selectedDate.toLocaleDateString(
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


      const p =
        h >= 12
          ? 'PM'
          : 'AM';

      const displayHour =
        h % 12 === 0
          ? 12
          : h % 12;

      return `${String(
        displayHour
      ).padStart(
        2,
        '0'
      )}:${String(m).padStart(
        2,
        '0'
      )} ${p}`;
    })()
    : '06:00 PM';

  const isEditMode = !!editingTask;

  // "Rings at 6:00 PM on Oct 24, 2026 · reminder 1 day before"
  const alarmHint = (() => {
    const [h, m] = (newDueTime || '12:00').split(':').map(Number);
    const due = new Date(selectedDate);
    due.setHours(Number.isFinite(h) ? h : 12, Number.isFinite(m) ? m : 0, 0, 0);
    const msLeft = due.getTime() - Date.now();
    if (msLeft <= 0) return 'This time has passed, so the alarm will not ring.';
    return `Rings at ${timeLabel} on ${dateLabel}${
      msLeft >= 24 * 60 * 60 * 1000 ? ' · reminder 1 day before' : ''
    }`;
  })();

  // An old task title that is kept as-is is never blocked.
  const originalTitle = String((editingTask as { title?: string } | null)?.title ?? '').trim();
  const titleError =
    isEditMode && newTitle.trim() === originalTitle && originalTitle
      ? ''
      : checkLength(newTitle, {
          min: LIMITS.taskTitleMin,
          max: LIMITS.taskTitleMax,
          empty: 'Add a task title',
          short: `Add a task title (at least ${LIMITS.taskTitleMin} characters)`,
        });
  const shownTitleError = submitted || titleTouched ? titleError : '';

  // Subject is required (2-40 characters). An old task saved without a
  // subject ("General") can still be edited if the subject is not touched.
  const originalSubject = String(
    (editingTask as { subject?: string } | null)?.subject ?? '',
  ).trim();
  const keepsOldSubject =
    isEditMode &&
    (newSubject.trim() === originalSubject ||
      (!newSubject.trim() && (!originalSubject || originalSubject === 'General')));
  const subjectError = keepsOldSubject
    ? ''
    : checkLength(newSubject, {
        min: 2,
        max: LIMITS.subjectMax,
        empty: 'Add a subject (e.g. Math 101)',
        short: 'Use at least 2 characters',
      });
  const shownSubjectError = submitted || subjectTouched ? subjectError : '';
  const formInvalid = Boolean(titleError || subjectError);

  const save = () => {
    setSubmitted(true);
    if (formInvalid) return;
    if (isEditMode) handleUpdateTask();
    else handleCreateTask();
  };

  const counter = (count: number, max: number) => (
    <Text style={{ color: textSecondary, fontSize: 11, marginLeft: 8 }}>
      {count}/{max}
    </Text>
  );

  return (<Modal
    visible={isAdding}
    transparent
    animationType="slide"
    onRequestClose={handleClose}
  >
    <View
      style={{
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: theme.isDark
          ? 'rgba(0,0,0,0.68)'
          : 'rgba(44, 34, 26, 0.32)',
      }}
    >
      <KeyboardAvoidingView behavior="padding">
        <View
          style={{
            backgroundColor: cardBg,
            borderTopLeftRadius: 26,
            borderTopRightRadius: 26,
            maxHeight: '90%',
            borderTopWidth: 1,
            borderColor: borderCol,
          }}
        >
          {/* HEADER */}

        
          <View
            style={{
              flexDirection: 'row',
              justifyContent:
                'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 18,
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
              {isEditMode
                ? 'Edit Task'
                : 'New Task'}
            </Text>

            <TouchableOpacity
              onPress={handleClose}
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
              padding: 20,
              paddingBottom: 30,
            }}
          >
            {/* TITLE */}

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: inputBg,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: shownTitleError ? '#EF4444' : borderCol,
                paddingHorizontal: 14,
                height: 50,
              }}
            >
              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                onBlur={() => setTitleTouched(true)}
                placeholder="Task title"
                placeholderTextColor={
                  textSecondary
                }
                maxLength={LIMITS.taskTitleMax}
                style={{
                  flex: 1,
                  color: textPrimary,
                  fontSize: 15,
                  height: '100%',
                }}
              />
              {counter(newTitle.length, LIMITS.taskTitleMax)}
            </View>
            <FieldError message={shownTitleError} />
            <View style={{ height: 16 }} />

            {/* SUBJECT (typed by the user) */}

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

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: inputBg,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: shownSubjectError ? '#EF4444' : borderCol,
                paddingHorizontal: 13,
                height: 46,
              }}
            >
              <TextInput
                value={newSubject}
                onChangeText={setNewSubject}
                onBlur={() => setSubjectTouched(true)}
                placeholder="e.g. Math 101"
                placeholderTextColor={textSecondary}
                autoCapitalize="words"
                maxLength={LIMITS.subjectMax}
                style={{
                  flex: 1,
                  color: textPrimary,
                  fontSize: 14,
                  height: '100%',
                }}
              />
              {counter(newSubject.length, LIMITS.subjectMax)}
            </View>
            <FieldError message={shownSubjectError} />
            <View style={{ height: 16 }} />


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
              {priorities.map(
                (priority) => {
                  const active =
                    newPriority ===
                    priority;

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
                        justifyContent:
                          'center',
                        alignItems:
                          'center',
                        borderRadius: 10,
                        backgroundColor:
                          active
                            ? primaryBrown
                            : inputBg,
                        borderWidth: 1,
                        borderColor:
                          active
                            ? primaryBrown
                            : borderCol,
                        marginRight:
                          priority !==
                            'Low'
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
                          fontWeight:
                            '600',
                        }}
                      >
                        {priority}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
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
                onPress={() =>
                  setPicker('date')
                }
                style={{
                  flex: 1,
                  height: 52,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  borderRadius: 13,
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

                <View
                  style={{
                    marginLeft: 9,
                    flex: 1,
                  }}
                >
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
                onPress={() =>
                  setPicker('time')
                }
                style={{
                  flex: 1,
                  height: 52,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  borderRadius: 13,
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

                <View
                  style={{
                    marginLeft: 9,
                    flex: 1,
                  }}
                >
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

            {/* ALARM (same as Calendar) */}

            <Text
              style={{
                color: textSecondary,
                fontSize: 11,
                fontWeight: '700',
                marginBottom: 8,
              }}
            >
              ALARM
            </Text>

            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[
                { label: 'Off', value: false },
                { label: 'On', value: true },
              ].map((option) => {
                const active = newHasReminder === option.value;
                return (
                  <TouchableOpacity
                    key={option.label}
                    onPress={() => setNewHasReminder(option.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={{
                      flex: 1,
                      height: 38,
                      flexDirection: 'row',
                      gap: 6,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 10,
                      backgroundColor: active ? primaryBrown : inputBg,
                      borderWidth: 1,
                      borderColor: active ? primaryBrown : borderCol,
                    }}
                  >
                    {option.value && (
                      <Feather
                        name="bell"
                        size={13}
                        color={active ? '#FFF' : textSecondary}
                      />
                    )}
                    <Text
                      style={{
                        color: active ? '#FFF' : textSecondary,
                        fontSize: 12,
                        fontWeight: '600',
                      }}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text
              style={{
                color: textSecondary,
                fontSize: 11.5,
                marginTop: 8,
                marginBottom: 16,
              }}
            >
              {newHasReminder
                ? alarmHint
                : 'No alarm for this task.'}
            </Text>

            {/* NOTES */}

            <Text
              style={{
                color: textSecondary,
                fontSize: 11,
                fontWeight: '700',
                marginBottom: 8,
              }}
            >
              NOTES{' '}
              <Text style={{ fontWeight: '600' }}>(OPTIONAL)</Text>
            </Text>

            <TextInput
              value={newDesc}
              onChangeText={setNewDesc}
              placeholder="Add a note..."
              placeholderTextColor={
                textSecondary
              }
              multiline
              maxLength={LIMITS.taskNoteMax}
              textAlignVertical="top"
              style={{
                backgroundColor: inputBg,
                color: textPrimary,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: borderCol,
                padding: 13,
                minHeight: 72,
                fontSize: 14,
              }}
            />
            <View style={{ alignItems: 'flex-end', marginTop: 4, marginBottom: 12 }}>
              {counter(newDesc.length, LIMITS.taskNoteMax)}
            </View>

            {/* SAVE */}

            <TouchableOpacity
              onPress={save}
              style={{
                height: 48,
                borderRadius: 13,
                opacity: formInvalid ? 0.5 : 1,
                backgroundColor:
                  primaryBrown,
                alignItems: 'center',
                justifyContent:
                  'center',
              }}
            >
              <Text
                style={{
                  color: '#FFF',
                  fontSize: 14,
                  fontWeight: '700',
                }}
              >
                {isEditMode
                  ? 'Save Changes'
                  : 'Create Task'}
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
                borderRadius: 18,
                borderWidth: 1,
                borderColor: borderCol,
                padding: 14,
                elevation: 10,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent:
                    'space-between',
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
                      const date =
                        new Date(
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
                      color={
                        textSecondary
                      }
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      const date =
                        new Date(
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
                      color={
                        textSecondary
                      }
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      setPicker(null)
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Close date picker"
                    style={{
                      padding: 5,
                      marginLeft: 4,
                    }}
                  >
                    <Feather
                      name="x"
                      size={20}
                      color={
                        textSecondary
                      }
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
                ].map(
                  (day, index) => (
                    <Text
                      key={index}
                      style={{
                        flex: 1,
                        textAlign:
                          'center',
                        color:
                          textSecondary,
                        fontSize: 10,
                        fontWeight:
                          '700',
                      }}
                    >
                      {day}
                    </Text>
                  )
                )}
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                }}
              >
                {days.map(
                  (day, index) => {
                    if (day === null) {
                      return (
                        <View
                          key={`empty-${index}`}
                          style={{
                            width:
                              '14.285%',
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
                          selectDate(
                            day
                          )
                        }
                        style={{
                          width:
                            '14.285%',
                          height: 34,
                          alignItems:
                            'center',
                          justifyContent:
                            'center',
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
                              color:
                                selected
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
                  }
                )}
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
                borderRadius: 18,
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
                  justifyContent:
                    'space-between',
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

              {/* Hour and minute: tap a box and type */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  marginBottom: 14,
                }}
              >
                {[
                  {
                    key: 'hour',
                    label: 'Hour',
                    text: hourDraft ?? String(hour).padStart(2, '0'),
                    isEditing: hourDraft !== null,
                    onChange: typeHour,
                    onFocus: () => setHourDraft(''),
                  },
                  {
                    key: 'minute',
                    label: 'Min',
                    text: minuteDraft ?? String(minute).padStart(2, '0'),
                    isEditing: minuteDraft !== null,
                    onChange: typeMinute,
                    onFocus: () => setMinuteDraft(''),
                  },
                ].map((part, index) => (
                  <View
                    key={part.key}
                    style={{ flexDirection: 'row', alignItems: 'flex-start' }}
                  >
                    {index === 1 && (
                      <Text
                        style={{
                          color: primaryBrown,
                          fontSize: 30,
                          fontWeight: '700',
                          marginHorizontal: 10,
                          marginTop: 14,
                        }}
                      >
                        :
                      </Text>
                    )}

                    <View style={{ alignItems: 'center' }}>
                      <TextInput
                        value={part.text}
                        onChangeText={part.onChange}
                        onFocus={part.onFocus}
                        onBlur={finishTyping}
                        keyboardType="number-pad"
                        returnKeyType="done"
                        maxLength={2}
                        selectTextOnFocus
                        accessibilityLabel={part.label}
                        style={{
                          width: 80,
                          height: 66,
                          borderRadius: 16,
                          borderWidth: 1.5,
                          borderColor: part.isEditing ? primaryBrown : borderCol,
                          backgroundColor: inputBg,
                          color: textPrimary,
                          fontSize: 34,
                          fontWeight: '700',
                          textAlign: 'center',
                          padding: 0,
                        }}
                      />

                      <Text
                        style={{
                          color: textSecondary,
                          fontSize: 10,
                          marginTop: 6,
                        }}
                      >
                        {part.label}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor:
                    inputBg,
                  borderRadius: 10,
                  padding: 3,
                }}
              >
                {(
                  ['AM', 'PM'] as Period[]
                ).map(
                  (value) => {
                    const active =
                      period ===
                      value;

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
                onPress={() => {
                  finishTyping();
                  setPicker(null);
                }}
                style={{
                  marginTop: 16,
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