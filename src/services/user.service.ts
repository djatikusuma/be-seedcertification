import { UserInterface } from '../interfaces/model.interface';
import { UserRepository } from '../repositories/user.repository';
import { BaseService } from './base.service';
import bcrypt from 'bcryptjs';

export class UserService extends BaseService<UserInterface> {
    private userRepository: UserRepository;

    constructor() {
        const repository = new UserRepository();
        super(repository);
        this.userRepository = repository;
    }

    async findByEmail(email: string): Promise<UserInterface | null> {
        return this.userRepository.findByEmail(email);
    }

    async create(user: Partial<UserInterface>): Promise<UserInterface> {
        // Hash password before saving
        if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        }
        return this.repository.create(user);
    }
}
