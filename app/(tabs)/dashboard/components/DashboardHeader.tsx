import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { dashboardHeaderStyles as styles } from '../styles/dashboardHeaderStyles';

import {
  getNotifications,
  subscribeToNotifications,
  markNotificationAsRead,
} from '@/app/notifications/notificationService';

import { Notification } from '@/app/notifications/types';

interface DashboardHeaderProps {
  greeting: string;
  userName: string;
  onOpenDrawer: () => void;
  textPrimary: string;
  textSecondary: string;
}

export default function DashboardHeader({
  greeting,
  userName,
  onOpenDrawer,
  textPrimary,
  textSecondary,
}: DashboardHeaderProps) {
  const router = useRouter();

  const [notificationsVisible, setNotificationsVisible] =
    useState(false);

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  useEffect(() => {
    let isMounted = true;

    getNotifications().then((storedNotifications) => {
      if (isMounted) {
        setNotifications(storedNotifications);
      }
    });

    const unsubscribe =
      subscribeToNotifications(setNotifications);

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleNotificationPress = async (
    notification: Notification,
  ) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }

    /*
     * Optional task navigation.
     *
     * If this notification is connected to a task,
     * you can navigate to that task here later.
     */

    if (notification.taskId) {
      // Example:
      // router.push(`/(tabs)/tasks/${notification.taskId}`);
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const isDark = textPrimary === '#ECEDEE';

  const headerSurface = isDark
    ? '#1A1A1A'
    : '#F8F6F3';

  const softSurface = isDark
    ? '#242424'
    : '#FFFFFF';

  const iconColor = isDark
    ? '#E6D5C4'
    : '#5C4033';

  const accentBrown = '#A97C50';

  const hasUnreadNotifications = notifications.some(
    (notification) => !notification.read,
  );

  return (
    <>
      {/* =========================================
          DASHBOARD HEADER
      ========================================= */}
      <View
        style={[
          styles.container,
          {
            backgroundColor: headerSurface,
          },
        ]}
      >
        {/* LEFT SIDE */}
        <View style={styles.leftSection}>
          {/* MENU */}
          <TouchableOpacity
            style={[
              styles.menuButton,
              {
                backgroundColor: accentBrown,
              },
            ]}
            onPress={onOpenDrawer}
            activeOpacity={0.8}
          >
            <Feather
              name="menu"
              size={21}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {/* GREETING */}
          <View style={styles.greetingContainer}>
            <Text
              style={[
                styles.greetingLabel,
                {
                  color: textSecondary,
                },
              ]}
              numberOfLines={1}
            >
              {greeting}
            </Text>

            <Text
              style={[
                styles.welcomeText,
                {
                  color: textPrimary,
                },
              ]}
              numberOfLines={1}
            >
              {userName} 👋
            </Text>

            <View style={styles.dateRow}>
              <Feather
                name="calendar"
                size={12}
                color={textSecondary}
              />

              <Text
                style={[
                  styles.dateText,
                  {
                    color: textSecondary,
                  },
                ]}
                numberOfLines={1}
              >
                {today}
              </Text>
            </View>
          </View>
        </View>

        {/* RIGHT SIDE */}
        <View style={styles.rightSection}>
          {/* NOTIFICATIONS */}
          <TouchableOpacity
            style={[
              styles.notificationButton,
              {
                backgroundColor: softSurface,
                borderColor: isDark
                  ? '#303030'
                  : '#E8E1D9',
              },
            ]}
            onPress={() =>
              setNotificationsVisible(true)
            }
            activeOpacity={0.8}
          >
            <Feather
              name="bell"
              size={19}
              color={iconColor}
            />

            {hasUnreadNotifications && (
              <View
                style={[
                  styles.notificationDot,
                  {
                    borderColor: softSurface,
                  },
                ]}
              />
            )}
          </TouchableOpacity>

          {/* PROFILE */}
          <TouchableOpacity
            style={[
              styles.avatarWrapper,
              {
                borderColor: isDark
                  ? '#4A3A2D'
                  : '#D8C2AA',
              },
            ]}
            onPress={() =>
              router.push('/(tabs)/profile/profile')
            }
            activeOpacity={0.8}
          >
            <Image
              source={{
                uri: 'https://i.pravatar.cc/150?img=12',
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* =========================================
          NOTIFICATIONS MODAL
      ========================================= */}
      <Modal
        visible={notificationsVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setNotificationsVisible(false)
        }
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setNotificationsVisible(false)
          }
        >
          <Pressable
            style={[
              styles.notificationPanel,
              {
                backgroundColor: isDark
                  ? '#1E1E1E'
                  : '#FFFFFF',
              },
            ]}
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            {/* MODAL HEADER */}
            <View style={styles.notificationHeader}>
              <View style={styles.modalTitleContainer}>
                <View
                  style={[
                    styles.modalTitleIcon,
                    {
                      backgroundColor: isDark
                        ? '#30271F'
                        : '#F3EAE1',
                    },
                  ]}
                >
                  <Feather
                    name="bell"
                    size={16}
                    color={accentBrown}
                  />
                </View>

                <View>
                  <Text
                    style={[
                      styles.notificationTitle,
                      {
                        color: textPrimary,
                      },
                    ]}
                  >
                    Notifications
                  </Text>

                  <Text
                    style={[
                      styles.notificationSubtitle,
                      {
                        color: textSecondary,
                      },
                    ]}
                  >
                    Academic reminders & insights
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setNotificationsVisible(false)
                }
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Feather
                  name="x"
                  size={19}
                  color={textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* NOTIFICATION LIST */}
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  activeOpacity={0.75}
                  onPress={() =>
                    handleNotificationPress(notification)
                  }
                >
                  <View
                    style={[
                      styles.notificationItem,
                      {
                        backgroundColor: isDark
                          ? '#262626'
                          : '#F8FAFC',
                        borderColor: isDark
                          ? '#303030'
                          : '#EDF0F2',
                        opacity: notification.read
                          ? 0.58
                          : 1,
                      },
                    ]}
                  >
                    {/* ICON */}
                    <View
                      style={[
                        styles.notificationIcon,
                        {
                          backgroundColor:
                            notification.iconColor
                              ? `${notification.iconColor}15`
                              : '#F59E0B15',
                        },
                      ]}
                    >
                      <Feather
                        name={
                          notification.icon as any
                        }
                        size={17}
                        color={
                          notification.iconColor ||
                          '#F59E0B'
                        }
                      />
                    </View>

                    {/* CONTENT */}
                    <View
                      style={styles.notificationContent}
                    >
                      <Text
                        style={[
                          styles.notificationItemTitle,
                          {
                            color: textPrimary,
                          },
                        ]}
                      >
                        {notification.title}
                      </Text>

                      <Text
                        style={[
                          styles.notificationMessage,
                          {
                            color: textSecondary,
                          },
                        ]}
                      >
                        {notification.message}
                      </Text>

                      <Text
                        style={[
                          styles.notificationTime,
                          {
                            color: textSecondary,
                          },
                        ]}
                      >
                        {notification.time}
                      </Text>
                    </View>

                    {/* UNREAD */}
                    {!notification.read && (
                      <View
                        style={[
                          styles.itemUnreadDot,
                          {
                            backgroundColor:
                              accentBrown,
                          },
                        ]}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyNotification}>
                <View
                  style={[
                    styles.emptyIcon,
                    {
                      backgroundColor: isDark
                        ? '#1D3029'
                        : '#ECFDF5',
                    },
                  ]}
                >
                  <Feather
                    name="check"
                    size={24}
                    color="#10B981"
                  />
                </View>

                <Text
                  style={[
                    styles.emptyNotificationTitle,
                    {
                      color: textPrimary,
                    },
                  ]}
                >
                  You're all caught up
                </Text>

                <Text
                  style={[
                    styles.emptyNotificationText,
                    {
                      color: textSecondary,
                    },
                  ]}
                >
                  No reminders or productivity updates
                  right now.
                </Text>
              </View>
            )}

            {/* FOOTER */}
            {notifications.length > 0 && (
              <View
                style={[
                  styles.footer,
                  {
                    borderTopColor: isDark
                      ? '#303030'
                      : '#EDF0F2',
                  },
                ]}
              >
                <Feather
                  name="bell"
                  size={13}
                  color={textSecondary}
                />

                <Text
                  style={[
                    styles.footerText,
                    {
                      color: textSecondary,
                    },
                  ]}
                >
                  {notifications.length} notification
                  {notifications.length > 1
                    ? 's'
                    : ''}
                </Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

