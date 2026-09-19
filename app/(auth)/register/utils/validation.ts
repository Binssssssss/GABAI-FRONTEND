import { RegisterFormData, RegisterFormErrors } from '../types';

export function validateRegisterForm(data: RegisterFormData): {
  isValid: boolean;
  errors: RegisterFormErrors;
} {
  const errors: RegisterFormErrors = {};
  let isValid = true;

  if (!data.name.trim()) {
    errors.name = 'Full name is required';
    isValid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email) {
    errors.email = 'Email address is required';
    isValid = false;
  } else if (!emailRegex.test(data.email)) {
    errors.email = 'Please enter a valid email address';
    isValid = false;
  }

  if (!data.password) {
    errors.password = 'Password is required';
    isValid = false;
  } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
    isValid = false;
  }

  return { isValid, errors };
}
