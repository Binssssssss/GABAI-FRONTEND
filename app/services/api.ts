  import { create } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'http://192.168.254.104:8000';

const api = create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const storedSession = await AsyncStorage.getItem(
        'gabai.auth.session',
      );

      const legacyToken = await AsyncStorage.getItem(
        'gabai_token',
      );

      let token: string | null = null;

      /*
       * Try the current session first.
       */
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);

          if (
            session &&
            typeof session.token === 'string' &&
            session.token.length > 0
          ) {
            token = session.token;
          }
        } catch {
          /*
           * Invalid session JSON.
           * Fall back to the legacy token.
           */
        }
      }

      /*
       * Fallback for older stored sessions.
       */
      if (!token && legacyToken) {
        token = legacyToken;
      }

      /*
       * Attach JWT when available.
       */
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      /*
       * Only use JSON Content-Type when a request
       * actually has a body.
       *
       * This is important for requests such as:
       *
       * POST /api/auth/logout
       *
       * where there is no request body.
       */
      if (config.data !== undefined && config.data !== null) {
        config.headers['Content-Type'] = 'application/json';
      } else {
        delete config.headers['Content-Type'];
      }

      return config;
    } catch (error) {
      console.error(
        'Failed to prepare API request:',
        error,
      );

      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;