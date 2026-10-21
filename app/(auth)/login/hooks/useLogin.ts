import { useEffect, useState } from "react";
import { AppAlert } from '@/components/AppAlert';
import { useRouter } from "expo-router";

import api from "@/app/services/api";
import { useAuth } from "@/app/context/AuthContext";
import { validateLoginForm } from "../utils";
import { configureGoogleSignIn, getGoogleSignin } from "@/app/services/googleAuth";

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

      // Account exists but the email is not verified yet.
      if (error?.response?.data?.errors?.code === "EMAIL_NOT_VERIFIED") {
        const unverifiedEmail =
          error.response.data.errors.email ?? email.trim().toLowerCase();

        AppAlert.alert(
          "Verify your email",
          error.response.data.message ??
            "Please verify your email before logging in.",
          [
            {
              text: "Enter code",
              onPress: () =>
                router.push({
                  pathname: "/(auth)/verify-email/verify-email",
                  params: { email: unverifiedEmail },
                }),
            },
          ],
        );
        return;
      }

      // Wrong email or password: show it on the form, not in a popup.
      // Both fields turn red; the message shows under the password.
      // (Google accounts without a password keep their own message.)
      const status = error?.response?.status;
      const serverMessage: string = error?.response?.data?.message ?? "";
      const isWrongCredentials =
        status === 401 && !/google/i.test(serverMessage);

      if (isWrongCredentials) {
        setEmailError(" ");
        setPasswordError("Incorrect email or password.");
        return;
      }

      let errorMessage = "An error occurred during login. Please try again.";

      if (serverMessage) {
        errorMessage = serverMessage;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      AppAlert.alert("Login Failed", errorMessage);
    }
  };

  // ============================================================
  // GOOGLE LOGIN
  // ============================================================

  const handleGoogleLogin = async () => {
    if (isLoading) {
      return;
    }

    const GoogleSignin = getGoogleSignin();

    if (!GoogleSignin) {
      setIsLoading(false);
      AppAlert.alert(
        "Google Sign-In unavailable",
        "Google authentication is not available in this environment.",
      );
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
      const response = await api.post("/auth/google", {
        idToken: firebaseIdToken,
      });

      // Never log the whole response: it contains the access and refresh tokens.
      console.log("GABAI GOOGLE AUTH RESPONSE USER:", response.data?.user);

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

      AppAlert.alert("Google Login Failed", errorMessage);
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
