import { Text, TouchableOpacity, View } from 'react-native';
import { taskStyles as styles } from '../../styles/task.styles';
import { TaskSubTab } from '../../types';

interface TaskSubNavTabsProps {
  activeSubTab: TaskSubTab;
  onSelectSubTab: (tab: TaskSubTab) => void;
  borderCol: string;
  textPrimary: string;
  textSecondary: string;
  primaryBrown: string;
}

export default function TaskSubNavTabs({
  activeSubTab,
  onSelectSubTab,
  borderCol,
  textPrimary,
  textSecondary,
  primaryBrown,
}: TaskSubNavTabsProps) {
  const tabs: { id: TaskSubTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'subjects', label: 'Subjects' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <View style={[styles.subTabBar, { borderColor: borderCol }]}>
      {tabs.map((tab) => {
        const isSelected = activeSubTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.subTabItem,
              isSelected && { borderBottomColor: primaryBrown },
            ]}
            onPress={() => onSelectSubTab(tab.id)}
          >
            <Text
              style={[
                styles.subTabText,
                {
                  color: isSelected ? primaryBrown : textSecondary,
                  fontWeight: isSelected ? 'bold' : 'normal',
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
