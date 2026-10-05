import { GoogleSignin } from '@react-native-google-signin/google-signin';

export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId:
      '532975186614-ac3jtooa56dclahi8q72m8baa5l8gc94.apps.googleusercontent.com',
  });
}