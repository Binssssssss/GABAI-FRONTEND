import { Feather } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  CATEGORY_STYLE,
  EXPENSE_CATEGORIES,
  HistoryCategory,
  INCOME_CATEGORIES,
} from '../constants/expenseCategories';
import { TransactionType } from '../types';
import {
  TITLE_MAX,
  cleanAmountInput,
  formatPeso,
  hasErrors,
  parseAmount,
  validateTransaction,
} from '../utils/transactionValidation';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  onTitleChange: (val: string) => void;
  amount: string;
  onAmountChange: (val: string) => void;
  transactionType: TransactionType;
  onTypeChange: (type: TransactionType) => void;
  category: string;
  onCategoryChange: (cat: string) => void;
  date: Date;
  onDateChange: (date: Date) => void;
  onSubmit: () => void;
  /** Current wallet balance, for "Balance after" and the Expenses limit. */
  balance: number;
  cardBg: string;
  borderCol: string;
  inputBg: string;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
  successGreen: string;
  errorRed: string;
}

const WEEK_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/* ---------- date helpers ---------- */

const startOfDay = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const daysAgo = (count: number) => {
  const d = new Date();
  d.setDate(d.getDate() - count);
  return d;
};

/* Keep the current time of day so the record still sorts naturally. */
const withCurrentTime = (day: Date) => {
  const now = new Date();
  return new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
  );
};

