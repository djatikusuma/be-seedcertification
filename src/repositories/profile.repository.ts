import { BaseRepository } from './base.repository';
import { Profile } from '../models/Profile.model';
import { User } from '../models/User.model';

export class ProfileRepository extends BaseRepository<Profile> {
    constructor() {
        super(Profile);
    }

    async findByUserId(userId: string): Promise<Profile | null> {
        return await this.model.findOne({
            where: { userId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email'],
                },
            ],
        });
    }

    async findByNik(nik: string): Promise<Profile | null> {
        // Use the Profile model's findByNik method which handles encrypted data
        return await Profile.findByNik(nik);
    }

    async createProfile(profileData: Partial<Profile>): Promise<Profile> {
        return await this.model.create(profileData as any);
    }

    async updateByUserId(userId: string, profileData: Partial<Profile>): Promise<Profile | null> {
        const [affectedCount] = await this.model.update(profileData, {
            where: { userId },
        });

        if (affectedCount > 0) {
            return await this.findByUserId(userId);
        }

        return null;
    }

    async deleteByUserId(userId: string): Promise<boolean> {
        const deletedCount = await this.model.destroy({
            where: { userId },
        });

        return deletedCount > 0;
    }
}

export default ProfileRepository;
