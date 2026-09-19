import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { drawerStyles as styles } from './drawer.style';

interface MenuItem {
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  route: string;
  active: boolean;
  badge?: number;
}

interface AppDrawerProps {
  isDrawerOpen: boolean;
  closeDrawer: () => void;
  handleNavigate: (route: string) => void;
  handleLogout: () => void;
  isActiveRoute: (route: string) => boolean;
  menuItems: MenuItem[];

  primaryBrown: string;
  successGreen: string;
  errorRed: string;

  textPrimary: string;
  textSecondary: string;
  cardBg: string;
  borderCol: string;
}

export default function AppDrawer({
  isDrawerOpen,
  closeDrawer,
  handleNavigate,
  handleLogout,
  isActiveRoute,
  menuItems,

  primaryBrown,
  successGreen,
  errorRed,

  textPrimary,
  textSecondary,
  cardBg,
  borderCol,
}: AppDrawerProps) {
  const [currentUser, setCurrentUser] = React.useState<Record<string, string>>({});
  const screenWidth = Dimensions.get('window').width;
  const drawerWidth = screenWidth * 0.78;

  const slideAnim = useRef(
    new Animated.Value(-drawerWidth)
  ).current;

  useEffect(() => {
    AsyncStorage.getItem('gabai_user').then((storedUser) => {
      if (!storedUser) return;

      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to load drawer user:', error);
      }
    });
  }, []);

  useEffect(() => {
    if (isDrawerOpen) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -drawerWidth,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }
  }, [isDrawerOpen, drawerWidth, slideAnim]);

  // Separate menu items visually without changing your actual menuItems.
  const mainItems = menuItems.filter(
    (item) =>
      ![
        'Focus Session',
        'Virtual Assistant',
      ].includes(item.label)
  );

  const productivityItems = menuItems.filter(
    (item) =>
      item.label === 'Focus Session' ||
      item.label === 'Virtual Assistant'
  );

  return (
    <>
      {/* =========================================
          BACKDROP
      ====================================== */}

      {isDrawerOpen && (
        <Pressable
          style={styles.backdrop}
          onPress={closeDrawer}
        >
          <View
            style={[
              styles.backdropOverlay,
              {
                backgroundColor:
                  'rgba(0, 0, 0, 0.48)',
              },
            ]}
          />
        </Pressable>
      )}

      {/* =========================================
          DRAWER
      ========================================== */}

      <Animated.View
        style={[
          styles.drawer,
          {
            width: drawerWidth,
            backgroundColor: cardBg,
            borderColor: borderCol,
            transform: [
              {
                translateX: slideAnim,
              },
            ],
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.drawerContent
          }
        >
          {/* =====================================
              PROFILE CARD
          ====================================== */}

          <View
            style={[
              styles.profileCard,
              {
                backgroundColor:
                  colorWithOpacity(
                    primaryBrown,
                    0.08
                  ),
                borderColor:
                  colorWithOpacity(
                    primaryBrown,
                    0.16
                  ),
              },
            ]}
          >
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: primaryBrown,
                },
              ]}
            >
              <Text style={styles.avatarText}>
                {currentUser.initials || currentUser.name?.slice(0, 2).toUpperCase() || 'U'}
              </Text>

              <View
                style={[
                  styles.avatarStatus,
                  {
                    backgroundColor: successGreen,
                    borderColor: cardBg,
                  },
                ]}
              />
            </View>

            <View style={styles.profileInfo}>
              <Text
                style={[
                  styles.profileName,
                  {
                    color: textPrimary,
                  },
                ]}
                numberOfLines={1}
              >
                {currentUser.name || currentUser.fullName || currentUser.userName || currentUser.email || 'User'}
              </Text>

              <Text
                style={[
                  styles.profileCourse,
                  {
                    color: textSecondary,
                  },
                ]}
              >
                {currentUser.course || ''}
              </Text>

              <View style={styles.status}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        successGreen,
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.statusText,
                    {
                      color: successGreen,
                    },
                  ]}
                >
                  Offline Sync Active
                </Text>
              </View>
            </View>

            <Feather
              name="chevron-right"
              size={17}
              color={textSecondary}
            />
          </View>

          {/* =====================================
              MAIN NAVIGATION
          ====================================== */}

          <View style={styles.navigation}>
            <Text
              style={[
                styles.sectionLabel,
                {
                  color: textSecondary,
                },
              ]}
            >
              MAIN
            </Text>

            {mainItems.map((item) => (
              <DrawerMenuItem
                key={item.label}
                item={item}
                primaryBrown={primaryBrown}
                textPrimary={textPrimary}
                textSecondary={textSecondary}
                onPress={() =>
                  handleNavigate(item.route)
                }
              />
            ))}
          </View>

          {/* =====================================
              PRODUCTIVITY
          ====================================== */}

          {productivityItems.length > 0 && (
            <View style={styles.productivitySection}>
              <Text
                style={[
                  styles.sectionLabel,
                  {
                    color: textSecondary,
                  },
                ]}
              >
                PRODUCTIVITY
              </Text>

              {productivityItems.map((item) => (
                <DrawerMenuItem
                  key={item.label}
                  item={item}
                  primaryBrown={primaryBrown}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  onPress={() =>
                    handleNavigate(item.route)
                  }
                />
              ))}
            </View>
          )}

          {/* =====================================
              FOOTER
          ====================================== */}

          <View
            style={[
              styles.footer,
              {
                borderTopColor: borderCol,
              },
            ]}
          >
            {/* Settings */}

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                handleNavigate(
                  '/(tabs)/profile/profile'
                )
              }
              style={[
                styles.footerItem,
                isActiveRoute('profile') && {
                  backgroundColor:
                    colorWithOpacity(
                      primaryBrown,
                      0.08
                    ),
                },
              ]}
            >
              <View
                style={[
                  styles.footerIcon,
                  {
                    backgroundColor:
                      colorWithOpacity(
                        textSecondary,
                        0.08
                      ),
                  },
                ]}
              >
                <Feather
                  name="settings"
                  size={16}
                  color={
                    isActiveRoute('profile')
                      ? primaryBrown
                      : textSecondary
                  }
                />
              </View>

              <Text
                style={[
                  styles.footerText,
                  {
                    color: isActiveRoute('profile')
                      ? textPrimary
                      : textSecondary,
                  },
                ]}
              >
                Settings & Profile
              </Text>

              <Feather
                name="chevron-right"
                size={16}
                color={textSecondary}
              />
            </TouchableOpacity>

            {/* Logout */}

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleLogout}
              style={styles.footerItem}
            >
              <View
                style={[
                  styles.footerIcon,
                  {
                    backgroundColor:
                      colorWithOpacity(
                        errorRed,
                        0.08
                      ),
                  },
                ]}
              >
                <Feather
                  name="log-out"
                  size={16}
                  color={errorRed}
                />
              </View>

              <Text
                style={[
                  styles.footerText,
                  {
                    color: errorRed,
                  },
                ]}
              >
                Log Out
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </>
  );
}

