import React, { createContext, useContext, ReactNode } from 'react';
import { User, Hospital, Shift } from '../types';
import { AuthProvider, useAuth } from './AuthContext';
import { HospitalProvider, useHospitals } from './HospitalContext';
import { ShiftProvider, useShifts } from './ShiftContext';
import { UIProvider, useUI } from './UIContext';

interface OverlapResult {
  success: boolean;
  conflictDates: string[];
  addedShifts: number;
}

interface ProfileMessage {
  type: 'success' | 'error';
  message: string;
}

// Interface de compatibilidade para manter o código existente funcionando
interface AppContextType {
  // State
  user: User | null;
  hospitals: Hospital[];
  shifts: Shift[];
  showEconomicValues: boolean;
  theme: 'light' | 'dark';
  currentView: string;
  overlapMessage: string;
  profileMessage: ProfileMessage | null;
  
  // User actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; specialty?: string }) => Promise<void>;
  logout: () => void;
  updateUserProfile: (updates: { email?: string; passwordChanged?: boolean }) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  
  // Hospital actions
  addHospital: (hospital: Omit<Hospital, 'id'>) => Promise<void>;
  editHospital: (id: string, hospital: Omit<Hospital, 'id'>) => Promise<void>;
  deleteHospital: (id: string) => Promise<void>;
  toggleHospitalStatus: (id: string) => Promise<void>;
  
  // Shift actions
  addShift: (shift: Omit<Shift, 'id'>) => Promise<boolean>;
  bulkAddShifts: (shifts: Omit<Shift, 'id'>[]) => Promise<OverlapResult>;
  editShift: (id: string, shift: Omit<Shift, 'id'>) => Promise<boolean>;
  deleteShift: (id: string) => Promise<void>;
  togglePaid: (id: string) => Promise<void>;
  
  // UI actions
  setCurrentView: (view: string) => void;
  setShowEconomicValues: (show: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Computed values
  sortedShifts: Shift[];
  enabledHospitals: Hospital[];
  upcomingShifts: Shift[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};

// Componente interno que combina todos os contexts
const AppContextCombiner: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const hospitals = useHospitals();
  const shifts = useShifts();
  const ui = useUI();

  const handleLogout = () => {
    ui.setCurrentView('dashboard');
  };

  const contextValue: AppContextType = {
    // State
    user: auth.user,
    hospitals: hospitals.hospitals,
    shifts: shifts.shifts,
    showEconomicValues: ui.showEconomicValues,
    theme: ui.theme,
    currentView: ui.currentView,
    overlapMessage: shifts.overlapMessage,
    profileMessage: auth.profileMessage,
    
    // User actions
    login: auth.login,
    register: auth.register,
    logout: () => auth.logout(),
    updateUserProfile: auth.updateUserProfile,
    setNotificationsEnabled: auth.setNotificationsEnabled,
    
    // Hospital actions
    addHospital: hospitals.addHospital,
    editHospital: hospitals.editHospital,
    deleteHospital: hospitals.deleteHospital,
    toggleHospitalStatus: hospitals.toggleHospitalStatus,
    
    // Shift actions
    addShift: shifts.addShift,
    bulkAddShifts: shifts.bulkAddShifts,
    editShift: shifts.editShift,
    deleteShift: shifts.deleteShift,
    togglePaid: shifts.togglePaid,
    
    // UI actions
    setCurrentView: ui.setCurrentView,
    setShowEconomicValues: ui.setShowEconomicValues,
    setTheme: ui.setTheme,
    
    // Computed values
    sortedShifts: shifts.sortedShifts,
    enabledHospitals: hospitals.enabledHospitals,
    upcomingShifts: shifts.upcomingShifts,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

interface AppContextProviderProps {
  children: ReactNode;
}

// Provider interno que conecta HospitalProvider e ShiftProvider
const ConnectedProviders: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ShiftProvider>
      {children}
    </ShiftProvider>
  );
};

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  return (
    <UIProvider>
      <AuthProvider>
        <HospitalProvider>
          <ConnectedProviders>
            <AppContextCombiner>
              {children}
            </AppContextCombiner>
          </ConnectedProviders>
        </HospitalProvider>
      </AuthProvider>
    </UIProvider>
  );
};