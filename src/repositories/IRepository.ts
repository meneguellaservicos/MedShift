export interface IRepository<T> {
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}

export interface IQueryableRepository<T> extends IRepository<T> {
  find(predicate: (item: T) => boolean): Promise<T[]>;
  findOne(predicate: (item: T) => boolean): Promise<T | null>;
  count(predicate?: (item: T) => boolean): Promise<number>;
}

export interface IAuditableRepository<T> extends IRepository<T> {
  getAuditLog(id: string): Promise<any[]>;
  getHistory(id: string): Promise<T[]>;
} 