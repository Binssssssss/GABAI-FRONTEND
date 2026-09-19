import React from 'react';
import {
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TransactionType } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/expenseCategories';
import { expenseStyles as styles } from '../styles/expenses.styles';

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
  onSubmit: () => void;
  cardBg: string;
  borderCol: string;
  inputBg: string;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
  successGreen: string;
  errorRed: string;
}

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
  onSubmit,
  cardBg,
  borderCol,
  inputBg,
  textPrimary,
  textSecondary,
  primaryBrown,
  successGreen,
  errorRed,
}: AddTransactionModalProps) {
  const currentCategories = transactionType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <View style={[styles.modalContent, { backgroundColor: cardBg, borderColor: borderCol }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textPrimary }]}>Add New Transaction</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={22} color={textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Transaction Type Toggles */}
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    {
                      backgroundColor: transactionType === 'expense' ? errorRed : inputBg,
                      borderColor: transactionType === 'expense' ? errorRed : borderCol,
                    },
                  ]}
                  onPress={() => onTypeChange('expense')}
                >
                  <Feather
                    name="arrow-up-right"
                    size={16}
                    color={transactionType === 'expense' ? '#FFFFFF' : textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.toggleButtonText,
                      { color: transactionType === 'expense' ? '#FFFFFF' : textPrimary },
                    ]}
                  >
                    Expense
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    {
                      backgroundColor: transactionType === 'income' ? successGreen : inputBg,
                      borderColor: transactionType === 'income' ? successGreen : borderCol,
                    },
                  ]}
                  onPress={() => onTypeChange('income')}
                >
                  <Feather
                    name="arrow-down-left"
                    size={16}
                    color={transactionType === 'income' ? '#FFFFFF' : textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.toggleButtonText,
                      { color: transactionType === 'income' ? '#FFFFFF' : textPrimary },
                    ]}
                  >
                    Income
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Text Inputs */}
              <Text style={[styles.inputLabel, { color: textSecondary }]}>Description</Text>
              <TextInput
                style={[styles.input, { color: textPrimary, backgroundColor: inputBg, borderColor: borderCol }]}
                placeholder="e.g. Weekly Allowance, Lunch"
                placeholderTextColor={textSecondary}
                value={title}
                onChangeText={onTitleChange}
                autoFocus={true}
              />

              <Text style={[styles.inputLabel, { color: textSecondary }]}>Amount (₱)</Text>
              <TextInput
                style={[styles.input, { color: textPrimary, backgroundColor: inputBg, borderColor: borderCol }]}
                placeholder="0.00"
                placeholderTextColor={textSecondary}
                keyboardType="numeric"
                value={amount}
                onChangeText={onAmountChange}
              />

              {/* Dynamic Category List */}
              <Text style={[styles.categoryLabel, { color: textSecondary }]}>Category</Text>
              <View style={styles.categoryRow}>
                {currentCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor: category === cat ? primaryBrown : inputBg,
                        borderColor: borderCol,
                      },
                    ]}
                    onPress={() => onCategoryChange(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        { color: category === cat ? '#FFFFFF' : textPrimary },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: primaryBrown }]}
                onPress={onSubmit}
              >
                <Text style={styles.submitButtonText}>
                  Save {transactionType === 'income' ? 'Income' : 'Expense'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
