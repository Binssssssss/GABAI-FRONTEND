import { useAppTheme } from '@/app/context/ThemeContext';
import StandaloneDrawer from '@/components/drawer/StandaloneDrawer';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    AssistantHeader,
    ChatInputBar,
    EmptyStateView,
    MessageBubble,
    QuickActionsBar,
    TypingIndicator,
} from './components';
import { useAssistant } from './hooks';
import { assistantStyles as styles } from './styles';

export default function AssistantScreen() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Use GabAi manual theme
  const { colors } = useAppTheme();

  // GabAi Design Colors
  const primaryBrown = '#A97C50';
  const bgTheme = colors.background;
  const textPrimary = colors.text;
  const textSecondary = colors.icon;
  const cardBg = colors.surface;
  const borderCol = colors.border;
  const inputBg = colors.surfaceStrong;

  const {
    messages,
    inputVal,
    setInputVal,
    isTyping,
    flatListRef,
    scrollToBottom,
    handleQuery,
    handleQuickAction,
    activeQuickAction,
    handleFocusComplete,
    resetChat,
  } = useAssistant();

  return (
    <View style={{ flex: 1, backgroundColor: bgTheme }}>
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
        onOpenMenu={() => setIsMenuOpen(true)}
        onReset={resetChat}
      />

      {/* Main chat history */}
      {/* Lift the quick actions and input above the keyboard (iOS and Android). */}
      <KeyboardAvoidingView
        behavior="padding"
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
              keyboardShouldPersistTaps="handled"
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
                  onNavigate={(route) => router.replace(route as any)}
                />
              )}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messageList}
              ListFooterComponent={
                isTyping ? <TypingIndicator /> : null
              }
              onContentSizeChange={scrollToBottom}
              keyboardShouldPersistTaps="handled"
            />
          )}

          {/* Quick Actions bar above Input */}
          <QuickActionsBar
            cardBg={cardBg}
            borderCol={borderCol}
            textPrimary={textPrimary}
            primaryBrown={primaryBrown}
            activeKey={activeQuickAction}
            onSelectAction={handleQuickAction}
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

      {/* Side menu (same as the main tabs) */}
      <StandaloneDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </View>
  );
}