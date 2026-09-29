import { create } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = create({
  baseURL:
    process.env.EXPO_PUBLIC_API_URL ||
    'http://[IP_ADDRESS]',

  timeout: 10000,

  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const storedSession = await AsyncStorage.getItem('gabai.auth.session');
      const legacyToken = await AsyncStorage.getItem('gabai_token');

      let token: string | null = null;

      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);

          if (session?.token) {
            token = session.token;
          }
        } catch {
          // Ignore invalid stored session and fall back to legacy token.
        }
      }

      if (!token && legacyToken) {
        token = legacyToken;
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to attach authentication token:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;