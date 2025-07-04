// Validações de email e senha
import { getValidationConfig } from '../config';

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (password.length < 8) {
    errors.push('Mínimo de 8 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Pelo menos uma letra maiúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Pelo menos uma letra minúscula');
  }
  if (!/\d/.test(password)) {
    errors.push('Pelo menos um número');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Pelo menos um caractere especial');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Tipos para validação de formulários
export interface ValidationErrors {
  [key: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

// Validação de formulário de login
export interface LoginFormData {
  email: string;
  password: string;
}

export function validateLoginForm(data: LoginFormData): ValidationResult {
  const errors: ValidationErrors = {};

  // Email validation
  if (!data.email.trim()) {
    errors.email = 'Email é obrigatório';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Formato de email inválido';
  }

  // Password validation
  if (!data.password.trim()) {
    errors.password = 'Senha é obrigatória';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Validação de formulário de registro
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  specialty?: string;
}

export function validateRegisterForm(data: RegisterFormData): ValidationResult {
  const errors: ValidationErrors = {};

  // Name validation
  if (!data.name.trim()) {
    errors.name = 'Nome é obrigatório';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Nome deve ter pelo menos 2 caracteres';
  }

  // Email validation
  if (!data.email.trim()) {
    errors.email = 'Email é obrigatório';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Formato de email inválido';
  }

  // Password validation
  if (!data.password.trim()) {
    errors.password = 'Senha é obrigatória';
  } else {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors.join(', ');
    }
  }

  // Confirm password validation
  if (!data.confirmPassword.trim()) {
    errors.confirmPassword = 'Confirmação de senha é obrigatória';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Senhas não coincidem';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Validação de formulário de perfil
export interface ProfileFormData {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function validateProfileForm(data: ProfileFormData): ValidationResult {
  const errors: ValidationErrors = {};

  // Email validation
  if (!data.email.trim()) {
    errors.email = 'Email é obrigatório';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Formato de email inválido';
  }

  // Password validation (only if user is trying to change password)
  if (data.newPassword || data.confirmPassword || data.currentPassword) {
    if (!data.currentPassword) {
      errors.currentPassword = 'Senha atual é obrigatória para alterações';
    }
    
    if (data.newPassword) {
      const passwordValidation = validatePassword(data.newPassword);
      if (!passwordValidation.isValid) {
        errors.newPassword = passwordValidation.errors.join(', ');
      }
    }
    
    if (data.newPassword !== data.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Validação específica para quando o usuário é forçado a trocar a senha
export function validateForcePasswordChange(data: ProfileFormData): ValidationResult {
  const errors: ValidationErrors = {};

  // Email validation
  if (!data.email.trim()) {
    errors.email = 'Email é obrigatório';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Formato de email inválido';
  }

  // Password validation (obrigatória quando forçado)
  if (!data.currentPassword) {
    errors.currentPassword = 'Senha atual é obrigatória';
  }
  
  if (!data.newPassword) {
    errors.newPassword = 'Nova senha é obrigatória';
  } else {
    const passwordValidation = validatePassword(data.newPassword);
    if (!passwordValidation.isValid) {
      errors.newPassword = passwordValidation.errors.join(', ');
    }
  }
  
  if (!data.confirmPassword) {
    errors.confirmPassword = 'Confirmação de senha é obrigatória';
  } else if (data.newPassword !== data.confirmPassword) {
    errors.confirmPassword = 'Senhas não coincidem';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Validação de formulário de hospital
export interface HospitalFormData {
  name: string;
  hourlyRate: string;
  address: string;
  color: string;
}

export function validateHospitalForm(data: HospitalFormData): ValidationResult {
  const errors: ValidationErrors = {};

  // Name validation
  const minNameLength = getValidationConfig().MIN_NAME_LENGTH;
  if (!data.name.trim()) {
    errors.name = 'Nome do hospital é obrigatório';
  } else if (data.name.trim().length < minNameLength) {
    errors.name = `Nome deve ter pelo menos ${minNameLength} caracteres`;
  }

  // Hourly rate validation
  if (!data.hourlyRate || data.hourlyRate.trim() === '') {
    errors.hourlyRate = 'Taxa horária é obrigatória';
  } else {
    const rate = parseFloat(data.hourlyRate);
    if (isNaN(rate) || rate < 0) {
      errors.hourlyRate = 'Taxa horária deve ser um valor válido';
      } else if (rate > getValidationConfig().MAX_HOURLY_RATE) {
    errors.hourlyRate = 'Taxa horária muito alta';
  } else if (rate === 0) {
    errors.hourlyRate = 'Taxa horária deve ser maior que zero';
  }
  }

  // Address validation (optional but if provided, should be valid)
  const minAddressLength = getValidationConfig().MIN_ADDRESS_LENGTH;
  if (data.address.trim() && data.address.trim().length < minAddressLength) {
    errors.address = `Endereço deve ter pelo menos ${minAddressLength} caracteres`;
  }

  // Color validation
  if (!data.color || !/^#[0-9A-F]{6}$/i.test(data.color)) {
    errors.color = 'Cor deve ser um código hexadecimal válido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Validação de formulário de plantão
export interface ShiftFormData {
  hospitalId: string;
  startTime: string;
  endTime: string;
  notes?: string;
  selectedDates?: string[]; // Adicionando para validação
}

export function validateShiftForm(data: ShiftFormData): ValidationResult {
  const errors: ValidationErrors = {};

  // Hospital validation
  if (!data.hospitalId || data.hospitalId.trim() === '') {
    errors.hospitalId = 'Hospital é obrigatório';
  }

  // Time validation
  if (!data.startTime) {
    errors.startTime = 'Horário de início é obrigatório';
  }

  if (!data.endTime) {
    errors.endTime = 'Horário de término é obrigatório';
  }

  // Validate time logic
  if (data.startTime && data.endTime) {
    const start = new Date(`2000-01-01T${data.startTime}`);
    const end = new Date(`2000-01-01T${data.endTime}`);
    
    if (start >= end) {
      // Allow same time for 24-hour shifts
      if (data.startTime !== data.endTime) {
        errors.endTime = 'Horário de término deve ser posterior ao início';
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Função utilitária para limpar erros de validação
export function clearValidationError(errors: ValidationErrors, field: string): ValidationErrors {
  const newErrors = { ...errors };
  delete newErrors[field];
  return newErrors;
}

// Função para obter força da senha
export function getPasswordStrength(password: string): { strength: number; label: string; color: string } {
  if (!password) return { strength: 0, label: '', color: '' };
  
  const validation = validatePassword(password);
  const strength = ((5 - validation.errors.length) / 5) * 100;
  
  if (strength < 40) return { strength, label: 'Fraca', color: 'text-red-600' };
  if (strength < 70) return { strength, label: 'Média', color: 'text-yellow-600' };
  if (strength < 90) return { strength, label: 'Boa', color: 'text-blue-600' };
  return { strength, label: 'Forte', color: 'text-green-600' };
}