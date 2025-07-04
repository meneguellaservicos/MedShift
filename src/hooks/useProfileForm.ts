import { useCallback, useEffect } from 'react';
import { useFormValidation } from './useFormValidation';
import { ProfileFormData, validateProfileForm, validateForcePasswordChange } from '../utils/validation';
import { User } from '../types';

interface UseProfileFormOptions {
  user: User | null;
  onUpdateProfile: (updates: { email?: string; passwordChanged?: boolean }) => void;
}

export function useProfileForm({ user, onUpdateProfile }: UseProfileFormOptions) {
  const initialData: ProfileFormData = {
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  const handleSubmit = useCallback(async (data: ProfileFormData) => {
    // Simulate current password verification
    // In a real app, this would be verified against the backend
    if (data.currentPassword && data.currentPassword !== '123456' && data.currentPassword !== 'admin123') {
      throw new Error('Senha atual incorreta');
    }

    const updates: { email?: string; passwordChanged?: boolean } = {};

    // Update email if changed
    if (data.email !== user?.email) {
      updates.email = data.email;
    }

    // Simulate password update
    if (data.newPassword) {
      updates.passwordChanged = true;
    }

    onUpdateProfile(updates);
  }, [user, onUpdateProfile]);

  const formValidation = useFormValidation({
    initialData,
    validateFunction: user?.forcePasswordChange ? validateForcePasswordChange : validateProfileForm,
    onSubmit: handleSubmit
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      formValidation.setFormData(prev => ({
        ...prev,
        email: user.email
      }));
    }
  }, [user]);

  return formValidation;
} 