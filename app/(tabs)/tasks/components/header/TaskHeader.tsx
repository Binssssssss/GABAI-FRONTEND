import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { taskStyles as styles } from '../../styles/task.styles';

interface TaskHeaderProps {
  onOpenDrawer: () => void;
  onOpenAdd: () => void;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
  cardBg: string;
  borderCol: string;
}

export default function TaskHeader({
  onOpenDrawer,
  onOpenAdd,
  textPrimary,
  textSecondary,
  primaryBrown,
  cardBg,
  borderCol,
}: TaskHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={onOpenDrawer}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          style={{ marginRight: 10, padding: 4 }}
        >
          <Feather name="menu" size={24} color={textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerGreeting, { color: textPrimary }]}>Tasks</Text>
          <Text style={[styles.headerDate, { color: textSecondary }]}>Academic Planner</Text>
        </View>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity
          style={[styles.headerIconButton, styles.headerPrimaryButton, { backgroundColor: primaryBrown, borderColor: primaryBrown }]}
          onPress={onOpenAdd}
          accessibilityRole="button"
          accessibilityLabel="Add task"
        >
          <Feather name="plus" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
