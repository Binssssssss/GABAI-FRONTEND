import { Feather } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
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
  const selectedBackground = `${primaryBrown}20`;

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
            backgroundColor: isMultiSelectMode ? selectedBackground : cardBg,
            borderColor: isMultiSelectMode ? primaryBrown : borderCol,
          },
        ]}
      >
        <Feather
          name="list"
          size={13}
          color={isMultiSelectMode ? primaryBrown : textSecondary}
          style={{ marginRight: 4 }}
        />
        <Text
          style={[
            styles.filterPillText,
            { color: isMultiSelectMode ? primaryBrown : textSecondary },
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
                backgroundColor: isActive ? selectedBackground : cardBg,
                borderColor: isActive ? primaryBrown : borderCol,
              },
            ]}
            onPress={() => onSelectFilter(filter)}
          >
            <Text
              style={[
                styles.filterPillText,
                { color: isActive ? primaryBrown : textSecondary },
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
