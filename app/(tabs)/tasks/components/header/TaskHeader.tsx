import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { taskStyles as styles } from '../../styles/task.styles';

interface TaskHeaderProps {
  onOpenDrawer: () => void;
  onToggleSearch: () => void;
  onOpenAdd: () => void;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
  cardBg: string;
  borderCol: string;
}

export default function TaskHeader({
  onOpenDrawer,
  onToggleSearch,
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
          style={[styles.headerIconButton, { backgroundColor: cardBg, borderColor: borderCol }]}
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
          style={[styles.headerIconButton, { backgroundColor: cardBg, borderColor: borderCol }]}
          onPress={onToggleSearch}
        >
          <Feather name="search" size={20} color={textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.headerIconButton, styles.headerPrimaryButton, { backgroundColor: primaryBrown, borderColor: primaryBrown }]}
          onPress={onOpenAdd}
        >
          <Feather name="plus" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
