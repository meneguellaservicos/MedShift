import { LocalStorageRepository } from './LocalStorageRepository';
import { Shift } from '../types';

export class ShiftRepository extends LocalStorageRepository<Shift> {
  protected readonly storageKey = 'medshift-shifts';
  protected readonly idField: keyof Shift = 'id';

  // Métodos específicos para Shifts
  async findByHospital(hospitalId: string): Promise<Shift[]> {
    return this.find(shift => shift.hospitalId === hospitalId);
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Shift[]> {
    return this.find(shift => 
      shift.startDate >= startDate && shift.startDate <= endDate
    );
  }

  async findByDate(date: string): Promise<Shift[]> {
    return this.find(shift => shift.startDate === date);
  }

  async findPaid(): Promise<Shift[]> {
    return this.find(shift => shift.isPaid);
  }

  async findPending(): Promise<Shift[]> {
    return this.find(shift => !shift.isPaid);
  }

  async togglePaidStatus(shiftId: string): Promise<Shift> {
    const shift = await this.getById(shiftId);
    if (!shift) {
      throw new Error(`Shift with id ${shiftId} not found`);
    }

    return this.update(shiftId, { isPaid: !shift.isPaid });
  }

  async getShiftsByMonth(year: number, month: number): Promise<Shift[]> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
    
    return this.findByDateRange(startDate, endDate);
  }

  async getTotalEarnings(startDate?: string, endDate?: string): Promise<number> {
    let shifts = await this.getAll();
    
    if (startDate && endDate) {
      shifts = shifts.filter(shift => 
        shift.startDate >= startDate && shift.startDate <= endDate
      );
    }

    return shifts.reduce((total, shift) => total + shift.totalAmount, 0);
  }

  async getTotalHours(startDate?: string, endDate?: string): Promise<number> {
    let shifts = await this.getAll();
    
    if (startDate && endDate) {
      shifts = shifts.filter(shift => 
        shift.startDate >= startDate && shift.startDate <= endDate
      );
    }

    return shifts.reduce((total, shift) => total + shift.totalHours, 0);
  }

  async getShiftsCount(startDate?: string, endDate?: string): Promise<number> {
    let shifts = await this.getAll();
    
    if (startDate && endDate) {
      shifts = shifts.filter(shift => 
        shift.startDate >= startDate && shift.startDate <= endDate
      );
    }

    return shifts.length;
  }

  async getEarningsByHospital(startDate?: string, endDate?: string): Promise<Record<string, number>> {
    let shifts = await this.getAll();
    
    if (startDate && endDate) {
      shifts = shifts.filter(shift => 
        shift.startDate >= startDate && shift.startDate <= endDate
      );
    }

    const earningsByHospital: Record<string, number> = {};
    
    shifts.forEach(shift => {
      earningsByHospital[shift.hospitalId] = (earningsByHospital[shift.hospitalId] || 0) + shift.totalAmount;
    });

    return earningsByHospital;
  }

  async checkDateConflicts(startDate: string, endDate: string, hospitalId: string, excludeShiftId?: string): Promise<Shift[]> {
    return this.find(shift => 
      shift.hospitalId === hospitalId &&
      shift.startDate >= startDate &&
      shift.startDate <= endDate &&
      shift.id !== excludeShiftId
    );
  }
} 