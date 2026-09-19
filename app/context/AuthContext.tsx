import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type AuthUser = Record<string, unknown>;

type AuthSession = {
  token: string;
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

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function decodeJwtPayload(token: string): AuthUser | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    return JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '='))
    );
  } catch {
    return null;
  }
}

function isSessionValid(session: AuthSession | null) {
  if (!session?.token) return false;

  try {
    const decoded = decodeJwtPayload(session.token);
    if (!decoded) return true;

    return typeof decoded.exp !== 'number' || decoded.exp * 1000 > Date.now();
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedSession = await AsyncStorage.getItem(SESSION_KEY);
        const storedToken = await AsyncStorage.getItem(LEGACY_TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(LEGACY_USER_KEY);
        const parsedSession = storedSession ? JSON.parse(storedSession) : null;
        const parsedUser = storedUser ? JSON.parse(storedUser) : undefined;
        const savedSession: AuthSession | null = parsedSession?.token
          ? parsedSession
          : storedToken
            ? { token: storedToken, user: parsedUser }
            : null;

        if (savedSession) {
          const tokenUser = decodeJwtPayload(savedSession.token);
          savedSession.user = { ...tokenUser, ...savedSession.user };
        }

        if (isSessionValid(savedSession)) {
          setSession(savedSession);
        } else {
          await AsyncStorage.multiRemove([SESSION_KEY, LEGACY_TOKEN_KEY, LEGACY_USER_KEY]);
        }
      } catch (error) {
        console.error('Failed to load auth session:', error);
        await AsyncStorage.multiRemove([SESSION_KEY, LEGACY_TOKEN_KEY, LEGACY_USER_KEY]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const signIn = async (nextSession: AuthSession) => {
    if (!isSessionValid(nextSession)) {
      throw new Error('Cannot save an invalid auth session.');
    }

    const tokenUser = decodeJwtPayload(nextSession.token);
    const normalizedSession = {
      ...nextSession,
      user: { ...tokenUser, ...nextSession.user },
    };

    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(normalizedSession));
    await AsyncStorage.setItem(LEGACY_TOKEN_KEY, normalizedSession.token);
    if (normalizedSession.user) {
      await AsyncStorage.setItem(LEGACY_USER_KEY, JSON.stringify(normalizedSession.user));
    }
    setSession(normalizedSession);
  };

  const signOut = async () => {
    await AsyncStorage.multiRemove([SESSION_KEY, LEGACY_TOKEN_KEY, LEGACY_USER_KEY]);
    setSession(null);
  };

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      isLoading,
      signIn,
      signOut,
    }),
    [isLoading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
