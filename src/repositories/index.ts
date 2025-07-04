// Interfaces
export * from './IRepository';

// Base Repository
export * from './LocalStorageRepository';

// Specific Repositories
// export * from './UserRepository'; // Removido: não exportar mais o antigo
export * from './HospitalRepository';
export * from './ShiftRepository';

// Repository instances (singletons)
import { SupabaseUserRepository } from './SupabaseUserRepository';
import { HospitalRepository } from './HospitalRepository';
import { ShiftRepository } from './ShiftRepository';

// Singleton instances
export const userRepository = new SupabaseUserRepository();
export const hospitalRepository = new HospitalRepository();
export const shiftRepository = new ShiftRepository(); 