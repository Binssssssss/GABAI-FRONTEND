
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Pressable,
  Animated,
  PanResponder,
  StyleSheet,
  useWindowDimensions,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { AppAlert } from '@/components/AppAlert';

import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  RichEditor,
  actions,
} from 'react-native-pell-rich-editor';

import { CATEGORIES } from '../../constants/notesConfig';
import {
  countWords,
  htmlToPlainText,
  isLightColor,
  shadeHex,
  toEditorHtml,
  withAlpha,
} from '../../utils/noteHelpers';
import { noteStyles as styles } from '../../styles/notes.styles';

type FeatherName = React.ComponentProps<typeof Feather>['name'];
type ToolbarIconName = React.ComponentProps<
  typeof MaterialCommunityIcons
>['name'];

const ICON_HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };

/* ------------------------------------------------------------------ */
/* Horizontal scrolling helper                                        */
/* ------------------------------------------------------------------ */

function HScroll({
  children,
  style,
  contentContainerStyle,
  fadeColor,
  iconColor,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  fadeColor: string;
  iconColor: string;
}) {
  const [layoutW, setLayoutW] = useState(0);
  const [contentW, setContentW] = useState(0);
  const [offsetX, setOffsetX] = useState(0);

  const hasMore =
    contentW > layoutW + 1 &&
    offsetX + layoutW < contentW - 8;

  return (
    <View style={style}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        overScrollMode="never"
        scrollEventThrottle={16}
        onLayout={(event) =>
          setLayoutW(event.nativeEvent.layout.width)
        }
        onContentSizeChange={(width) => setContentW(width)}
        onScroll={(event) =>
          setOffsetX(event.nativeEvent.contentOffset.x)
        }
        contentContainerStyle={contentContainerStyle}
      >
        {children}
      </ScrollView>

      {hasMore && (
        <View
          pointerEvents="none"
          style={[
            styles.toolbarScrollHint,
            { backgroundColor: withAlpha(fadeColor, 0.9) },
          ]}
        >
          <Feather
            name="chevron-right"
            size={16}
            color={iconColor}
          />
        </View>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Bottom sheet: drag handle, drag-down and tap-outside to close      */
/* ------------------------------------------------------------------ */

function EditorSheet({
  visible,
  onClose,
  onDismiss,
  title,
  closeLabel,
  backgroundColor,
  handleColor,
  titleColor,
  bottomInset,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  onDismiss?: () => void;
  title?: string;
  closeLabel: string;
  backgroundColor: string;
  handleColor: string;
  titleColor: string;
  bottomInset: number;
  children: React.ReactNode;
}) {
  const [translateY] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      translateY.setValue(0);
    }
  }, [visible, translateY]);

  const panResponder = useMemo(() => {
    const springBack = () =>
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 0,
      }).start();

    return PanResponder.create({
      onMoveShouldSetPanResponder: (_event, gesture) =>
        gesture.dy > 6 &&
        Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_event, gesture) =>
        translateY.setValue(Math.max(0, gesture.dy)),
      onPanResponderRelease: (_event, gesture) => {
        if (gesture.dy > 80 || gesture.vy > 0.8) {
          onClose();
          return;
        }
        springBack();
      },
      onPanResponderTerminate: springBack,
    });
  }, [onClose, translateY]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onDismiss={onDismiss}
    >
      <View style={styles.sheetBackdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
        />

        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.editorSheetCard,
            {
              backgroundColor,
              paddingBottom: Math.max(bottomInset + 8, 16),
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.editorSheetHandleArea}>
            <View
              style={[
                styles.sheetHandle,
                { backgroundColor: handleColor },
              ]}
            />
          </View>

          {title ? (
            <Text
              style={[
                styles.editorSheetTitle,
                { color: titleColor },
              ]}
            >
              {title}
            </Text>
          ) : null}

          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Sheet row                                                          */
/* ------------------------------------------------------------------ */

function MenuItem({
  icon,
  label,
  onPress,
  iconColor,
  labelColor,
  selected,
  trailing,
}: {
  icon: FeatherName;
  label: string;
  onPress: () => void;
  iconColor: string;
  labelColor: string;
  selected?: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={
        selected === undefined ? undefined : { selected }
      }
      style={styles.moreMenuItem}
      onPress={onPress}
    >
      <Feather name={icon} size={20} color={iconColor} />

      <View style={styles.moreMenuTextBlock}>
        <Text
          numberOfLines={1}
          style={[
            styles.moreMenuLabel,
            { color: labelColor },
            selected ? { fontWeight: '600' } : null,
          ]}
        >
          {label}
        </Text>
      </View>

      {trailing}
    </TouchableOpacity>
  );
}

/* ------------------------------------------------------------------ */
/* Formatting toolbar config                                          */
/* ------------------------------------------------------------------ */

interface FormatTool {
  action: string;
  icon: ToolbarIconName;
  label: string;
}

const FORMAT_GROUPS: FormatTool[][] = [
  [
    { action: actions.heading1, icon: 'format-header-1', label: 'Heading 1' },
    { action: actions.heading2, icon: 'format-header-2', label: 'Heading 2' },
  ],
  [
    { action: actions.setBold, icon: 'format-bold', label: 'Bold' },
    { action: actions.setItalic, icon: 'format-italic', label: 'Italic' },
    { action: actions.setUnderline, icon: 'format-underline', label: 'Underline' },
  ],
  [
    { action: actions.insertBulletsList, icon: 'format-list-bulleted', label: 'Bulleted list' },
    { action: actions.insertOrderedList, icon: 'format-list-numbered', label: 'Numbered list' },
    { action: actions.checkboxList, icon: 'format-list-checks', label: 'Checklist' },
    { action: actions.blockquote, icon: 'format-quote-close', label: 'Quote' },
  ],
  [
    { action: actions.undo, icon: 'undo', label: 'Undo' },
    { action: actions.redo, icon: 'redo', label: 'Redo' },
  ],
];

/* ------------------------------------------------------------------ */
/* Component props                                                    */
/* ------------------------------------------------------------------ */

export interface CloseEditorOptions {
  /** Latest editor HTML to save. */
  content?: string;
  /** false = close without saving. Defaults to true. */
  save?: boolean;
}

interface NoteEditorModalProps {
  visible: boolean;
  onClose: (options?: CloseEditorOptions) => void;

  title: string;
  onTitleChange: (value: string) => void;

  content: string;
  /** Not called while typing; content is handed over when the user saves. */
  onContentChange?: (value: string) => void;

  category: string;
  onCategoryChange: (category: string) => void;

  tags: string[];
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;

  saveStatus: 'saved' | 'saving';

  isPreviewMode: boolean;
  onTogglePreview: () => void;

  isFavorite: boolean;
  onToggleFavorite: () => void;

  isPinned: boolean;
  onTogglePin: () => void;

  isArchived: boolean;
  onToggleArchive: () => void;

  onDelete: () => void;
  onShare: (content: string) => void;
  onOpenConvertTask: (content: string) => void;
  onOpenSchedule: (content: string) => void;
  onOpenTemplateModal: () => void;

  // Retained for compatibility with the existing parent. Undo/redo run
  // inside the rich editor so its own history stays in sync with the DOM.
  onUndo: () => void;
  onRedo: () => void;

  isMoreMenuOpen: boolean;
  onToggleMoreMenu: (value: boolean) => void;

  bgTheme: string;
  cardBg: string;
  borderCol: string;
  inputBg: string;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
  successGreen: string;
}

/* ------------------------------------------------------------------ */
/* Note editor                                                        */
/* ------------------------------------------------------------------ */

export default function NoteEditorModal({
  visible,
  onClose,

  title,
  onTitleChange,

  content,

  category,
  onCategoryChange,

  tags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,

  saveStatus,

  isPreviewMode,
  onTogglePreview,

  isFavorite,
  onToggleFavorite,

  isPinned,
  onTogglePin,

  isArchived,
  onToggleArchive,

  onDelete,
  onShare,
  onOpenConvertTask,
  onOpenSchedule,
  onOpenTemplateModal,

  isMoreMenuOpen,
  onToggleMoreMenu,

  bgTheme,
  cardBg,
  borderCol,
  inputBg,
  textPrimary,
  textSecondary,
  primaryBrown,
  successGreen,
}: NoteEditorModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const bodyInputRef = useRef<RichEditor | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);
  const prevStatusRef = useRef(saveStatus);

  /* Geometry used to keep the caret above the keyboard and toolbar. */
  const scrollYRef = useRef(0);
  const viewportHRef = useRef(0);
  const bodyTopRef = useRef(0);
  const lastCursorYRef = useRef<number | null>(null);
  const bodyFocusedRef = useRef(false);

  /* Last HTML the editor itself reported, to detect outside changes. */
  const lastEditorHtmlRef = useRef(content);

  /*
   * Latest editor HTML while typing. It stays inside the editor until the
   * user saves, so typing never re-renders the notes screen and nothing
   * pushes old text back into the editor (which made the caret jump).
   */
  const draftHtmlRef = useRef(content);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Sheet action that waits for the sheet to finish closing (iOS). */
  const pendingMenuActionRef = useRef<(() => void) | null>(null);

  const [showSaved, setShowSaved] = useState(false);

  /* Draft shown in counts/preview, and what the note looked like when opened. */
  const [draftHtml, setDraftHtml] = useState(content);
  const [baseline, setBaseline] = useState({ content, title });
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [activeFormats, setActiveFormats] = useState<string[]>([]);

  /* Colours derived from theme values (contrast ≥ 4.5:1). */
  const isLightTheme = isLightColor(bgTheme);
  const brandStrong = shadeHex(primaryBrown, 0.7);
  const accentText = isLightTheme ? brandStrong : primaryBrown;
  const destructive = isLightTheme ? '#DC2626' : '#F87171';
  const handleColor = withAlpha(textSecondary, 0.4);

  const editorHtml = useMemo(() => toEditorHtml(draftHtml), [draftHtml]);
  const isDirty =
    draftHtml !== baseline.content || title !== baseline.title;
  const plainTextContent = useMemo(
    () => htmlToPlainText(editorHtml),
    [editorHtml],
  );
  const { words, chars } = countWords(plainTextContent);

  const bodyMinHeight = Math.max(240, windowHeight * 0.35);

  const selectableCategories = CATEGORIES.filter(
    (item) => item.name !== 'All',
  );
  const currentCategory = CATEGORIES.find(
    (item) => item.name === category,
  );

  /* Shared WebView CSS so editing and preview look identical. */
  const contentCss = useMemo(
    () => `
      h1 { font-size: 24px; line-height: 1.3; font-weight: 700; margin: 20px 0 8px; }
      h2 { font-size: 20px; line-height: 1.35; font-weight: 700; margin: 16px 0 6px; }
      h3, h4, h5, h6 { font-size: 17px; font-weight: 700; margin: 14px 0 4px; }
      b, strong { font-weight: 700; }
      ul, ol { margin: 6px 0; padding-left: 24px; }
      li { margin: 2px 0; }
      ol.x-todo { padding-left: 28px; }
      .x-todo-box input { width: 17px; height: 17px; margin: 4px 0 0; accent-color: ${primaryBrown}; }
      blockquote { margin: 12px 0; padding: 2px 0 2px 14px; border-left: 3px solid ${primaryBrown}; color: ${textSecondary}; }
      pre { margin: 12px 0; padding: 12px 14px; min-height: 1.5em; background: ${cardBg}; border: 1px solid ${borderCol}; border-radius: 8px; font-size: 14px; line-height: 1.5; color: ${textPrimary}; }
      code { font-family: ui-monospace, Menlo, monospace; font-size: 0.9em; background: ${cardBg}; border-radius: 4px; padding: 1px 4px; }
      pre code { background: none; padding: 0; }
      hr { border: 0; border-top: 1px solid ${borderCol}; margin: 16px 0; }
      a { color: ${accentText}; }
    `,
    [primaryBrown, textSecondary, cardBg, borderCol, textPrimary, accentText],
  );

  const baseContentCss =
    "font-size: 17px; line-height: 1.5; padding: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;";

  /* Memoised: the editor re-applies its style whenever this object changes. */
  const editStyle = useMemo(
    () => ({
      backgroundColor: bgTheme,
      color: textPrimary,
      placeholderColor: textSecondary,
      caretColor: primaryBrown,
      contentCSSText: baseContentCss,
      cssText: contentCss,
    }),
    [bgTheme, textPrimary, textSecondary, primaryBrown, contentCss],
  );

  const previewStyle = useMemo(
    () => ({
      backgroundColor: bgTheme,
      color: textPrimary,
      contentCSSText: baseContentCss,
      cssText: `${contentCss} input { pointer-events: none; }`,
    }),
    [bgTheme, textPrimary, contentCss],
  );

  /* Show "Saved" only after a saving -> saved transition. */
  useEffect(() => {
    const previousStatus = prevStatusRef.current;
    prevStatusRef.current = saveStatus;

    if (
      saveStatus === 'saved' &&
      previousStatus === 'saving'
    ) {
      setShowSaved(true);

      const timeout = setTimeout(() => {
        setShowSaved(false);
      }, 1400);

      return () => clearTimeout(timeout);
    }
  }, [saveStatus]);

  /* Track keyboard visibility for the bottom toolbar. */
  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios'
        ? 'keyboardWillShow'
        : 'keyboardDidShow';

    const hideEvent =
      Platform.OS === 'ios'
        ? 'keyboardWillHide'
        : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(
      showEvent,
      () => setKeyboardVisible(true),
    );

    const hideSubscription = Keyboard.addListener(
      hideEvent,
      () => setKeyboardVisible(false),
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  /* Reset temporary UI when the editor closes. */
  const [prevVisible, setPrevVisible] = useState(visible);

  if (visible !== prevVisible) {
    setPrevVisible(visible);

    if (visible) {
      // A note was opened: this is the saved version to compare against.
      setDraftHtml(content);
      setBaseline({ content, title });
    }

    if (!visible) {
      setIsAddingTag(false);
      setKeyboardVisible(false);
      setShowSaved(false);
      setIsScrolled(false);
      setIsCategorySheetOpen(false);
      setActiveFormats([]);
    }
  }

  useEffect(() => {
    if (!visible) {
      lastCursorYRef.current = null;
      bodyFocusedRef.current = false;
    }

    if (visible) {
      // Each open starts from the note's saved content.
      draftHtmlRef.current = content;
      lastEditorHtmlRef.current = content;
    } else if (draftTimerRef.current) {
      clearTimeout(draftTimerRef.current);
      draftTimerRef.current = null;
    }
    // Only on open/close; outside content changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, []);

  /*
   * The rich editor only reads initialContentHTML once. When content is
   * replaced from outside (e.g. a template), push it into the editor.
   */
  useEffect(() => {
    // The parent no longer echoes typing back, so any change here is a
    // real outside change (e.g. a template): load it into the editor.
    if (content === lastEditorHtmlRef.current) return;

    lastEditorHtmlRef.current = content;
    draftHtmlRef.current = content;
    setDraftHtml(content);
    bodyInputRef.current?.setContentHTML(toEditorHtml(content));
  }, [content]);

  const handleEditorChange = (html: string) => {
    lastEditorHtmlRef.current = html;
    draftHtmlRef.current = html;

    // Update word count / "Unsaved" badge after a short pause, not per key.
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      draftTimerRef.current = null;
      setDraftHtml(html);
    }, 300);
  };

  /* Push the latest typed text into local state right away. */
  const flushDraft = () => {
    if (draftTimerRef.current) {
      clearTimeout(draftTimerRef.current);
      draftTimerRef.current = null;
    }
    setDraftHtml(draftHtmlRef.current);
  };

  const hasBodyText = (html: string) =>
    htmlToPlainText(toEditorHtml(html)).trim().length > 0;

  /* Save is only done by the user: Done, or "Save" when leaving. */
  const saveAndClose = () => {
    bodyInputRef.current?.dismissKeyboard();
    Keyboard.dismiss();

    const html = draftHtmlRef.current;

    onClose({
      content: html,
      save: title.trim().length > 0 || hasBodyText(html),
    });
  };

  const discardAndClose = () => {
    bodyInputRef.current?.dismissKeyboard();
    Keyboard.dismiss();
    onClose({ save: false });
  };

  /* Back arrow / Android back: ask before losing unsaved changes. */
  const requestClose = () => {
    const changed =
      draftHtmlRef.current !== baseline.content ||
      title !== baseline.title;

    if (!changed) {
      discardAndClose();
      return;
    }

    AppAlert.alert(
      'Save changes?',
      'This note has changes that are not saved yet.',
      [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: discardAndClose },
        { text: 'Save', onPress: saveAndClose },
      ],
    );
  };

  /* Scroll so the caret line sits above the toolbar with breathing room. */
  const ensureCursorVisible = useCallback((offsetY: number) => {
    lastCursorYRef.current = offsetY;

    const scroll = scrollRef.current;
    const viewportH = viewportHRef.current;
    if (!scroll || viewportH <= 0) return;

    const cursorY = bodyTopRef.current + offsetY;
    const viewTop = scrollYRef.current;
    const bottomMargin = 64;
    const topMargin = 24;

    if (cursorY + bottomMargin > viewTop + viewportH) {
      scroll.scrollTo({
        y: cursorY + bottomMargin - viewportH,
        animated: true,
      });
    } else if (cursorY - topMargin < viewTop) {
      scroll.scrollTo({
        y: Math.max(0, cursorY - topMargin),
        animated: true,
      });
    }
  }, []);

  const handleScrollLayout = (event: LayoutChangeEvent) => {
    viewportHRef.current = event.nativeEvent.layout.height;

    // Viewport shrank (keyboard opened): bring the caret back into view.
    if (bodyFocusedRef.current && lastCursorYRef.current !== null) {
      ensureCursorVisible(lastCursorYRef.current);
    }
  };

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const y = event.nativeEvent.contentOffset.y;
    scrollYRef.current = y;
    setIsScrolled(y > 4);
  };

  const focusBody = () => {
    if (isPreviewMode) return;
    bodyInputRef.current?.focusContentEditor();
  };

  const runFormat = (action: string) => {
    bodyInputRef.current?.sendAction(action, 'result');
  };

  const handleEditorReady = () => {
    bodyInputRef.current?.registerToolbar((items) => {
      setActiveFormats(
        items.map((item) =>
          typeof item === 'string' ? item : item.type,
        ),
      );
    });
  };

  /* Done saves the note and closes the editor. */
  const handleDone = saveAndClose;

  /* Add a tag using the existing parent handler. */
  const submitTag = () => {
    if (!tagInput.trim()) {
      setIsAddingTag(false);
      return;
    }

    onAddTag();
    onTagInputChange('');
    setIsAddingTag(false);
  };

  /*
   * Close the options sheet, then run the action. On iOS the action
   * waits for the sheet to finish dismissing, otherwise the next modal
   * or the delete confirmation alert can fail to present.
   */
  const runPendingMenuAction = useCallback(() => {
    const action = pendingMenuActionRef.current;
    pendingMenuActionRef.current = null;
    action?.();
  }, []);

  const closeMenuThen = (action: () => void) => {
    pendingMenuActionRef.current = action;
    onToggleMoreMenu(false);

    if (Platform.OS !== 'ios') {
      runPendingMenuAction();
      return;
    }

    // Fallback in case onDismiss does not fire.
    setTimeout(runPendingMenuAction, 450);
  };

  const closeMoreMenu = useCallback(
    () => onToggleMoreMenu(false),
    [onToggleMoreMenu],
  );

  const closeCategorySheet = useCallback(
    () => setIsCategorySheetOpen(false),
    [],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={requestClose}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={0}
        style={{
          flex: 1,
          backgroundColor: bgTheme,
        }}
      >
        <SafeAreaView
          style={[
            styles.editorContainer,
            { backgroundColor: bgTheme },
          ]}
          edges={['top']}
        >
          {/* Header: back · status · overflow · Done */}
          <View
            style={[
              styles.editorHeader,
              {
                borderBottomColor: isScrolled
                  ? borderCol
                  : 'transparent',
              },
            ]}
          >
            <View
              pointerEvents="none"
              style={styles.editorHeaderCenter}
            >
              {saveStatus === 'saving' ? (
                <View
                  style={styles.saveStatusBadge}
                  accessibilityLiveRegion="polite"
                >
                  <View
                    style={[
                      styles.saveStatusDot,
                      { backgroundColor: primaryBrown },
                    ]}
                  />

                  <Text
                    style={[
                      styles.saveStatusText,
                      { color: textSecondary },
                    ]}
                  >
                    Saving…
                  </Text>
                </View>
              ) : isDirty ? (
                <View
                  style={styles.saveStatusBadge}
                  accessibilityLiveRegion="polite"
                >
                  <View
                    style={[
                      styles.saveStatusDot,
                      { backgroundColor: primaryBrown },
                    ]}
                  />

                  <Text
                    style={[
                      styles.saveStatusText,
                      { color: textSecondary },
                    ]}
                  >
                    Unsaved changes
                  </Text>
                </View>
              ) : showSaved ? (
                <View
                  style={styles.saveStatusBadge}
                  accessibilityLiveRegion="polite"
                >
                  <View
                    style={[
                      styles.saveStatusDot,
                      { backgroundColor: successGreen },
                    ]}
                  />

                  <Text
                    style={[
                      styles.saveStatusText,
                      { color: textSecondary },
                    ]}
                  >
                    Saved
                  </Text>
                </View>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={requestClose}
              accessibilityRole="button"
              accessibilityLabel="Back to notes"
              style={styles.editorHeaderButton}
            >
              <Feather
                name="chevron-left"
                size={26}
                color={textPrimary}
              />
            </TouchableOpacity>

            <View style={styles.editorHeaderSpacer} />

            <View style={styles.editorHeaderRight}>
              <TouchableOpacity
                onPress={() => onToggleMoreMenu(true)}
                accessibilityRole="button"
                accessibilityLabel="Note options"
                style={styles.editorHeaderButton}
              >
                <Feather
                  name="more-horizontal"
                  size={22}
                  color={textPrimary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDone}
                accessibilityRole="button"
                accessibilityLabel="Save and close note"
                hitSlop={{ top: 6, bottom: 6 }}
                style={[
                  styles.editorDoneBtn,
                  { backgroundColor: brandStrong },
                ]}
              >
                <Text style={styles.editorDoneBtnText}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Editor content */}
          <ScrollView
            ref={scrollRef}
            style={styles.editorContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === 'ios'
                ? 'interactive'
                : 'on-drag'
            }
            scrollEventThrottle={16}
            onScroll={handleScroll}
            onLayout={handleScrollLayout}
            contentContainerStyle={[
              styles.editorScroll,
              {
                paddingBottom: isPreviewMode
                  ? insets.bottom + 24
                  : 0,
              },
            ]}
          >
            {/* Category */}
            <TouchableOpacity
              onPress={() => setIsCategorySheetOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={`Category: ${category}. Change category`}
              hitSlop={{ top: 6, bottom: 6, left: 8, right: 8 }}
              style={styles.editorCategoryTrigger}
            >
              <Feather
                name={
                  (currentCategory?.icon ?? 'folder') as FeatherName
                }
                size={14}
                color={accentText}
              />

              <Text
                style={[
                  styles.editorCategoryTriggerText,
                  { color: accentText },
                ]}
              >
                {category}
              </Text>

              <Feather
                name="chevron-down"
                size={14}
                color={accentText}
              />
            </TouchableOpacity>

            {/* Title */}
            <TextInput
              style={[
                styles.editorTitleInput,
                { color: textPrimary },
              ]}
              placeholder="Title"
              placeholderTextColor={textSecondary}
              value={title}
              onChangeText={onTitleChange}
              maxLength={100}
              multiline
              scrollEnabled={false}
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={focusBody}
              selectionColor={primaryBrown}
              accessibilityLabel="Note title"
            />

            {/* Tags */}
            <View style={styles.editorTagsSection}>
              {tags.map((tag) => (
                <View
                  key={tag}
                  style={[
                    styles.editorTagBadgeWrapper,
                    { backgroundColor: withAlpha(primaryBrown, 0.12) },
                  ]}
                >
                  <Text
                    style={[
                      styles.editorTagBadgeText,
                      { color: accentText },
                    ]}
                  >
                    {tag}
                  </Text>

                  <TouchableOpacity
                    onPress={() => onRemoveTag(tag)}
                    hitSlop={ICON_HIT_SLOP}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove tag ${tag}`}
                    style={styles.editorTagBadgeRemove}
                  >
                    <Feather
                      name="x"
                      size={13}
                      color={accentText}
                    />
                  </TouchableOpacity>
                </View>
              ))}

              {isAddingTag ? (
                <View
                  style={[
                    styles.tagInputRow,
                    {
                      borderColor: accentText,
                      backgroundColor: inputBg,
                    },
                  ]}
                >
                  <TextInput
                    autoFocus
                    style={[
                      styles.tagInput,
                      { color: textPrimary },
                    ]}
                    placeholder="New tag"
                    placeholderTextColor={textSecondary}
                    value={tagInput}
                    onChangeText={onTagInputChange}
                    onSubmitEditing={submitTag}
                    onBlur={() => {
                      if (!tagInput.trim()) {
                        setIsAddingTag(false);
                      }
                    }}
                    returnKeyType="done"
                    autoCapitalize="none"
                    autoCorrect={false}
                    selectionColor={primaryBrown}
                    maxLength={24}
                    accessibilityLabel="New tag name"
                  />

                  <TouchableOpacity
                    onPress={submitTag}
                    accessibilityRole="button"
                    accessibilityLabel="Confirm tag"
                    hitSlop={ICON_HIT_SLOP}
                    style={styles.editorTagBadgeRemove}
                  >
                    <Feather
                      name="check"
                      size={16}
                      color={accentText}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setIsAddingTag(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Add tag"
                  hitSlop={{ top: 8, bottom: 8 }}
                  style={[
                    styles.tagAddButton,
                    { borderColor: accentText },
                  ]}
                >
                  <Text
                    style={[
                      styles.tagAddButtonText,
                      { color: accentText },
                    ]}
                  >
                    + Add tag
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Body / Preview */}
            <View
              onLayout={(event) => {
                bodyTopRef.current = event.nativeEvent.layout.y;
              }}
            >
              {isPreviewMode ? (
                plainTextContent ? (
                  <RichEditor
                    key="preview"
                    initialContentHTML={editorHtml}
                    disabled
                    editorStyle={previewStyle}
                    style={{ backgroundColor: bgTheme }}
                    useContainer
                  />
                ) : (
                  <Text
                    style={[
                      styles.editorEmptyPreviewText,
                      { color: textSecondary },
                    ]}
                  >
                    Nothing to preview yet.
                  </Text>
                )
              ) : (
                <RichEditor
                  key="editor"
                  ref={bodyInputRef}
                  initialContentHTML={editorHtml}
                  initialHeight={bodyMinHeight}
                  placeholder="Start writing…"
                  onChange={handleEditorChange}
                  onCursorPosition={ensureCursorVisible}
                  onFocus={() => {
                    bodyFocusedRef.current = true;
                  }}
                  onBlur={() => {
                    bodyFocusedRef.current = false;
                  }}
                  editorInitializedCallback={handleEditorReady}
                  editorStyle={editStyle}
                  style={{ backgroundColor: bgTheme }}
                  useContainer
                />
              )}
            </View>

            {/* Empty space below the body: tap to keep writing. */}
            {!isPreviewMode && (
              <Pressable
                style={styles.editorBodyTail}
                onPress={focusBody}
                accessible={false}
              />
            )}
          </ScrollView>

          {/* Word count and formatting toolbar (edit mode only) */}
          {!isPreviewMode && (
            <View>
              <View style={styles.editorMetaLine}>
                <Text
                  style={[
                    styles.editorMetaText,
                    { color: textSecondary },
                  ]}
                >
                  {words} {words === 1 ? 'word' : 'words'} · {chars}{' '}
                  {chars === 1 ? 'character' : 'characters'}
                </Text>
              </View>

              <View
                style={[
                  styles.formattingToolbar,
                  {
                    backgroundColor: cardBg,
                    borderTopColor: borderCol,
                    paddingBottom: keyboardVisible
                      ? 0
                      : insets.bottom,
                  },
                ]}
              >
                <HScroll
                  style={styles.toolbarScrollWrap}
                  fadeColor={cardBg}
                  iconColor={textSecondary}
                  contentContainerStyle={styles.toolbarScroll}
                >
                  {FORMAT_GROUPS.map((group, groupIndex) => (
                    <React.Fragment key={group[0].action}>
                      {groupIndex > 0 && (
                        <View
                          style={[
                            styles.toolbarDivider,
                            { backgroundColor: borderCol },
                          ]}
                        />
                      )}

                      {group.map((tool) => {
                        const active = activeFormats.includes(
                          tool.action,
                        );

                        return (
                          <TouchableOpacity
                            key={tool.action}
                            onPress={() => runFormat(tool.action)}
                            accessibilityRole="button"
                            accessibilityLabel={tool.label}
                            accessibilityState={{ selected: active }}
                            style={styles.toolbarBtn}
                          >
                            <MaterialCommunityIcons
                              name={tool.icon}
                              size={20}
                              color={
                                active ? accentText : textPrimary
                              }
                            />
                          </TouchableOpacity>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </HScroll>

                <View style={styles.toolbarPinned}>
                  <View
                    style={[
                      styles.toolbarDivider,
                      { backgroundColor: borderCol },
                    ]}
                  />

                  <TouchableOpacity
                    onPress={onOpenTemplateModal}
                    accessibilityRole="button"
                    accessibilityLabel="Insert template"
                    style={styles.toolbarBtn}
                  >
                    <MaterialCommunityIcons
                      name="file-document-outline"
                      size={20}
                      color={textPrimary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* Category sheet */}
      <EditorSheet
        visible={isCategorySheetOpen}
        onClose={closeCategorySheet}
        title="Category"
        closeLabel="Close category picker"
        backgroundColor={cardBg}
        handleColor={handleColor}
        titleColor={textSecondary}
        bottomInset={insets.bottom}
      >
        {selectableCategories.map((cat) => {
          const selected = category === cat.name;

          return (
            <MenuItem
              key={cat.name}
              icon={cat.icon as FeatherName}
              label={cat.name}
              selected={selected}
              iconColor={selected ? accentText : textSecondary}
              labelColor={selected ? accentText : textPrimary}
              trailing={
                selected ? (
                  <Feather
                    name="check"
                    size={18}
                    color={accentText}
                  />
                ) : null
              }
              onPress={() => {
                onCategoryChange(cat.name);
                setIsCategorySheetOpen(false);
              }}
            />
          );
        })}
      </EditorSheet>

      {/* Options sheet */}
      <EditorSheet
        visible={isMoreMenuOpen}
        onClose={closeMoreMenu}
        onDismiss={runPendingMenuAction}
        closeLabel="Close note options"
        backgroundColor={cardBg}
        handleColor={handleColor}
        titleColor={textSecondary}
        bottomInset={insets.bottom}
      >
        <View style={styles.moreMenuList}>
          <MenuItem
            icon={isPreviewMode ? 'edit-3' : 'eye'}
            label={isPreviewMode ? 'Edit note' : 'Preview'}
            iconColor={textSecondary}
            labelColor={textPrimary}
            onPress={() => closeMenuThen(() => {
              flushDraft();
              onTogglePreview();
            })}
          />

          <MenuItem
            icon="star"
            label={
              isFavorite
                ? 'Remove from favorites'
                : 'Add to favorites'
            }
            iconColor={textSecondary}
            labelColor={textPrimary}
            onPress={() => closeMenuThen(onToggleFavorite)}
          />

          <MenuItem
            icon="bookmark"
            label={isPinned ? 'Unpin' : 'Pin to top'}
            iconColor={textSecondary}
            labelColor={textPrimary}
            onPress={() => closeMenuThen(onTogglePin)}
          />

          <View
            style={[
              styles.moreMenuDivider,
              { backgroundColor: borderCol },
            ]}
          />

          <MenuItem
            icon="check-circle"
            label="Convert to task"
            iconColor={textSecondary}
            labelColor={textPrimary}
            onPress={() => closeMenuThen(() => onOpenConvertTask(draftHtmlRef.current))}
          />

          <MenuItem
            icon="calendar"
            label="Link to calendar"
            iconColor={textSecondary}
            labelColor={textPrimary}
            onPress={() => closeMenuThen(() => onOpenSchedule(draftHtmlRef.current))}
          />

          <MenuItem
            icon="share"
            label="Share"
            iconColor={textSecondary}
            labelColor={textPrimary}
            onPress={() => closeMenuThen(() => onShare(draftHtmlRef.current))}
          />

          <View
            style={[
              styles.moreMenuDivider,
              { backgroundColor: borderCol },
            ]}
          />

          <MenuItem
            icon="archive"
            label={isArchived ? 'Unarchive' : 'Archive'}
            iconColor={textSecondary}
            labelColor={textPrimary}
            onPress={() => closeMenuThen(onToggleArchive)}
          />

          <MenuItem
            icon="trash-2"
            label="Delete note"
            iconColor={destructive}
            labelColor={destructive}
            onPress={() => closeMenuThen(onDelete)}
          />
        </View>
      </EditorSheet>
    </Modal>
  );
}
