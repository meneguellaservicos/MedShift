import { useCallback } from 'react';
import { useFormValidation } from './useFormValidation';
import { HospitalFormData, validateHospitalForm } from '../utils/validation';
import { Hospital } from '../types';

interface UseHospitalFormOptions {
  onAddHospital?: (hospitalData: Omit<Hospital, 'id'>) => void;
  onEditHospital?: (id: string, hospitalData: Omit<Hospital, 'id'>) => void;
  editingHospital?: Hospital | null;
}

export function useHospitalForm({ onAddHospital, onEditHospital, editingHospital }: UseHospitalFormOptions) {
  const initialData: HospitalFormData = {
    name: editingHospital?.name || '',
    hourlyRate: editingHospital?.hourlyRate.toString() || '',
    address: editingHospital?.address || '',
    color: editingHospital?.color || '#3B82F6'
  };

  const handleSubmit = useCallback(async (data: HospitalFormData) => {
    const hospitalData = {
      name: data.name,
      hourlyRate: parseFloat(data.hourlyRate),
      address: data.address,
      color: data.color,
      isDisabled: editingHospital?.isDisabled || false,
    };

    if (editingHospital && onEditHospital) {
      onEditHospital(editingHospital.id, hospitalData);
    } else if (onAddHospital) {
      onAddHospital(hospitalData);
    }
  }, [editingHospital, onAddHospital, onEditHospital]);

  const formValidation = useFormValidation({
    initialData,
    validateFunction: validateHospitalForm,
    onSubmit: handleSubmit
  });

  return formValidation;
} 