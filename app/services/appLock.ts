import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'gabai.settings.appLock';

export async function isAppLockEnabled(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function setAppLockEnabled(enabled: boolean): Promise<void> {
  try {
    if (enabled) {
      await AsyncStorage.setItem(KEY, 'true');
    } else {
      await AsyncStorage.removeItem(KEY);
    }
  } catch (error) {
    console.error('Failed to save app lock setting:', error);
  }
}