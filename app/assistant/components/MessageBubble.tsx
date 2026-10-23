import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Message } from '../types';
import { assistantStyles as styles } from '../styles';
import { FocusSessionWidget } from './FocusSessionWidget';
import { SummaryCard } from './SummaryCard';
import { GabAvatar } from './GabAvatar';

function AnimatedMessageItem({ children }: { children: React.ReactNode }) {
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [slideAnim] = useState(() => new Animated.Value(15));

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

/** Shows **text** as bold and removes any leftover ** markers. */
function renderRichText(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
      <Text key={index} style={{ fontWeight: '700' }}>
        {part.slice(2, -2)}
      </Text>
    ) : (
      part.replace(/\*\*/g, '')
    ),
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
  /** Used by summary cards to open a feature. */
  onNavigate?: (route: string) => void;
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
  onNavigate,
}: MessageBubbleProps) {
  const isUser = item.sender === 'user';
  const alignSelf = isUser ? 'flex-end' : 'flex-start';
  const isSummary = item.customWidget === 'summary' && !!item.widgetData;

  // Quick-action answers use the full chat width.
  if (isSummary) {
    return (
      <AnimatedMessageItem>
        <View style={[styles.messageContainer, { alignSelf: 'stretch', maxWidth: '100%' }]}>
          <View style={{ marginRight: 8, marginTop: 4 }}>
            <GabAvatar size={28} />
          </View>
          <View
            style={[
              styles.messageBubble,
              styles.assistantBubble,
              { flex: 1, backgroundColor: cardBg, borderColor: borderCol, paddingHorizontal: 14 },
            ]}
          >
            <SummaryCard
              data={item.widgetData}
              primaryBrown={primaryBrown}
              bgTheme={bgTheme}
              borderCol={borderCol}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              onNavigate={(route) => onNavigate?.(route)}
            />
            <Text style={[styles.timestamp, { color: textSecondary }]}>{item.timestamp}</Text>
          </View>
        </View>
      </AnimatedMessageItem>
    );
  }

  return (
    <AnimatedMessageItem>
      <View style={[styles.messageContainer, { alignSelf }]}>
        {!isUser && (
          <View style={{ marginRight: 8, marginTop: 4 }}>
            <GabAvatar size={28} />
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
              {renderRichText(item.text)}
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