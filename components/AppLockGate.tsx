import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useAuth } from '@/app/context/AuthContext';
import { isAppLockEnabled } from '@/app/services/appLock';
import { authenticateUser, isLocalAuthSupported } from '@/app/services/localAuth';

const ACCENT = '#A97C50';

// Ask again only if the app was in the background longer than this.
const RELOCK_AFTER_MS = 30_000;

/**
 * Covers the app with a lock screen when App Lock is on
 * (Profile > Privacy & Security) until the user unlocks with
 * fingerprint, face or phone PIN.
 */
export default function AppLockGate({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();

  const [locked, setLocked] = useState(false);
  const [checking, setChecking] = useState(true);

  const authenticating = useRef(false);
  const backgroundedAt = useRef<number | null>(null);

  const unlock = useCallback(async () => {
    if (authenticating.current) return;

    authenticating.current = true;

    try {
      if (await authenticateUser('Unlock GabAi')) setLocked(false);
    } finally {
      authenticating.current = false;
    }
  }, []);

  // Lock when the app opens with a saved session.
  useEffect(() => {
    if (isLoading) return;

    if (!session?.token) {
      setLocked(false);
      setChecking(false);
      return;
    }

    let active = true;

    (async () => {
      const enabled = isLocalAuthSupported() && (await isAppLockEnabled());

      if (!active) return;

      setChecking(false);

      if (enabled) {
        setLocked(true);
        unlock();
      }
    })();

    return () => {
      active = false;
    };
  }, [isLoading, session?.token, unlock]);

  // Lock again after the app was away for a while.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (next) => {
      if (next === 'background') {
        // The biometric prompt itself can briefly background the app.
        if (!authenticating.current) backgroundedAt.current = Date.now();
        return;
      }

      if (next === 'active' && backgroundedAt.current && !authenticating.current) {
        const away = Date.now() - backgroundedAt.current;
        backgroundedAt.current = null;

        if (
          away > RELOCK_AFTER_MS &&
          session?.token &&
          isLocalAuthSupported() &&
          (await isAppLockEnabled())
        ) {
          setLocked(true);
          unlock();
        }
      }
    });

    return () => subscription.remove();
  }, [session?.token, unlock]);

  const showOverlay = locked || (checking && !!session?.token);

  return (
    <View style={{ flex: 1 }}>
      {children}

      {showOverlay && (
        <View style={styles.overlay}>
          {locked && (
            <>
              <Feather name="lock" size={44} color={ACCENT} />
              <Text style={styles.title}>GabAi is locked</Text>
              <TouchableOpacity style={styles.button} onPress={unlock}>
                <Text style={styles.buttonText}>Unlock</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0B0B0B',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    zIndex: 999,
    elevation: 999,
  },
  title: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  button: {
    backgroundColor: ACCENT,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
