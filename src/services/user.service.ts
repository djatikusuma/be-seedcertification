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

    async findAllWithMasking(requestingUserRole: string = 'guest'): Promise<Partial<UserInterface>[]> {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            include: ['role']
        });
        return User.applyMaskingToArray(users, requestingUserRole);
    }

    async findByIdWithMasking(id: string, requestingUserRole: string = 'guest'): Promise<Partial<UserInterface> | null> {
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] },
            include: ['role']
        });

        if (!user) {
            return null;
        }

        return user.applyMasking(requestingUserRole);
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

    async updateWithMasking(id: string, updateData: Partial<UserInterface>, requestingUserRole: string = 'guest'): Promise<Partial<UserInterface> | null> {
        // Check if email already exists (excluding current user)
        if (updateData.email) {
            const existingUser = await User.findByEmail(updateData.email);
            if (existingUser && existingUser.id !== id) {
                throw new Error('Email already exists');
            }
        }

        // Hash password if provided
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        const [affectedRows] = await User.update(updateData, {
            where: { id }
        });

        if (affectedRows === 0) {
            return null;
        }

        // Return updated user with masking
        return this.findByIdWithMasking(id, requestingUserRole);
    }
}
