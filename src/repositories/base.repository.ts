import { Model, ModelCtor } from 'sequelize-typescript';
import { IBaseRepository } from '../interfaces/repository.interface';
import { BaseEntityInterface } from '../interfaces/model.interface';

export abstract class BaseRepository<T extends Model & BaseEntityInterface> implements IBaseRepository<T> {
    protected model: ModelCtor<T>;

    constructor(model: ModelCtor<T>) {
        this.model = model;
    }

    async findAll(): Promise<T[]> {
        return this.model.findAll();
    }

    async findById(id: string): Promise<T | null> {
        return this.model.findByPk(id);
    }

    async create(item: Partial<T>): Promise<T> {
        return this.model.create(item as any);
    }

    async update(id: string, item: Partial<T>): Promise<T | null> {
        const record = await this.findById(id);
        if (!record) {
            return null;
        }

        return record.update(item);
    }

    async delete(id: string): Promise<boolean> {
        const record = await this.findById(id);
        if (!record) {
            return false;
        }

        await record.destroy();
        return true;
    }
}
