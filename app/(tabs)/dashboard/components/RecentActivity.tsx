import React, { useMemo } from 'react';
import {
  View,
  Text,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface RecentActivityTask {
  id: string;
  title: string;
  subject?: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface RecentActivityProps {
  tasks?: RecentActivityTask[];
  primaryBrown?: string;
  textColor?: string;
  secondaryText?: string;
  cardColor?: string;
  borderColor?: string;
  backgroundColor?: string;
}

export default function RecentActivity({
  tasks = [],
  primaryBrown = '#A97C50',
  textColor = '#ECEDEE',
  secondaryText = '#9BA1A6',
  cardColor = '#1E1E1E',
  borderColor = '#2E2E2E',
  backgroundColor = '#121212',
}: RecentActivityProps) {
  const activities = useMemo(() => {
    return [...tasks]
      .sort((a, b) => {
        const dateA = new Date(
          a.updatedAt ||
            a.createdAt ||
            0
        ).getTime();

        const dateB = new Date(
          b.updatedAt ||
            b.createdAt ||
            0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5)
      .map((task) => ({
        id: task.id,

        icon: task.completed
          ? 'check-circle'
          : 'clipboard',

        text: task.completed
          ? `Completed "${task.title}".`
          : `Created "${task.title}".`,

        subject:
          task.subject || 'General',

        completed:
          task.completed,
      }));
  }, [tasks]);

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 20,
        backgroundColor: cardColor,
        borderWidth: 1,
        borderColor,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Feather
            name="activity"
            size={18}
            color={primaryBrown}
          />

          <Text
            style={{
              marginLeft: 8,
              fontSize: 17,
              fontWeight: '700',
              color: textColor,
            }}
          >
            Recent Activity
          </Text>
        </View>

        {activities.length > 0 && (
          <Text
            style={{
              fontSize: 12,
              color: secondaryText,
            }}
          >
            {activities.length} recent
          </Text>
        )}
      </View>

      {/* Empty state */}
      {activities.length === 0 ? (
        <View
          style={{
            alignItems: 'center',
            paddingVertical: 24,
          }}
        >
          <Feather
            name="activity"
            size={28}
            color={secondaryText}
          />

          <Text
            style={{
              marginTop: 10,
              fontSize: 14,
              fontWeight: '600',
              color: textColor,
            }}
          >
            No recent activity
          </Text>

          <Text
            style={{
              marginTop: 4,
              fontSize: 12,
              textAlign: 'center',
              color: secondaryText,
            }}
          >
            Your recent task activity
            will appear here.
          </Text>
        </View>
      ) : (
        /* Activities */
        activities.map(
          (activity) => (
            <View
              key={activity.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
              }}
            >
              {/* Icon */}
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor:
                    backgroundColor,
                }}
              >
                <Feather
                  name={
                    activity.icon as any
                  }
                  size={16}
                  color={
                    activity.completed
                      ? '#22C55E'
                      : primaryBrown
                  }
                />
              </View>

              {/* Activity text */}
              <View
                style={{
                  flex: 1,
                  marginLeft: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    lineHeight: 19,
                    color: textColor,
                  }}
                >
                  {activity.text}
                </Text>

                <Text
                  style={{
                    marginTop: 2,
                    fontSize: 11,
                    color: secondaryText,
                  }}
                >
                  {activity.subject}
                </Text>
              </View>
            </View>
          )
        )
      )}
    </View>
  );
}