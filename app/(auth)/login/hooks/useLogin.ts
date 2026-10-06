import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

import api from "@/app/services/api";
import { useAuth } from "@/app/context/AuthContext";
import { validateLoginForm } from "../utils";
import { configureGoogleSignIn } from "@/app/services/googleAuth";

import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { firebaseAuth } from "@/app/services/firebase";

function decodeJwtPayload(token: string) {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");

    const decodedPayload = atob(
      normalizedPayload.padEnd(
        Math.ceil(normalizedPayload.length / 4) * 4,
        "=",
      ),
    );

    return JSON.parse(decodedPayload);
  } catch {
    return null;
  }
}

export function useLogin() {
  const router = useRouter();
  const { signIn } = useAuth();

  // Configure Google Sign-In once when the login screen loads.
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Focus States
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Validation States
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // ============================================================
  // NORMAL EMAIL/PASSWORD LOGIN
  // ============================================================

  const handleLogin = async () => {
    const { isValid, errors } = validateLoginForm({
      email,
      password,
    });

    setEmailError(errors.email || "");
    setPasswordError(errors.password || "");

    if (!isValid) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const authorizationHeader = response.headers.authorization;

      const responseToken =
        response.data?.token ||
        response.data?.accessToken ||
        response.data?.access_token;

      const token =
        responseToken || authorizationHeader?.replace(/^Bearer\s+/i, "");

      const loggedInUser = authorizationHeader
        ? decodeJwtPayload(authorizationHeader.replace(/^Bearer\s+/i, ""))
        : responseToken
          ? decodeJwtPayload(responseToken)
          : response.data?.user;

      const currentSession = response.data?.session || response.data;

      const currentUser = response.data?.user ||
        currentSession?.user ||
        loggedInUser || { email };

      if (!token) {
        throw new Error("Login succeeded without an authentication token.");
      }

      // Save GabAi JWT to AuthContext + AsyncStorage.
      await signIn({
        token,
        refreshToken: response.data?.refreshToken,
        user: currentUser,
      });

      console.log("NORMAL LOGIN SUCCESS");
      console.log("CURRENT USER:", currentUser);

      setIsLoading(false);

      router.replace("/(tabs)/dashboard/dashboard");
    } catch (error: any) {
      setIsLoading(false);

      let errorMessage = "An error occurred during login. Please try again.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert("Login Failed", errorMessage);
    }
  };

  // ============================================================
  // GOOGLE LOGIN
  // ============================================================

  const handleGoogleLogin = async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      // Check that Google Play Services are available.
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Clear the previous Google Sign-In session
      try {
        await GoogleSignin.signOut();
      } catch {
        // Ignore if there is no active Google Sign-In session
      }

      const googleResult = await GoogleSignin.signIn();
      console.log("GOOGLE SIGN-IN SUCCESS");

      // Get Google ID token.
      const googleIdToken = googleResult.data?.idToken;

      if (!googleIdToken) {
        throw new Error("Google Sign-In did not return an ID token.");
      }

      console.log("GOOGLE ID TOKEN RECEIVED");

      // Create Firebase Google credential.
      const credential = GoogleAuthProvider.credential(googleIdToken);

      // Sign in to Firebase.
      const firebaseResult = await signInWithCredential(
        firebaseAuth,
        credential,
      );

      console.log("FIREBASE SIGN-IN SUCCESS");

      // Get Firebase ID token.
      const firebaseIdToken = await firebaseResult.user.getIdToken(true);

      if (!firebaseIdToken) {
        throw new Error("Firebase did not return an ID token.");
      }

      console.log("FIREBASE ID TOKEN RECEIVED");

      // Send Firebase ID token to GabAi backend.
      const response = await api.post("/api/auth/google", {
        idToken: firebaseIdToken,
      });

      console.log("GABAI GOOGLE AUTH RESPONSE:", response.data);

      // Get GabAi JWT.
      const token =
        response.data?.token ||
        response.data?.accessToken ||
        response.data?.access_token;

      const refreshToken = response.data?.refreshToken;

      const currentUser = response.data?.user;

      if (!token) {
        throw new Error(
          "Google login succeeded, but GabAi did not return an authentication token.",
        );
      }

      // Save GabAi JWT to AuthContext + AsyncStorage.
      await signIn({
        token,
        refreshToken,
        user: currentUser,
      });

      console.log("GABAI GOOGLE LOGIN SUCCESS");

      console.log("GABAI USER:", currentUser);

      setIsLoading(false);

      // Navigate only after authentication
      // and token storage are successful.
      router.replace("/(tabs)/dashboard/dashboard");
    } catch (error: any) {
      setIsLoading(false);

      // User cancelled Google account selection.
      if (error?.code === "SIGN_IN_CANCELLED" || error?.code === "12501") {
        return;
      }

      console.error("GOOGLE LOGIN ERROR:", error);

      let errorMessage = "Google login failed. Please try again.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert("Google Login Failed", errorMessage);
    }
  };

  // ============================================================
  // OTHER AUTH ACTIONS
  // ============================================================

  const handleForgotPassword = () => {
    router.push("/(auth)/forgot-password/forgot-password");
  };

  const handleNavigateRegister = () => {
    router.replace("/(auth)/register/register");
  };

  return {
    email,
    setEmail,

    password,
    setPassword,

    passwordVisible,
    setPasswordVisible,

    isLoading,

    isEmailFocused,
    setIsEmailFocused,

    isPasswordFocused,
    setIsPasswordFocused,

    emailError,
    setEmailError,

    passwordError,
    setPasswordError,

    handleLogin,
    handleGoogleLogin,

    handleForgotPassword,
    handleNavigateRegister,
  };
}
