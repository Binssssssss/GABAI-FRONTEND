import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { localDb } from '@/app/services/localDb';
import api from '@/app/services/api';

import {
  initializeNotifications,
  subscribeToTokenChanges,
} from '@/app/services/notificationService';

type AuthUser = Record<string, unknown>;

type AuthSession = {
  token: string;
  refreshToken?: string;
  user?: AuthUser;
};

function getUserId(user?: AuthUser | null) {
  const id = user?.id || user?.userId || user?.sub;

  return typeof id === 'string' || typeof id === 'number'
    ? String(id)
    : null;
}

interface AuthContextValue {
  session: AuthSession | null;
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (session: AuthSession) => Promise<void>;
  signOut: () => Promise<void>;
}

const SESSION_KEY = 'gabai.auth.session';
const LEGACY_TOKEN_KEY = 'gabai_token';
const LEGACY_USER_KEY = 'gabai_user';
const REFRESH_TOKEN_KEY = 'gabai_refresh_token';

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

function decodeJwtPayload(token: string): AuthUser | null {
  try {
    const payload = token.split('.')[1];

    if (!payload) {
      return null;
    }

    return JSON.parse(
      atob(
        payload
          .replace(/-/g, '+')
          .replace(/_/g, '/')
          .padEnd(
            Math.ceil(payload.length / 4) * 4,
            '=',
          ),
      ),
    );
  } catch {
    return null;
  }
}

