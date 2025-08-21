import { BaseEntityInterface } from '../interfaces/model.interface';
import { IBaseRepository } from '../interfaces/repository.interface';
import { IBaseService } from '../interfaces/service.interface';

export abstract class BaseService<T extends BaseEntityInterface> implements IBaseService<T> {
    protected repository: IBaseRepository<T>;

    constructor(repository: IBaseRepository<T>) {
        this.repository = repository;
    }

    async findAll(): Promise<T[]> {
        return this.repository.findAll();
    }

    async findById(id: string): Promise<T | null> {
        return this.repository.findById(id);
    }

    async create(item: Partial<T>): Promise<T> {
        return this.repository.create(item);
    }

    async update(id: string, item: Partial<T>): Promise<T | null> {
        return this.repository.update(id, item);
    }

    async delete(id: string): Promise<boolean> {
        return this.repository.delete(id);
    }
}
