import { StyleSheet } from 'react-native';

export const dashboardHeaderStyles = StyleSheet.create({
  /* =========================================
     MAIN HEADER
  ========================================= */

  container: {
    width: '100%',
    minHeight: 82,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 13,

    alignItems: 'center',
    justifyContent: 'center',

    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  greetingContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    marginRight: 10,
  },

  greetingLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginBottom: 1,
  },

  welcomeText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.25,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  dateText: {
    marginLeft: 5,
    fontSize: 11,
    fontWeight: '500',
    flexShrink: 1,
  },

  /* =========================================
     RIGHT SIDE
  ========================================= */

  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },

  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 9,
    position: 'relative',
  },

  notificationDot: {
    position: 'absolute',

    top: 8,
    right: 8,

    width: 8,
    height: 8,
    borderRadius: 4,

    backgroundColor: '#D9534F',

    borderWidth: 2,
  },

  avatarWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,

    borderWidth: 2,

    alignItems: 'center',
    justifyContent: 'center',
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },

  /* =========================================
     MODAL
  ========================================= */

  modalOverlay: {
    flex: 1,

    backgroundColor: 'rgba(0, 0, 0, 0.42)',

    justifyContent: 'flex-start',
    alignItems: 'flex-end',

    paddingTop: 78,
    paddingRight: 16,
    paddingLeft: 16,
  },

  notificationPanel: {
    width: 330,
    maxWidth: '100%',

    borderRadius: 20,
    padding: 16,

    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 10,
  },

  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 14,
  },

  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  modalTitleIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  notificationTitle: {
    fontSize: 16,
    fontWeight: '800',
  },

  notificationSubtitle: {
    fontSize: 10.5,
    marginTop: 2,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 10,

    alignItems: 'center',
    justifyContent: 'center',
  },

  /* =========================================
     NOTIFICATION ITEMS
  ========================================= */

  notificationItem: {
    flexDirection: 'row',

    borderRadius: 14,
    borderWidth: 1,

    padding: 12,
    marginBottom: 9,

    position: 'relative',
  },

  notificationIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  notificationContent: {
    flex: 1,
    paddingRight: 8,
  },

  notificationItemTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 3,
  },

  notificationMessage: {
    fontSize: 11.5,
    lineHeight: 16,
  },

  notificationTime: {
    fontSize: 9.5,
    marginTop: 5,
  },

  itemUnreadDot: {
    position: 'absolute',

    top: 13,
    right: 12,

    width: 7,
    height: 7,
    borderRadius: 4,
  },

  /* =========================================
     EMPTY STATE
  ========================================= */

  emptyNotification: {
    alignItems: 'center',
    justifyContent: 'center',

    paddingVertical: 28,
    paddingHorizontal: 20,
  },

  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 10,
  },

  emptyNotificationTitle: {
    fontSize: 14,
    fontWeight: '700',
  },

  emptyNotificationText: {
    fontSize: 11.5,
    marginTop: 4,

    textAlign: 'center',
    lineHeight: 17,
  },

  /* =========================================
     FOOTER
  ========================================= */

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    borderTopWidth: 1,

    marginTop: 5,
    paddingTop: 12,
  },

  footerText: {
    fontSize: 10.5,
    marginLeft: 5,
  },
});