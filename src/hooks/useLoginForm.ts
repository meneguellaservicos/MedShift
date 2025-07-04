import { useCallback } from 'react';
import { useFormValidation } from './useFormValidation';
import { LoginFormData, validateLoginForm } from '../utils/validation';

interface UseLoginFormOptions {
  onLogin: (email: string, password: string) => void | Promise<void>;
}

export function useLoginForm({ onLogin }: UseLoginFormOptions) {
  const initialData: LoginFormData = {
    email: '',
    password: ''
  };

  const handleSubmit = useCallback(async (data: LoginFormData) => {
    await onLogin(data.email, data.password);
  }, [onLogin]);

  const formValidation = useFormValidation({
    initialData,
    validateFunction: validateLoginForm,
    onSubmit: handleSubmit
  });

  return formValidation;
} 