/* =========================================
   MENU ITEM COMPONENT
========================================= */

interface DrawerMenuItemProps {
  item: MenuItem;
  primaryBrown: string;
  textPrimary: string;
  textSecondary: string;
  onPress: () => void;
}

function DrawerMenuItem({
  item,
  primaryBrown,
  textPrimary,
  textSecondary,
  onPress,
}: DrawerMenuItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.72}
      onPress={onPress}
      style={[
        styles.menuItem,
        item.active && {
          backgroundColor:
            colorWithOpacity(
              primaryBrown,
              0.11
            ),
        },
      ]}
    >
      {/* Active indicator */}

      {item.active && (
        <View
          style={[
            styles.activeIndicator,
            {
              backgroundColor: primaryBrown,
            },
          ]}
        />
      )}

      {/* Icon */}

      <View
        style={[
          styles.menuIcon,
          {
            backgroundColor: item.active
              ? colorWithOpacity(
                  primaryBrown,
                  0.13
                )
              : colorWithOpacity(
                  textSecondary,
                  0.06
                ),
          },
        ]}
      >
        <Feather
          name={item.icon}
          size={16}
          color={
            item.active
              ? primaryBrown
              : textSecondary
          }
        />
      </View>

      {/* Label */}

      <Text
        style={[
          styles.menuText,
          {
            color: item.active
              ? textPrimary
              : textSecondary,
            fontWeight: item.active
              ? '700'
              : '500',
          },
        ]}
        numberOfLines={1}
      >
        {item.label}
      </Text>

      {/* Badge */}

      {item.badge !== undefined &&
        item.badge > 0 && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: primaryBrown,
              },
            ]}
          >
            <Text style={styles.badgeText}>
              {item.badge}
            </Text>
          </View>
        )}
    </TouchableOpacity>
  );
}

/* =========================================
   COLOR HELPER
========================================= */

function colorWithOpacity(
  hex: string,
  opacity: number
) {
  const cleanHex = hex.replace('#', '');

  if (cleanHex.length !== 6) {
    return hex;
  }

  const r = parseInt(
    cleanHex.substring(0, 2),
    16
  );
  const g = parseInt(
    cleanHex.substring(2, 4),
    16
  );
  const b = parseInt(
    cleanHex.substring(4, 6),
    16
  );

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}