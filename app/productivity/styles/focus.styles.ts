import { StyleSheet } from 'react-native';

export const focusStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginLeft: 10,
    flexShrink: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  // Status chips above the ring
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Timer ring
  ringWrapper: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },
  ringTick: {
    position: 'absolute',
    width: 3,
    borderRadius: 2,
  },
  ringInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  ringDigits: {
    fontWeight: '300',
    letterSpacing: -1.5,
    fontVariant: ['tabular-nums'],
  },
  ringStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  ringStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  ringStatusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  ringHint: {
    fontSize: 11,
    marginTop: 6,
  },

  // Strict banner
  strictBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  strictBannerText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '500',
  },

  // Controls
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 18,
    marginBottom: 22,
  },
  controlColumn: {
    alignItems: 'center',
    gap: 6,
  },
  controlSecondaryBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  controlMainBtn: {
    minWidth: 150,
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 26,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlMainText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },

  // Session summary card
  sessionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 22,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sessionCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sessionCardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  sessionCardActionText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  sessionRowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionRowLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  sessionRowValue: {
    fontSize: 14.5,
    fontWeight: '600',
    marginTop: 1,
  },

  // Section titles
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionLink: {
    fontSize: 12.5,
    fontWeight: '700',
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  affirmationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
  },
  affirmationText: {
    flex: 1,
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '500',
    lineHeight: 19,
  },

  // Setup modal (bottom sheet)
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    maxHeight: '92%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  sheetTitle: {
    fontSize: 19,
    fontWeight: '700',
  },
  sheetSubtitle: {
    fontSize: 12.5,
    marginTop: 2,
  },
  sheetBody: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  sheetSection: {
    marginBottom: 22,
  },
  sheetFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  footerBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },

  // Mode picker
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  modeCard: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 96,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  modeCardLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  modeCardMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  modeSubheading: {
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 8,
  },

  // Duration
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    padding: 8,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  durationNote: {
    fontSize: 12.5,
    marginTop: 8,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },

  // Pills (subjects, presets)
  subjectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 10,
  },
  subjectsScroll: {
    gap: 8,
    paddingRight: 8,
  },
  subjectPill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  subjectPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Task picker
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  taskMeta: {
    fontSize: 11.5,
    marginTop: 2,
  },
  taskStateBox: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  taskStateText: {
    fontSize: 12.5,
    textAlign: 'center',
  },

  // Strict toggle
  strictToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  strictToggleLeft: {
    flex: 1,
    paddingRight: 12,
  },
  strictToggleTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  strictToggleSub: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },

  // Completion modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalBadgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
  },
  modalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  modalStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  modalStatVal: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalStatSub: {
    fontSize: 11,
    marginTop: 4,
  },
  modalPrimaryBtn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSecondaryBtn: {
    width: '100%',
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },

  // Zen mode
  zenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  zenExitBtn: {
    position: 'absolute',
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zenSubjectText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  zenTimerDigits: {
    fontSize: 84,
    fontWeight: '200',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  zenStrictNotice: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 10,
  },
});
