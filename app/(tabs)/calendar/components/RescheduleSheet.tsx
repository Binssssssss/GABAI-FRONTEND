import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { CalendarEvent } from '../types';
import { getLocalDateKey } from '../utils/calendarHelpers';

type Period = 'AM' | 'PM';

interface RescheduleSheetProps {
  visible: boolean;
  event: CalendarEvent | null;
  /** All events, used to warn when the new day is already busy. */
  events: CalendarEvent[];
  onClose: () => void;
  /** Save the new date ("YYYY-MM-DD") and time ("HH:mm", or "" for all-day). */
  onConfirm: (date: string, time: string) => Promise<boolean>;
  modalSurface: string;
  borderTheme: string;
  textTheme: string;
  textSubTheme: string;
  primaryAccent: string;
}

const WEEK_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/* ---------- helpers ---------- */

const parseDateKey = (key: string) => {
  const d = new Date(`${key}T12:00:00`);
  return Number.isNaN(d.getTime()) ? new Date() : d;
};

/** "2026-10-22" -> "Thu, Oct 22, 2026" */
const formatDateLabel = (key: string) =>
  parseDateKey(key).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

/** "14:30" -> "2:30 PM" */
const formatTimeLabel = (value: string) => {
  const [h, m] = value.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return '';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

/** "14:30" -> { hour: "02", minute: "30", period: "PM" } */
const splitTime = (value: string) => {
  const [rawH, rawM] = (value || '09:00').split(':').map(Number);
  const h24 = Number.isFinite(rawH) ? Math.min(23, Math.max(0, rawH)) : 9;
  const minute = Number.isFinite(rawM) ? Math.min(59, Math.max(0, rawM)) : 0;
  const hour = h24 % 12 === 0 ? 12 : h24 % 12;
  return {
    hour: String(hour).padStart(2, '0'),
    minute: String(minute).padStart(2, '0'),
    period: (h24 >= 12 ? 'PM' : 'AM') as Period,
  };
};

const clampText = (text: string, min: number, max: number, fallback: string) => {
  const n = Number(text);
  if (!text || !Number.isFinite(n)) return fallback;
  return String(Math.min(max, Math.max(min, Math.round(n)))).padStart(2, '0');
};

/**
 * Simple reschedule sheet: pick a new date, type a new time, Move event.
 */
export default function RescheduleSheet({
  visible,
  event,
  events,
  onClose,
  onConfirm,
  modalSurface,
  borderTheme,
  textTheme,
  textSubTheme,
  primaryAccent,
}: RescheduleSheetProps) {
  const todayKey = getLocalDateKey();
  const inputBg = modalSurface === '#FFFFFF' ? '#F3EEE8' : '#242424';

  const [date, setDate] = useState(todayKey);
  const [hourText, setHourText] = useState('09');
  const [minuteText, setMinuteText] = useState('00');
  const [period, setPeriod] = useState<Period>('AM');
  const [focused, setFocused] = useState<'hour' | 'minute' | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [cursor, setCursor] = useState(() => new Date());
  const [isSaving, setIsSaving] = useState(false);

  // Start from the event's current date and time each time the sheet opens.
  useEffect(() => {
    if (!visible || !event) return;

    const startDate = event.date < todayKey ? todayKey : event.date;
    const parts = splitTime(event.time);

    setDate(startDate);
    setHourText(parts.hour);
    setMinuteText(parts.minute);
    setPeriod(parts.period);
    setShowCalendar(false);
    setFocused(null);
    setIsSaving(false);
    setCursor(parseDateKey(startDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, event?.id]);

  const isAllDay = !!event?.isAllDay;

  // "HH:mm" from what the user typed.
  const time24 = useMemo(() => {
    const hour = Number(clampText(hourText, 1, 12, '12'));
    const minute = Number(clampText(minuteText, 0, 59, '00'));
    const h24 = (hour % 12) + (period === 'PM' ? 12 : 0);
    return `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }, [hourText, minuteText, period]);

  const otherEventsThatDay = useMemo(
    () =>
      event
        ? events.filter(
            (item) => item.date === date && item.id !== event.id && !item.completed,
          ).length
        : 0,
    [events, date, event],
  );

  const isPastTime =
    !isAllDay &&
    date === todayKey &&
    new Date(`${date}T${time24}:00`).getTime() <= Date.now();

  const isUnchanged =
    !!event && date === event.date && (isAllDay || time24 === event.time);

  const canMove = !!event && !isSaving && !isPastTime && !isUnchanged;

  /* ---------- calendar ---------- */

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthName = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const days = useMemo(() => {
    const firstWeekday = new Date(year, month, 1).getDay();
    const count = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = Array(firstWeekday).fill(null);
    for (let day = 1; day <= count; day += 1) cells.push(day);
    return cells;
  }, [year, month]);

  const dayKey = (day: number) =>
    [year, String(month + 1).padStart(2, '0'), String(day).padStart(2, '0')].join('-');

  const shiftMonth = (delta: number) => setCursor(new Date(year, month + delta, 1));

  /* ---------- actions ---------- */

  const move = async () => {
    if (!canMove) return;
    setIsSaving(true);
    const ok = await onConfirm(date, isAllDay ? '' : time24);
    setIsSaving(false);
    if (ok) onClose();
  };

  if (!event) return null;

  const currentLabel = `${formatDateLabel(event.date).replace(/, \d{4}$/, '')}${
    event.isAllDay ? ' (all day)' : event.time ? `, ${formatTimeLabel(event.time)}` : ''
  }`;

  const timeBox = (
    key: 'hour' | 'minute',
    value: string,
    setValue: (v: string) => void,
    min: number,
    max: number,
    label: string,
  ) => (
    <TextInput
      value={value}
      onChangeText={(text) => setValue(text.replace(/[^0-9]/g, '').slice(0, 2))}
      onFocus={() => {
        setFocused(key);
        setShowCalendar(false);
      }}
      onBlur={() => {
        setFocused(null);
        setValue(clampText(value, min, max, key === 'hour' ? '12' : '00'));
      }}
      keyboardType="number-pad"
      returnKeyType="done"
      selectTextOnFocus
      maxLength={2}
      accessibilityLabel={label}
      style={[
        s.timeBox,
        {
          color: textTheme,
          backgroundColor: inputBg,
          borderColor: focused === key ? primaryAccent : borderTheme,
        },
      ]}
    />
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={s.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[s.sheet, { backgroundColor: modalSurface }]}>
          <View style={[s.grab, { backgroundColor: borderTheme }]} />

          {/* Header */}
          <View style={s.header}>
            <Text style={[s.title, { color: textTheme }]}>Reschedule</Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityLabel="Close"
              style={[s.closeBtn, { backgroundColor: inputBg }]}
            >
              <Feather name="x" size={18} color={textSubTheme} />
            </TouchableOpacity>
          </View>

          <Text style={[s.eventLine, { color: textSubTheme }]} numberOfLines={2}>
            <Text style={{ color: textTheme, fontWeight: '600' }}>{event.title}</Text>
            {`  ·  now ${currentLabel}`}
          </Text>

          {/* Date */}
          <Text style={[s.label, { color: textSubTheme }]}>DATE</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowCalendar((open) => !open)}
            style={[
              s.dateField,
              {
                backgroundColor: inputBg,
                borderColor: showCalendar ? primaryAccent : borderTheme,
              },
            ]}
          >
            <Feather name="calendar" size={18} color={primaryAccent} />
            <Text style={[s.dateText, { color: textTheme }]}>{formatDateLabel(date)}</Text>
            <Feather
              name={showCalendar ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={textSubTheme}
            />
          </TouchableOpacity>

          {showCalendar && (
            <View style={[s.calendar, { borderColor: borderTheme }]}>
              <View style={s.calHeader}>
                <Text style={[s.calTitle, { color: textTheme }]}>{monthName}</Text>
                <View style={s.calNav}>
                  <TouchableOpacity onPress={() => shiftMonth(-1)} hitSlop={8}>
                    <Feather name="chevron-left" size={20} color={textSubTheme} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => shiftMonth(1)} hitSlop={8}>
                    <Feather name="chevron-right" size={20} color={textSubTheme} />
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

              <View style={s.grid}>
                {days.map((day, index) => {
                  if (day === null) return <View key={`e-${index}`} style={s.cell} />;

                  const key = dayKey(day);
                  const isSelected = key === date;
                  const isToday = key === todayKey;
                  const isPast = key < todayKey;

                  return (
                    <TouchableOpacity
                      key={key}
                      disabled={isPast}
                      onPress={() => {
                        setDate(key);
                        setShowCalendar(false);
                      }}
                      style={s.cell}
                    >
                      <View
                        style={[
                          s.dayInner,
                          isSelected && { backgroundColor: primaryAccent },
                          !isSelected && isToday && { borderWidth: 1, borderColor: primaryAccent },
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: isSelected ? '700' : '500',
                            color: isSelected ? '#FFFFFF' : textTheme,
                            opacity: isPast ? 0.3 : 1,
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

          {/* Time */}
          {isAllDay ? (
            <Text style={[s.allDay, { color: textSubTheme }]}>All-day event</Text>
          ) : (
            <>
              <Text style={[s.label, { color: textSubTheme }]}>TIME</Text>
              <View style={s.timeRow}>
                {timeBox('hour', hourText, setHourText, 1, 12, 'Hour')}
                <Text style={[s.colon, { color: primaryAccent }]}>:</Text>
                {timeBox('minute', minuteText, setMinuteText, 0, 59, 'Minute')}

                <View style={[s.periodWrap, { backgroundColor: inputBg, borderColor: borderTheme }]}>
                  {(['AM', 'PM'] as Period[]).map((value) => {
                    const active = period === value;
                    return (
                      <TouchableOpacity
                        key={value}
                        onPress={() => setPeriod(value)}
                        style={[s.periodBtn, active && { backgroundColor: primaryAccent }]}
                      >
                        <Text
                          style={[s.periodText, { color: active ? '#FFFFFF' : textSubTheme }]}
                        >
                          {value}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </>
          )}

          {/* One-line hint */}
          {isPastTime ? (
            <View style={s.hintRow}>
              <Feather name="alert-circle" size={15} color="#EF4444" />
              <Text style={[s.hint, { color: '#EF4444' }]}>That time has already passed.</Text>
            </View>
          ) : otherEventsThatDay > 0 ? (
            <View style={s.hintRow}>
              <Feather name="alert-circle" size={15} color="#F59E0B" />
              <Text style={[s.hint, { color: '#F59E0B' }]}>
                {formatDateLabel(date).replace(/, \d{4}$/, '')} already has {otherEventsThatDay}{' '}
                {otherEventsThatDay === 1 ? 'event' : 'events'}
              </Text>
            </View>
          ) : null}

          {/* Actions */}
          <TouchableOpacity
            onPress={move}
            disabled={!canMove}
            activeOpacity={0.85}
            style={[s.moveBtn, { backgroundColor: primaryAccent, opacity: canMove ? 1 : 0.5 }]}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Feather name="check" size={18} color="#FFFFFF" />
                <Text style={s.moveText}>Move event</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={s.cancelBtn}>
            <Text style={[s.cancelText, { color: textSubTheme }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingBottom: 28,
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
    marginTop: 12,
  },
  title: {
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
  eventLine: {
    fontSize: 13,
    marginTop: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 8,
  },
  dateField: {
    height: 54,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  calendar: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    marginTop: 8,
  },
  calHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  calTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  calNav: {
    flexDirection: 'row',
    gap: 16,
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekLetter: {
    width: '14.2857%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    paddingVertical: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.2857%',
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
  allDay: {
    fontSize: 13,
    marginTop: 14,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeBox: {
    width: 64,
    height: 54,
    borderWidth: 1.5,
    borderRadius: 14,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    paddingVertical: 0,
  },
  colon: {
    fontSize: 22,
    fontWeight: '800',
    marginHorizontal: 8,
  },
  periodWrap: {
    flexDirection: 'row',
    marginLeft: 'auto',
    borderWidth: 1,
    borderRadius: 12,
    padding: 3,
  },
  periodBtn: {
    width: 52,
    height: 44,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodText: {
    fontSize: 15,
    fontWeight: '700',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  hint: {
    fontSize: 12.5,
    flexShrink: 1,
  },
  moveBtn: {
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  moveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
    marginTop: 4,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
