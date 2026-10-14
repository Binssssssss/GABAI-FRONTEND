import { StyleSheet } from 'react-native';

export const calendarStyles = StyleSheet.create({
  // Compact workload line (replaces the Academic Pressure / Load cards)
  workloadLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  workloadLineLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 8,
  },
  workloadLineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  workloadLineLevel: {
    fontSize: 13,
    fontWeight: '600',
  },
  workloadLineMeta: {
    fontSize: 12,
  },
  // Month grid without a card
  monthContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dayNumberWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Agenda rows
  agendaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  agendaTimeCol: {
    width: 64,
  },
  agendaTimeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  agendaDurationText: {
    fontSize: 11,
    marginTop: 2,
  },
  agendaCategoryBar: {
    width: 3,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: 12,
  },
  agendaBody: {
    flex: 1,
    marginRight: 8,
  },
  agendaProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  agendaEmpty: {
    paddingVertical: 20,
  },
  // Upcoming deadline rows
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  deadlineDateCol: {
    width: 44,
    alignItems: 'center',
    marginRight: 12,
  },
  deadlineMonthText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  deadlineDayText: {
    fontSize: 18,
    fontWeight: '600',
  },
  deadlineMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  deadlineCategoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  deadlineStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerAddButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#A97C50',
  },
  headerAddButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  rangeNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 4,
  },
  rangeArrow: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  todayButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 6,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  workloadDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 3,
  },
  workloadSummary: {
    marginHorizontal: 24,
    marginTop: 4,
    marginBottom: 18,
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
  },
  workloadSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  workloadSummaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  workloadLevel: {
    fontSize: 12,
    fontWeight: '800',
  },
  workloadSummaryMeta: {
    fontSize: 12,
    lineHeight: 18,
  },
  pressureSummaryText: {
    fontSize: 11,
    marginTop: 5,
  },
  workloadAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  workloadAlertText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  recommendationText: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  smartPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 4,
  },
  smartPlanButtonText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  rescheduleBanner: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 52,
    backgroundColor: '#7C2D12',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 100,
  },
  rescheduleText: {
    color: '#FFFFFF',
    fontSize: 12,
    flex: 1,
  },
  cancelRescheduleButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  cancelRescheduleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  aiButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  categoryScroll: {
    paddingVertical: 10,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 6,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  viewToggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
  },
  viewToggleButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleText: {
    fontSize: 13,
  },
  mainScroll: {
    paddingBottom: 80,
  },
  calendarCard: {
    marginHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  calendarMonthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  monthHeaderActions: {
    flexDirection: 'row',
  },
  arrowButton: {
    marginLeft: 8,
    padding: 4,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  weekdayLabel: {
    width: '14.28%',
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCell: {
    width: '14.28%',
    height: 46,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  emptyGridCell: {
    width: '14.28%',
    height: 46,
  },
  cellDayText: {
    fontSize: 14,
  },
  indicatorRow: {
    flexDirection: 'row',
    marginTop: 3,
    height: 4,
    justifyContent: 'center',
    width: '100%',
  },
  indicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  monthWorkloadMarker: {
    width: 16,
    height: 2,
    borderRadius: 1,
    marginTop: 3,
  },
  calendarLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 10,
    columnGap: 12,
    rowGap: 6,
  },
  calendarLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarLegendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  calendarLegendBar: {
    width: 12,
    height: 3,
    borderRadius: 2,
    marginRight: 5,
  },
  calendarLegendText: {
    fontSize: 10,
  },
  weekRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDayHeaderCell: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  weekDayNum: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  weeklyTimelineContainer: {
    marginTop: 12,
  },
  weekTimelineDayBlock: {
    marginBottom: 16,
  },
  weekTimelineDayTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  weekEventCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    marginBottom: 6,
  },
  weekCardLeft: {
    flex: 1,
  },
  eventTimeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  eventTitleText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  priorityBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  dayViewHeader: {
    marginBottom: 12,
  },
  dailyTimelineList: {
    marginTop: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
  },
  timelineTimeCol: {
    width: 60,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  timelineTimeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  timelineContentCol: {
    flex: 1,
    paddingLeft: 12,
  },
  dailyEventCard: {
    borderRadius: 8,
    borderLeftWidth: 3,
    padding: 10,
    marginBottom: 6,
  },
  dailyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dailyEventTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  dailyEventDesc: {
    fontSize: 11,
    marginTop: 4,
  },
  dailyProgressContainer: {
    marginTop: 8,
  },
  dailyProgressText: {
    fontSize: 10,
    marginBottom: 4,
  },
  dailyProgressBarBg: {
    height: 4,
    borderRadius: 2,
    width: '100%',
  },
  dailyProgressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  agendaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  eventsCountText: {
    fontSize: 12,
  },
  agendaList: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  agendaCard: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryColorRibbon: {
    width: 6,
    height: '100%',
  },
  agendaCardContent: {
    flex: 1,
    padding: 16,
  },
  agendaTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  agendaEventTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  agendaDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agendaStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },
  agendaStatusText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 3,
  },
  agendaDetailText: {
    fontSize: 12,
    marginTop: 2,
  },
  agendaProgressContainer: {
    marginTop: 12,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressTextLabel: {
    fontSize: 11,
  },
  progressValLabel: {
    fontSize: 11,
    marginLeft: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  noEventsCard: {
    borderWidth: 1,
    borderRadius: 12,
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noEventsText: {
    fontSize: 13,
  },
  deadlineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
  },
  deadlinesList: {
    marginHorizontal: 20,
  },
  deadlineCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  deadlineInfoCol: {
    flex: 1,
    marginRight: 12,
  },
  deadlineHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  deadlineTitleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deadlineBadge: {
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  deadlineBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  deadlineDateText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  detailModalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    maxHeight: '85%',
  },
  modalHeaderRibbon: {
    height: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
  },
  modalHeaderClose: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  modalScrollBody: {
    paddingHorizontal: 20,
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalCategoryBadge: {
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 10,
  },
  modalCategoryText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalTitleText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalSubjectText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: -10,
    marginBottom: 14,
  },
  modalInfoCard: {
    backgroundColor: 'rgba(36, 50, 79, 0.25)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  infoRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoRowText: {
    fontSize: 13,
    marginLeft: 10,
  },
  modalDescContainer: {
    marginBottom: 20,
  },
  descTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  descBodyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalChecklistContainer: {
    marginBottom: 24,
  },
  checklistTitleText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  modalProgressBarBg: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    marginBottom: 12,
  },
  modalProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  checklistsList: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  checklistRowText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  modalActionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  addModalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    height: '90%',
  },
  addModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#24324F',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addFormScroll: {
    padding: 20,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  rowSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  selectorPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  formRowFields: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  switchRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checklistBuilderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  addChecklistBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  builderItemsContainer: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  builderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  saveFormBtn: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  saveFormBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  aiProgressOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  aiProgressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  aiProgressSub: {
    fontSize: 12,
    marginTop: 6,
    marginBottom: 20,
  },
  aiProgressBarBg: {
    height: 6,
    borderRadius: 3,
    width: '60%',
  },
  aiProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
