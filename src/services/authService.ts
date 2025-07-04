// Serviço de autenticação com controle de usuários e superusuário
import { User, AuditLog, LoginAttempt } from '../types';
import { createNewUserNotification, saveNotification } from './notificationService';
import { userRepository } from '../repositories';
import { getMaxLoginAttempts, getBlockDuration, getAuthConfig } from '../config';

// Dados simulados em localStorage (para audit logs e login attempts)
const AUDIT_LOGS_KEY = 'medshift-audit-logs';
const LOGIN_ATTEMPTS_KEY = 'medshift-login-attempts';

// Inicializar dados padrão se não existirem
const initializeDefaultData = async () => {
  const users = await userRepository.getAll();
  if (users.length === 0) {
    const defaultSuperUser: Omit<User, 'id'> = {
      name: 'Administrador',
      email: 'admin@medshift.com',
      specialty: 'Administração',
      role: 'superuser',
      status: 'active',
      createdAt: new Date().toISOString(),
      twoFactorEnabled: true,
    };
    await userRepository.create(defaultSuperUser);
  }

  if (!localStorage.getItem(AUDIT_LOGS_KEY)) {
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify([]));
  }

  if (!localStorage.getItem(LOGIN_ATTEMPTS_KEY)) {
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify([]));
  }
};

// Função para gerar senha temporária
const generateTemporaryPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Função para registrar logs de auditoria
const logAuditAction = (action: string, details: string, userId: string, userEmail: string, targetUserId?: string, targetUserEmail?: string) => {
  const logs: AuditLog[] = JSON.parse(localStorage.getItem(AUDIT_LOGS_KEY) || '[]');
  const newLog: AuditLog = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    userId,
    userEmail,
    action,
    details,
    timestamp: new Date().toISOString(),
    targetUserId,
    targetUserEmail,
  };
  logs.push(newLog);
  localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs));
};

// Função para registrar tentativas de login
const logLoginAttempt = (email: string, success: boolean) => {
  const attempts: LoginAttempt[] = JSON.parse(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '[]');
  const newAttempt: LoginAttempt = {
    email,
    success,
    timestamp: new Date().toISOString(),
  };
  attempts.push(newAttempt);
  
  // Manter apenas os últimos registros conforme configuração
  const maxAttempts = getAuthConfig().MAX_LOGIN_ATTEMPTS_HISTORY;
  if (attempts.length > maxAttempts) {
    attempts.splice(0, attempts.length - maxAttempts);
  }
  
  localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
};

// Função para verificar se conta está bloqueada por tentativas falhadas
const isAccountLocked = (email: string): boolean => {
  const attempts: LoginAttempt[] = JSON.parse(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '[]');
  const blockDuration = getBlockDuration();
  const maxAttempts = getMaxLoginAttempts();
  
  const recentFailedAttempts = attempts.filter(
    attempt => attempt.email === email && 
    !attempt.success && 
    new Date(attempt.timestamp) > new Date(Date.now() - blockDuration)
  );
  return recentFailedAttempts.length >= maxAttempts;
};

export async function login(email: string, password: string): Promise<User | null> {
  await initializeDefaultData();
  
  // Verificar se conta está bloqueada
  if (isAccountLocked(email)) {
    logLoginAttempt(email, false);
    const blockDurationMinutes = Math.floor(getBlockDuration() / (60 * 1000));
    throw new Error(`Conta temporariamente bloqueada devido a múltiplas tentativas de login. Tente novamente em ${blockDurationMinutes} minutos.`);
  }

  const user = await userRepository.findByEmail(email);

  if (!user || user.status !== 'active') {
    logLoginAttempt(email, false);
    throw new Error('Credenciais inválidas ou conta inativa.');
  }

  // Simular verificação de senha (em produção, seria hash + salt)
  if (password !== '123456' && password !== 'admin123') {
    logLoginAttempt(email, false);
    throw new Error('Credenciais inválidas.');
  }

  // Atualizar último login
  await userRepository.update(user.id, { lastLogin: new Date().toISOString() });

  logLoginAttempt(email, true);
  logAuditAction('LOGIN', 'Login realizado com sucesso', user.id, user.email);

  return { ...user, lastLogin: new Date().toISOString() };
}

