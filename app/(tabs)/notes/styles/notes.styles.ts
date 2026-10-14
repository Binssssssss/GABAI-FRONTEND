import { Platform, StyleSheet } from 'react-native';

export const noteStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitleBlock: {
    justifyContent: 'center',
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  counterBadge: {
    marginLeft: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  counterText: {
    fontSize: 11,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryHeaderBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 38,
    borderRadius: 12,
    shadowColor: '#A97C50',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Prominent Search Bar
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
    paddingVertical: 0,
  },

  // Smart Compact Filter Strip
  smartFilterStrip: {
    paddingBottom: 8,
  },
  smartFilterScroll: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  compactTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  compactTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterSheetTrigger: {
    paddingHorizontal: 12,
  },
  filterBadgeCount: {
    marginLeft: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeCountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },

  // Active filters banner
  activeFiltersBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeFiltersLeft: {
    flex: 1,
  },
  activeFiltersText: {
    fontSize: 11,
  },
  clearFiltersBtnText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 8,
  },

  // Scroll Content & Layout
  scrollContent: {
    paddingBottom: 90,
  },
  notesContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingLeft: 2,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  notesGridWrapper: {
    width: '100%',
  },
  notesGridLayout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  notesListLayout: {
    flexDirection: 'column',
    gap: 10,
  },

  // Note Card
  noteCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 5,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardHeaderIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardIconIndicator: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 6,
  },
  cardSnippet: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  cardTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  cardTagChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardTagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  cardMoreTags: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestampText: {
    fontSize: 10,
    fontWeight: '500',
  },
  cardQuickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardActionIconBtn: {
    padding: 2,
  },

  // Floating Action Button
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 10,
  },
  fabSpeedDial: {
    alignItems: 'flex-end',
    marginBottom: 12,
    gap: 8,
  },
  fabSpeedDialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 4,
    gap: 8,
  },
  fabSpeedDialLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  fabSpeedDialIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabMainBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A97C50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 6,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 1,
    shadowColor: '#A97C50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 22,
  },
  emptyPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Bottom Sheets Generic
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  bottomSheetCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingTop: 10,
  },
  sheetHandleBar: {
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 6,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sheetResetBtn: {
    fontSize: 12,
    fontWeight: '700',
  },
  sheetSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  sheetPillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sheetCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6,
  },
  sheetCategoryChipText: {
    fontSize: 12,
  },
  sheetTagChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sheetTagText: {
    fontSize: 11,
  },
  sheetSortChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  sheetSortText: {
    fontSize: 12,
  },
  sheetViewModeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sheetViewModeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  sheetViewModeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sheetDoneBtn: {
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  sheetDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Focused Editor Screen
  // Vertical spacing here is the only spacing: the safe-area top inset comes
  // from SafeAreaView and the bottom inset is added to the toolbar in the
  // component, so nothing in this block may add its own top/bottom inset.
  editorContainer: {
    flex: 1,
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  editorHeaderButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Absolutely centred so the status stays centred regardless of the
  // different widths of the left (back) and right (overflow + Done) sides.
  editorHeaderCenter: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorHeaderSpacer: {
    flex: 1,
  },
  saveStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  saveStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  editorHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 12,
  },
  editorDoneBtn: {
    height: 32,
    minWidth: 64,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  editorScroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  editorCategoryTrigger: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    gap: 4,
    marginBottom: 4,
  },
  editorCategoryTriggerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  editorTitleInput: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.4,
    padding: 0,
    marginBottom: 12,
  },
  editorTagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  editorTagBadgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    paddingLeft: 10,
    paddingRight: 4,
    borderRadius: 6,
    gap: 2,
  },
  editorTagBadgeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  editorTagBadgeRemove: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagAddButton: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
  },
  tagAddButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    paddingLeft: 10,
    paddingRight: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  tagInput: {
    minWidth: 96,
    fontSize: 13,
    paddingVertical: 0,
  },
  editorBodyTail: {
    flexGrow: 1,
    minHeight: 96,
  },
  editorEmptyPreviewText: {
    fontSize: 16,
    lineHeight: 24,
  },
  editorMetaLine: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  editorMetaText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Formatting Toolbar (sits directly on the keyboard: no vertical padding)
  formattingToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  toolbarScrollWrap: {
    flex: 1,
  },
  toolbarScroll: {
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 28,
  },
  toolbarBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarTextBtn: {
    fontSize: 15,
    fontWeight: '700',
  },
  toolbarDivider: {
    width: StyleSheet.hairlineWidth,
    height: 20,
    marginHorizontal: 6,
  },
  toolbarPinned: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  toolbarScrollHint: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Editor bottom sheets (options + category)
  editorSheetCard: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 8,
  },
  editorSheetHandleArea: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
  },
  editorSheetTitle: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },

  // More Options Menu Items
  moreMenuList: {
    gap: 0,
  },
  moreMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
    gap: 14,
  },
  moreMenuTextBlock: {
    flex: 1,
  },
  moreMenuLabel: {
    fontSize: 16,
    fontWeight: '400',
  },
  moreMenuDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
    marginHorizontal: 12,
  },

  // Template Modal Cards
  templateCardItem: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  templateCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  templateCardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  templateCardDesc: {
    fontSize: 12,
    lineHeight: 17,
  },

  // Convert to Task & Schedule Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
  },
  modalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  convertNoteSummary: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  convertNoteTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  convertNoteSnippet: {
    fontSize: 11,
    lineHeight: 15,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  modalTextInput: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    marginBottom: 14,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  priorityChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  priorityChipText: {
    fontSize: 12,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  modalCancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 10,
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
