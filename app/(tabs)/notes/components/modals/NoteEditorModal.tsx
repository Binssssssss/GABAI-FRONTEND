import React from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CATEGORIES } from '../../constants/notesConfig';
import { countWords } from '../../utils/noteHelpers';
import { noteStyles as styles } from '../../styles/notes.styles';

interface NoteEditorModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  onTitleChange: (val: string) => void;
  content: string;
  onContentChange: (val: string) => void;
  category: string;
  onCategoryChange: (cat: string) => void;
  tags: string[];
  tagInput: string;
  onTagInputChange: (val: string) => void;
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
  onShare: () => void;
  onOpenConvertTask: () => void;
  onOpenSchedule: () => void;
  onOpenTemplateModal: () => void;
  onInsertFormatting: (prefix: string, suffix?: string, placeholder?: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  isMoreMenuOpen: boolean;
  onToggleMoreMenu: (val: boolean) => void;
  bgTheme: string;
  cardBg: string;
  borderCol: string;
  inputBg: string;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
  successGreen: string;
}

export default function NoteEditorModal({
  visible,
  onClose,
  title,
  onTitleChange,
  content,
  onContentChange,
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
  onInsertFormatting,
  onUndo,
  onRedo,
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
  const { words, chars } = countWords(content);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.editorContainer, { backgroundColor: bgTheme }]}>
        {/* Editor Top Bar */}
        <View style={[styles.editorHeader, { borderColor: borderCol }]}>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.editorHeaderBtn, { backgroundColor: cardBg, borderColor: borderCol }]}
          >
            <Feather name="arrow-left" size={18} color={textPrimary} />
          </TouchableOpacity>

          {/* Auto-save status */}
          <View style={styles.saveStatusBadge}>
            <View
              style={[
                styles.saveStatusDot,
                { backgroundColor: saveStatus === 'saved' ? successGreen : '#F59E0B' },
              ]}
            />
            <Text style={[styles.saveStatusText, { color: textSecondary }]}>
              {saveStatus === 'saved' ? 'Saved' : 'Saving...'}
            </Text>
          </View>

          {/* Header Action Icons */}
          <View style={styles.editorHeaderRight}>
            {/* Preview Toggle */}
            <TouchableOpacity
              onPress={onTogglePreview}
              style={[
                styles.editorIconBtn,
                {
                  backgroundColor: isPreviewMode ? primaryBrown + '20' : cardBg,
                  borderColor: isPreviewMode ? primaryBrown : borderCol,
                },
              ]}
            >
              <Feather
                name={isPreviewMode ? 'edit-3' : 'eye'}
                size={16}
                color={isPreviewMode ? primaryBrown : textPrimary}
              />
            </TouchableOpacity>

            {/* Favorite */}
            <TouchableOpacity
              onPress={onToggleFavorite}
              style={[styles.editorIconBtn, { backgroundColor: cardBg, borderColor: borderCol }]}
            >
              <Feather
                name="star"
                size={16}
                color={isFavorite ? '#F59E0B' : textSecondary}
              />
            </TouchableOpacity>

            {/* More Options */}
            <TouchableOpacity
              onPress={() => onToggleMoreMenu(true)}
              style={[styles.editorIconBtn, { backgroundColor: cardBg, borderColor: borderCol }]}
            >
              <Feather name="more-vertical" size={16} color={textPrimary} />
            </TouchableOpacity>

            {/* Done Button */}
            <TouchableOpacity
              onPress={onClose}
              style={[styles.editorDoneBtn, { backgroundColor: primaryBrown }]}
            >
              <Text style={styles.editorDoneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.editorScroll}
          >
            {/* Category Selector Chips */}
            <View style={styles.editorCategorySection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.editorCategoryScroll}
              >
                {CATEGORIES.filter((c) => c.name !== 'All').map((cat) => {
                  const isSelected = category === cat.name;
                  return (
                    <TouchableOpacity
                      key={cat.name}
                      onPress={() => onCategoryChange(cat.name)}
                      style={[
                        styles.editorCategoryChip,
                        {
                          backgroundColor: isSelected ? cat.color : cardBg,
                          borderColor: isSelected ? cat.color : borderCol,
                        },
                      ]}
                    >
                      <Feather
                        name={cat.icon as any}
                        size={12}
                        color={isSelected ? '#FFFFFF' : cat.color}
                      />
                      <Text
                        style={[
                          styles.editorCategoryChipText,
                          { color: isSelected ? '#FFFFFF' : textPrimary },
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Title Input */}
            <TextInput
              style={[styles.editorTitleInput, { color: textPrimary }]}
              placeholder="Note Title..."
              placeholderTextColor={textSecondary}
              value={title}
              onChangeText={onTitleChange}
            />

            {/* Tags Section */}
            <View style={styles.editorTagsSection}>
              {tags.map((tag, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => onRemoveTag(tag)}
                  style={[
                    styles.editorTagBadge,
                    { backgroundColor: primaryBrown + '15', borderColor: primaryBrown + '40' },
                  ]}
                >
                  <Text style={[styles.editorTagBadgeText, { color: primaryBrown }]}>{tag}</Text>
                  <Feather name="x" size={12} color={primaryBrown} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              ))}

              <View
                style={[
                  styles.tagInputWrapper,
                  { backgroundColor: inputBg, borderColor: borderCol },
                ]}
              >
                <TextInput
                  style={[styles.tagTextInput, { color: textPrimary }]}
                  placeholder="+ tag"
                  placeholderTextColor={textSecondary}
                  value={tagInput}
                  onChangeText={onTagInputChange}
                  onSubmitEditing={onAddTag}
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* Content or Markdown Preview */}
            {isPreviewMode ? (
              <View style={[styles.previewContainer, { backgroundColor: cardBg, borderColor: borderCol }]}>
                <Text style={[styles.previewContent, { color: textPrimary }]}>
                  {content || 'Nothing to preview...'}
                </Text>
              </View>
            ) : (
              <TextInput
                style={[styles.editorContentInput, { color: textPrimary }]}
                placeholder="Write markdown notes, checklist items, or paste lecture summaries here..."
                placeholderTextColor={textSecondary}
                value={content}
                onChangeText={onContentChange}
                multiline={true}
                textAlignVertical="top"
              />
            )}

            {/* Word count footer */}
            <View style={{ paddingVertical: 12, borderTopWidth: 1, borderColor: borderCol, marginTop: 20 }}>
              <Text style={{ fontSize: 11, color: textSecondary }}>
                {words} words • {chars} characters
              </Text>
            </View>
          </ScrollView>

          {/* Formatting Toolbar */}
          {!isPreviewMode && (
            <View style={[styles.formattingToolbar, { backgroundColor: cardBg, borderColor: borderCol }]}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.toolbarScroll}
              >
                {/* Heading 1 */}
                <TouchableOpacity
                  style={[styles.toolbarBtn, { backgroundColor: inputBg }]}
                  onPress={() => onInsertFormatting('# ', '', 'Heading 1')}
                >
                  <Text style={[styles.toolbarTextBtn, { color: textPrimary }]}>H1</Text>
                </TouchableOpacity>

                {/* Heading 2 */}
                <TouchableOpacity
                  style={[styles.toolbarBtn, { backgroundColor: inputBg }]}
                  onPress={() => onInsertFormatting('## ', '', 'Heading 2')}
                >
                  <Text style={[styles.toolbarTextBtn, { color: textPrimary }]}>H2</Text>
                </TouchableOpacity>

                {/* Bold */}
                <TouchableOpacity
                  style={[styles.toolbarBtn, { backgroundColor: inputBg }]}
                  onPress={() => onInsertFormatting('**', '**', 'bold text')}
                >
                  <Feather name="bold" size={15} color={textPrimary} />
                </TouchableOpacity>

                {/* Italic */}
                <TouchableOpacity
                  style={[styles.toolbarBtn, { backgroundColor: inputBg }]}
                  onPress={() => onInsertFormatting('*', '*', 'italic text')}
                >
                  <Feather name="italic" size={15} color={textPrimary} />
                </TouchableOpacity>

                {/* Checklist */}
                <TouchableOpacity
                  style={[styles.toolbarBtn, { backgroundColor: inputBg }]}
                  onPress={() => onInsertFormatting('- [ ] ', '', 'Task item')}
                >
                  <Feather name="check-square" size={15} color={textPrimary} />
                </TouchableOpacity>

                {/* Bullet */}
                <TouchableOpacity
                  style={[styles.toolbarBtn, { backgroundColor: inputBg }]}
                  onPress={() => onInsertFormatting('- ', '', 'Bullet point')}
                >
                  <Feather name="list" size={15} color={textPrimary} />
                </TouchableOpacity>

                {/* Code Block */}
                <TouchableOpacity
                  style={[styles.toolbarBtn, { backgroundColor: inputBg }]}
                  onPress={() => onInsertFormatting('```\n', '\n```', 'code here')}
                >
                  <Feather name="code" size={15} color={textPrimary} />
                </TouchableOpacity>

                {/* Quote */}
                <TouchableOpacity
                  style={[styles.toolbarBtn, { backgroundColor: inputBg }]}
                  onPress={() => onInsertFormatting('> ', '', 'Quote / Insight')}
                >
                  <Feather name="message-square" size={15} color={textPrimary} />
                </TouchableOpacity>

                <View style={[styles.toolbarDivider, { backgroundColor: borderCol }]} />

                {/* Undo */}
                <TouchableOpacity
                  style={[styles.toolbarBtn, { backgroundColor: inputBg }]}
                  onPress={onUndo}
                >
                  <Feather name="rotate-ccw" size={14} color={textPrimary} />
                </TouchableOpacity>

                {/* Redo */}
                <TouchableOpacity
                  style={[styles.toolbarBtn, { backgroundColor: inputBg }]}
                  onPress={onRedo}
                >
                  <Feather name="rotate-cw" size={14} color={textPrimary} />
                </TouchableOpacity>

                {/* Template Inserter */}
                <TouchableOpacity
                  style={[styles.templateInsertBtn, { backgroundColor: primaryBrown + '20' }]}
                  onPress={onOpenTemplateModal}
                >
                  <Feather name="layout" size={13} color={primaryBrown} style={{ marginRight: 4 }} />
                  <Text style={[styles.templateInsertText, { color: primaryBrown }]}>Template</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
        </KeyboardAvoidingView>

        {/* More Options Bottom Sheet Modal */}
        <Modal
          visible={isMoreMenuOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => onToggleMoreMenu(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => onToggleMoreMenu(false)}
            style={styles.sheetBackdrop}
          >
            <View style={[styles.bottomSheetCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
              <View style={styles.sheetHandleBar}>
                <View style={[styles.sheetHandle, { backgroundColor: borderCol }]} />
              </View>

              <Text style={[styles.sheetTitle, { color: textPrimary, marginBottom: 12 }]}>
                Note Options
              </Text>

              <View style={styles.moreMenuList}>
                {/* Convert to Task */}
                <TouchableOpacity
                  style={[styles.moreMenuItem, { borderColor: borderCol }]}
                  onPress={() => {
                    onToggleMoreMenu(false);
                    onOpenConvertTask();
                  }}
                >
                  <View style={[styles.moreMenuIconCircle, { backgroundColor: '#10B98120' }]}>
                    <Feather name="check-circle" size={16} color="#10B981" />
                  </View>
                  <View style={styles.moreMenuTextBlock}>
                    <Text style={[styles.moreMenuLabel, { color: textPrimary }]}>Convert to Task</Text>
                    <Text style={[styles.moreMenuDesc, { color: textSecondary }]}>
                      Add this note to your active academic todo list
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Link to Schedule */}
                <TouchableOpacity
                  style={[styles.moreMenuItem, { borderColor: borderCol }]}
                  onPress={() => {
                    onToggleMoreMenu(false);
                    onOpenSchedule();
                  }}
                >
                  <View style={[styles.moreMenuIconCircle, { backgroundColor: '#6366F120' }]}>
                    <Feather name="calendar" size={16} color="#6366F1" />
                  </View>
                  <View style={styles.moreMenuTextBlock}>
                    <Text style={[styles.moreMenuLabel, { color: textPrimary }]}>Link to Calendar</Text>
                    <Text style={[styles.moreMenuDesc, { color: textSecondary }]}>
                      Schedule study session or review deadline
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Pin Note */}
                <TouchableOpacity
                  style={[styles.moreMenuItem, { borderColor: borderCol }]}
                  onPress={() => {
                    onTogglePin();
                    onToggleMoreMenu(false);
                  }}
                >
                  <View style={[styles.moreMenuIconCircle, { backgroundColor: primaryBrown + '20' }]}>
                    <Feather name="bookmark" size={16} color={primaryBrown} />
                  </View>
                  <View style={styles.moreMenuTextBlock}>
                    <Text style={[styles.moreMenuLabel, { color: textPrimary }]}>
                      {isPinned ? 'Unpin Note' : 'Pin to Top'}
                    </Text>
                    <Text style={[styles.moreMenuDesc, { color: textSecondary }]}>
                      Keep this note at the top of your workspace
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Share Note */}
                <TouchableOpacity
                  style={[styles.moreMenuItem, { borderColor: borderCol }]}
                  onPress={() => {
                    onToggleMoreMenu(false);
                    onShare();
                  }}
                >
                  <View style={[styles.moreMenuIconCircle, { backgroundColor: '#3B82F620' }]}>
                    <Feather name="share-2" size={16} color="#3B82F6" />
                  </View>
                  <View style={styles.moreMenuTextBlock}>
                    <Text style={[styles.moreMenuLabel, { color: textPrimary }]}>Share Note</Text>
                    <Text style={[styles.moreMenuDesc, { color: textSecondary }]}>
                      Export plain text or markdown to other apps
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Archive Note */}
                <TouchableOpacity
                  style={[styles.moreMenuItem, { borderColor: borderCol }]}
                  onPress={() => {
                    onToggleArchive();
                    onToggleMoreMenu(false);
                  }}
                >
                  <View style={[styles.moreMenuIconCircle, { backgroundColor: '#6B728020' }]}>
                    <Feather name="archive" size={16} color="#6B7280" />
                  </View>
                  <View style={styles.moreMenuTextBlock}>
                    <Text style={[styles.moreMenuLabel, { color: textPrimary }]}>
                      {isArchived ? 'Unarchive Note' : 'Archive Note'}
                    </Text>
                    <Text style={[styles.moreMenuDesc, { color: textSecondary }]}>
                      Hide from regular view without deleting
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Delete Note */}
                <TouchableOpacity
                  style={[styles.moreMenuItem, { borderColor: 'transparent' }]}
                  onPress={() => {
                    onToggleMoreMenu(false);
                    onDelete();
                  }}
                >
                  <View style={[styles.moreMenuIconCircle, { backgroundColor: '#EF444420' }]}>
                    <Feather name="trash-2" size={16} color="#EF4444" />
                  </View>
                  <View style={styles.moreMenuTextBlock}>
                    <Text style={[styles.moreMenuLabel, { color: '#EF4444' }]}>Delete Note</Text>
                    <Text style={[styles.moreMenuDesc, { color: textSecondary }]}>
                      Permanently remove this note from storage
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
}
