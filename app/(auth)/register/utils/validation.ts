import { checkEmail, checkName, checkNewPassword } from '@/utils/formValidation';
import { RegisterFormData, RegisterFormErrors } from '../types';

export function validateRegisterForm(data: RegisterFormData): {
  isValid: boolean;
  errors: RegisterFormErrors;
} {
  const errors: RegisterFormErrors = {};

  const name = checkName(data.name);
  const email = checkEmail(data.email);
  const password = checkNewPassword(data.password);

  if (name) errors.name = name;
  if (email) errors.email = email;
  if (password) errors.password = password;

  return { isValid: !name && !email && !password, errors };
}
