import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import api from '@/app/services/api';
import { useAuth } from '@/app/context/AuthContext';
import { validateLoginForm } from '../utils';

function decodeJwtPayload(token: string) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = atob(normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '='));
    return JSON.parse(decodedPayload);
  } catch {
    return null;
  }
}

export function useLogin() {
  const router = useRouter();
  const { signIn } = useAuth();

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Focus States
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Validation States
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = async () => {
    const { isValid, errors } = validateLoginForm({ email, password });
    setEmailError(errors.email || '');
    setPasswordError(errors.password || '');

    if (!isValid) return;

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
      const token = responseToken || authorizationHeader?.replace(/^Bearer\s+/i, '');
      const loggedInUser = authorizationHeader
        ? decodeJwtPayload(authorizationHeader.replace(/^Bearer\s+/i, ''))
        : responseToken
          ? decodeJwtPayload(responseToken)
          : response.data?.user;
      const currentSession = response.data?.session || response.data;
      const currentUser = response.data?.user || currentSession?.user || loggedInUser || { email };

      if (!token) {
        throw new Error('Login succeeded without an authentication token.');
      }

      await signIn({ token, user: currentUser });

      const currentUserName =
        currentUser?.name ||
        currentUser?.fullName ||
        currentUser?.userName ||
        currentUser?.email ||
        'Unknown user';

      console.log('CURRENT SESSION:', currentSession);
      console.log('CURRENT USER NAME:', currentUserName);

      setIsLoading(false);
      router.replace('/(tabs)/dashboard/dashboard');
    } catch (error: any) {
      setIsLoading(false);
      let errorMessage = 'An error occurred during login. Please try again.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Login Failed', errorMessage);
    }
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(tabs)/dashboard/dashboard');
    }, 1200);
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password/forgot-password');
  };

  const handleNavigateRegister = () => {
    router.replace('/(auth)/register/register');
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
