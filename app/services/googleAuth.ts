import { TurboModuleRegistry } from 'react-native';

const GOOGLE_WEB_CLIENT_ID =
  '532975186614-ac3jtooa56dclahi8q72m8baa5l8gc94.apps.googleusercontent.com';

// Returns null when the native module is not in this build (e.g. Expo Go).
// The check runs before require() because loading the package without its
// native module throws an Invariant Violation that React Native reports
// as an error even when it is caught.
export function getGoogleSignin() {
  if (!TurboModuleRegistry.get('RNGoogleSignin')) {
    return null;
  }

  try {
    const googleSignInModule = require('@react-native-google-signin/google-signin');
    return googleSignInModule?.GoogleSignin ?? googleSignInModule?.default?.GoogleSignin ?? null;
  } catch {
    return null;
  }
}

export function configureGoogleSignIn() {
  const GoogleSignin = getGoogleSignin();

  if (!GoogleSignin) {
    console.warn('Google Sign-In is unavailable in this build.');
    return false;
  }

  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  return true;
}
