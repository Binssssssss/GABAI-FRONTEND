
import { useDrawer } from '@/app/(tabs)/_layout';
import { useAppTheme } from '@/app/context/ThemeContext';
import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    AgendaSection,
    CalendarFilterSection,
    CalendarHeader,
    CalendarRangeNavigation,
    CalendarViewToggle,
    DayView,
    EventDetailModal,
    MonthView,
    QuickAddEventModal,
    UpcomingDeadlinesWidget,
    WeekView,
} from './components';

import { useCalendarData } from './hooks/useCalendarData';
import { calendarStyles as styles } from './styles/calendar.styles';
import { getLocalDateKey, shiftCalendarDate } from './utils/calendarHelpers';

export default function SmartCalendarScreen() {
  // GabAi manual theme
  const { colors, colorScheme } = useAppTheme();

  // Theme Colors
  const primaryAccent = '#A97C50';

  const textTheme = colors.text;
  const textSubTheme = colors.icon;
  const cardTheme = colors.surface;
  const borderTheme = colors.border;
  const bgTheme = colors.background;
  const modalSurface = colorScheme === 'dark' ? '#191919' : '#FFFFFF';

  const { openDrawer } = useDrawer();
  const router = useRouter();

  const {
    events,
    isLoadingEvents,
    eventsLoadFailed,
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    isAddModalOpen,
    setIsAddModalOpen,
    isDetailModalOpen,
    setIsDetailModalOpen,
    selectedEvent,
    setSelectedEvent,
    rescheduleMode,
    activeReschedulingId,
    startRescheduling,
    cancelRescheduling,
    completeRescheduling,
    upcomingDeadlines,
    academicPressure,
    filteredEvents,

    // Form fields
    newTitle,
    setNewTitle,
    newCategory,
    setNewCategory,
    newPriority,
    setNewPriority,
    newDate,
    setNewDate,
    newTime,
    setNewTime,
    newDuration,
    setNewDuration,
    newIsAllDay,
    setNewIsAllDay,
    newHasReminder,
    setNewHasReminder,
    newReminderTime,
    setNewReminderTime,
    newIsRecurring,
    setNewIsRecurring,
    newRecurrenceRule,
    setNewRecurrenceRule,
    newDescription,
    setNewDescription,
    newChecklistText,
    setNewChecklistText,
    newChecklistItems,
    addChecklistItem,
    removeChecklistItem,
    saveEvent,
    deleteEvent,
    toggleChecklistItem,
    openQuickAdd,
  } = useCalendarData();

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: bgTheme,
        },
      ]}
      edges={['top']}
    >
      {/* Header */}
      <CalendarHeader
        textTheme={textTheme}
        rescheduleMode={rescheduleMode}
        onOpenDrawer={openDrawer}
        onAddEvent={openQuickAdd}
        onCancelReschedule={cancelRescheduling}
      />

      {/* Search & Filters */}
      <CalendarFilterSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        cardTheme={cardTheme}
        borderTheme={borderTheme}
        textTheme={textTheme}
        textSubTheme={textSubTheme}
        primaryAccent={primaryAccent}
      />

      {/* View Toggle */}
      <CalendarViewToggle
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        cardTheme={cardTheme}
        borderTheme={borderTheme}
        textTheme={textTheme}
        textSubTheme={textSubTheme}
      />

      <CalendarRangeNavigation
        date={selectedDate}
        viewMode={viewMode}
        textTheme={textTheme}
        textSubTheme={textSubTheme}
        borderTheme={borderTheme}
        onNavigate={(direction) =>
          setSelectedDate((date) => shiftCalendarDate(date, viewMode, direction))
        }
        onToday={() => setSelectedDate(getLocalDateKey())}
      />

      {/* Main Calendar Content */}
      <ScrollView
        contentContainerStyle={styles.mainScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Month View */}
        {viewMode === 'month' && (
          <MonthView
            events={events}
            selectedDate={selectedDate}
            rescheduleMode={rescheduleMode}
            onSelectDate={setSelectedDate}
            onCompleteRescheduling={completeRescheduling}
            cardTheme={cardTheme}
            borderTheme={borderTheme}
            textTheme={textTheme}
            textSubTheme={textSubTheme}
            primaryAccent={primaryAccent}
          />
        )}

        {/* Week View */}
        {viewMode === 'week' && (
          <WeekView
            events={events}
            selectedDate={selectedDate}
            rescheduleMode={rescheduleMode}
            onSelectDate={setSelectedDate}
            onCompleteRescheduling={completeRescheduling}
            onSelectEvent={(evt) => {
              setSelectedEvent(evt);
              setIsDetailModalOpen(true);
            }}
            onStartRescheduling={startRescheduling}
            cardTheme={cardTheme}
            borderTheme={borderTheme}
            textTheme={textTheme}
            textSubTheme={textSubTheme}
            bgTheme={bgTheme}
            primaryAccent={primaryAccent}
          />
        )}

        {/* Day View */}
        {viewMode === 'day' && (
          <DayView
            events={events}
            selectedDate={selectedDate}
            onSelectEvent={(evt) => {
              setSelectedEvent(evt);
              setIsDetailModalOpen(true);
            }}
            onStartRescheduling={startRescheduling}
            cardTheme={cardTheme}
            borderTheme={borderTheme}
            textTheme={textTheme}
            textSubTheme={textSubTheme}
            bgTheme={bgTheme}
          />
        )}

        {/* Today's Agenda */}
        <AgendaSection
          events={filteredEvents}
          allEvents={events}
          academicPressure={academicPressure}
          isLoadingEvents={isLoadingEvents}
          eventsLoadFailed={eventsLoadFailed}
          selectedDate={selectedDate}
          rescheduleMode={rescheduleMode}
          activeReschedulingId={activeReschedulingId}
          onSelectEvent={(evt) => {
            setSelectedEvent(evt);
            setIsDetailModalOpen(true);
          }}
          onStartRescheduling={startRescheduling}
          cardTheme={cardTheme}
          borderTheme={borderTheme}
          textTheme={textTheme}
          textSubTheme={textSubTheme}
        />

        {/* Upcoming Deadlines */}
        <UpcomingDeadlinesWidget
          deadlines={upcomingDeadlines}
          onSelectEvent={(evt) => {
            setSelectedEvent(evt);
            setIsDetailModalOpen(true);
          }}
          cardTheme={cardTheme}
          borderTheme={borderTheme}
          textTheme={textTheme}
          textSubTheme={textSubTheme}
          primaryAccent={primaryAccent}
        />
      </ScrollView>

      {/* Event Details Modal */}
      <EventDetailModal
        visible={isDetailModalOpen}
        event={selectedEvent}
        onClose={() => setIsDetailModalOpen(false)}
        onToggleChecklistItem={toggleChecklistItem}
        onStartRescheduling={startRescheduling}
        onDeleteEvent={deleteEvent}
        onStartFocusSession={(eventId) => {
          setIsDetailModalOpen(false);
          router.push({
            pathname: '/(tabs)/tasks/task',
            params: { focusTaskId: eventId },
          });
        }}
        cardTheme={cardTheme}
        borderTheme={borderTheme}
        textTheme={textTheme}
        textSubTheme={textSubTheme}
      />

      {/* Quick Add Event Modal */}
      <QuickAddEventModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={newTitle}
        onTitleChange={setNewTitle}
        category={newCategory}
        onCategoryChange={setNewCategory}
        priority={newPriority}
        onPriorityChange={setNewPriority}
        date={newDate}
        onDateChange={setNewDate}
        time={newTime}
        onTimeChange={setNewTime}
        duration={newDuration}
        onDurationChange={setNewDuration}
        isAllDay={newIsAllDay}
        onIsAllDayChange={setNewIsAllDay}
        hasReminder={newHasReminder}
        onHasReminderChange={setNewHasReminder}
        reminderTime={newReminderTime}
        onReminderTimeChange={setNewReminderTime}
        isRecurring={newIsRecurring}
        onIsRecurringChange={setNewIsRecurring}
        recurrenceRule={newRecurrenceRule}
        onRecurrenceRuleChange={setNewRecurrenceRule}
        description={newDescription}
        onDescriptionChange={setNewDescription}
        checklistText={newChecklistText}
        onChecklistTextChange={setNewChecklistText}
        checklistItems={newChecklistItems}
        onAddChecklistItem={addChecklistItem}
        onRemoveChecklistItem={removeChecklistItem}
        onSave={saveEvent}
        modalSurface={modalSurface}
        borderTheme={borderTheme}
        textTheme={textTheme}
        textSubTheme={textSubTheme}
        bgTheme={bgTheme}
        primaryAccent={primaryAccent}
      />
    </SafeAreaView>
  );
}

