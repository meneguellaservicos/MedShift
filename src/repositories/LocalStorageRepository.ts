import { IRepository, IQueryableRepository } from './IRepository';

export abstract class LocalStorageRepository<T> implements IQueryableRepository<T> {
  protected abstract readonly storageKey: string;
  protected abstract readonly idField: keyof T;

  protected getStorageKey(): string {
    return this.storageKey;
  }

  protected getIdField(): keyof T {
    return this.idField;
  }

  protected getStorage(): T[] {
    try {
      const data = localStorage.getItem(this.getStorageKey());
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading from localStorage for key ${this.getStorageKey()}:`, error);
      return [];
    }
  }

  protected setStorage(data: T[]): void {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing to localStorage for key ${this.getStorageKey()}:`, error);
      throw new Error('Failed to save data to storage');
    }
  }

  protected generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async getAll(): Promise<T[]> {
    return this.getStorage();
  }

  async getById(id: string): Promise<T | null> {
    const items = this.getStorage();
    return items.find(item => item[this.getIdField()] === id) || null;
  }

  async create(data: Omit<T, 'id'>): Promise<T> {
    const items = this.getStorage();
    const newItem = {
      ...data,
      [this.getIdField()]: this.generateId()
    } as T;
    
    items.push(newItem);
    this.setStorage(items);
    return newItem;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const items = this.getStorage();
    const index = items.findIndex(item => item[this.getIdField()] === id);
    
    if (index === -1) {
      throw new Error(`Item with id ${id} not found`);
    }

    const updatedItem = { ...items[index], ...data };
    items[index] = updatedItem;
    this.setStorage(items);
    return updatedItem;
  }

  async delete(id: string): Promise<boolean> {
    const items = this.getStorage();
    const filteredItems = items.filter(item => item[this.getIdField()] !== id);
    
    if (filteredItems.length === items.length) {
      return false; // Item not found
    }

    this.setStorage(filteredItems);
    return true;
  }

  async exists(id: string): Promise<boolean> {
    const items = this.getStorage();
    return items.some(item => item[this.getIdField()] === id);
  }

  async find(predicate: (item: T) => boolean): Promise<T[]> {
    const items = this.getStorage();
    return items.filter(predicate);
  }

  async findOne(predicate: (item: T) => boolean): Promise<T | null> {
    const items = this.getStorage();
    return items.find(predicate) || null;
  }

  async count(predicate?: (item: T) => boolean): Promise<number> {
    const items = this.getStorage();
    if (predicate) {
      return items.filter(predicate).length;
    }
    return items.length;
  }

  // Métodos utilitários específicos para localStorage
  async clear(): Promise<void> {
    localStorage.removeItem(this.getStorageKey());
  }

  async backup(): Promise<string> {
    const data = this.getStorage();
    return JSON.stringify(data);
  }

  async restore(backupData: string): Promise<void> {
    try {
      const data = JSON.parse(backupData);
      this.setStorage(data);
    } catch (error) {
      throw new Error('Invalid backup data format');
    }
  }
} 