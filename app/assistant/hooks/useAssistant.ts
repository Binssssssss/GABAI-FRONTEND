import { useState, useRef, useCallback } from 'react';
import { FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import api from '@/app/services/api';

import { Message, ActionButton, CustomWidgetType } from '../types';
import {
  generateMessageId,
  getCurrentTimestamp,
} from '../utils';

export function useAssistant() {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({
        animated: true,
      });
    }, 100);
  }, []);

  const addMessage = useCallback(
    (
      sender: 'user' | 'assistant',
      text: string,
      actions?: ActionButton[],
      customWidget?: CustomWidgetType,
      widgetData?: any,
    ) => {
      const newMessage: Message = {
        id: generateMessageId(),
        sender,
        text,
        timestamp: getCurrentTimestamp(),
        actions,
        customWidget,
        widgetData,
      };

      setMessages((prev) => [...prev, newMessage]);

      scrollToBottom();
    },
    [scrollToBottom],
  );

  const handleQuery = useCallback(
    async (queryText: string) => {
      const message = queryText.trim();

      if (!message || isTyping) {
        return;
      }

      // Add user's message immediately
      addMessage('user', message);

      // Clear input
      setInputVal('');

      // Show typing indicator
      setIsTyping(true);

      try {
        // Small haptic feedback
        try {
          await Haptics.impactAsync(
            Haptics.ImpactFeedbackStyle.Light,
          );
        } catch {
          // Ignore haptic errors
        }

        // Send message to backend
        const response = await api.post('/assistant/chat', {
          message,
        });

        const reply = response?.data?.data?.reply;

        if (!reply) {
          throw new Error(
            'Assistant returned an empty response.',
          );
        }

        // Add backend response to chat
        addMessage('assistant', reply);
      } catch (error: any) {
        console.error(
          'Assistant chat error:',
          error,
        );

        let errorMessage =
          'Sorry, I could not connect to GabAi Assistant right now. Please try again.';

        if (error?.response?.status === 401) {
          errorMessage =
            'Your session has expired. Please log in again.';
        } else if (error?.response?.data?.message) {
          errorMessage =
            error.response.data.message;
        } else if (
          error?.code === 'ECONNABORTED'
        ) {
          errorMessage =
            'The Assistant request took too long. Please try again.';
        }

        addMessage(
          'assistant',
          errorMessage,
        );
      } finally {
        // Always hide typing indicator
        setIsTyping(false);

        // Keep chat scrolled to the latest message
        scrollToBottom();
      }
    },
    [
      addMessage,
      isTyping,
      scrollToBottom,
    ],
  );

  const handleFocusComplete = useCallback(
    (durationSecs: number) => {
      const mins = Math.floor(
        durationSecs / 60,
      );

      const secs =
        durationSecs % 60;

      const timeStr =
        mins > 0
          ? `${mins}m ${secs}s`
          : `${secs}s`;

      addMessage(
        'assistant',
        `🎉 **Focus Session Complete!**\n\nYou focused successfully for **${timeStr}**. Great work maintaining concentration.\n\nThis session has been recorded as part of your productivity tracking.`,
        [
          {
            label: 'Open Dashboard',
            icon: 'grid',
            action: () =>
              router.replace(
                '/(tabs)/dashboard/dashboard',
              ),
          },
        ],
      );
    },
    [addMessage, router],
  );

  const resetChat = useCallback(() => {
    setMessages([]);
    setInputVal('');
    setIsTyping(false);

    try {
      Haptics.impactAsync(
        Haptics.ImpactFeedbackStyle.Light,
      );
    } catch {
      // Ignore haptic errors
    }
  }, []);

  return {
    messages,
    inputVal,
    setInputVal,
    isTyping,
    flatListRef,
    scrollToBottom,
    addMessage,
    handleQuery,
    handleFocusComplete,
    resetChat,
  };
}
