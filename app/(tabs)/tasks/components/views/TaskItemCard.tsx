import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Task } from '../../types';
import { taskStyles as styles } from '../../styles/task.styles';

interface TaskItemCardProps {
  task: Task;
  onToggleTask: (id: string) => void;
  onToggleSubTask: (taskId: string, subId: string) => void;
  onDeleteTask: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onFocusTask: (task: Task) => void;
  isMultiSelectMode: boolean;
  isSelected: boolean;
  onSelectTask: (id: string) => void;
  cardBg: string;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
  successGreen: string;
  errorRed: string;
  warningOrange: string;
}

export default function TaskItemCard({
  task,
  onToggleTask,
  onToggleSubTask,
  onDeleteTask,
  onTogglePin,
  onToggleFavorite,
  onFocusTask,
  isMultiSelectMode,
  isSelected,
  onSelectTask,
  cardBg,
  borderCol,
  textPrimary,
  textSecondary,
  primaryBrown,
  successGreen,
  errorRed,
  warningOrange,
}: TaskItemCardProps) {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'High':
        return errorRed;
      case 'Medium':
        return warningOrange;
      case 'Low':
        return successGreen;
      default:
        return primaryBrown;
    }
  };

  const getDifficultyColor = (diff: Task['difficulty']) => {
    switch (diff) {
      case 'Hard':
        return '#8B5CF6';
      case 'Medium':
        return '#3B82F6';
      case 'Easy':
        return successGreen;
      default:
        return textSecondary;
    }
  };

  const completedSubs = task.subTasks?.filter((st) => st.completed).length || 0;
  const totalSubs = task.subTasks?.length || 0;

  return (
    <View
      style={[
        styles.taskCard,
        {
          backgroundColor: cardBg,
          borderColor: isSelected ? primaryBrown : borderCol,
          opacity: task.completed ? 0.6 : 1,
        },
      ]}
    >
      {/* Checkbox / Multi-select toggle */}
      <TouchableOpacity
        onPress={() => {
          if (isMultiSelectMode) {
            onSelectTask(task.id);
          } else {
            onToggleTask(task.id);
          }
        }}
        style={[
          styles.checkbox,
          {
            borderColor: isMultiSelectMode
              ? isSelected
                ? primaryBrown
                : textSecondary
              : task.completed
              ? successGreen
              : textSecondary,
            backgroundColor: isMultiSelectMode
              ? isSelected
                ? primaryBrown
                : 'transparent'
              : task.completed
              ? successGreen
              : 'transparent',
          },
        ]}
      >
        {(isMultiSelectMode ? isSelected : task.completed) && (
          <Feather name="check" size={14} color="#FFFFFF" />
        )}
      </TouchableOpacity>

      {/* Main Task Body */}
      <View style={styles.taskCardMain}>
        <View style={styles.taskCardHeaderRow}>
          <Text style={[styles.taskSubject, { color: primaryBrown }]}>{task.subject}</Text>
          <View style={styles.taskControlsRow}>
            {/* Pin */}
            <TouchableOpacity onPress={() => onTogglePin(task.id)} style={styles.iconButton}>
              <Feather
                name="bookmark"
                size={14}
                color={task.isPinned ? primaryBrown : textSecondary}
              />
            </TouchableOpacity>

            {/* Favorite */}
            <TouchableOpacity onPress={() => onToggleFavorite(task.id)} style={styles.iconButton}>
              <Feather
                name="star"
                size={14}
                color={task.isFavorite ? warningOrange : textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text
          style={[
            styles.taskTitle,
            {
              color: textPrimary,
              textDecorationLine: task.completed ? 'line-through' : 'none',
            },
          ]}
        >
          {task.title}
        </Text>

        {task.description ? (
          <Text style={[styles.taskDesc, { color: textSecondary }]} numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}

        {/* SubTasks Interactive Checklist */}
        {totalSubs > 0 && (
          <View style={styles.taskProgressContainer}>
            {task.subTasks.map((st) => (
              <TouchableOpacity
                key={st.id}
                style={styles.focusSubTaskRow}
                onPress={() => onToggleSubTask(task.id, st.id)}
              >
                <Feather
                  name={st.completed ? 'check-circle' : 'circle'}
                  size={14}
                  color={st.completed ? successGreen : textSecondary}
                  style={{ marginRight: 6 }}
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
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Footer Meta Chips */}
        <View style={styles.taskFooter}>
          <View style={[styles.dateBadge, { backgroundColor: primaryBrown + '15' }]}>
            <Feather name="clock" size={11} color={primaryBrown} style={{ marginRight: 4 }} />
            <Text style={[styles.dateText, { color: primaryBrown }]}>
              {task.dueDate} {task.dueTime ? `• ${task.dueTime}` : ''}
            </Text>
          </View>

          <View style={[styles.categoryBadge, { backgroundColor: textSecondary + '20' }]}>
            <Text style={[styles.categoryBadgeText, { color: textPrimary }]}>{task.category}</Text>
          </View>

          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(task.difficulty) + '15' },
            ]}
          >
            <Text
              style={[
                styles.difficultyBadgeText,
                { color: getDifficultyColor(task.difficulty) },
              ]}
            >
              {task.difficulty}
            </Text>
          </View>

          {totalSubs > 0 && (
            <View style={styles.attachmentMeta}>
              <Feather name="check-square" size={11} color={textSecondary} />
              <Text style={[styles.attachmentText, { color: textSecondary }]}>
                {completedSubs}/{totalSubs}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Right Edge: Priority Dot, Focus shortcut, Delete */}
      <View style={styles.taskCardRight}>
        <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />

        {!task.completed && (
          <TouchableOpacity
            style={[styles.focusShortcutBtn, { backgroundColor: primaryBrown + '20' }]}
            onPress={() => onFocusTask(task)}
          >
            <Feather name="play" size={13} color={primaryBrown} />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => onDeleteTask(task.id)} style={styles.trashShortcutBtn}>
          <Feather name="trash-2" size={14} color={errorRed} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
