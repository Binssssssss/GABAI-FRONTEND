import { StyleSheet } from 'react-native';

export const drawerStyles = StyleSheet.create({
  /* ========================================
     BACKDROP
  ======================================== */

  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,

    zIndex: 999,
  },

  backdropOverlay: {
    flex: 1,
  },

  /* ========================================
     DRAWER
  ======================================== */

  drawer: {
    position: 'absolute',

    top: 0,
    bottom: 0,
    left: 0,

    borderRightWidth: 1,

    borderTopRightRadius: 26,
    borderBottomRightRadius: 26,

    overflow: 'hidden',

    zIndex: 1000,

    shadowColor: '#000',
    shadowOffset: {
      width: 8,
      height: 0,
    },
    shadowOpacity: 0.18,
    shadowRadius: 24,

    elevation: 18,
  },

  drawerContent: {
    paddingBottom: 30,
  },

  /* ========================================
     BRAND HEADER
  ======================================== */

  brandHeader: {
    paddingHorizontal: 20,
    paddingTop: 58,
    paddingBottom: 18,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottomWidth: 1,
  },

  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandMark: {
    width: 34,
    height: 34,

    borderRadius: 11,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  brandMarkText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },

  brandName: {
    fontSize: 17,
    fontWeight: '800',

    letterSpacing: -0.4,
  },
  
  closeButton: {
    width: 34,
    height: 34,

    borderRadius: 11,

    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ========================================
     PROFILE CARD
  ======================================== */

  profileCard: {
    marginHorizontal: 16,
    marginTop: 18,

    minHeight: 76,

    paddingHorizontal: 12,
    paddingVertical: 12,

    borderRadius: 16,

    borderWidth: 1,

    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 44,
    height: 44,

    borderRadius: 14,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 11,
  },

  avatarText: {
    color: '#FFFFFF',

    fontSize: 14,
    fontWeight: '800',

    letterSpacing: 0.2,
  },

  avatarStatus: {
    position: 'absolute',

    width: 9,
    height: 9,

    borderRadius: 5,

    right: -1,
    bottom: -1,

    borderWidth: 2,
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 14,

    fontWeight: '700',

    letterSpacing: -0.2,
  },

  profileCourse: {
    fontSize: 10,

    marginTop: 2,
  },

  status: {
    flexDirection: 'row',
    alignItems: 'center',

    marginTop: 4,
  },

  statusDot: {
    width: 5,
    height: 5,

    borderRadius: 3,

    marginRight: 5,
  },

  statusText: {
    fontSize: 8.5,

    fontWeight: '600',

    letterSpacing: 0.05,
  },

  /* ========================================
     NAVIGATION
  ======================================== */

  navigation: {
    paddingHorizontal: 14,
    paddingTop: 24,
  },

  productivitySection: {
    paddingHorizontal: 14,
    paddingTop: 18,
  },

  sectionLabel: {
    fontSize: 9,

    fontWeight: '800',

    letterSpacing: 1.4,

    marginLeft: 12,
    marginBottom: 9,
  },

  menuItem: {
    position: 'relative',

    height: 47,

    borderRadius: 13,

    paddingHorizontal: 10,

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 3,

    overflow: 'hidden',
  },

  activeIndicator: {
    position: 'absolute',

    left: 0,

    width: 3,
    height: 20,

    borderRadius: 2,
  },

  menuIcon: {
    width: 32,
    height: 32,

    borderRadius: 10,

    alignItems: 'center',
    justifyContent: 'center',
  },

  menuText: {
    flex: 1,

    fontSize: 13,

    marginLeft: 11,

    letterSpacing: -0.1,
  },

  /* ========================================
     BADGES
  ======================================== */

  badge: {
    minWidth: 21,
    height: 21,

    paddingHorizontal: 6,

    borderRadius: 10.5,

    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: 7,
  },

  badgeText: {
    color: '#FFFFFF',

    fontSize: 9,

    fontWeight: '800',
  },

  /* ========================================
     FOOTER
  ======================================== */

  footer: {
    marginTop: 20,

    paddingHorizontal: 14,
    paddingTop: 15,

    borderTopWidth: 1,
  },

  footerItem: {
    height: 47,

    paddingHorizontal: 10,

    borderRadius: 13,

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 3,
  },

  footerIcon: {
    width: 32,
    height: 32,

    borderRadius: 10,

    alignItems: 'center',
    justifyContent: 'center',
  },

  footerText: {
    flex: 1,

    fontSize: 13,

    marginLeft: 11,

    fontWeight: '500',
  },
});