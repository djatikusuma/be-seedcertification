import { BaseRepository } from './base.repository';
import { ProfileApplicant } from '../models/ProfileApplicant.model';
import { User } from '../models/User.model';
import { Role } from '../models/Role.model';

export class ProfileApplicantRepository extends BaseRepository<ProfileApplicant> {
    constructor() {
        super(ProfileApplicant);
    }

    async findByUserId(userId: string): Promise<ProfileApplicant | null> {
        return await this.model.findOne({
            where: { userId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email'],
                    include: [
                        {
                            model: Role,
                            as: 'role',
                            attributes: ['id', 'roleName'],
                        },
                    ],
                },
            ],
        });
    }

    async findByNik(nik: string): Promise<ProfileApplicant | null> {
        // Use the ProfileApplicant model's findByNik method which handles encrypted data
        return await ProfileApplicant.findByNik(nik);
    }

    async findByEmail(email: string): Promise<ProfileApplicant | null> {
        // Use the ProfileApplicant model's findByEmail method which handles encrypted data
        return await ProfileApplicant.findByEmail(email);
    }

    async findByRoleName(roleName: string): Promise<ProfileApplicant[]> {
        return await this.model.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email'],
                    include: [
                        {
                            model: Role,
                            as: 'role',
                            attributes: ['id', 'roleName'],
                            where: { roleName },
                        },
                    ],
                },
            ],
        });
    }

    async createProfile(profileData: Partial<ProfileApplicant>): Promise<ProfileApplicant> {
        return await this.model.create(profileData as any);
    }

    async updateByUserId(userId: string, profileData: Partial<ProfileApplicant>): Promise<ProfileApplicant | null> {
        // Find the profile instance first
        const profile = await this.model.findOne({
            where: { userId }
        });

        if (!profile) {
            return null;
        }

        // Use instance update method to trigger hooks
        await profile.update(profileData);

        // Reload to get fresh data with relations
        return await this.findByUserId(userId);
    }

    async deleteByUserId(userId: string): Promise<boolean> {
        const deletedCount = await this.model.destroy({
            where: { userId },
        });

        return deletedCount > 0;
    }
}

export default ProfileApplicantRepository;
