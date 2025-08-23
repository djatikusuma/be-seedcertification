import { BaseService } from './base.service';
import { Profile } from '../models/Profile.model';
import { ProfileRepository } from '../repositories/profile.repository';
import { ProfileInterface } from '../interfaces/model.interface';

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

    async getProfileByUserIdWithMasking(userId: string, requestingUserRole: string = 'guest'): Promise<Partial<ProfileInterface> | null> {
        const profile = await this.profileRepository.findByUserId(userId);

        if (!profile) {
            return null;
        }

        return profile.applyMasking(requestingUserRole);
    }

    async getAllProfilesWithMasking(requestingUserRole: string = 'guest'): Promise<Partial<ProfileInterface>[]> {
        const profiles = await Profile.findAll({
            include: ['user']
        });
        return Profile.applyMaskingToArray(profiles, requestingUserRole);
    }

    async getProfileByNik(nik: string): Promise<Profile | null> {
        // Use the model's findByNik method that works with encrypted data
        return await Profile.findByNik(nik);
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

        // Check if NIK already exists
        if (await Profile.nikExists(profileData.nik)) {
            throw new Error('NIK already exists');
        }

        return await this.profileRepository.createProfile(profileData);
    }

    async updateProfile(userId: string, profileData: Partial<Profile>): Promise<Profile | null> {
        // Remove userId from update data to prevent modification
        const { userId: _, ...updateData } = profileData;

        // If updating NIK, check for duplicates
        if (updateData.nik) {
            const existingProfile = await Profile.findByNik(updateData.nik);
            if (existingProfile && existingProfile.userId !== userId) {
                throw new Error('NIK already exists');
            }
        }

        return await this.profileRepository.updateByUserId(userId, updateData);
    }

    async updateProfileWithMasking(userId: string, profileData: Partial<Profile>, requestingUserRole: string = 'guest'): Promise<Partial<ProfileInterface> | null> {
        const updatedProfile = await this.updateProfile(userId, profileData);

        if (!updatedProfile) {
            return null;
        }

        return updatedProfile.applyMasking(requestingUserRole);
    }

    async deleteProfile(userId: string): Promise<boolean> {
        return await this.profileRepository.deleteByUserId(userId);
    }

    async getAllProfiles(): Promise<Profile[]> {
        return await this.profileRepository.findAll();
    }
}

export default ProfileService;
