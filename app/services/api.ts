
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const DEFAULT_API_URL =
  'https://gabai-backend-bk7i.onrender.com';

const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL
)
  .trim()
  .replace(/\/+$/, '');

const API_BASE_URL = API_URL.endsWith('/api')
  ? API_URL
  : `${API_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach the existing GabAi authentication token.
api.interceptors.request.use(
  async (config) => {
    try {
      const storedSession = await AsyncStorage.getItem(
        'gabai.auth.session',
      );

      let token: string | null = null;

      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);

          if (
            typeof session?.token === 'string' &&
            session.token.trim().length > 0
          ) {
            token = session.token;
          }
        } catch (error) {
          console.error(
            'Failed to parse GabAi session:',
            error,
          );
        }
      }

      if (!token) {
        token = await AsyncStorage.getItem('gabai_token');
      }

      if (token) {
        config.headers.set(
          'Authorization',
          `Bearer ${token}`,
        );
      }

      if (config.data !== undefined && config.data !== null) {
        config.headers.set(
          'Content-Type',
          'application/json',
        );
      }

      console.log('========== GABAI API REQUEST ==========');
      console.log('BASE URL:', config.baseURL);
      console.log('METHOD:', config.method?.toUpperCase());
      console.log('ENDPOINT:', config.url);
      console.log(
        'FULL REQUEST URL:',
        `${config.baseURL}${config.url ?? ''}`,
      );
      console.log('AUTH TOKEN EXISTS:', Boolean(token));
      console.log('=======================================');

      return config;
    } catch (error) {
      console.error(
        'GabAi API request setup failed:',
        error,
      );
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error),
);

// Distinguish HTTP errors from connection failures.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // An expired token on logout is expected; the caller clears the session.
    const isExpiredLogout =
      error.response?.status === 401 &&
      error.config?.url === '/auth/logout';

    if (isExpiredLogout) {
      return Promise.reject(error);
    }

    if (error.response) {
      console.error('========== GABAI API ERROR ==========');
      console.error('STATUS:', error.response.status);
      console.error('URL:', error.config?.url);
      console.error('RESPONSE:', error.response.data);
      console.error('=====================================');
    } else {
      console.error('========== NETWORK ERROR ==========');
      console.error('MESSAGE:', error.message);
      console.error('BASE URL:', error.config?.baseURL);
      console.error('ENDPOINT:', error.config?.url);
      console.error(
        'FULL URL:',
        `${error.config?.baseURL ?? ''}${error.config?.url ?? ''}`,
      );
      console.error('===================================');
    }

    return Promise.reject(error);
  },
);

export default api;
