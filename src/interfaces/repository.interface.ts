import { BaseEntityInterface } from '../interfaces/model.interface';

export interface IBaseRepository<T extends BaseEntityInterface> {
    findAll(): Promise<T[]>;
    findById(id: string): Promise<T | null>;
    create(item: Partial<T>): Promise<T>;
    update(id: string, item: Partial<T>): Promise<T | null>;
    delete(id: string): Promise<boolean>;
}
