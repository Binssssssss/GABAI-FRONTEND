import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import api from '@/app/services/api';
import { validateLoginForm } from '../utils';

export function useLogin() {
  const router = useRouter();

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
      const response = await api.post('/api/auth/login', {
  email: email,
  password: password,
});

console.log('LOGIN RESPONSE:', response.data);

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
