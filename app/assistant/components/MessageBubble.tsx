import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Message } from '../types';
import { assistantStyles as styles } from '../styles';
import { FocusSessionWidget } from './FocusSessionWidget';

function AnimatedMessageItem({ children }: { children: React.ReactNode }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {children}
    </Animated.View>
  );
}

interface MessageBubbleProps {
  item: Message;
  primaryBrown: string;
  cardBg: string;
  borderCol: string;
  bgTheme: string;
  textPrimary: string;
  textSecondary: string;
  onFocusComplete: (durationSecs: number) => void;
}

export function MessageBubble({
  item,
  primaryBrown,
  cardBg,
  borderCol,
  bgTheme,
  textPrimary,
  textSecondary,
  onFocusComplete,
}: MessageBubbleProps) {
  const isUser = item.sender === 'user';
  const alignSelf = isUser ? 'flex-end' : 'flex-start';

  return (
    <AnimatedMessageItem>
      <View style={[styles.messageContainer, { alignSelf }]}>
        {!isUser && (
          <View style={[styles.avatarSymbol, { backgroundColor: primaryBrown }]}>
            <Feather name="zap" size={10} color="#FFF" />
          </View>
        )}

        <View style={{ flexShrink: 1, maxWidth: '85%' }}>
          <View
            style={[
              styles.messageBubble,
              isUser ? styles.userBubble : styles.assistantBubble,
              isUser
                ? { backgroundColor: primaryBrown }
                : { backgroundColor: cardBg, borderColor: borderCol },
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isUser ? styles.userMessageText : { color: textPrimary },
              ]}
            >
              {item.text}
            </Text>

            {item.customWidget === 'focus' && (
              <FocusSessionWidget
                topic={item.widgetData?.topic}
                onComplete={onFocusComplete}
              />
            )}

            <Text
              style={[
                styles.timestamp,
                isUser ? styles.userTimestamp : { color: textSecondary },
              ]}
            >
              {item.timestamp}
            </Text>
          </View>

          {item.actions && item.actions.length > 0 && (
            <View style={styles.actionButtonsContainer}>
              {item.actions.map((act, index) => (
                <TouchableOpacity
                  key={index.toString()}
                  style={[
                    styles.inlineActionBtn,
                    { borderColor: borderCol, backgroundColor: bgTheme },
                  ]}
                  onPress={act.action}
                >
                  <Feather
                    name={act.icon as any}
                    size={12}
                    color={primaryBrown}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.inlineActionBtnText, { color: textPrimary }]}>
                    {act.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </AnimatedMessageItem>
  );
}
