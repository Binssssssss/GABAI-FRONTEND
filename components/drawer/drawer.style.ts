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

    borderTopRightRadius: 22,
    borderBottomRightRadius: 22,

    overflow: 'hidden',

    zIndex: 1000,

    shadowColor: '#000',
    shadowOffset: {
      width: 4,
      height: 0,
    },
    shadowOpacity: 0.12,
    shadowRadius: 18,

    elevation: 12,
  },

  drawerContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  /* ========================================
     BRAND HEADER
  ======================================== */

  brandHeader: {
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,

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
    width: 32,
    height: 32,

    borderRadius: 9,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  brandMarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  brandName: {
    fontSize: 16,
    fontWeight: '700',
  },

  brandSubtitle: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  
  closeButton: {
    width: 34,
    height: 34,

    borderRadius: 10,

    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ========================================
     PROFILE CARD
  ======================================== */

  profileCard: {
    marginHorizontal: 14,
    marginTop: 14,

    minHeight: 66,

    paddingHorizontal: 10,
    paddingVertical: 10,

    borderRadius: 14,

    borderWidth: 1,

    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 40,
    height: 40,

    borderRadius: 12,
    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
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
    fontSize: 13,
    fontWeight: '700',
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
    fontSize: 9,
    fontWeight: '500',
  },

  /* ========================================
     NAVIGATION
  ======================================== */

  navigation: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  productivitySection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginLeft: 10,
    marginBottom: 8,
  },

  menuItem: {
    position: 'relative',

    height: 46,

    borderRadius: 10,

    paddingHorizontal: 12,

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 2,

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
    width: 28,
    height: 28,

    borderRadius: 8,

    alignItems: 'center',
    justifyContent: 'center',
  },

  menuText: {
    flex: 1,

    fontSize: 14,

    marginLeft: 10,
  },

  /* ========================================
     BADGES
  ======================================== */

  badge: {
    minWidth: 20,
    height: 20,

    paddingHorizontal: 6,

    borderRadius: 8,

    alignItems: 'center',
    justifyContent: 'center',

    marginLeft: 7,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  /* ========================================
     FOOTER
  ======================================== */

  footer: {
    marginTop: 'auto',

    paddingHorizontal: 16,
    paddingTop: 14,

    borderTopWidth: 1,
  },

  footerItem: {
    height: 44,

    paddingHorizontal: 12,

    borderRadius: 10,

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 3,
  },

  footerIcon: {
    width: 28,
    height: 28,

    borderRadius: 8,

    alignItems: 'center',
    justifyContent: 'center',
  },

  footerText: {
    flex: 1,

    fontSize: 14,

    marginLeft: 10,

    fontWeight: '500',
  },
});