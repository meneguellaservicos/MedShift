import { supabase } from '../lib/supabaseClient';
import { User } from '../types';
import { IRepository } from './IRepository';

export class SupabaseUserRepository implements IRepository<User> {
  private table = 'usuarios';

  async getAll(): Promise<User[]> {
    const { data, error } = await supabase.from(this.table).select('*');
    if (error) throw error;
    return data as User[];
  }

  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase.from(this.table).select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116: no rows returned
    return data as User || null;
  }

  async create(data: Omit<User, 'id'>): Promise<User> {
    const { data: inserted, error } = await supabase.from(this.table).insert([data]).select().single();
    if (error) throw error;
    return inserted as User;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const { data: updated, error } = await supabase.from(this.table).update(data).eq('id', id).select().single();
    if (error) throw error;
    return updated as User;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from(this.table).delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  async exists(id: string): Promise<boolean> {
    const { data, error } = await supabase.from(this.table).select('id').eq('id', id).single();
    if (error && error.code === 'PGRST116') return false;
    if (error) throw error;
    return !!data;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase.from(this.table).select('*').eq('email', email).single();
    if (error && error.code === 'PGRST116') return null;
    if (error) throw error;
    return data as User || null;
  }

  async findByRole(role: string): Promise<User[]> {
    const { data, error } = await supabase.from(this.table).select('*').eq('role', role);
    if (error) throw error;
    return data as User[];
  }

  async findActiveUsers(): Promise<User[]> {
    const { data, error } = await supabase.from(this.table).select('*').eq('status', 'active');
    if (error) throw error;
    return data as User[];
  }

  async findUsersByStatus(status: string): Promise<User[]> {
    const { data, error } = await supabase.from(this.table).select('*').eq('status', status);
    if (error) throw error;
    return data as User[];
  }

  async updatePassword(userId: string, newPassword: string): Promise<User> {
    const { data, error } = await supabase.from(this.table).update({ forcePasswordChange: false, password: newPassword }).eq('id', userId).select().single();
    if (error) throw error;
    return data as User;
  }

  async updateStatus(userId: string, status: 'active' | 'inactive'): Promise<User> {
    const { data, error } = await supabase.from(this.table).update({ status }).eq('id', userId).select().single();
    if (error) throw error;
    return data as User;
  }

  async updateRole(userId: string, role: 'user' | 'superuser'): Promise<User> {
    const { data, error } = await supabase.from(this.table).update({ role }).eq('id', userId).select().single();
    if (error) throw error;
    return data as User;
  }

  async getUsersCountByRole(): Promise<Record<string, number>> {
    const { data, error } = await supabase.from(this.table).select('role');
    if (error) throw error;
    const countByRole: Record<string, number> = {};
    (data as User[]).forEach(user => {
      countByRole[user.role] = (countByRole[user.role] || 0) + 1;
    });
    return countByRole;
  }

  async getUsersCountByStatus(): Promise<Record<string, number>> {
    const { data, error } = await supabase.from(this.table).select('status');
    if (error) throw error;
    const countByStatus: Record<string, number> = {};
    (data as User[]).forEach(user => {
      countByStatus[user.status] = (countByStatus[user.status] || 0) + 1;
    });
    return countByStatus;
  }
} 