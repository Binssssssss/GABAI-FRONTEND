import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://192.168.254.158:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const session = await AsyncStorage.getItem('gabai.auth.session');
  const legacyToken = await AsyncStorage.getItem('gabai_token');

  try {
    const token = session
      ? JSON.parse(session).token
      : legacyToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    if (legacyToken) {
      config.headers.Authorization = `Bearer ${legacyToken}`;
    }
  }

  return config;
});

export default api;