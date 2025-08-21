import { RoleInterface } from '../interfaces/model.interface';
import { RoleRepository } from '../repositories/role.repository';
import { BaseService } from './base.service';

export class RoleService extends BaseService<RoleInterface> {
    private roleRepository: RoleRepository;

    constructor() {
        const repository = new RoleRepository();
        super(repository);
        this.roleRepository = repository;
    }

    async findByName(roleName: string): Promise<RoleInterface | null> {
        return this.roleRepository.findByName(roleName);
    }
}
