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
                'profileApplicant',
                'profileInspector',
                'profileCompany'
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
            include: ['role', 'profileApplicant', 'profileInspector', 'profileCompany']
        });
    }
}
