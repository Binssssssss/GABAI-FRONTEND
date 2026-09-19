import React from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FILTERS } from '../../constants/taskConfig';
import { taskStyles as styles } from '../../styles/task.styles';

interface TaskFilterScrollProps {
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
  isMultiSelectMode: boolean;
  onToggleMultiSelect: () => void;
  cardBg: string;
  borderCol: string;
  textSecondary: string;
  primaryBrown: string;
}

export default function TaskFilterScroll({
  activeFilter,
  onSelectFilter,
  isMultiSelectMode,
  onToggleMultiSelect,
  cardBg,
  borderCol,
  textSecondary,
  primaryBrown,
}: TaskFilterScrollProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterScroll}
    >
      <TouchableOpacity
        onPress={onToggleMultiSelect}
        style={[
          styles.filterPill,
          {
            backgroundColor: isMultiSelectMode ? primaryBrown : cardBg,
            borderColor: borderCol,
          },
        ]}
      >
        <Feather
          name="list"
          size={13}
          color={isMultiSelectMode ? '#FFFFFF' : textSecondary}
          style={{ marginRight: 4 }}
        />
        <Text
          style={[
            styles.filterPillText,
            { color: isMultiSelectMode ? '#FFFFFF' : textSecondary },
          ]}
        >
          Select
        </Text>
      </TouchableOpacity>

      {FILTERS.map((filter) => {
        const isActive = activeFilter === filter;
        return (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterPill,
              {
                backgroundColor: isActive ? primaryBrown : cardBg,
                borderColor: borderCol,
              },
            ]}
            onPress={() => onSelectFilter(filter)}
          >
            <Text
              style={[
                styles.filterPillText,
                { color: isActive ? '#FFFFFF' : textSecondary },
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
