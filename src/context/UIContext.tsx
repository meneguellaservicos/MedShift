import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface UIContextType {
  // State
  showEconomicValues: boolean;
  theme: 'light' | 'dark';
  currentView: string;
  
  // Actions
  setCurrentView: (view: string) => void;
  setShowEconomicValues: (show: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

interface UIProviderProps {
  children: ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [showEconomicValues, setShowEconomicValues] = useLocalStorage<boolean>('medshift-show-economic-values', false);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('medshift-theme', 'light');
  const [currentView, setCurrentView] = useLocalStorage<string>('medshift-current-view', 'dashboard');

  const contextValue: UIContextType = {
    showEconomicValues,
    theme,
    currentView,
    setCurrentView,
    setShowEconomicValues,
    setTheme,
  };

  return (
    <UIContext.Provider value={contextValue}>
      {children}
    </UIContext.Provider>
  );
}; 