
import { useDrawer } from '@/app/(tabs)/_layout';
import { useAppTheme } from '@/app/context/ThemeContext';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AgendaSection,
  CalendarFilterSection,
  CalendarHeader,
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

export default function SmartCalendarScreen() {
  // GabAi manual theme
  const { colorScheme } = useAppTheme();

  const isDark = colorScheme === 'dark';

  // Theme Colors
  const primaryAccent = '#A97C50';

  const textTheme = isDark
    ? '#ECEDEE'
    : '#11181C';

  const textSubTheme = isDark
    ? '#9BA1A6'
    : '#666666';

  const cardTheme = isDark
    ? '#1E1E1E'
    : '#F8FAFC';

  const borderTheme = isDark
    ? '#2E2E2E'
    : '#E2E8F0';

  const bgTheme = isDark
    ? '#121212'
    : '#FFFFFF';

  const { openDrawer } = useDrawer();

  const {
    events,
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

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: primaryAccent,
          },
        ]}
        onPress={openQuickAdd}
        activeOpacity={0.8}
      >
        <Feather
          name="plus"
          size={24}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      {/* Event Details Modal */}
      <EventDetailModal
        visible={isDetailModalOpen}
        event={selectedEvent}
        onClose={() => setIsDetailModalOpen(false)}
        onToggleChecklistItem={toggleChecklistItem}
        onStartRescheduling={startRescheduling}
        onDeleteEvent={deleteEvent}
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
        cardTheme={cardTheme}
        borderTheme={borderTheme}
        textTheme={textTheme}
        textSubTheme={textSubTheme}
        bgTheme={bgTheme}
        primaryAccent={primaryAccent}
      />
    </SafeAreaView>
  );
}

