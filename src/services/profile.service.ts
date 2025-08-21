import { BaseService } from './base.service';
import { Profile } from '../models/Profile.model';
import { ProfileRepository } from '../repositories/profile.repository';

export class ProfileService extends BaseService<Profile> {
    private profileRepository: ProfileRepository;

    constructor() {
        const profileRepository = new ProfileRepository();
        super(profileRepository);
        this.profileRepository = profileRepository;
    }

    async getProfileByUserId(userId: string): Promise<Profile | null> {
        return await this.profileRepository.findByUserId(userId);
    }

    async getProfileByNik(nik: string): Promise<Profile | null> {
        return await this.profileRepository.findByNik(nik);
    }

    async createProfile(profileData: Partial<Profile>): Promise<Profile> {
        // Validate required fields
        if (!profileData.userId || !profileData.nik || !profileData.nama) {
            throw new Error('userId, nik, and nama are required fields');
        }

        // Check if profile already exists for this user
        const existingProfile = await this.profileRepository.findByUserId(profileData.userId);
        if (existingProfile) {
            throw new Error('Profile already exists for this user');
        }

        return await this.profileRepository.createProfile(profileData);
    }

    async updateProfile(userId: string, profileData: Partial<Profile>): Promise<Profile | null> {
        // Remove userId from update data to prevent modification
        const { userId: _, ...updateData } = profileData;

        return await this.profileRepository.updateByUserId(userId, updateData);
    }

    async deleteProfile(userId: string): Promise<boolean> {
        return await this.profileRepository.deleteByUserId(userId);
    }

    async getAllProfiles(): Promise<Profile[]> {
        return await this.profileRepository.findAll();
    }
}

export default ProfileService;
