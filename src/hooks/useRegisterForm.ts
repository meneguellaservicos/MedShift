import { useCallback } from 'react';
import { useFormValidation } from './useFormValidation';
import { RegisterFormData, validateRegisterForm } from '../utils/validation';

interface UseRegisterFormOptions {
  onRegister: (userData: { name: string; email: string; password: string; specialty?: string }) => void | Promise<void>;
}

export function useRegisterForm({ onRegister }: UseRegisterFormOptions) {
  const initialData: RegisterFormData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    specialty: ''
  };

  const handleSubmit = useCallback(async (data: RegisterFormData) => {
    await onRegister({
      name: data.name.trim(),
      email: data.email,
      password: data.password,
      specialty: data.specialty?.trim() || undefined,
    });
  }, [onRegister]);

  const formValidation = useFormValidation({
    initialData,
    validateFunction: validateRegisterForm,
    onSubmit: handleSubmit
  });

  return formValidation;
} 