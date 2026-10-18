import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { EventCategory, EventPriority } from '../types';

interface QuickAddEventModalProps {
  mode?: 'add' | 'edit';
  saveButtonLabel?: string;
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
  onSave: () => void;
  modalSurface: string;
  borderTheme: string;
  textTheme: string;
  textSubTheme: string;
  bgTheme: string;
  primaryAccent: string;

  // No longer shown in the form. Kept optional so calendar.tsx
  // still compiles without changes.
  duration?: string;
  onDurationChange?: (val: string) => void;
  checklistText?: string;
  onChecklistTextChange?: (val: string) => void;
  checklistItems?: string[];
  onAddChecklistItem?: () => void;
  onRemoveChecklistItem?: (idx: number) => void;
}

type Period = 'AM' | 'PM';
type Picker = 'date' | 'time' | null;

const CATEGORIES_LIST: EventCategory[] = [
  'Class',
  'Exam',
  'Assignment',
  'Focus Session',
  'Meeting',
  'Personal',
];

const PRIORITIES_LIST: EventPriority[] = ['Low', 'Medium', 'High'];

/* Alarm: beeps at the start time (plus a reminder the day before
   when the event is 1 day or more away). */
const ALARM_ON = 'At start time';
const REMINDER_CHOICES: { label: string; value: string | null }[] = [
  { label: 'Off', value: null },
  { label: 'On', value: ALARM_ON },
];


const QUICK_TIMES: { label: string; h: number; m: number; p: Period }[] = [
  { label: '7:30 AM', h: 7, m: 30, p: 'AM' },
  { label: '8:00 AM', h: 8, m: 0, p: 'AM' },
  { label: '10:00 AM', h: 10, m: 0, p: 'AM' },
  { label: '1:00 PM', h: 1, m: 0, p: 'PM' },
  { label: '3:00 PM', h: 3, m: 0, p: 'PM' },
  { label: '5:00 PM', h: 5, m: 0, p: 'PM' },
  { label: '7:00 PM', h: 7, m: 0, p: 'PM' },
];

const WEEK_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/* ---------- helpers ---------- */

