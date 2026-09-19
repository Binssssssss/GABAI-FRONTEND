import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  getNotifications,
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
  const router = useRouter();
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    let isMounted = true;

    getNotifications().then((storedNotifications) => {
      if (isMounted) {
        setNotifications(storedNotifications);
      }
    });

    const unsubscribe = subscribeToNotifications(setNotifications);

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <View style={styles.container}>
        {/* LEFT */}
        <View style={styles.leftSection}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={onOpenDrawer}
            activeOpacity={0.8}
          >
            <Feather
              name="menu"
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <View style={styles.greetingContainer}>
           <Text
  style={[
    styles.welcomeText,
    { color: textPrimary },
  ]}
>
  Welcome back, {userName} 👋
</Text>

            <View style={styles.dateRow}>
              <Feather
                name="calendar"
                size={13}
                color={textSecondary}
              />

              <Text
                style={[
                  styles.dateText,
                  { color: textSecondary },
                ]}
                numberOfLines={1}
              >
                {today}
              </Text>
            </View>
          </View>
        </View>

        {/* RIGHT */}
        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => setNotificationsVisible(true)}
            activeOpacity={0.8}
          >
            <Feather
              name="bell"
              size={20}
              color="#4E342E"
            />

            {/* Notification indicator */}
            {notifications.some((notification) => !notification.read) && (
              <View style={styles.notificationDot} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarButton}
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

      {/* NOTIFICATIONS MODAL */}
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
                backgroundColor:
                  textPrimary === '#ECEDEE'
                    ? '#1E1E1E'
                    : '#FFFFFF',
              },
            ]}
            onPress={(event) => event.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.notificationHeader}>
              <View>
                <Text
                  style={[
                    styles.notificationTitle,
                    { color: textPrimary },
                  ]}
                >
                  Notifications
                </Text>
                <Text
                  style={[
                    styles.notificationSubtitle,
                    { color: textSecondary },
                  ]}
                >
                  Academic reminders & productivity insights
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setNotificationsVisible(false)
                }
                style={styles.closeButton}
              >
                <Feather
                  name="x"
                  size={20}
                  color={textSecondary}
                />
              </TouchableOpacity>
            </View>

            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <View
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    {
                      backgroundColor:
                        textPrimary === '#ECEDEE'
                          ? '#262626'
                          : '#F8FAFC',
                      marginBottom: 10,
                      opacity: notification.read ? 0.65 : 1,
                    },
                  ]}
                >
                  {/* Dynamic Icon */}
                  <View
                    style={[
                      styles.notificationIcon,
                      {
                        backgroundColor: '#F59E0B15',
                      },
                    ]}
                  >
                    <Feather
                      name="alert-circle"
                      size={18}
                      color="#F59E0B"
                    />
                  </View>

                  {/* Content */}
                  <View style={styles.notificationContent}>
                    <Text
                      style={[
                        styles.notificationItemTitle,
                        { color: textPrimary },
                      ]}
                    >
                      {notification.title}
                    </Text>

                    <Text
                      style={[
                        styles.notificationMessage,
                        { color: textSecondary },
                      ]}
                    >
                      {notification.message}
                    </Text>

                    <Text
                      style={[
                        styles.notificationTime,
                        { color: textSecondary },
                      ]}
                    >
                      {notification.time}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyNotification}>
                <Feather
                  name="check-circle"
                  size={28}
                  color="#10B981"
                />

                <Text
                  style={[
                    styles.emptyNotificationTitle,
                    { color: textPrimary },
                  ]}
                >
                  You're all caught up
                </Text>

                <Text
                  style={[
                    styles.emptyNotificationText,
                    { color: textSecondary },
                  ]}
                >
                  No reminders or productivity updates right now.
                </Text>
              </View>
            )}

            {/* Empty space / future notifications */}
            {notifications.length > 0 && (
              <View style={styles.footer}>
                <Feather
                  name="bell"
                  size={15}
                  color={textSecondary}
                />

                <Text
                  style={[
                    styles.footerText,
                    { color: textSecondary },
                  ]}
                >
                  {notifications.length} notification
                  {notifications.length > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  emptyNotification: {
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 28,
  paddingHorizontal: 20,
},

emptyNotificationTitle: {
  fontSize: 14,
  fontWeight: '700',
  marginTop: 10,
},

emptyNotificationText: {
  fontSize: 12,
  marginTop: 4,
  textAlign: 'center',
  lineHeight: 18,
},
  container: {
    width: '100%',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  /* LEFT */
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 14,

    backgroundColor: '#7A5230',

    alignItems: 'center',
    justifyContent: 'center',
  },

  greetingContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
    marginRight: 8,
  },

  welcomeText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.1,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  dateText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 1,
  },

  /* RIGHT */
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },

  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 14,

    backgroundColor: '#F5F1EC',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 9,
    position: 'relative',
  },

  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 9,

    width: 8,
    height: 8,
    borderRadius: 4,

    backgroundColor: '#D9534F',

    borderWidth: 2,
    borderColor: '#F5F1EC',
  },

  avatarButton: {
    width: 42,
    height: 42,
    borderRadius: 21,

    alignItems: 'center',
    justifyContent: 'center',
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,

    borderWidth: 2,
    borderColor: '#D8C2AA',
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',

    justifyContent: 'flex-start',
    alignItems: 'flex-end',

    paddingTop: 70,
    paddingRight: 18,
  },

  notificationPanel: {
    width: 320,
    maxWidth: '90%',

    borderRadius: 18,
    padding: 16,

    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 8,
  },

  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 14,
  },

  notificationTitle: {
    fontSize: 17,
    fontWeight: '800',
  },

  notificationSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 10,

    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationItem: {
    flexDirection: 'row',

    borderRadius: 14,
    padding: 13,
  },

  notificationIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,

    backgroundColor: '#F59E0B15',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  notificationContent: {
    flex: 1,
  },

  notificationItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },

  notificationMessage: {
    fontSize: 12,
    lineHeight: 17,
  },

  notificationTime: {
    fontSize: 10,
    marginTop: 6,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 15,
  },

  footerText: {
    fontSize: 11,
    marginLeft: 5,
  },
});