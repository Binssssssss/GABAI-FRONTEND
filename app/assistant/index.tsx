import React from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/app/context/ThemeContext';

import {
  AssistantHeader,
  TypingIndicator,
  MessageBubble,
  EmptyStateView,
  QuickActionsBar,
  ChatInputBar,
} from './components';
import { useAssistant } from './hooks';
import { assistantStyles as styles } from './styles';

export default function AssistantScreen() {
  const router = useRouter();

  // Use GabAi manual theme
  const { colorScheme } = useAppTheme();
  const isDark = colorScheme === 'dark';

  // GabAi Design Colors
  const primaryBrown = '#A97C50';
  const bgTheme = isDark ? '#121212' : '#FFFFFF';
  const textPrimary = isDark ? '#ECEDEE' : '#11181C';
  const textSecondary = isDark ? '#9BA1A6' : '#666666';
  const cardBg = isDark ? '#1E1E1E' : '#F8FAFC';
  const borderCol = isDark ? '#2E2E2E' : '#E2E8F0';
  const inputBg = isDark ? '#1C1C1E' : '#FFFFFF';

  const {
    messages,
    inputVal,
    setInputVal,
    isTyping,
    flatListRef,
    scrollToBottom,
    handleQuery,
    handleFocusComplete,
    resetChat,
  } = useAssistant();

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: bgTheme },
      ]}
      edges={['top', 'bottom']}
    >
      {/* Header bar */}
      <AssistantHeader
        textPrimary={textPrimary}
        textSecondary={textSecondary}
        primaryBrown={primaryBrown}
        borderCol={borderCol}
        onBack={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }

          router.replace('/(tabs)/dashboard/dashboard');
        }}
        onReset={resetChat}
      />

      {/* Main chat history */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1 }}>
          {messages.length === 0 ? (
            /* Welcome / Empty state */
            <FlatList
              data={[]}
              renderItem={null}
              ListEmptyComponent={
                <EmptyStateView
                  primaryBrown={primaryBrown}
                  cardBg={cardBg}
                  borderCol={borderCol}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  onSelectQuery={handleQuery}
                />
              }
              contentContainerStyle={{ paddingBottom: 24 }}
            />
          ) : (
            /* Active messages */
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={({ item }) => (
                <MessageBubble
                  item={item}
                  primaryBrown={primaryBrown}
                  cardBg={cardBg}
                  borderCol={borderCol}
                  bgTheme={bgTheme}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  onFocusComplete={handleFocusComplete}
                />
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messageList}
              ListFooterComponent={
                isTyping ? <TypingIndicator /> : null
              }
              onContentSizeChange={scrollToBottom}
            />
          )}

          {/* Quick Actions bar above Input */}
          <QuickActionsBar
            cardBg={cardBg}
            borderCol={borderCol}
            textPrimary={textPrimary}
            onSelectAction={handleQuery}
          />

          {/* Text Input Row */}
          <ChatInputBar
            inputVal={inputVal}
            onChangeText={setInputVal}
            onSubmit={() => handleQuery(inputVal)}
            bgTheme={bgTheme}
            inputBg={inputBg}
            borderCol={borderCol}
            textPrimary={textPrimary}
            textSecondary={textSecondary}
            primaryBrown={primaryBrown}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}