const toDateKey = (d: Date) =>
  [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');

const parseDate = (value: string) => {
  const d = value ? new Date(`${value}T12:00:00`) : new Date();
  return Number.isNaN(d.getTime()) ? new Date() : d;
};

/* "15:30" -> { hour: 3, minute: 30, period: 'PM' } */
const parseTime = (value: string) => {
  const [rawH, rawM] = (value || '09:00').split(':').map(Number);
  const h24 = Number.isFinite(rawH) ? Math.max(0, Math.min(23, rawH)) : 9;
  const minute = Number.isFinite(rawM) ? Math.max(0, Math.min(59, rawM)) : 0;
  return {
    hour: h24 % 12 === 0 ? 12 : h24 % 12,
    minute,
    period: (h24 >= 12 ? 'PM' : 'AM') as Period,
  };
};

/* { 3, 30, 'PM' } -> "15:30" */
const buildTime = (hour: number, minute: number, period: Period) => {
  let h24 = hour % 12;
  if (period === 'PM') h24 += 12;
  return `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

/* ---------- small render helpers ---------- */
// Defined outside the modal so React keeps the same component type
// between renders (inner components would remount on every render).

function Label({ children, color }: { children: string; color: string }) {
  return <Text style={[s.label, { color }]}>{children}</Text>;
}

function Segmented<T extends string>({
  options,
  active,
  onSelect,
  backgroundColor,
  borderColor,
  accentColor,
  textColor,
}: {
  options: { label: string; value: T }[];
  active: T;
  onSelect: (value: T) => void;
  backgroundColor: string;
  borderColor: string;
  accentColor: string;
  textColor: string;
}) {
  return (
    <View style={[s.seg, { backgroundColor, borderColor }]}>
      {options.map((option) => {
        const isActive = option.value === active;
        return (
          <TouchableOpacity
            key={option.label}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.8}
            style={[s.segItem, isActive && { backgroundColor: accentColor }]}
          >
            <Text
              style={[
                s.segText,
                { color: isActive ? '#FFFFFF' : textColor },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function QuickAddEventModal({
  mode = 'add',
  saveButtonLabel,
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
  isAllDay,
  onIsAllDayChange,
  hasReminder,
  onHasReminderChange,
  reminderTime,
  onReminderTimeChange,
  description,
  onDescriptionChange,
  onSave,
  modalSurface,
  borderTheme,
  textTheme,
  textSubTheme,
  bgTheme,
  primaryAccent,
}: QuickAddEventModalProps) {
  const [picker, setPicker] = useState<Picker>(null);

  // Text being typed in the hour / minute boxes (null = not editing).
  const [hourDraft, setHourDraft] = useState<string | null>(null);
  const [minuteDraft, setMinuteDraft] = useState<string | null>(null);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const inputBg = bgTheme;
  const selectedDate = parseDate(date);
  const { hour, minute, period } = parseTime(time);

  /* ---------- labels ---------- */

  const dateLabel = selectedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const timeLabel = `${hour}:${String(minute).padStart(2, '0')} ${period}`;

  /* ---------- date picker ---------- */

  const openDatePicker = () => {
    setMonth(selectedDate.getMonth());
    setYear(selectedDate.getFullYear());
    setPicker('date');
  };

  const shiftMonth = (amount: number) => {
    const d = new Date(year, month + amount, 1);
    setMonth(d.getMonth());
    setYear(d.getFullYear());
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1,
  );
  const monthName = new Date(year, month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const todayKey = toDateKey(new Date());

  const selectDay = (day: number) => {
    onDateChange(toDateKey(new Date(year, month, day)));
    setPicker(null);
  };

  /* ---------- time picker ---------- */

  // Typing updates the time right away (hour 1-12, minute 0-59).
  const typeHour = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, 2);
    setHourDraft(digits);
    const n = Number(digits);
    if (digits && n >= 1) onTimeChange(buildTime(Math.min(12, n), minute, period));
  };

  const typeMinute = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, 2);
    setMinuteDraft(digits);
    if (digits) onTimeChange(buildTime(hour, Math.min(59, Number(digits)), period));
  };

  // Leaving a box: show the saved value again (empty or "0" falls back).
  const finishTyping = () => {
    setHourDraft(null);
    setMinuteDraft(null);
  };

  const changePeriod = (value: Period) => {
    finishTyping();
    onTimeChange(buildTime(hour, minute, value));
  };

  /* ---------- selectors ---------- */

  const activeReminder = hasReminder ? ALARM_ON : null;

  const selectReminder = (value: string | null) => {
    if (value === null) {
      onHasReminderChange(false);
      return;
    }
    onHasReminderChange(true);
    onReminderTimeChange(value);
  };

  const handleClose = () => {
    setPicker(null);
    finishTyping();
    onClose();
  };

  const handleSave = () => {
    setPicker(null);
    onSave();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={s.overlay}>
        <KeyboardAvoidingView
          behavior="padding"
          style={[s.sheet, { backgroundColor: modalSurface }]}
        >
          <View style={[s.grab, { backgroundColor: borderTheme }]} />

          {/* Header */}
          <View style={[s.header, { borderBottomColor: borderTheme }]}>
            <Text style={[s.headerTitle, { color: textTheme }]}>
              {mode === 'edit' ? 'Edit Event' : 'New Event'}
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={[s.closeBtn, { backgroundColor: inputBg }]}
            >
              <Feather name="x" size={18} color={textSubTheme} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={s.body}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title */}
            <Label color={textSubTheme}>TITLE</Label>
            <TextInput
              placeholder="e.g. Math Quiz, Chemistry Lecture"
              placeholderTextColor={textSubTheme}
              style={[
                s.input,
                { color: textTheme, borderColor: borderTheme, backgroundColor: inputBg },
              ]}
              value={title}
              onChangeText={onTitleChange}
              returnKeyType="done"
            />

            {/* Type */}
            <Label color={textSubTheme}>TYPE</Label>
            <View style={s.chips}>
              {CATEGORIES_LIST.map((cat) => {
                const isActive = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => onCategoryChange(cat)}
                    activeOpacity={0.8}
                    style={[
                      s.chip,
                      {
                        borderColor: isActive ? primaryAccent : borderTheme,
                        backgroundColor: isActive ? primaryAccent : 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        s.chipText,
                        { color: isActive ? '#FFFFFF' : textTheme },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Date & Time */}
            <Label color={textSubTheme}>DATE & TIME</Label>
            <View style={s.row}>
              <TouchableOpacity
                onPress={openDatePicker}
                activeOpacity={0.8}
                style={[
                  s.pickBox,
                  { borderColor: borderTheme, backgroundColor: inputBg },
                ]}
              >
                <Feather name="calendar" size={18} color={primaryAccent} />
                <View style={s.pickTextWrap}>
                  <Text style={[s.pickCaption, { color: textSubTheme }]}>Date</Text>
                  <Text style={[s.pickValue, { color: textTheme }]}>{dateLabel}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => !isAllDay && setPicker('time')}
                activeOpacity={isAllDay ? 1 : 0.8}
                style={[
                  s.pickBox,
                  {
                    borderColor: borderTheme,
                    backgroundColor: inputBg,
                    opacity: isAllDay ? 0.45 : 1,
                  },
                ]}
              >
                <Feather name="clock" size={18} color={primaryAccent} />
                <View style={s.pickTextWrap}>
                  <Text style={[s.pickCaption, { color: textSubTheme }]}>Time</Text>
                  <Text style={[s.pickValue, { color: textTheme }]}>
                    {isAllDay ? 'All day' : timeLabel}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={s.toggleRow}>
              <Text style={[s.toggleText, { color: textTheme }]}>All day</Text>
              <Switch
                value={isAllDay}
                onValueChange={(value) => {
                  onIsAllDayChange(value);
                  if (value) setPicker(null);
                }}
                trackColor={{ false: '#767577', true: primaryAccent }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[s.divider, { backgroundColor: borderTheme }]} />

            {/* Priority */}
            <Label color={textSubTheme}>PRIORITY</Label>
            <Segmented
              backgroundColor={inputBg}
              borderColor={borderTheme}
              accentColor={primaryAccent}
              textColor={textSubTheme}
              options={PRIORITIES_LIST.map((p) => ({ label: p, value: p }))}
              active={priority}
              onSelect={onPriorityChange}
            />

            {/* Reminder */}
            <Label color={textSubTheme}>ALARM</Label>
            <Segmented
              backgroundColor={inputBg}
              borderColor={borderTheme}
              accentColor={primaryAccent}
              textColor={textSubTheme}
              options={REMINDER_CHOICES.map((r) => ({
                label: r.label,
                value: r.value ?? 'none',
              }))}
              active={activeReminder ?? 'none'}
              onSelect={(value) => selectReminder(value === 'none' ? null : value)}
            />

            {/* Notes */}
            <Label color={textSubTheme}>NOTES (OPTIONAL)</Label>
            <TextInput
              placeholder="Add room, topics, or reminders..."
              placeholderTextColor={textSubTheme}
              multiline
              style={[
                s.input,
                s.textArea,
                { color: textTheme, borderColor: borderTheme, backgroundColor: inputBg },
              ]}
              value={description}
              onChangeText={onDescriptionChange}
            />

            {/* Save */}
            <TouchableOpacity
              onPress={handleSave}
              activeOpacity={0.85}
              style={[s.saveBtn, { backgroundColor: primaryAccent }]}
            >
              <Feather name="check" size={18} color="#FFFFFF" />
              <Text style={s.saveText}>
                {saveButtonLabel === 'Save Event & Schedule'
                  ? 'Save Event'
                  : saveButtonLabel ?? (mode === 'edit' ? 'Save Changes' : 'Save Event')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleClose} style={s.cancelBtn}>
              <Text style={[s.cancelText, { color: textSubTheme }]}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Dim behind open picker */}
          {picker !== null && (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setPicker(null)}
              style={s.pickerDim}
            />
          )}

          {/* ================= DATE PICKER ================= */}
          {picker === 'date' && (
            <View
              style={[
                s.panel,
                { backgroundColor: modalSurface, borderColor: borderTheme },
              ]}
            >
              <View style={s.panelHeader}>
                <Text style={[s.panelTitle, { color: textTheme }]}>{monthName}</Text>
                <View style={s.panelHeaderBtns}>
                  <TouchableOpacity onPress={() => shiftMonth(-1)} style={s.iconBtn}>
                    <Feather name="chevron-left" size={18} color={textSubTheme} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => shiftMonth(1)} style={s.iconBtn}>
                    <Feather name="chevron-right" size={18} color={textSubTheme} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setPicker(null)}
                    accessibilityLabel="Close date picker"
                    style={[s.iconBtn, { marginLeft: 4 }]}
                  >
                    <Feather name="x" size={20} color={textSubTheme} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={s.weekRow}>
                {WEEK_LETTERS.map((letter, index) => (
                  <Text key={index} style={[s.weekLetter, { color: textSubTheme }]}>
                    {letter}
                  </Text>
                ))}
              </View>

              <View style={s.daysGrid}>
                {days.map((day, index) => {
                  if (day === null) {
                    return <View key={`empty-${index}`} style={s.dayCell} />;
                  }

                  const key = toDateKey(new Date(year, month, day));
                  const isSelected = key === date;
                  const isToday = key === todayKey;

                  return (
                    <TouchableOpacity
                      key={`day-${day}`}
                      onPress={() => selectDay(day)}
                      style={s.dayCell}
                    >
                      <View
                        style={[
                          s.dayInner,
                          isSelected && { backgroundColor: primaryAccent },
                          !isSelected &&
                            isToday && { borderWidth: 1, borderColor: primaryAccent },
                        ]}
                      >
                        <Text
                          style={{
                            color: isSelected ? '#FFFFFF' : textTheme,
                            fontSize: 13,
                            fontWeight: isSelected ? '700' : '500',
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

          {/* ================= TIME PICKER ================= */}
          {picker === 'time' && (
            <View
              style={[
                s.panel,
                { backgroundColor: modalSurface, borderColor: borderTheme },
              ]}
            >
              <Text style={[s.panelCaption, { color: textSubTheme }]}>
                TIME · tap the numbers to type
              </Text>

              <View style={s.clockRow}>
                {[
                  {
                    key: 'hour',
                    label: 'Hour',
                    value: hourDraft ?? String(hour).padStart(2, '0'),
                    onChange: typeHour,
                    onFocus: () => setHourDraft(String(hour)),
                    isEditing: hourDraft !== null,
                  },
                  {
                    key: 'minute',
                    label: 'Min',
                    value: minuteDraft ?? String(minute).padStart(2, '0'),
                    onChange: typeMinute,
                    onFocus: () => setMinuteDraft(String(minute).padStart(2, '0')),
                    isEditing: minuteDraft !== null,
                  },
                ].map((part, index) => (
                  <View key={part.key} style={s.clockPartRow}>
                    {index === 1 && (
                      <Text style={[s.colon, { color: primaryAccent }]}>:</Text>
                    )}
                    <View style={s.clockPart}>
                      <TextInput
                        value={part.value}
                        onChangeText={part.onChange}
                        onFocus={part.onFocus}
                        onBlur={finishTyping}
                        onSubmitEditing={finishTyping}
                        keyboardType="number-pad"
                        returnKeyType="done"
                        selectTextOnFocus
                        maxLength={2}
                        accessibilityLabel={part.label}
                        style={[
                          s.timeInput,
                          {
                            color: textTheme,
                            backgroundColor: inputBg,
                            borderColor: part.isEditing ? primaryAccent : borderTheme,
                          },
                        ]}
                      />
                      <Text style={[s.clockCaption, { color: textSubTheme }]}>
                        {part.label}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={[s.periodRow, { backgroundColor: inputBg }]}>
                {(['AM', 'PM'] as Period[]).map((value) => {
                  const isActive = period === value;
                  return (
                    <TouchableOpacity
                      key={value}
                      onPress={() => changePeriod(value)}
                      style={[s.periodItem, isActive && { backgroundColor: primaryAccent }]}
                    >
                      <Text
                        style={[
                          s.periodText,
                          { color: isActive ? '#FFFFFF' : textSubTheme },
                        ]}
                      >
                        {value}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[s.panelCaption, { color: textSubTheme, marginTop: 14 }]}>
                QUICK PICK
              </Text>
              <View style={s.quickRow}>
                {QUICK_TIMES.map((option) => {
                  const isActive =
                    hour === option.h && minute === option.m && period === option.p;
                  return (
                    <TouchableOpacity
                      key={option.label}
                      onPress={() => {
                        finishTyping();
                        onTimeChange(buildTime(option.h, option.m, option.p));
                      }}
                      style={[
                        s.quickChip,
                        {
                          borderColor: isActive ? primaryAccent : borderTheme,
                          backgroundColor: isActive ? primaryAccent : 'transparent',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          s.quickText,
                          { color: isActive ? '#FFFFFF' : textTheme },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity onPress={() => setPicker(null)} style={s.doneBtn}>
                <Text style={[s.doneText, { color: primaryAccent }]}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '92%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
  },
  grab: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 8,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  textArea: {
    height: 88,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  pickBox: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  pickTextWrap: {
    flex: 1,
  },
  pickCaption: {
    fontSize: 11,
  },
  pickValue: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  toggleText: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginTop: 16,
  },
  seg: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 3,
  },
  segItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 9,
    borderRadius: 9,
  },
  segText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    marginTop: 26,
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },

  /* pickers */
  pickerDim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  panel: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 80,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  panelHeaderBtns: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  panelCaption: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  iconBtn: {
    padding: 5,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekLetter: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.285%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 14,
  },
  clockPartRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockPart: {
    alignItems: 'center',
  },
  colon: {
    fontSize: 30,
    fontWeight: '700',
    marginHorizontal: 10,
    marginBottom: 18,
  },
  arrowBtn: {
    width: 44,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeInput: {
    width: 84,
    height: 62,
    borderWidth: 1.5,
    borderRadius: 14,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    paddingVertical: 0,
  },
  clockNum: {
    fontSize: 34,
    fontWeight: '700',
    marginVertical: 4,
    minWidth: 56,
    textAlign: 'center',
  },
  clockCaption: {
    fontSize: 10,
    marginTop: 4,
  },
  periodRow: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  periodItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  periodText: {
    fontSize: 11,
    fontWeight: '700',
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickText: {
    fontSize: 12,
    fontWeight: '600',
  },
  doneBtn: {
    alignItems: 'center',
    marginTop: 12,
  },
  doneText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
