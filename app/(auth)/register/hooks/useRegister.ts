import { useState } from 'react';
import { AppAlert } from '@/components/AppAlert';
import { useRouter } from 'expo-router';
import api from '@/app/services/api';
import { validateRegisterForm } from '../utils';
import { cleanSpaces } from '@/utils/formValidation';

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
      const cleanEmail = email.trim().toLowerCase();

      await api.post('/auth/register', {
        fullName: cleanSpaces(name),
        email: cleanEmail,
        password: password,
      });

      setIsLoading(false);

      // Next step: enter the 6-digit code sent to this email.
      router.replace({
        pathname: '/(auth)/verify-email/verify-email',
        params: { email: cleanEmail },
      });
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
        AppAlert.alert('Registration Failed', errorMessage);
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
