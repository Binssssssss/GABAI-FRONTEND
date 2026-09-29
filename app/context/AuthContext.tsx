import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import api from '@/app/services/api';

type AuthUser = Record<string, unknown>;

type AuthSession = {
  token: string;
  refreshToken?: string;
  user?: AuthUser;
};

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

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isSessionValid(session: AuthSession | null) {
  if (!session?.token) return false;

  try {
    const payload = session.token.split('.')[1];

    if (!payload) return true;

    const decoded = JSON.parse(
      atob(
        payload
          .replace(/-/g, '+')
          .replace(/_/g, '/')
          .padEnd(Math.ceil(payload.length / 4) * 4, '='),
      ),
    );

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
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedSession = await AsyncStorage.getItem(SESSION_KEY);
        const storedToken = await AsyncStorage.getItem(LEGACY_TOKEN_KEY);
        const storedRefreshToken =
          await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(LEGACY_USER_KEY);

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
                  parsedSession.refreshToken || storedRefreshToken || undefined,
                user: parsedSession.user || parsedUser,
              }
            : storedToken
              ? {
                  token: storedToken,
                  refreshToken: storedRefreshToken || undefined,
                  user: parsedUser,
                }
              : null;

        if (isSessionValid(savedSession)) {
          setSession(savedSession);
        } else {
          await AsyncStorage.multiRemove([
            SESSION_KEY,
            LEGACY_TOKEN_KEY,
            LEGACY_USER_KEY,
            REFRESH_TOKEN_KEY,
          ]);
        }
      } catch (error) {
        console.error('Failed to load auth session:', error);

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

  const signIn = useCallback(async (nextSession: AuthSession) => {
    if (!isSessionValid(nextSession)) {
      throw new Error('Cannot save an invalid auth session.');
    }

    await AsyncStorage.setItem(
      SESSION_KEY,
      JSON.stringify(nextSession),
    );

    await AsyncStorage.setItem(
      LEGACY_TOKEN_KEY,
      nextSession.token,
    );

    if (nextSession.refreshToken) {
      await AsyncStorage.setItem(
        REFRESH_TOKEN_KEY,
        nextSession.refreshToken,
      );
    }

    if (nextSession.user) {
      await AsyncStorage.setItem(
        LEGACY_USER_KEY,
        JSON.stringify(nextSession.user),
      );
    }

    setSession(nextSession);
  }, []);

  const signOut = useCallback(async () => {
    /*
     * Tell the backend that the authenticated user is logging out.
     *
     * The backend currently uses stateless JWT authentication,
     * so there is no database session to delete.
     */
    try {
      if (session?.token) {
        await api.post('/api/auth/logout');
      }
    } catch (error) {
      /*
       * Even if the backend request fails, continue clearing
       * local authentication data.
       *
       * This prevents the user from being trapped in the
       * authenticated state.
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
    [isLoading, session, signIn, signOut],
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