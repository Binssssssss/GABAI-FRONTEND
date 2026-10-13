import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

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

export const firebaseAuth = getAuth(firebaseApp);

export default firebaseApp;