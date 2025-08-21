import { BaseRepository } from './base.repository';
import Role from '../models/Role.model';
import { RoleInterface } from '../interfaces/model.interface';

export class RoleRepository extends BaseRepository<Role> {
    constructor() {
        super(Role);
    }

    async findByName(roleName: string): Promise<Role | null> {
        return this.model.findOne({ where: { roleName } });
    }
}
