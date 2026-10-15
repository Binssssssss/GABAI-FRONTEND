
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { InternalAxiosRequestConfig, isCancel } from 'axios';

import { recordTaskActivity } from '@/app/services/activityLog';

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

// Connection failures (no response at all) are usually brief, e.g.
// the phone's network isn't ready yet or the Render server is waking
// up. Retry those a few times, waiting a bit longer each time.
// Only GET requests are retried: retrying a POST/PUT/DELETE could
// apply it twice if the server already handled the first attempt.
const RETRY_DELAYS_MS = [2000, 5000];

type RetryableConfig = InternalAxiosRequestConfig & {
  _retryCount?: number;
};

const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Distinguish HTTP errors from connection failures.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (isCancel(error)) {
      return Promise.reject(error);
    }

    // An expired token on logout is expected; the caller clears the session.
    const isExpiredLogout =
      error.response?.status === 401 &&
      error.config?.url === '/auth/logout';

    // Unregistering a token the backend no longer has is expected;
    // unregisterPushToken treats it as success.
    const isMissingPushToken =
      error.response?.status === 404 &&
      error.config?.method?.toLowerCase() === 'delete' &&
      error.config?.url === '/notifications/push-token';

    if (isExpiredLogout || isMissingPushToken) {
      return Promise.reject(error);
    }

    const config = error.config as RetryableConfig | undefined;
    const endpoint = `${config?.method?.toUpperCase() ?? ''} ${config?.url ?? ''}`;

    if (error.response) {
      console.error(
        `GabAi API error ${error.response.status}: ${endpoint}`,
      );

      // Response bodies can contain personal data; keep them out of
      // release-build logs.
      if (__DEV__) {
        console.error('RESPONSE:', error.response.data);
      }

      return Promise.reject(error);
    }

    const retryCount = config?._retryCount ?? 0;
    const canRetry =
      config !== undefined &&
      (config.method ?? 'get').toLowerCase() === 'get' &&
      retryCount < RETRY_DELAYS_MS.length;

    if (canRetry) {
      config._retryCount = retryCount + 1;

      console.log(
        `GabAi network issue (${error.message}), retrying ${endpoint} ` +
          `(${config._retryCount}/${RETRY_DELAYS_MS.length})...`,
      );

      await wait(RETRY_DELAYS_MS[retryCount]);

      return api(config);
    }

    console.warn(
      `GabAi network error: ${error.message} (${endpoint})` +
        (retryCount > 0 ? ` after ${retryCount} retries` : ''),
    );

    return Promise.reject(error);
  },
);

// Keep the on-phone Activity history up to date with task changes.
api.interceptors.response.use((response) => {
  recordTaskActivity(response);
  return response;
});

export default api;
