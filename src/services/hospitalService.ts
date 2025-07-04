// Serviço de manipulação de hospitais usando Repository pattern
import { Hospital, Shift } from '../types';
import { HospitalRepository } from '../repositories/HospitalRepository';
import { ShiftRepository } from '../repositories/ShiftRepository';

const hospitalRepository = new HospitalRepository();
const shiftRepository = new ShiftRepository();

export async function addHospital(hospitalData: Omit<Hospital, 'id'>): Promise<Hospital> {
  const newHospital: Hospital = {
    ...hospitalData,
    id: Date.now().toString(),
    isDisabled: false,
  };
  
  await hospitalRepository.create(newHospital);
  return newHospital;
}

export async function editHospital(id: string, hospitalData: Omit<Hospital, 'id'>): Promise<Hospital> {
  const updatedHospital: Hospital = { ...hospitalData, id };
  await hospitalRepository.update(id, updatedHospital);
  return updatedHospital;
}

export async function toggleHospitalStatus(id: string): Promise<Hospital> {
  return await hospitalRepository.toggleStatus(id);
}

export async function deleteHospital(id: string): Promise<void> {
  const shifts = await shiftRepository.getAll();
  const hasShifts = shifts.some((shift: Shift) => shift.hospitalId === id);
  
  if (hasShifts) {
    throw new Error('Não é possível excluir este hospital, pois existem plantões associados a ele.');
  }
  
  await hospitalRepository.delete(id);
}

export async function getAllHospitals(): Promise<Hospital[]> {
  return await hospitalRepository.getAll();
}

export async function getHospitalById(id: string): Promise<Hospital | null> {
  return await hospitalRepository.getById(id);
} 