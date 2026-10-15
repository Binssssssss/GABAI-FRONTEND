import React, { useEffect } from 'react';
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
import DefaultAvatar from '@/components/DefaultAvatar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';
import { drawerStyles as styles } from './drawer.style';

/** "gabai capstone" -> "Gabai Capstone" (email addresses are left as-is). */
const toTitleCase = (value: string) =>
  value.includes('@')
    ? value
    : value
        .trim()
        .toLowerCase()
        .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());

const DRAWER_PALETTES = {
  dark: {
    background: '#151515',
    surface: '#1C1C1C',
    hover: '#242424',
    active: '#2A211B',
    primaryText: '#F2F2F2',
    secondaryText: '#9B9B9B',
    mutedText: '#6F6F6F',
    border: '#2A2A2A',
    highlight: '#C59A6B',
  },
  light: {
    background: '#F7F3EE',
    surface: '#EEE7DE',
    hover: '#E8E0D6',
    active: '#F0E3D4',
    primaryText: '#29231E',
    secondaryText: '#65584E',
    mutedText: '#817366',
    border: '#DED3C6',
    highlight: '#8A5B34',
  },
};

type DrawerPalette = typeof DRAWER_PALETTES.dark;

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
}: AppDrawerProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState<Record<string, string>>({});

  // Name with capital first letters, and initials taken from it.
  const displayName = toTitleCase(
    currentUser.name ||
      currentUser.fullName ||
      currentUser.userName ||
      currentUser.email ||
      'User',
  );
  const screenWidth = Dimensions.get('window').width;
  const drawerWidth = screenWidth * 0.78;
  const isDark = textPrimary === Colors.dark.text;
  const drawerColors = isDark ? DRAWER_PALETTES.dark : DRAWER_PALETTES.light;

  const [slideAnim] = React.useState(
    () => new Animated.Value(-drawerWidth)
  );

  // Reload the saved user each time the drawer opens (picks up profile edits).
  useEffect(() => {
    if (!isDrawerOpen) return;

    AsyncStorage.getItem('gabai_user').then((storedUser: string | null) => {
      if (!storedUser) return;

      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to load drawer user:', error);
      }
    });
  }, [isDrawerOpen]);

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

    const personalLabels = ['Wallet', 'Focus Session', 'GabAi'];
  const workspaceItems = menuItems.filter(
    (item) => !personalLabels.includes(item.label)
  );
  const personalItems = menuItems.filter(
    (item) => personalLabels.includes(item.label)
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
            backgroundColor: drawerColors.background,
            borderColor: drawerColors.border,
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

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
  closeDrawer();

  setTimeout(() => {
    router.push('/(tabs)/profile/profile');
  }, 150);
}}
            style={[
              styles.profileCard,
              {
                backgroundColor: drawerColors.surface,
                borderColor: drawerColors.border,
              },
            ]}
          >
            <View style={{ marginRight: 10 }}>
              <DefaultAvatar name={displayName} size={40} />
            </View>

            <View style={styles.profileInfo}>
              <Text
                style={[
                  styles.profileName,
                  {
                    color: drawerColors.primaryText,
                  },
                ]}
                numberOfLines={1}
              >
                {displayName}
              </Text>

              {!!currentUser.email && currentUser.email !== displayName && (
                <Text
                  style={[
                    styles.profileCourse,
                    {
                      color: drawerColors.secondaryText,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {currentUser.email}
                </Text>
              )}
            </View>

            <Feather
              name="chevron-right"
              size={17}
              color={drawerColors.secondaryText}
            />
          </TouchableOpacity>

          {/* =====================================
              MAIN NAVIGATION
          ====================================== */}

          <View style={styles.navigation}>
            <Text
              style={[
                styles.sectionLabel,
                {
                  color: drawerColors.mutedText,
                },
              ]}
            >
              WORKSPACE
            </Text>

            {workspaceItems.map((item) => (
              <DrawerMenuItem
                key={item.label}
                item={item}
                primaryBrown={primaryBrown}
                colors={drawerColors}
                onPress={() =>
                  handleNavigate(item.route)
                }
              />
            ))}
          </View>

          {/* =====================================
              PRODUCTIVITY
          ====================================== */}

          {personalItems.length > 0 && (
            <View style={styles.productivitySection}>
              <Text
                style={[
                  styles.sectionLabel,
                  {
                    color: drawerColors.mutedText,
                  },
                ]}
              >
                  PERSONAL
              </Text>

              {personalItems.map((item) => (
                <DrawerMenuItem
                  key={item.label}
                  item={item}
                  primaryBrown={primaryBrown}
                  colors={drawerColors}
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
                borderTopColor: drawerColors.border,
              },
            ]}
          >
            <Text style={[styles.sectionLabel, { color: drawerColors.mutedText }]}>ACCOUNT</Text>
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
                  backgroundColor: drawerColors.active,
                },
              ]}
            >
              <View
                style={[
                  styles.footerIcon,
                  {
                    backgroundColor: drawerColors.hover,
                  },
                ]}
              >
                <Feather
                  name="settings"
                  size={16}
                  color={
                    isActiveRoute('profile')
                      ? primaryBrown
                      : drawerColors.secondaryText
                  }
                />
              </View>

              <Text
                style={[
                  styles.footerText,
                  {
                    color: isActiveRoute('profile')
                      ? drawerColors.primaryText
                      : drawerColors.secondaryText,
                  },
                ]}
              >
                Settings & Profile
              </Text>

              <Feather
                name="chevron-right"
                size={16}
                color={drawerColors.secondaryText}
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
                    backgroundColor: `${errorRed}24`,
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
  colors: DrawerPalette;
  onPress: () => void;
}

function DrawerMenuItem({
  item,
  primaryBrown,
  colors,
  onPress,
}: DrawerMenuItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.72}
      onPress={onPress}
      style={[
        styles.menuItem,
        item.active && {
          backgroundColor: colors.active,
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
            backgroundColor: 'transparent',
          },
        ]}
      >
        <Feather
          name={item.icon}
          size={16}
          color={
            item.active
              ? primaryBrown
              : colors.secondaryText
          }
        />
      </View>

      {/* Label */}

      <Text
        style={[
          styles.menuText,
          {
            color: item.active
              ? colors.primaryText
              : colors.secondaryText,
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
                backgroundColor: colors.hover,
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.highlight }]}>
              {item.badge}
            </Text>
          </View>
        )}
    </TouchableOpacity>
  );
}

