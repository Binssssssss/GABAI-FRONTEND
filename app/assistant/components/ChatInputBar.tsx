import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { assistantStyles as styles } from '../styles';

interface ChatInputBarProps {
  inputVal: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  bgTheme: string;
  inputBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
}

export function ChatInputBar({
  inputVal,
  onChangeText,
  onSubmit,
  bgTheme,
  inputBg,
  borderCol,
  textPrimary,
  textSecondary,
  primaryBrown,
}: ChatInputBarProps) {
  const isSendDisabled = !inputVal.trim();

  return (
    <View style={[styles.inputContainer, { borderTopColor: borderCol, backgroundColor: bgTheme }]}>
      <TextInput
        style={[
          styles.inputField,
          { backgroundColor: inputBg, color: textPrimary, borderColor: borderCol },
        ]}
        placeholder="Ask about classes, tasks, spending..."
        placeholderTextColor={textSecondary}
        value={inputVal}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="send"
      />
      <TouchableOpacity
        style={[
          styles.sendBtn,
          { backgroundColor: !isSendDisabled ? primaryBrown : primaryBrown + '40' },
        ]}
        onPress={onSubmit}
        disabled={isSendDisabled}
      >
        <Feather name="send" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