export async function register(userData: { name: string; email: string; password: string; specialty?: string }): Promise<User> {
  await initializeDefaultData();
  
  // Verificar se email já existe
  const existingUser = await userRepository.findByEmail(userData.email);
  if (existingUser) {
    throw new Error('Email já está em uso. Tente fazer login ou use outro email.');
  }

  // Criar novo usuário
  const newUserData: Omit<User, 'id'> = {
    name: userData.name,
    email: userData.email,
    specialty: userData.specialty,
    role: 'user', // Novos usuários sempre começam como usuários comuns
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };

  const newUser = await userRepository.create(newUserData);

  logAuditAction('REGISTRO', 'Novo usuário registrado', newUser.id, newUser.email);

  // Criar notificação para superusuários
  const notification = createNewUserNotification(newUser);
  saveNotification(notification);

  return newUser;
}

export function logout(): null {
  return null;
}

export function updateUserProfile(user: User, updates: { email?: string; passwordChanged?: boolean }) {
  let updatedUser = { ...user };
  let messages: string[] = [];
  
  if (updates.email && updates.email !== user.email) {
    updatedUser.email = updates.email;
    updatedUser.name = updates.email.split('@')[0].charAt(0).toUpperCase() + updates.email.split('@')[0].slice(1);
    messages.push('Email atualizado');
  }
  
  if (updates.passwordChanged) {
    messages.push('Senha atualizada');
    // Remover a flag de força de alteração de senha
    updatedUser.forcePasswordChange = false;
  }
  
  return { updatedUser, messages };
}

// Funções de superusuário
export async function getAllUsers(): Promise<User[]> {
  await initializeDefaultData();
  return userRepository.getAll();
}

export function getAuditLogs(): AuditLog[] {
  return JSON.parse(localStorage.getItem(AUDIT_LOGS_KEY) || '[]');
}

export async function toggleUserStatus(userId: string, superUserId: string, superUserEmail: string): Promise<User> {
  const user = await userRepository.getById(userId);
  
  if (!user) {
    throw new Error('Usuário não encontrado.');
  }

  const newStatus = user.status === 'active' ? 'inactive' : 'active';
  const updatedUser = await userRepository.updateStatus(userId, newStatus);

  const action = newStatus === 'active' ? 'HABILITAR_USUARIO' : 'DESABILITAR_USUARIO';
  const details = newStatus === 'active' ? 'Usuário habilitado' : 'Usuário desabilitado';
  
  logAuditAction(action, details, superUserId, superUserEmail, userId, user.email);

  return updatedUser;
}

export async function resetUserPassword(userId: string, superUserId: string, superUserEmail: string): Promise<string> {
  const user = await userRepository.getById(userId);
  
  if (!user) {
    throw new Error('Usuário não encontrado.');
  }

  const temporaryPassword = generateTemporaryPassword();
  
  await userRepository.update(userId, { forcePasswordChange: true });

  logAuditAction('REDEFINIR_SENHA', 'Senha redefinida pelo superusuário', superUserId, superUserEmail, userId, user.email);

  return temporaryPassword;
}

export async function createUser(userData: Omit<User, 'id' | 'createdAt'>, superUserId: string, superUserEmail: string): Promise<User> {
  // Verificar se email já existe
  const existingUser = await userRepository.findByEmail(userData.email);
  if (existingUser) {
    throw new Error('Email já está em uso.');
  }

  const newUserData: Omit<User, 'id'> = {
    ...userData,
    createdAt: new Date().toISOString(),
    role: 'user', // Novos usuários sempre começam como usuários comuns
    status: 'active',
  };

  const newUser = await userRepository.create(newUserData);

  logAuditAction('CRIAR_USUARIO', 'Novo usuário criado', superUserId, superUserEmail, newUser.id, newUser.email);

  return newUser;
}

export async function updateUserRole(userId: string, newRole: 'user' | 'superuser', superUserId: string, superUserEmail: string): Promise<User> {
  const user = await userRepository.getById(userId);
  
  if (!user) {
    throw new Error('Usuário não encontrado.');
  }

  const updatedUser = await userRepository.updateRole(userId, newRole);

  logAuditAction('ALTERAR_PAPEL', `Papel alterado para ${newRole}`, superUserId, superUserEmail, userId, user.email);

  return updatedUser;
}

export async function setUserNotificationsEnabled(userId: string, enabled: boolean): Promise<User> {
  const updatedUser = await userRepository.update(userId, { notificationsEnabled: enabled });
  return updatedUser;
} 