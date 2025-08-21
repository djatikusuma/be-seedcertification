import { UserInterface } from '../interfaces/model.interface';
import { UserRepository } from '../repositories/user.repository';
import { BaseService } from './base.service';
import { User } from '../models/User.model';
import bcrypt from 'bcryptjs';

export class UserService extends BaseService<UserInterface> {
    private userRepository: UserRepository;

    constructor() {
        const repository = new UserRepository();
        super(repository);
        this.userRepository = repository;
    }

    async findByEmail(email: string): Promise<UserInterface | null> {
        // Use the model's findByEmail method that works with encrypted data
        return await User.findByEmail(email);
    }

    async create(user: Partial<UserInterface>): Promise<UserInterface> {
        // Check if email already exists
        if (user.email && await User.emailExists(user.email)) {
            throw new Error('Email already exists');
        }

        // Hash password before saving
        if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        }
        return this.repository.create(user);
    }
}
