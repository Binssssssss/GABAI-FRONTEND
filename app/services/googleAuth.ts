export function configureGoogleSignIn() {
  try {
    const googleSignInModule = require('@react-native-google-signin/google-signin');
    const GoogleSignin = googleSignInModule?.GoogleSignin ?? googleSignInModule?.default?.GoogleSignin;

    if (!GoogleSignin) {
      return false;
    }

    GoogleSignin.configure({
      webClientId:
        '532975186614-ac3jtooa56dclahi8q72m8baa5l8gc94.apps.googleusercontent.com',
    });

    return true;
  } catch (error) {
    console.warn('Google Sign-In is unavailable in this environment.', error);
    return false;
  }
}