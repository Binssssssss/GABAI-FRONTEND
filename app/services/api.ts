
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { InternalAxiosRequestConfig, isCancel } from 'axios';

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

      config.headers = config.headers ?? {};

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

export default api;
