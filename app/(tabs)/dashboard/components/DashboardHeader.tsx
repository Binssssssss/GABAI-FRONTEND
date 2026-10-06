import { Colors } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { dashboardHeaderStyles as styles } from '../styles/dashboardHeaderStyles';

import {
  getNotifications,
  markNotificationAsRead,
  subscribeToNotifications,
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

  const isDark = textPrimary === Colors.dark.text;

  const headerSurface = isDark
    ? Colors.dark.subtleSurface
    : 'rgba(255, 255, 255, 0.5)';

  const softSurface = isDark
    ? Colors.dark.surfaceStrong
    : Colors.light.surfaceStrong;

  const modalSurface = isDark ? '#191919' : '#FFFFFF';
  const notificationItemSurface = isDark ? '#242427' : '#F7F4F0';
  const modalIconSurface = isDark ? '#2A2521' : '#F4EAE0';

  const iconColor = isDark
    ? Colors.dark.tint
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
                borderColor: isDark ? Colors.dark.border : Colors.light.border,
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
                backgroundColor: modalSurface,
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
                      backgroundColor: modalIconSurface,
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
                        backgroundColor: notificationItemSurface,
                        borderColor: isDark
                          ? Colors.dark.border
                          : Colors.light.border,
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
                              : `${Colors.light.warning}20`,
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
                          Colors.light.warning
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
                      backgroundColor: modalIconSurface,
                    },
                  ]}
                >
                  <Feather
                    name="check"
                    size={24}
                    color={Colors.light.success}
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
                  You&apos;re all caught up
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
                      ? Colors.dark.border
                      : Colors.light.border,
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

