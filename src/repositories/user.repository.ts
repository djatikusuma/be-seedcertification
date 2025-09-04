import { BaseRepository } from './base.repository';
import User from '../models/User.model';
import { UserInterface } from '../interfaces/model.interface';
import { Op } from 'sequelize';

export class UserRepository extends BaseRepository<User> {
    constructor() {
        super(User);
    }

    async findByEmail(email: string): Promise<User | null> {
        // Use the User model's findByEmail method which handles encrypted data
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

    async emailExists(email: string): Promise<boolean> {
        return await User.emailExists(email);
    }

    /**
     * Find user by ID with profile relationship
     */
    async findByIdWithProfile(id: string): Promise<User | null> {
        return await User.findByPk(id, {
            include: [
                'role',
                'profile',
                'profileApplicant'
            ]
        });
    }

    /**
     * Find multiple users by IDs
     */
    async findByIds(ids: string[]): Promise<User[]> {
        return await User.findAll({
            where: {
                id: {
                    [Op.in]: ids
                }
            },
            include: ['role', 'profile', 'profileApplicant']
        });
    }

    /**
     * Find users by role with pagination
     */
    async findByRole(
        roleName: string,
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
            include: [
                {
                    model: require('../models/Role.model').default,
                    as: 'role',
                    where: {
                        roleName: roleName
                    }
                }
            ],
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
}