const formatDate = (value: Date) =>
  value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const dateLabel = (value: Date) => {
  if (isSameDay(value, new Date())) return `Today · ${formatDate(value)}`;
  if (isSameDay(value, daysAgo(1))) return `Yesterday · ${formatDate(value)}`;
  return value.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function AddTransactionModal({
  visible,
  onClose,
  title,
  onTitleChange,
  amount,
  onAmountChange,
  transactionType,
  onTypeChange,
  category,
  onCategoryChange,
  date,
  onDateChange,
  onSubmit,
  balance,
  cardBg,
  borderCol,
  inputBg,
  textPrimary,
  textSecondary,
  primaryBrown,
  successGreen,
  errorRed,
}: AddTransactionModalProps) {
  const isIncome = transactionType === 'income';
  const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const [showCalendar, setShowCalendar] = useState(false);
  const [month, setMonth] = useState(date.getMonth());
  const [year, setYear] = useState(date.getFullYear());

  const today = startOfDay(new Date());

  /* ---------- validation ---------- */

  // Errors show after the field is left or Save is tapped.
  const [touched, setTouched] = useState({ amount: false, title: false });
  const [submitted, setSubmitted] = useState(false);

  // Start clean every time the sheet opens.
  useEffect(() => {
    if (visible) {
      setTouched({ amount: false, title: false });
      setSubmitted(false);
    }
  }, [visible]);

  const errors = useMemo(
    () =>
      validateTransaction({ amount, title, date, type: transactionType, balance }),
    [amount, title, date, transactionType, balance],
  );
  const invalid = hasErrors(errors);

  const amountValue = parseAmount(amount);
  const balanceAfter = isIncome ? balance + amountValue : balance - amountValue;
  const overBalance = !isIncome && amountValue > Math.max(0, balance);

  // "Not enough balance" shows right away while typing.
  const amountError =
    submitted || touched.amount || overBalance ? errors.amount : undefined;
  const titleError = submitted || touched.title ? errors.title : undefined;
  const dateError = errors.date;

  const typeColor = isIncome ? successGreen : errorRed;

  /* ---------- calendar ---------- */

  const toggleCalendar = () => {
    if (!showCalendar) {
      setMonth(date.getMonth());
      setYear(date.getFullYear());
    }
    setShowCalendar((open) => !open);
  };

  const shiftMonth = (amountOfMonths: number) => {
    const d = new Date(year, month + amountOfMonths, 1);
    setMonth(d.getMonth());
    setYear(d.getFullYear());
  };

  // Can't go past the current month (no future records).
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1,
  );

  const monthName = new Date(year, month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const pickDay = (day: Date) => {
    onDateChange(withCurrentTime(day));
    setShowCalendar(false);
  };

  const quickDates = [
    { label: 'Today', value: new Date() },
    { label: 'Yesterday', value: daysAgo(1) },
    { label: '2 days ago', value: daysAgo(2) },
  ];

  const handleClose = () => {
    setShowCalendar(false);
    onClose();
  };

  const handleSubmit = () => {
    setShowCalendar(false);
    setSubmitted(true);
    if (invalid) return;
    onSubmit();
  };

  const errorText = (message?: string) =>
    message ? (
      <View style={s.errorRow}>
        <Feather name="alert-circle" size={13} color={errorRed} />
        <Text style={[s.errorText, { color: errorRed }]}>{message}</Text>
      </View>
    ) : null;

  /* ---------- render ---------- */

  const typeButton = (type: TransactionType, label: string, icon: 'arrow-up-right' | 'arrow-down-left') => {
    const active = transactionType === type;
    const activeColor = type === 'expense' ? errorRed : successGreen;

    return (
      <TouchableOpacity
        key={type}
        onPress={() => onTypeChange(type)}
        activeOpacity={0.85}
        style={[s.segItem, active && { backgroundColor: activeColor }]}
      >
        <Feather
          name={icon}
          size={16}
          color={active ? '#FFFFFF' : textSecondary}
        />
        <Text style={[s.segText, { color: active ? '#FFFFFF' : textSecondary }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
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
          style={[s.sheet, { backgroundColor: cardBg, borderColor: borderCol }]}
        >
          <View style={[s.grab, { backgroundColor: borderCol }]} />

          {/* Header */}
          <View style={s.header}>
            <Text style={[s.headerTitle, { color: textPrimary }]}>
              {isIncome ? 'Add Allowance' : 'Add Expense'}
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={[s.closeBtn, { backgroundColor: inputBg }]}
            >
              <Feather name="x" size={18} color={textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={s.body}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Expenses / Allowance */}
            <View style={[s.seg, { backgroundColor: inputBg, borderColor: borderCol }]}>
              {typeButton('expense', 'Expenses', 'arrow-up-right')}
              {typeButton('income', 'Allowance', 'arrow-down-left')}
            </View>

            {/* Amount */}
            <View
              style={[
                s.amountBox,
                {
                  backgroundColor: inputBg,
                  borderColor: amountError ? errorRed : borderCol,
                },
              ]}
            >
              <Text style={[s.amountLabel, { color: textSecondary }]}>AMOUNT</Text>
              <View style={s.amountRow}>
                <Text
                  style={[s.amountSign, { color: amount ? typeColor : textSecondary }]}
                >
                  {isIncome ? '+' : '−'} ₱
                </Text>
                <TextInput
                  style={[s.amountInput, { color: typeColor }]}
                  placeholder="0.00"
                  placeholderTextColor={textSecondary}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={(text) => onAmountChange(cleanAmountInput(text))}
                  onBlur={() => setTouched((t) => ({ ...t, amount: true }))}
                  maxLength={10}
                  autoFocus
                  accessibilityLabel="Amount"
                />
              </View>
              <Text
                style={[s.balanceAfter, { color: overBalance ? errorRed : textSecondary }]}
              >
                Balance after:{' '}
                <Text style={{ fontWeight: '700', color: overBalance ? errorRed : textPrimary }}>
                  {balanceAfter < 0 ? '−' : ''}₱{formatPeso(balanceAfter)}
                </Text>
              </Text>
            </View>
            {errorText(amountError)}

            {/* What is it for */}
            <Text style={[s.label, { color: textSecondary }]}>WHAT IS IT FOR?</Text>
            <View
              style={[
                s.input,
                s.titleRow,
                {
                  backgroundColor: inputBg,
                  borderColor: titleError ? errorRed : borderCol,
                },
              ]}
            >
              <TextInput
                style={[s.textInput, { color: textPrimary }]}
                placeholder={
                  isIncome ? 'e.g. Weekly allowance' : 'e.g. Lunch, Jeepney Fare'
                }
                placeholderTextColor={textSecondary}
                value={title}
                onChangeText={onTitleChange}
                onBlur={() => setTouched((t) => ({ ...t, title: true }))}
                maxLength={TITLE_MAX}
                returnKeyType="done"
                accessibilityLabel="What is it for"
              />
              <Text style={[s.counter, { color: textSecondary }]}>
                {title.length}/{TITLE_MAX}
              </Text>
            </View>
            {errorText(titleError)}

            {/* Category */}
            <Text style={[s.label, { color: textSecondary }]}>CATEGORY</Text>
            <View style={s.chips}>
              {categories.map((cat) => {
                const active = category === cat;
                const look = CATEGORY_STYLE[cat as HistoryCategory];
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => onCategoryChange(cat)}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[
                      s.chip,
                      {
                        borderColor: active ? look.color : borderCol,
                        backgroundColor: active ? look.color + '26' : 'transparent',
                      },
                    ]}
                  >
                    <View style={[s.chipIcon, { backgroundColor: look.color + '2E' }]}>
                      <Feather name={look.icon as any} size={14} color={look.color} />
                    </View>
                    <Text
                      style={[s.chipText, { color: active ? look.color : textPrimary }]}
                    >
                      {cat}
                    </Text>
                    {active && <Feather name="check" size={14} color={look.color} />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Date */}
            <Text style={[s.label, { color: textSecondary }]}>DATE</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={toggleCalendar}
              style={[
                s.input,
                s.dateRow,
                {
                  backgroundColor: inputBg,
                  borderColor: dateError
                    ? errorRed
                    : showCalendar
                      ? primaryBrown
                      : borderCol,
                },
              ]}
            >
              <Feather name="calendar" size={18} color={primaryBrown} />
              <Text style={[s.dateText, { color: textPrimary }]}>{dateLabel(date)}</Text>
              <Feather
                name={showCalendar ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={textSecondary}
              />
            </TouchableOpacity>

            {errorText(dateError)}

            {showCalendar && (
              <View
                style={[s.calendar, { backgroundColor: inputBg, borderColor: borderCol }]}
              >
                {/* Quick picks */}
                <View style={s.quickRow}>
                  {quickDates.map((option) => {
                    const active = isSameDay(option.value, date);
                    return (
                      <TouchableOpacity
                        key={option.label}
                        onPress={() => pickDay(option.value)}
                        style={[
                          s.quickChip,
                          {
                            borderColor: active ? primaryBrown : borderCol,
                            backgroundColor: active ? primaryBrown : 'transparent',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            s.quickText,
                            { color: active ? '#FFFFFF' : textPrimary },
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Month header */}
                <View style={s.monthRow}>
                  <Text style={[s.monthName, { color: textPrimary }]}>{monthName}</Text>
                  <View style={s.monthBtns}>
                    <TouchableOpacity onPress={() => shiftMonth(-1)} style={s.iconBtn}>
                      <Feather name="chevron-left" size={18} color={textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => !isCurrentMonth && shiftMonth(1)}
                      disabled={isCurrentMonth}
                      style={[s.iconBtn, { opacity: isCurrentMonth ? 0.3 : 1 }]}
                    >
                      <Feather name="chevron-right" size={18} color={textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={s.weekRow}>
                  {WEEK_LETTERS.map((letter, index) => (
                    <Text key={index} style={[s.weekLetter, { color: textSecondary }]}>
                      {letter}
                    </Text>
                  ))}
                </View>

                <View style={s.daysGrid}>
                  {days.map((day, index) => {
                    if (day === null) {
                      return <View key={`empty-${index}`} style={s.dayCell} />;
                    }

                    const value = new Date(year, month, day);
                    const isFuture = value > today;
                    const isSelected = isSameDay(value, date);
                    const isTodayCell = isSameDay(value, today);

                    return (
                      <TouchableOpacity
                        key={`day-${day}`}
                        disabled={isFuture}
                        onPress={() => pickDay(value)}
                        style={s.dayCell}
                      >
                        <View
                          style={[
                            s.dayInner,
                            isSelected && { backgroundColor: primaryBrown },
                            !isSelected &&
                              isTodayCell && { borderWidth: 1, borderColor: primaryBrown },
                          ]}
                        >
                          <Text
                            style={{
                              color: isSelected ? '#FFFFFF' : textPrimary,
                              opacity: isFuture ? 0.3 : 1,
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

            {/* Save */}
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityState={{ disabled: invalid }}
              style={[
                s.saveBtn,
                { backgroundColor: primaryBrown, opacity: invalid ? 0.45 : 1 },
              ]}
            >
              <Feather name="check" size={18} color="#FFFFFF" />
              <Text style={s.saveText}>
                {isIncome ? 'Save Allowance' : 'Save Expense'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
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
    borderWidth: 1,
    borderBottomWidth: 0,
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
    paddingTop: 12,
    paddingBottom: 14,
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
    paddingBottom: 28,
  },
  seg: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 14,
    padding: 4,
  },
  segItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
  },
  segText: {
    fontSize: 14,
    fontWeight: '700',
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
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counter: {
    fontSize: 11.5,
    marginLeft: 8,
  },
  amountBox: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 16,
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountSign: {
    fontSize: 32,
    fontWeight: '800',
    marginRight: 2,
  },
  amountInput: {
    minWidth: 90,
    maxWidth: '75%',
    fontSize: 32,
    fontWeight: '800',
    paddingVertical: 4,
    textAlign: 'left',
  },
  balanceAfter: {
    fontSize: 12.5,
    marginTop: 2,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 7,
    marginLeft: 2,
  },
  errorText: {
    fontSize: 12.5,
    fontWeight: '600',
    flexShrink: 1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 38,
    paddingLeft: 5,
    paddingRight: 12,
    borderRadius: 19,
    borderWidth: 1,
  },
  chipIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
  },
  calendar: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  quickText: {
    fontSize: 12,
    fontWeight: '600',
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  monthName: {
    fontSize: 15,
    fontWeight: '700',
  },
  monthBtns: {
    flexDirection: 'row',
  },
  iconBtn: {
    padding: 5,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
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
  saveBtn: {
    marginTop: 24,
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
});