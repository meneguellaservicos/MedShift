import { LocalStorageRepository } from './LocalStorageRepository';
import { User } from '../types';

export class UserRepository extends LocalStorageRepository<User> {
  protected readonly storageKey = 'medshift-users';
  protected readonly idField: keyof User = 'id';

  // Métodos específicos para Users
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne(user => user.email === email);
  }

  async findByRole(role: string): Promise<User[]> {
    return this.find(user => user.role === role);
  }

  async findActiveUsers(): Promise<User[]> {
    return this.find(user => user.status === 'active');
  }

  async findUsersByStatus(status: string): Promise<User[]> {
    return this.find(user => user.status === status);
  }

  async updatePassword(userId: string, newPassword: string): Promise<User> {
    return this.update(userId, { 
      forcePasswordChange: false
    });
  }

  async updateStatus(userId: string, status: 'active' | 'inactive'): Promise<User> {
    return this.update(userId, { 
      status
    });
  }

  async updateRole(userId: string, role: 'user' | 'superuser'): Promise<User> {
    return this.update(userId, { 
      role
    });
  }

  async getUsersCountByRole(): Promise<Record<string, number>> {
    const users = await this.getAll();
    const countByRole: Record<string, number> = {};
    
    users.forEach(user => {
      countByRole[user.role] = (countByRole[user.role] || 0) + 1;
    });
    
    return countByRole;
  }

  async getUsersCountByStatus(): Promise<Record<string, number>> {
    const users = await this.getAll();
    const countByStatus: Record<string, number> = {};
    
    users.forEach(user => {
      countByStatus[user.status] = (countByStatus[user.status] || 0) + 1;
    });
    
    return countByStatus;
  }
} 