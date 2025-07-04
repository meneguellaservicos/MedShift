import { LocalStorageRepository } from './LocalStorageRepository';
import { Hospital } from '../types';

export class HospitalRepository extends LocalStorageRepository<Hospital> {
  protected readonly storageKey = 'medshift-hospitals';
  protected readonly idField: keyof Hospital = 'id';

  // Métodos específicos para Hospitals
  async findByName(name: string): Promise<Hospital | null> {
    return this.findOne(hospital => hospital.name.toLowerCase() === name.toLowerCase());
  }

  async findEnabled(): Promise<Hospital[]> {
    return this.find(hospital => !hospital.isDisabled);
  }

  async findDisabled(): Promise<Hospital[]> {
    return this.find(hospital => hospital.isDisabled === true);
  }

  async findByHourlyRate(minRate: number, maxRate?: number): Promise<Hospital[]> {
    if (maxRate) {
      return this.find(hospital => hospital.hourlyRate >= minRate && hospital.hourlyRate <= maxRate);
    }
    return this.find(hospital => hospital.hourlyRate >= minRate);
  }

  async toggleStatus(hospitalId: string): Promise<Hospital> {
    const hospital = await this.getById(hospitalId);
    if (!hospital) {
      throw new Error(`Hospital with id ${hospitalId} not found`);
    }

    return this.update(hospitalId, { 
      isDisabled: !hospital.isDisabled 
    });
  }

  async updateHourlyRate(hospitalId: string, newRate: number): Promise<Hospital> {
    return this.update(hospitalId, { hourlyRate: newRate });
  }

  async getAverageHourlyRate(): Promise<number> {
    const hospitals = await this.getAll();
    if (hospitals.length === 0) return 0;
    
    const total = hospitals.reduce((sum, hospital) => sum + hospital.hourlyRate, 0);
    return total / hospitals.length;
  }

  async getHourlyRateStats(): Promise<{
    min: number;
    max: number;
    average: number;
    total: number;
  }> {
    const hospitals = await this.getAll();
    if (hospitals.length === 0) {
      return { min: 0, max: 0, average: 0, total: 0 };
    }

    const rates = hospitals.map(h => h.hourlyRate);
    return {
      min: Math.min(...rates),
      max: Math.max(...rates),
      average: rates.reduce((sum, rate) => sum + rate, 0) / rates.length,
      total: hospitals.length
    };
  }
} 