import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TaskTheme } from '../../types';
import type { useTaskData } from '../../hooks/useTaskData';
import { taskStyles as styles } from '../../styles/task.styles';

interface TaskFocusModalProps {
  taskData: ReturnType<typeof useTaskData>;
  theme: TaskTheme;
}

export default function TaskFocusModal({ taskData, theme }: TaskFocusModalProps) {
  const {
    isFocusActive,
    focusedTask,
    pomodoroTime,
    isTimerRunning,
    handleToggleTimer,
    handleResetTimer,
    handleCloseFocus,
    toggleTask,
  } = taskData;

  const { cardBg, borderCol, textPrimary, textSecondary, primaryBrown, successGreen } = theme;

  if (!isFocusActive || !focusedTask) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      visible={isFocusActive}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCloseFocus}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: cardBg, borderColor: borderCol, maxHeight: '90%' },
            ]}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="zap" size={20} color={primaryBrown} style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: textPrimary }]}>Focus Mode</Text>
              </View>
              <TouchableOpacity onPress={handleCloseFocus} style={styles.closeBtn}>
                <Feather name="x" size={20} color={textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Circular Timer Display */}
              <View style={styles.timerContainer}>
                <View
                  style={[
                    styles.timerCircle,
                    {
                      borderColor: isTimerRunning ? primaryBrown : borderCol,
                      backgroundColor: cardBg,
                    },
                  ]}
                >
                  <Text style={[styles.timerText, { color: textPrimary }]}>
                    {formatTimer(pomodoroTime)}
                  </Text>
                  <Text style={[styles.timerSubText, { color: textSecondary }]}>
                    {isTimerRunning ? 'STAY FOCUSED' : 'PAUSED'}
                  </Text>
                </View>

                {/* Timer Controls */}
                <View style={styles.timerControls}>
                  <TouchableOpacity
                    style={[styles.timerBtn, { backgroundColor: primaryBrown }]}
                    onPress={handleToggleTimer}
                  >
                    <Feather
                      name={isTimerRunning ? 'pause' : 'play'}
                      size={18}
                      color="#FFFFFF"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.timerBtnText}>{isTimerRunning ? 'Pause' : 'Start'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.timerBtn,
                      { backgroundColor: cardBg, borderColor: borderCol, borderWidth: 1 },
                    ]}
                    onPress={handleResetTimer}
                  >
                    <Feather
                      name="rotate-ccw"
                      size={16}
                      color={textSecondary}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.timerBtnText, { color: textSecondary }]}>Reset</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Task Details */}
              <View style={styles.detailSection}>
                <Text style={[styles.taskSubject, { color: primaryBrown }]}>
                  {focusedTask.subject}
                </Text>
                <Text style={[styles.modalTitle, { color: textPrimary, marginVertical: 4 }]}>
                  {focusedTask.title}
                </Text>
                <Text style={[styles.taskDesc, { color: textSecondary }]}>
                  {focusedTask.description}
                </Text>
                <Text style={[styles.focusDurationText, { color: textPrimary }]}>
                  Target Session: {focusedTask.duration} Hours
                </Text>
              </View>

              {/* Subtasks */}
              {focusedTask.subTasks?.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={[styles.inputLabel, { color: textSecondary }]}>
                    SUBTASKS CHECKLIST
                  </Text>
                  {focusedTask.subTasks.map((st) => (
                    <View key={st.id} style={styles.focusSubTaskRow}>
                      <Feather
                        name={st.completed ? 'check-circle' : 'circle'}
                        size={16}
                        color={st.completed ? successGreen : textSecondary}
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={[
                          styles.focusSubTaskText,
                          {
                            color: st.completed ? textSecondary : textPrimary,
                            textDecorationLine: st.completed ? 'line-through' : 'none',
                          },
                        ]}
                      >
                        {st.title}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Complete Task Button */}
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  { backgroundColor: focusedTask.completed ? textSecondary : successGreen },
                ]}
                onPress={() => {
                  toggleTask(focusedTask.id);
                  handleCloseFocus();
                }}
              >
                <Feather
                  name={focusedTask.completed ? 'rotate-ccw' : 'check'}
                  size={18}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.saveBtnText}>
                  {focusedTask.completed ? 'Mark Incomplete' : 'Mark Task Completed'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}
