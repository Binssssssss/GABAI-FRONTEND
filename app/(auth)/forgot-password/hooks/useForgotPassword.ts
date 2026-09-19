import { useState } from 'react';
import { useRouter } from 'expo-router';
import { validateForgotPasswordEmail } from '../utils';

export function useForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleResetPassword = () => {
    setEmailError('');
    const { isValid, error } = validateForgotPasswordEmail(email);

    if (!isValid) {
      setEmailError(error || '');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

  const handleBack = () => {
    router.back();
  };

  return {
    email,
    setEmail,
    isFocused,
    setIsFocused,
    emailError,
    setEmailError,
    isLoading,
    isSent,
    handleResetPassword,
    handleBack,
  };
}