function isSessionValid(session: AuthSession | null) {
  if (!session?.token) {
    return false;
  }

  try {
    const decoded = decodeJwtPayload(session.token);

    /*
     * If the token cannot be decoded, don't immediately
     * destroy the session. The backend remains the final
     * authority for token validity.
     */
    if (!decoded) {
      return true;
    }

    return (
      typeof decoded.exp !== 'number' ||
      decoded.exp * 1000 > Date.now()
    );
  } catch {
    return true;
  }
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] =
    useState<AuthSession | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedSession =
          await AsyncStorage.getItem(SESSION_KEY);

        const storedToken =
          await AsyncStorage.getItem(LEGACY_TOKEN_KEY);

        const storedRefreshToken =
          await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

        const storedUser =
          await AsyncStorage.getItem(LEGACY_USER_KEY);

        const parsedSession = storedSession
          ? JSON.parse(storedSession)
          : null;

        const parsedUser = storedUser
          ? JSON.parse(storedUser)
          : undefined;

        const savedSession: AuthSession | null =
          parsedSession?.token
            ? {
                token: parsedSession.token,
                refreshToken:
                  parsedSession.refreshToken ||
                  storedRefreshToken ||
                  undefined,
                user:
                  parsedSession.user ||
                  parsedUser,
              }
            : storedToken
              ? {
                  token: storedToken,
                  refreshToken:
                    storedRefreshToken ||
                    undefined,
                  user: parsedUser,
                }
              : null;

        if (savedSession) {
          const tokenUser =
            decodeJwtPayload(savedSession.token);

          savedSession.user = {
            ...tokenUser,
            ...savedSession.user,
          };
        }

        if (isSessionValid(savedSession)) {
          const userId = getUserId(
            savedSession?.user,
          );

          if (userId) {
            localDb.activateUser(userId);
            setSession(savedSession);
          } else {
            await AsyncStorage.multiRemove([
              SESSION_KEY,
              LEGACY_TOKEN_KEY,
              LEGACY_USER_KEY,
              REFRESH_TOKEN_KEY,
            ]);
          }
        } else {
          await AsyncStorage.multiRemove([
            SESSION_KEY,
            LEGACY_TOKEN_KEY,
            LEGACY_USER_KEY,
            REFRESH_TOKEN_KEY,
          ]);
        }
      } catch (error) {
        console.error(
          'Failed to load auth session:',
          error,
        );

        await AsyncStorage.multiRemove([
          SESSION_KEY,
          LEGACY_TOKEN_KEY,
          LEGACY_USER_KEY,
          REFRESH_TOKEN_KEY,
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  /**
   * Initialize push notifications whenever an
   * authenticated session becomes available.
   *
   * This works for:
   * 1. A fresh login
   * 2. Google login
   * 3. An existing session restored from AsyncStorage
   */
  useEffect(() => {
    if (isLoading || !session?.token) {
      return;
    }

    let cancelled = false;

    const initializeUserNotifications = async () => {
      console.log(
        '🔔 Authenticated user detected. Initializing notifications...',
      );

      const result =
        await initializeNotifications();

      if (cancelled) {
        return;
      }

      console.log(
        '🔔 Notification initialization result:',
        {
          permissionGranted:
            result.permissionGranted,
          deviceToken:
            result.deviceToken
              ? 'AVAILABLE'
              : 'NOT AVAILABLE',
          registered:
            result.registered,
        },
      );
    };

    initializeUserNotifications();

    const tokenSubscription =
      subscribeToTokenChanges();

    return () => {
      cancelled = true;
      tokenSubscription.remove();

      console.log(
        '🔕 Notification token listener removed.',
      );
    };
  }, [isLoading, session?.token]);

  const signIn = useCallback(
    async (nextSession: AuthSession) => {
      console.log('AUTH SIGN IN CALLED');

      console.log(
        'TOKEN RECEIVED:',
        nextSession?.token
          ? `${nextSession.token.substring(0, 20)}...`
          : 'NO TOKEN',
      );

      if (!isSessionValid(nextSession)) {
        throw new Error(
          'Cannot save an invalid auth session.',
        );
      }

      /*
       * Merge user information from the JWT with
       * user information returned by the backend.
       */
      const tokenUser = decodeJwtPayload(
        nextSession.token,
      );

      const normalizedSession: AuthSession = {
        ...nextSession,
        user: {
          ...tokenUser,
          ...nextSession.user,
        },
      };

      const userId = getUserId(
        normalizedSession.user,
      );

      if (!userId) {
        throw new Error(
          'Login session does not contain an authenticated user ID.',
        );
      }

      localDb.activateUser(userId);

      /*
       * Save the current session.
       */
      await AsyncStorage.setItem(
        SESSION_KEY,
        JSON.stringify(normalizedSession),
      );

      /*
       * Keep legacy storage for compatibility
       * with existing GabAi screens/services.
       */
      await AsyncStorage.setItem(
        LEGACY_TOKEN_KEY,
        normalizedSession.token,
      );

      if (normalizedSession.refreshToken) {
        await AsyncStorage.setItem(
          REFRESH_TOKEN_KEY,
          normalizedSession.refreshToken,
        );
      }

      if (normalizedSession.user) {
        await AsyncStorage.setItem(
          LEGACY_USER_KEY,
          JSON.stringify(
            normalizedSession.user,
          ),
        );
      }

      console.log('AUTH SESSION SAVED');

      setSession(normalizedSession);
    },
    [],
  );

  const signOut = useCallback(async () => {
    /*
     * Tell the backend that the authenticated user
     * is logging out.
     *
     * The backend currently uses stateless JWT
     * authentication, but keeping this request
     * allows the backend to handle logout if needed.
     */
    try {
      if (session?.token) {
        await api.post('/api/auth/logout');
      }
    } catch (error) {
      /*
       * Even if the backend request fails, continue
       * clearing the local authentication data.
       */
      console.warn(
        'Backend logout request failed. Clearing local session anyway.',
        error,
      );
    } finally {
      await AsyncStorage.multiRemove([
        SESSION_KEY,
        LEGACY_TOKEN_KEY,
        LEGACY_USER_KEY,
        REFRESH_TOKEN_KEY,
      ]);

      localDb.clearActiveUser();

      setSession(null);
    }
  }, [session]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      isLoading,
      signIn,
      signOut,
    }),
    [
      isLoading,
      session,
      signIn,
      signOut,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    );
  }

  return context;
}
