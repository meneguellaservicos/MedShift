import { useCallback } from 'react';
import { useFormValidation } from './useFormValidation';
import { ShiftFormData, validateShiftForm } from '../utils/validation';
import { Hospital, Shift } from '../types';
import { calculateShiftHours } from '../utils/dateUtils';

interface UseShiftFormOptions {
  onAddShift?: (shift: Omit<Shift, 'id'>) => Promise<boolean>;
  onBulkAddShifts?: (shifts: Omit<Shift, 'id'>[]) => Promise<{ success: boolean; conflictDates: string[]; addedShifts: number }>;
  onEditShift?: (id: string, shift: Omit<Shift, 'id'>) => Promise<boolean>;
  hospitals: Hospital[];
  selectedDates: string[];
  editingShift?: any;
}

export function useShiftForm({ 
  onAddShift, 
  onBulkAddShifts, 
  onEditShift, 
  hospitals, 
  selectedDates, 
  editingShift 
}: UseShiftFormOptions) {
  const initialData: ShiftFormData = {
    hospitalId: editingShift?.hospitalId || '',
    startTime: editingShift?.startTime || '07:00',
    endTime: editingShift?.endTime || '19:00',
    notes: editingShift?.notes || '',
    selectedDates: selectedDates
  };

  const handleSubmit = useCallback(async (data: ShiftFormData) => {
    if (editingShift) {
      // Single shift edit
      const date = selectedDates[0];
      let endDate = date;
      
      if (data.endTime <= data.startTime) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        endDate = nextDay.toISOString().split('T')[0];
      }
      
      const hospital = hospitals.find(h => h.id === data.hospitalId);
      if (!hospital) {
        throw new Error('Hospital não encontrado');
      }

      const totalHours = calculateShiftHours(date, data.startTime, endDate, data.endTime);
      const totalAmount = totalHours * hospital.hourlyRate;

      const shiftData = {
        hospitalId: data.hospitalId,
        startDate: date,
        startTime: data.startTime,
        endDate,
        endTime: data.endTime,
        totalHours,
        totalAmount,
        isPaid: editingShift.isPaid,
        notes: data.notes,
      };

      if (onEditShift) {
        const success = await onEditShift(editingShift.id, shiftData);
        if (!success) {
          throw new Error('Erro ao editar plantão');
        }
      }
    } else {
      // Multiple shifts addition
      const shiftsToAdd: Omit<Shift, 'id'>[] = [];
      
      selectedDates.forEach((date) => {
        let endDate = date;
        
        if (data.endTime <= data.startTime) {
          const nextDay = new Date(date);
          nextDay.setDate(nextDay.getDate() + 1);
          endDate = nextDay.toISOString().split('T')[0];
        }
        
        const hospital = hospitals.find(h => h.id === data.hospitalId);
        if (!hospital) {
          throw new Error('Hospital não encontrado');
        }

        const totalHours = calculateShiftHours(date, data.startTime, endDate, data.endTime);
        const totalAmount = totalHours * hospital.hourlyRate;

        shiftsToAdd.push({
          hospitalId: data.hospitalId,
          startDate: date,
          startTime: data.startTime,
          endDate,
          endTime: data.endTime,
          totalHours,
          totalAmount,
          isPaid: false,
          notes: data.notes,
        });
      });

      if (onBulkAddShifts) {
        const result = await onBulkAddShifts(shiftsToAdd);
        if (result.addedShifts === 0) {
          throw new Error('Nenhum plantão foi adicionado');
        }
      }
    }
  }, [editingShift, selectedDates, hospitals, onAddShift, onBulkAddShifts, onEditShift]);

  const validateShiftFormWithDates = useCallback((data: ShiftFormData) => {
    return validateShiftForm({
      ...data,
      selectedDates: selectedDates
    });
  }, [selectedDates]);

  const formValidation = useFormValidation({
    initialData,
    validateFunction: validateShiftFormWithDates,
    onSubmit: handleSubmit
  });

  return formValidation;
} 