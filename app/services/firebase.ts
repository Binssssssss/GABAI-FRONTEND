import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Persistence,
} from 'firebase/auth';

// Firebase ships getReactNativePersistence only in its React Native build
// (which Metro uses at runtime), but TypeScript resolves the web typings.
// Declare it here with the same signature as Firebase's RN typings.
declare module 'firebase/auth' {
  export function getReactNativePersistence(
    storage: typeof ReactNativeAsyncStorage,
  ): Persistence;
}

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

console.log('========== FIREBASE CONFIG CHECK ==========');
console.log('API KEY EXISTS:', !!firebaseConfig.apiKey);
console.log('API KEY LENGTH:', firebaseConfig.apiKey?.length);
console.log('AUTH DOMAIN:', firebaseConfig.authDomain);
console.log('PROJECT ID:', firebaseConfig.projectId);
console.log('STORAGE BUCKET:', firebaseConfig.storageBucket);
console.log('SENDER ID:', firebaseConfig.messagingSenderId);
console.log('APP ID:', firebaseConfig.appId);
console.log('===========================================');

const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// Persist Firebase Auth state on the device (otherwise it lives in memory
// only and Firebase warns on every start). initializeAuth can only run once
// per app, so after a Fast Refresh reuse the existing instance.
const createFirebaseAuth = (): Auth => {
  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch {
    return getAuth(firebaseApp);
  }
};

export const firebaseAuth = createFirebaseAuth();

export default firebaseApp;