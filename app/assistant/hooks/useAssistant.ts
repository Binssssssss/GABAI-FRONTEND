import { useState, useRef, useCallback } from 'react';
import { FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Message, ActionButton, CustomWidgetType } from '../types';
import { generateMessageId, getCurrentTimestamp, processAssistantQuery } from '../utils';

export function useAssistant() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const addMessage = useCallback(
    (
      sender: 'user' | 'assistant',
      text: string,
      actions?: ActionButton[],
      customWidget?: CustomWidgetType,
      widgetData?: any
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
    [scrollToBottom]
  );

  const handleQuery = useCallback(
    async (queryText: string) => {
      if (!queryText.trim()) return;

      addMessage('user', queryText);
      setInputVal('');
      setIsTyping(true);

      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Ignored if haptics fail or on web
      }

      // Simulated short thinking delay (offline latency)
      await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 500));
      setIsTyping(false);

      await processAssistantQuery(queryText, {
        addMessage,
        router,
      });
    },
    [addMessage, router]
  );

  const handleFocusComplete = useCallback(
    (durationSecs: number) => {
      const mins = Math.floor(durationSecs / 60);
      const secs = durationSecs % 60;
      const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

      addMessage(
        'assistant',
        `🎉 **Focus Session Complete!**\n\nYou focused successfully for **${timeStr}**. Great work maintaining concentration. This session is logged in your offline productivity metrics.`,
        [
          {
            label: 'Open Dashboard',
            icon: 'grid',
            action: () => router.replace('/(tabs)/dashboard/dashboard'),
          },
        ]
      );
    },
    [addMessage, router]
  );

  const resetChat = useCallback(() => {
    setMessages([]);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
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
