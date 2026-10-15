import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppTheme } from '@/app/context/ThemeContext';
import { useActivityLog } from '@/app/services/activityLog';
import {
  ACTIVITY_ICON,
  activityText,
  formatActivityWhen,
  getActivityColor,
} from '@/utils/activityFormat';

interface RecentActivityTask {
  id: string;
  title: string;
  subject?: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface RecentActivityProps {
  /** No longer used: activity now comes from the on-phone history. */
  tasks?: RecentActivityTask[];
  primaryBrown?: string;
  textColor?: string;
  secondaryText?: string;
  cardColor?: string;
  borderColor?: string;
  backgroundColor?: string;
}

// How many activities the dashboard shows before "See activity history".
const DASHBOARD_COUNT = 5;

export default function RecentActivity({
  primaryBrown = '#A97C50',
  textColor = '#ECEDEE',
  secondaryText = '#9BA1A6',
  cardColor = '#1E1E1E',
  borderColor = '#2E2E2E',
  backgroundColor,
}: RecentActivityProps) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const iconBg = backgroundColor ?? colors.background;
  const allActivity = useActivityLog();
  const activities = allActivity.slice(0, DASHBOARD_COUNT);

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
          marginBottom: 6,
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

        <Text
          style={{
            fontSize: 12,
            color: secondaryText,
          }}
        >
          Last 30 days
        </Text>
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
            Tasks you create, complete or delete
            will appear here.
          </Text>
        </View>
      ) : (
        <>
          {activities.map((activity) => {
            const color = getActivityColor(
              activity.type,
              primaryBrown,
              '#EF4444',
            );

            return (
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
                    backgroundColor: iconBg,
                  }}
                >
                  <Feather
                    name={ACTIVITY_ICON[activity.type]}
                    size={16}
                    color={color}
                  />
                </View>

                {/* Activity text */}
                <View
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    marginRight: 8,
                  }}
                >
                  <Text
                    numberOfLines={2}
                    style={{
                      fontSize: 13,
                      lineHeight: 19,
                      color: textColor,
                    }}
                  >
                    {activityText(activity)}
                  </Text>

                  <Text
                    style={{
                      marginTop: 2,
                      fontSize: 11,
                      color: secondaryText,
                    }}
                  >
                    {activity.subject || 'General'}
                  </Text>
                </View>

                {/* When */}
                <Text
                  style={{
                    fontSize: 11,
                    color: secondaryText,
                  }}
                >
                  {formatActivityWhen(activity.at)}
                </Text>
              </View>
            );
          })}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/activity-history')}
            accessibilityRole="button"
            style={{
              height: 44,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: primaryBrown,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              marginTop: 8,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: primaryBrown,
              }}
            >
              See activity history
            </Text>
            <Feather
              name="arrow-right"
              size={16}
              color={primaryBrown}
            />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
