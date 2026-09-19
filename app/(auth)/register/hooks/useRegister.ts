import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import api from '@/app/services/api';
import { validateRegisterForm } from '../utils';

export function useRegister() {
  const router = useRouter();

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Focus States
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Validation Errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleRegister = async () => {
    const { isValid, errors } = validateRegisterForm({ name, email, password });
    setNameError(errors.name || '');
    setEmailError(errors.email || '');
    setPasswordError(errors.password || '');

    if (!isValid) return;

    setIsLoading(true);
    try {
      await api.post('/api/auth/register', {
        fullName: name,
        email: email,
        password: password,
      });

      setIsLoading(false);
      Alert.alert(
        'Success',
        'Account created successfully! Please log in.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login/login'),
          },
        ]
      );
    } catch (error: any) {
      setIsLoading(false);
      let errorMessage = 'An error occurred during registration. Please try again.';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (
        errorMessage.toLowerCase().includes('email already exists') ||
        errorMessage.toLowerCase().includes('email is already')
      ) {
        setEmailError(errorMessage);
      } else {
        Alert.alert('Registration Failed', errorMessage);
      }
    }
  };

  const handleGoogleSignup = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(tabs)/expenses/expenses');
    }, 1200);
  };

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    passwordVisible,
    setPasswordVisible,
    isLoading,
    isNameFocused,
    setIsNameFocused,
    isEmailFocused,
    setIsEmailFocused,
    isPasswordFocused,
    setIsPasswordFocused,
    nameError,
    setNameError,
    emailError,
    setEmailError,
    passwordError,
    setPasswordError,
    handleRegister,
    handleGoogleSignup,
  };
}
