import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface QuickActionsProps {
  primaryBrown: string;
  borderCol: string;
}

export default function QuickActions({
  primaryBrown,
  borderCol,
}: QuickActionsProps) {
  const router = useRouter();

  const actions = [
    {
      icon: 'plus' as const,
      route: '/(tabs)/tasks/task',
    },
    {
      icon: 'dollar-sign' as const,
      route: '/(tabs)/expenses/expenses',
    },
    {
      icon: 'calendar' as const,
      route: '/(tabs)/calendar/calendar',
    },
    {
      icon: 'edit-3' as const,
      route: '/(tabs)/notes/notes',
    },
  ];

  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.route}
          style={[
            styles.actionButton,
            {
              backgroundColor: `${primaryBrown}12`,
              borderColor: borderCol,
            },
          ]}
          onPress={() => router.push(action.route as any)}
          activeOpacity={0.65}
        >
          <Feather
            name={action.icon}
            size={18}
            color={primaryBrown}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 18,
    marginBottom: 14,
    gap: 8,
  },

  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});