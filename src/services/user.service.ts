import { UserInterface } from '../interfaces/model.interface';
import { UserRepository } from '../repositories/user.repository';
import { BaseService } from './base.service';
import { User } from '../models/User.model';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';

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

    async findAllWithMasking(
        requestingUserRole: string = 'guest',
        page: number = 1,
        limit: number = 10,
        roleFilter?: string | null
    ): Promise<{
        users: Partial<UserInterface>[];
        total: number;
        totalPages: number;
        currentPage: number;
    }> {
        const offset = (page - 1) * limit;

        // Build where clause for role filtering
        const whereClause: any = {};
        const includeClause: any = ['role'];

        // If role filter is provided, add it to include clause with where condition
        if (roleFilter) {
            includeClause[0] = {
                model: require('../models/Role.model').default,
                as: 'role',
                where: {
                    roleName: roleFilter
                }
            };
        }

        const { count, rows } = await User.findAndCountAll({
            attributes: { exclude: ['password'] },
            include: includeClause,
            where: whereClause,
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        const maskedUsers = User.applyMaskingToArray(rows, requestingUserRole);

        return {
            users: maskedUsers,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        };
    }

    async searchUsersWithMasking(
        searchTerm: string,
        requestingUserRole: string = 'guest',
        page: number = 1,
        limit: number = 10
    ): Promise<{
        users: Partial<UserInterface>[];
        total: number;
        totalPages: number;
        currentPage: number;
    }> {
        const offset = (page - 1) * limit;

        const { count, rows } = await User.findAndCountAll({
            attributes: { exclude: ['password'] },
            include: ['role'],
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${searchTerm}%` } },
                    { email: { [Op.like]: `%${searchTerm}%` } }
                ]
            },
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']]
        });

        const maskedUsers = User.applyMaskingToArray(rows, requestingUserRole);

        return {
            users: maskedUsers,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        };
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

        // Find the user instance first
        const userInstance = await User.findByPk(id);
        if (!userInstance) {
            return null;
        }

        // Update using instance method to trigger encryption hooks
        await userInstance.update(updateData);

        // Return updated user with masking
        return this.findByIdWithMasking(id, requestingUserRole);
    }
}
