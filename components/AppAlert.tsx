import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { AlertButton, AlertOptions } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useAppTheme } from '@/app/context/ThemeContext';

/**
 * GabAi's own alert, used instead of the plain phone alert.
 * Call it exactly like Alert.alert:
 *
 *   AppAlert.alert('Log Out', 'Are you sure?', [
 *     { text: 'Cancel', style: 'cancel' },
 *     { text: 'Log Out', style: 'destructive', onPress: logout },
 *   ]);
 *
 * <AppAlertHost /> must be mounted once (in app/_layout.tsx).
 */

type AlertVariant =
  | 'info'
  | 'success'
  | 'error'
  | 'warning'
  | 'delete'
  | 'logout'
  | 'lock';

interface AlertRequest {
  id: number;
  title: string;
  message?: string;
  buttons: AlertButton[];
  options?: AlertOptions;
}

// ------------------------------------------------------
// QUEUE (alerts show one at a time, in order)
// ------------------------------------------------------

let nextId = 1;
let queue: AlertRequest[] = [];
const listeners = new Set<(items: AlertRequest[]) => void>();

const publish = () => {
  listeners.forEach((listener) => listener(queue));
};

export const AppAlert = {
  alert(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions,
  ) {
    queue = [
      ...queue,
      {
        id: nextId++,
        title,
        message,
        buttons:
          buttons && buttons.length > 0 ? buttons : [{ text: 'OK' }],
        options,
      },
    ];
    publish();
  },
};

const removeFromQueue = (id: number) => {
  queue = queue.filter((item) => item.id !== id);
  publish();
};

// ------------------------------------------------------
// LOOK (icon + colors picked from the alert's words)
// ------------------------------------------------------

const getVariant = (request: AlertRequest): AlertVariant => {
  const title = request.title.toLowerCase();
  const hasDestructive = request.buttons.some(
    (button) => button.style === 'destructive',
  );

  if (hasDestructive) {
    if (/log ?out|sign ?out/.test(title)) return 'logout';
    if (/delete|clear|remove|discard/.test(title)) return 'delete';
    return 'warning';
  }

  if (/fail|error|unable|could ?n.t|cannot|can.t|invalid|missing|required/.test(title)) {
    return 'error';
  }
  if (/success|saved|done|complete|added|updated|created|sent/.test(title)) {
    return 'success';
  }
  if (/lock|strict|focus/.test(title)) return 'lock';

  return 'info';
};

const ICONS: Record<AlertVariant, keyof typeof Feather.glyphMap> = {
  info: 'info',
  success: 'check',
  error: 'x-circle',
  warning: 'alert-triangle',
  delete: 'trash-2',
  logout: 'log-out',
  lock: 'lock',
};

// ------------------------------------------------------
// HOST (renders the alert at the front of the queue)
// ------------------------------------------------------

export function AppAlertHost() {
  const { colorScheme, colors } = useAppTheme();
  const isDark = colorScheme === 'dark';

  const [items, setItems] = useState<AlertRequest[]>(queue);

  useEffect(() => {
    listeners.add(setItems);
    // Catch alerts sent before this host mounted.
    setItems(queue);

    return () => {
      listeners.delete(setItems);
    };
  }, []);

  const current = items[0];

  if (!current) {
    return null;
  }

  const brown = '#A97C50';
  const red = isDark ? '#EF4444' : '#DC2626';
  const green = '#22C55E';

  const variant = getVariant(current);

  const iconColor =
    variant === 'delete' || variant === 'logout' || variant === 'error'
      ? red
      : variant === 'success'
        ? green
        : variant === 'warning'
          ? '#F59E0B'
          : brown;

  const iconBg =
    iconColor === red
      ? isDark
        ? 'rgba(239, 68, 68, 0.16)'
        : '#FEE2E2'
      : iconColor === green
        ? isDark
          ? 'rgba(34, 197, 94, 0.16)'
          : '#DCFCE7'
        : iconColor === '#F59E0B'
          ? isDark
            ? 'rgba(245, 158, 11, 0.16)'
            : '#FEF3C7'
          : isDark
            ? 'rgba(169, 124, 80, 0.18)'
            : '#F5EBDD';

  const close = (button?: AlertButton) => {
    removeFromQueue(current.id);

    if (button?.onPress) {
      // Let this alert close first, in case the button opens another one.
      setTimeout(() => button.onPress?.(), 0);
    } else if (!button) {
      current.options?.onDismiss?.();
    }
  };

  // Android back button: close only when the alert allows it.
  const handleRequestClose = () => {
    const cancelButton = current.buttons.find(
      (button) => button.style === 'cancel',
    );

    if (cancelButton) {
      close(cancelButton);
      return;
    }

    if (current.options?.cancelable || current.buttons.length === 1) {
      close(current.buttons.length === 1 ? current.buttons[0] : undefined);
    }
  };

  const stacked = current.buttons.length > 2;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleRequestClose}
    >
      <View
        style={[
          styles.backdrop,
          {
            backgroundColor: isDark
              ? 'rgba(0, 0, 0, 0.65)'
              : 'rgba(17, 17, 17, 0.45)',
          },
        ]}
      >
        <View
          accessibilityRole="alert"
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
              borderColor: isDark ? '#2E2E2E' : 'transparent',
            },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
            <Feather name={ICONS[variant]} size={24} color={iconColor} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            {current.title}
          </Text>

          {!!current.message && (
            <Text style={[styles.message, { color: colors.secondaryText }]}>
              {current.message}
            </Text>
          )}

          <View style={stacked ? styles.buttonsStacked : styles.buttonsRow}>
            {current.buttons.map((button, index) => {
              const isCancel = button.style === 'cancel';
              const isDestructive = button.style === 'destructive';

              return (
                <TouchableOpacity
                  key={`${button.text ?? 'button'}-${index}`}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  onPress={() => close(button)}
                  style={[
                    styles.button,
                    !stacked && styles.buttonInRow,
                    isCancel
                      ? {
                          backgroundColor: 'transparent',
                          borderWidth: 1,
                          borderColor: isDark ? '#3A3A3A' : '#E5E7EB',
                        }
                      : {
                          backgroundColor: isDestructive ? red : brown,
                        },
                  ]}
                >
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.buttonText,
                      { color: isCancel ? colors.text : '#FFFFFF' },
                    ]}
                  >
                    {button.text ?? 'OK'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    borderWidth: 1,
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 6,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 20,
  },
  buttonsStacked: {
    gap: 10,
    width: '100%',
    marginTop: 20,
  },
  button: {
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  buttonInRow: {
    flex: 1,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default AppAlert;
