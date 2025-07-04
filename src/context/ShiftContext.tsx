import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Shift, Hospital } from '../types';
import { 
  createDateTime, 
  areIntervalsOverlapping, 
  sortShiftsChronologically,
  getUpcomingShifts
} from '../utils/dateUtils';
import * as shiftService from '../services/shiftService';
import { getAutoClearDelay } from '../config';

interface OverlapResult {
  success: boolean;
  conflictDates: string[];
  addedShifts: number;
}

interface ShiftContextType {
  // State
  shifts: Shift[];
  overlapMessage: string;
  loading: boolean;
  error: string | null;
  
  // Actions
  addShift: (shift: Omit<Shift, 'id'>) => Promise<boolean>;
  bulkAddShifts: (shifts: Omit<Shift, 'id'>[]) => Promise<OverlapResult>;
  editShift: (id: string, shift: Omit<Shift, 'id'>) => Promise<boolean>;
  deleteShift: (id: string) => Promise<void>;
  togglePaid: (id: string) => Promise<void>;
  refreshShifts: () => Promise<void>;
  
  // Computed values
  sortedShifts: Shift[];
  upcomingShifts: Shift[];
  
  // Utilities
  clearOverlapMessage: () => void;
}

const ShiftContext = createContext<ShiftContextType | undefined>(undefined);

export const useShifts = () => {
  const context = useContext(ShiftContext);
  if (context === undefined) {
    throw new Error('useShifts must be used within a ShiftProvider');
  }
  return context;
};

interface ShiftProviderProps {
  children: ReactNode;
}

export const ShiftProvider: React.FC<ShiftProviderProps> = ({ children }) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [overlapMessage, setOverlapMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshShifts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await shiftService.getAllShifts();
      setShifts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshShifts();
  }, []);

  // Business logic functions
  const checkShiftOverlap = (newShift: Omit<Shift, 'id'>, existingShifts: Shift[]): boolean => {
    const newStart = createDateTime(newShift.startDate, newShift.startTime);
    const newEnd = createDateTime(newShift.endDate, newShift.endTime);

    return existingShifts.some(existingShift => {
      const existingStart = createDateTime(existingShift.startDate, existingShift.startTime);
      const existingEnd = createDateTime(existingShift.endDate, existingShift.endTime);
      
      return areIntervalsOverlapping(newStart, newEnd, existingStart, existingEnd);
    });
  };

  const clearOverlapMessage = () => {
    setTimeout(() => setOverlapMessage(''), getAutoClearDelay());
  };

  // Helper function to process a single shift
  const processSingleShift = async (
    shiftData: Omit<Shift, 'id'>, 
    existingShifts: Shift[], 
    addedShifts: Shift[]
  ): Promise<{ success: boolean; conflictDate?: string; newShift?: Shift }> => {
    const hasOverlap = checkShiftOverlap(shiftData, [...existingShifts, ...addedShifts]);
    
    if (hasOverlap) {
      return { success: false, conflictDate: shiftData.startDate };
    }
    
    try {
      const newShift = await shiftService.addShift(shiftData);
      return { success: true, newShift };
    } catch (err: any) {
      console.error('Erro ao adicionar plantão:', err);
      return { success: false, conflictDate: shiftData.startDate };
    }
  };

  // Helper function to format conflict dates for display
  const formatConflictDates = (conflictDates: string[]): string => {
    return conflictDates
      .map(date => new Date(date + 'T00:00:00').toLocaleDateString('pt-BR'))
      .join(', ');
  };

  // Helper function to update overlap message
  const updateOverlapMessage = (conflictDates: string[]) => {
    if (conflictDates.length > 0) {
      const conflictDatesFormatted = formatConflictDates(conflictDates);
      setOverlapMessage(
        `Atenção: ${conflictDates.length} plantão(ões) não foram adicionados devido a conflitos de horário nas datas: ${conflictDatesFormatted}`
      );
      clearOverlapMessage();
    } else {
      setOverlapMessage('');
    }
  };

  // Helper function to update shifts state
  const updateShiftsState = (addedShifts: Shift[]) => {
    if (addedShifts.length > 0) {
      setShifts(prevShifts => [...prevShifts, ...addedShifts]);
    }
  };

  const bulkAddShifts = async (shiftsData: Omit<Shift, 'id'>[]): Promise<OverlapResult> => {
    const conflictDates: string[] = [];
    const addedShifts: Shift[] = [];

    // Process each shift individually
    for (const shiftData of shiftsData) {
      const result = await processSingleShift(shiftData, shifts, addedShifts);
      
      if (result.success && result.newShift) {
        addedShifts.push(result.newShift);
      } else if (result.conflictDate) {
        conflictDates.push(result.conflictDate);
      }
    }

    // Update state and messages
    updateShiftsState(addedShifts);
    updateOverlapMessage(conflictDates);

    return {
      success: addedShifts.length > 0,
      conflictDates,
      addedShifts: addedShifts.length
    };
  };

  const addShift = async (shiftData: Omit<Shift, 'id'>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar sobreposição antes de adicionar
      const hasOverlap = await shiftService.checkShiftOverlap(shiftData);
      if (hasOverlap) {
        setError('Existe sobreposição de horários com outro plantão');
        return false;
      }
      
      const newShift = await shiftService.addShift(shiftData);
      setShifts(prev => [...prev, newShift]);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const editShift = async (id: string, shiftData: Omit<Shift, 'id'>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const updatedShift = await shiftService.editShift(id, shiftData);
      setShifts(prev => prev.map(s => s.id === id ? updatedShift : s));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteShift = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await shiftService.deleteShift(id);
      setShifts(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const togglePaid = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const updatedShift = await shiftService.togglePaid(id);
      setShifts(prev => prev.map(s => s.id === id ? updatedShift : s));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Computed values - Memoized to prevent unnecessary recalculations
  const sortedShifts = useMemo(() => {
    return sortShiftsChronologically(shifts);
  }, [shifts]);

  const upcomingShifts = useMemo(() => {
    return getUpcomingShifts(shifts);
  }, [shifts]);

  const contextValue: ShiftContextType = {
    shifts,
    overlapMessage,
    loading,
    error,
    addShift,
    bulkAddShifts,
    editShift,
    deleteShift,
    togglePaid,
    refreshShifts,
    sortedShifts,
    upcomingShifts,
    clearOverlapMessage,
  };

  return (
    <ShiftContext.Provider value={contextValue}>
      {children}
    </ShiftContext.Provider>
  );
}; 