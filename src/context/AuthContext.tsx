import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import * as authService from '../services/authService';
import { getAutoClearDelay } from '../config';

interface ProfileMessage {
  type: 'success' | 'error';
  message: string;
}

interface AuthContextType {
  // State
  user: any | null;
  profileMessage: ProfileMessage | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; specialty?: string }) => Promise<void>;
  logout: () => Promise<void>;
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
  const [user, setUser] = useState<any | null>(null);
  const [profileMessage, setProfileMessage] = useState<ProfileMessage | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const clearProfileMessage = () => {
    setTimeout(() => setProfileMessage(null), getAutoClearDelay());
  };

  const login = async (email: string, password: string) => {
    try {
      const user = await authService.login(email, password);
      setUser(user);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const register = async (userData: { name: string; email: string; password: string; specialty?: string }) => {
    try {
      const user = await authService.register(userData);
      setUser(user);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setProfileMessage(null);
    onLogout?.();
  };

  const updateUserProfile = (updates: { email?: string; passwordChanged?: boolean }) => {
    setProfileMessage({ type: 'error', message: 'Funcionalidade não implementada com Supabase Auth.' });
    clearProfileMessage();
  };

  const setNotificationsEnabled = async (enabled: boolean) => {
    setProfileMessage({ type: 'error', message: 'Funcionalidade não implementada com Supabase Auth.' });
    clearProfileMessage();
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