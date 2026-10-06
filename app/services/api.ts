
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'http://192.168.254.104:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    console.log('========== API REQUEST ==========');
    console.log('BASE URL:', config.baseURL);
    console.log('URL:', config.url);
    console.log('METHOD:', config.method?.toUpperCase());

    try {
      /*
       * Primary GabAi session storage.
       */
      const storedSession = await AsyncStorage.getItem(
        'gabai.auth.session',
      );

      console.log(
        'AUTH SESSION EXISTS:',
        !!storedSession,
      );

      let token: string | null = null;

      /*
       * Try the current session first.
       */
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);

          console.log(
            'SESSION USER:',
            session?.user?.email || 'No user',
          );

          if (
            session &&
            typeof session.token === 'string' &&
            session.token.length > 0
          ) {
            token = session.token;
          }
        } catch (error) {
          console.log(
            'SESSION PARSE ERROR:',
            error,
          );
        }
      }

      /*
       * Fallback for older stored token.
       */
      if (!token) {
        const legacyToken = await AsyncStorage.getItem(
          'gabai_token',
        );

        if (legacyToken) {
          token = legacyToken;
        }

        console.log(
          'LEGACY TOKEN EXISTS:',
          !!legacyToken,
        );
      }

      /*
       * Attach JWT Authorization header.
       */
      if (token) {
        config.headers = config.headers || {};

        config.headers.Authorization = `Bearer ${token}`;

        console.log(
          'AUTH TOKEN:',
          `${token.substring(0, 20)}...`,
        );

        console.log(
          'AUTH HEADER ATTACHED: YES',
        );
      } else {
        console.log(
          'AUTH TOKEN: NO TOKEN',
        );

        console.log(
          'AUTH HEADER ATTACHED: NO TOKEN',
        );
      }

      /*
       * Only set JSON Content-Type when
       * the request actually contains a body.
       */
      if (
        config.data !== undefined &&
        config.data !== null
      ) {
        config.headers = config.headers || {};

        config.headers['Content-Type'] =
          'application/json';
      } else {
        delete config.headers?.['Content-Type'];
      }

      console.log(
        'FULL REQUEST URL:',
        `${config.baseURL}${config.url}`,
      );

      console.log(
        '================================',
      );

      return config;
    } catch (error) {
      console.error(
        'API AUTH INTERCEPTOR ERROR:',
        error,
      );

      return config;
    }
  },
  (error) => {
    console.log(
      'API REQUEST INTERCEPTOR ERROR:',
      error,
    );

    return Promise.reject(error);
  },
);

export default api;
