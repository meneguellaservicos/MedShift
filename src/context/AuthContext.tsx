import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { User } from '../types';
import * as authService from '../services/authService';
import { getAutoClearDelay } from '../config';

interface ProfileMessage {
  type: 'success' | 'error';
  message: string;
}

interface AuthContextType {
  // State
  user: User | null;
  profileMessage: ProfileMessage | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; specialty?: string }) => Promise<void>;
  logout: () => void;
  updateUserProfile: (updates: { email?: string; passwordChanged?: boolean }) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  
  // Utilities
  clearProfileMessage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
  onLogout?: () => void;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, onLogout }) => {
  const [user, setUser] = useLocalStorage<User | null>('medshift-user', null);
  const [profileMessage, setProfileMessage] = useState<ProfileMessage | null>(null);

  const clearProfileMessage = () => {
    setTimeout(() => setProfileMessage(null), getAutoClearDelay());
  };

  const login = async (email: string, password: string) => {
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const register = async (userData: { name: string; email: string; password: string; specialty?: string }) => {
    try {
      const registeredUser = await authService.register(userData);
      setUser(registeredUser);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const logout = () => {
    setUser(authService.logout());
    setProfileMessage(null);
    onLogout?.();
  };

  const updateUserProfile = (updates: { email?: string; passwordChanged?: boolean }) => {
    if (!user) return;
    try {
      const { updatedUser, messages } = authService.updateUserProfile(user, updates);
      if (messages.length > 0) {
        // Atualizar o usuário no localStorage também
        const users: User[] = JSON.parse(localStorage.getItem('medshift-users') || '[]');
        const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
        localStorage.setItem('medshift-users', JSON.stringify(updatedUsers));
        
        setUser(updatedUser);
        setProfileMessage({ type: 'success', message: messages.join(' e ') + ' com sucesso!' });
        clearProfileMessage();
      } else {
        setProfileMessage({ type: 'error', message: 'Nenhuma alteração foi detectada.' });
        clearProfileMessage();
      }
    } catch (error) {
      setProfileMessage({ type: 'error', message: 'Erro ao atualizar perfil. Tente novamente.' });
      clearProfileMessage();
    }
  };

  const setNotificationsEnabled = async (enabled: boolean) => {
    if (!user) return;
    try {
      const updatedUser = await authService.setUserNotificationsEnabled(user.id, enabled);
      setUser(updatedUser);
    } catch (error) {
      alert('Erro ao atualizar preferências de notificações.');
    }
  };

  const contextValue: AuthContextType = {
    user,
    profileMessage,
    login,
    register,
    logout,
    updateUserProfile,
    setNotificationsEnabled,
    clearProfileMessage,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 