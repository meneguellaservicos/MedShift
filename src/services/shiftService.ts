// Serviço de manipulação de plantões usando Repository pattern
import { Shift } from '../types';
import { ShiftRepository } from '../repositories/ShiftRepository';
import { createDateTime, areIntervalsOverlapping, sortShiftsChronologically, calculateShiftHours } from '../utils/dateUtils';

const shiftRepository = new ShiftRepository();

export async function checkShiftOverlap(newShift: Omit<Shift, 'id'>): Promise<boolean> {
  const existingShifts = await shiftRepository.getAll();
  const newStart = createDateTime(newShift.startDate, newShift.startTime);
  const newEnd = createDateTime(newShift.endDate, newShift.endTime);
  
  return existingShifts.some(existingShift => {
    const existingStart = createDateTime(existingShift.startDate, existingShift.startTime);
    const existingEnd = createDateTime(existingShift.endDate, existingShift.endTime);
    return areIntervalsOverlapping(newStart, newEnd, existingStart, existingEnd);
  });
}

export async function addShift(shiftData: Omit<Shift, 'id'>): Promise<Shift> {
  const newShift: Shift = {
    ...shiftData,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  };
  
  await shiftRepository.create(newShift);
  return newShift;
}

export async function editShift(id: string, shiftData: Omit<Shift, 'id'>): Promise<Shift> {
  const updatedShift: Shift = { ...shiftData, id };
  await shiftRepository.update(id, updatedShift);
  return updatedShift;
}

export async function deleteShift(id: string): Promise<boolean> {
  return await shiftRepository.delete(id);
}

export async function togglePaid(id: string): Promise<Shift> {
  const shift = await shiftRepository.getById(id);
  if (!shift) {
    throw new Error('Plantão não encontrado');
  }
  
  const updatedShift = { ...shift, isPaid: !shift.isPaid };
  await shiftRepository.update(id, updatedShift);
  return updatedShift;
}

export async function getAllShifts(): Promise<Shift[]> {
  const shifts = await shiftRepository.getAll();
  return sortShiftsChronologically(shifts);
}

export async function getShiftById(id: string): Promise<Shift | null> {
  return await shiftRepository.getById(id);
}

export async function getShiftsByHospital(hospitalId: string): Promise<Shift[]> {
  return await shiftRepository.find(shift => shift.hospitalId === hospitalId);
}

export async function getShiftsByDateRange(startDate: string, endDate: string): Promise<Shift[]> {
  return await shiftRepository.find(shift => 
    shift.startDate >= startDate && shift.startDate <= endDate
  );
}

export async function getUnpaidShifts(): Promise<Shift[]> {
  return await shiftRepository.find(shift => !shift.isPaid);
}

export async function getPaidShifts(): Promise<Shift[]> {
  return await shiftRepository.find(shift => shift.isPaid);
} 