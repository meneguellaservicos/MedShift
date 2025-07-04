import { useState, useCallback } from 'react';
import { ValidationErrors, ValidationResult, clearValidationError } from '../utils/validation';

interface UseFormValidationOptions<T> {
  initialData: T;
  validateFunction: (data: T) => ValidationResult;
  onSubmit: (data: T) => void | Promise<void>;
}

export function useFormValidation<T extends Record<string, any>>({
  initialData,
  validateFunction,
  onSubmit
}: UseFormValidationOptions<T>) {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => clearValidationError(prev, field as string));
    }
  }, [errors]);

  const validateField = useCallback((field: keyof T) => {
    const validation = validateFunction(formData);
    if (validation.errors[field as string]) {
      setErrors(prev => ({ ...prev, [field]: validation.errors[field as string] }));
      return false;
    }
    return true;
  }, [formData, validateFunction]);

  const validateForm = useCallback(() => {
    const validation = validateFunction(formData);
    setErrors(validation.errors);
    return validation.isValid;
  }, [formData, validateFunction]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const isValid = validateForm();

    if (!isValid) {
      return false;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onSubmit]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);

  const setFormErrors = useCallback((newErrors: ValidationErrors) => {
    setErrors(newErrors);
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    validateField,
    validateForm,
    handleSubmit,
    resetForm,
    setFormErrors,
    setFormData
  };
} 