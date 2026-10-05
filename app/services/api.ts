
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const api = axios.create({
  baseURL:
    process.env.EXPO_PUBLIC_API_URL ||
    'http://192.168.1.39:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    console.log('========== API REQUEST ==========');
    console.log('BASE URL:', config.baseURL);
    console.log('URL:', config.url);
    console.log('METHOD:', config.method);

    try {
      // Primary session storage
      const session = await AsyncStorage.getItem(
        'gabai.auth.session'
      );

      console.log(
        'AUTH SESSION EXISTS:',
        !!session
      );

      let token: string | null = null;

      if (session) {
        try {
          const parsed = JSON.parse(session);

          console.log(
            'SESSION USER:',
            parsed?.user?.email || 'No user'
          );

          // Current GabAi session structure
          token = parsed?.token || null;

          console.log(
            'SESSION TOKEN EXISTS:',
            !!token
          );
        } catch (error) {
          console.log(
            'SESSION PARSE ERROR:',
            error
          );
        }
      }

      // Fallback for older login storage
      if (!token) {
        token = await AsyncStorage.getItem(
          'gabai_token'
        );

        console.log(
          'LEGACY TOKEN EXISTS:',
          !!token
        );
      }

      // Attach Authorization header
      if (token) {
        config.headers = config.headers || {};

        config.headers.Authorization =
          `Bearer ${token}`;

        console.log(
          'AUTH HEADER ATTACHED: YES'
        );
      } else {
        console.log(
          'AUTH HEADER ATTACHED: NO TOKEN'
        );
      }

      console.log(
        'FULL REQUEST URL:',
        `${config.baseURL}${config.url}`
      );
      console.log(
        '================================'
      );

      return config;
    } catch (error) {
      console.log(
        'API AUTH INTERCEPTOR ERROR:',
        error
      );

      return config;
    }
  },
  (error) => {
    console.log(
      'API REQUEST INTERCEPTOR ERROR:',
      error
    );

    return Promise.reject(error);
  }
);

export default api;

