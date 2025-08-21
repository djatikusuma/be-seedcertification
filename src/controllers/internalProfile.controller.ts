import { Request, Response } from 'express';
import { ProfileService } from '../services/profile.service';

export class InternalProfileController {
    private profileService: ProfileService;

    constructor() {
        this.profileService = new ProfileService();
    }

    // Get current user's internal profile
    async getMyProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ message: 'User not authenticated' });
                return;
            }

            const profile = await this.profileService.getProfileByUserId(userId);
            if (!profile) {
                res.status(404).json({ message: 'Internal profile not found' });
                return;
            }

            res.status(200).json({
                success: true,
                data: profile,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    // Create internal profile for current user
    async createMyProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ message: 'User not authenticated' });
                return;
            }

            const profileData = {
                userId,
                ...req.body,
            };

            const profile = await this.profileService.createProfile(profileData);

            res.status(201).json({
                success: true,
                message: 'Internal profile created successfully',
                data: profile,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create internal profile',
            });
        }
    }

    // Update current user's internal profile
    async updateMyProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ message: 'User not authenticated' });
                return;
            }

            const profile = await this.profileService.updateProfile(userId, req.body);
            if (!profile) {
                res.status(404).json({ message: 'Internal profile not found' });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Internal profile updated successfully',
                data: profile,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update internal profile',
            });
        }
    }

    // Delete current user's internal profile
    async deleteMyProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ message: 'User not authenticated' });
                return;
            }

            const deleted = await this.profileService.deleteProfile(userId);
            if (!deleted) {
                res.status(404).json({ message: 'Internal profile not found' });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Internal profile deleted successfully',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete internal profile',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    // Admin: Get all internal profiles
    async getAllProfiles(req: Request, res: Response): Promise<void> {
        try {
            const profiles = await this.profileService.getAllProfiles();

            res.status(200).json({
                success: true,
                data: profiles,
                total: profiles.length,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get internal profiles',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    // Admin: Get internal profile by user ID
    async getProfileByUserId(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            const profile = await this.profileService.getProfileByUserId(userId);
            if (!profile) {
                res.status(404).json({ message: 'Internal profile not found' });
                return;
            }

            res.status(200).json({
                success: true,
                data: profile,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get internal profile',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    // Admin: Get internal profile by NIK
    async getProfileByNik(req: Request, res: Response): Promise<void> {
        try {
            const { nik } = req.params;

            const profile = await this.profileService.getProfileByNik(nik);
            if (!profile) {
                res.status(404).json({ message: 'Internal profile not found' });
                return;
            }

            res.status(200).json({
                success: true,
                data: profile,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get internal profile',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}

export default InternalProfileController;
