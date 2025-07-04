import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import { Hospital, Shift } from '../types';
import * as hospitalService from '../services/hospitalService';

interface HospitalContextType {
  // State
  hospitals: Hospital[];
  loading: boolean;
  error: string | null;
  
  // Actions
  addHospital: (hospital: Omit<Hospital, 'id'>) => Promise<void>;
  editHospital: (id: string, hospital: Omit<Hospital, 'id'>) => Promise<void>;
  deleteHospital: (id: string) => Promise<void>;
  toggleHospitalStatus: (id: string) => Promise<void>;
  refreshHospitals: () => Promise<void>;
  
  // Computed values
  enabledHospitals: Hospital[];
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const useHospitals = () => {
  const context = useContext(HospitalContext);
  if (context === undefined) {
    throw new Error('useHospitals must be used within a HospitalProvider');
  }
  return context;
};

interface HospitalProviderProps {
  children: ReactNode;
}

export const HospitalProvider: React.FC<HospitalProviderProps> = ({ children }) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshHospitals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hospitalService.getAllHospitals();
      setHospitals(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshHospitals();
  }, []);

  const addHospital = async (hospitalData: Omit<Hospital, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const newHospital = await hospitalService.addHospital(hospitalData);
      setHospitals(prev => [...prev, newHospital]);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editHospital = async (id: string, hospitalData: Omit<Hospital, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedHospital = await hospitalService.editHospital(id, hospitalData);
      setHospitals(prev => prev.map(h => h.id === id ? updatedHospital : h));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleHospitalStatus = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedHospital = await hospitalService.toggleHospitalStatus(id);
      setHospitals(prev => prev.map(h => h.id === id ? updatedHospital : h));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteHospital = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await hospitalService.deleteHospital(id);
      setHospitals(prev => prev.filter(h => h.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Computed values - Memoized to prevent unnecessary recalculations
  const enabledHospitals = useMemo(() => {
    return hospitals.filter(h => !h.isDisabled);
  }, [hospitals]);

  const contextValue: HospitalContextType = {
    hospitals,
    loading,
    error,
    addHospital,
    editHospital,
    deleteHospital,
    toggleHospitalStatus,
    refreshHospitals,
    enabledHospitals,
  };

  return (
    <HospitalContext.Provider value={contextValue}>
      {children}
    </HospitalContext.Provider>
  );
}; 