import { Request, Response } from 'express';
import { ProfileApplicantService } from '../services/profileApplicant.service';

interface MulterRequest extends Request {
    file?: {
        path: string;
        filename: string;
        mimetype: string;
        size: number;
    };
}

export class ApplicantProfileController {
    private profileApplicantService: ProfileApplicantService;

    constructor() {
        this.profileApplicantService = new ProfileApplicantService();
    }

    // Get current user's applicant profile
    async getMyProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ message: 'User not authenticated' });
                return;
            }

            const profile = await this.profileApplicantService.getProfileByUserId(userId);
            if (!profile) {
                res.status(404).json({ message: 'Applicant profile not found' });
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

    // Create applicant profile for current user
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

            const profile = await this.profileApplicantService.createProfile(profileData);

            res.status(201).json({
                success: true,
                message: 'Applicant profile created successfully',
                data: profile,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to create applicant profile',
            });
        }
    }

    // Update current user's applicant profile
    async updateMyProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ message: 'User not authenticated' });
                return;
            }

            const profile = await this.profileApplicantService.updateProfile(userId, req.body);
            if (!profile) {
                res.status(404).json({ message: 'Applicant profile not found' });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Applicant profile updated successfully',
                data: profile,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to update applicant profile',
            });
        }
    }

    // Upload document for current user's applicant profile
    async uploadDocument(req: MulterRequest, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ message: 'User not authenticated' });
                return;
            }

            const { documentType } = req.body;
            const filePath = req.file?.path;

            if (!filePath) {
                res.status(400).json({ message: 'No file uploaded' });
                return;
            }

            if (!documentType) {
                res.status(400).json({ message: 'Document type is required' });
                return;
            }

            const profile = await this.profileApplicantService.uploadDocument(userId, documentType, filePath);
            if (!profile) {
                res.status(404).json({ message: 'Applicant profile not found' });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Document uploaded successfully',
                data: profile,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to upload document',
            });
        }
    }

    // Delete current user's applicant profile
    async deleteMyProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                res.status(401).json({ message: 'User not authenticated' });
                return;
            }

            const deleted = await this.profileApplicantService.deleteProfile(userId);
            if (!deleted) {
                res.status(404).json({ message: 'Applicant profile not found' });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Applicant profile deleted successfully',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete applicant profile',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    // Admin: Get all applicant profiles
    async getAllProfiles(req: Request, res: Response): Promise<void> {
        try {
            const profiles = await this.profileApplicantService.getAllProfiles();

            res.status(200).json({
                success: true,
                data: profiles,
                total: profiles.length,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get applicant profiles',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    // Admin: Get applicant profiles by role (Petani or Perusahaan)
    async getProfilesByRole(req: Request, res: Response): Promise<void> {
        try {
            const { role } = req.params;

            if (role !== 'Petani' && role !== 'Perusahaan') {
                res.status(400).json({ message: 'Invalid role. Must be "Petani" or "Perusahaan"' });
                return;
            }

            const profiles = await this.profileApplicantService.getProfilesByRole(role);

            res.status(200).json({
                success: true,
                data: profiles,
                total: profiles.length,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get applicant profiles by role',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    // Admin: Get Petani profiles
    async getPetaniProfiles(req: Request, res: Response): Promise<void> {
        try {
            const profiles = await this.profileApplicantService.getPetaniProfiles();

            res.status(200).json({
                success: true,
                data: profiles,
                total: profiles.length,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get Petani profiles',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    // Admin: Get Perusahaan profiles
    async getPerusahaanProfiles(req: Request, res: Response): Promise<void> {
        try {
            const profiles = await this.profileApplicantService.getPerusahaanProfiles();

            res.status(200).json({
                success: true,
                data: profiles,
                total: profiles.length,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get Perusahaan profiles',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    // Admin: Get applicant profile by user ID
    async getProfileByUserId(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            const profile = await this.profileApplicantService.getProfileByUserId(userId);
            if (!profile) {
                res.status(404).json({ message: 'Applicant profile not found' });
                return;
            }

            res.status(200).json({
                success: true,
                data: profile,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get applicant profile',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    // Admin: Get applicant profile by NIK
    async getProfileByNik(req: Request, res: Response): Promise<void> {
        try {
            const { nik } = req.params;

            const profile = await this.profileApplicantService.getProfileByNik(nik);
            if (!profile) {
                res.status(404).json({ message: 'Applicant profile not found' });
                return;
            }

            res.status(200).json({
                success: true,
                data: profile,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get applicant profile',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

    // Admin: Get applicant profile by email
    async getProfileByEmail(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.params;

            const profile = await this.profileApplicantService.getProfileByEmail(email);
            if (!profile) {
                res.status(404).json({ message: 'Applicant profile not found' });
                return;
            }

            res.status(200).json({
                success: true,
                data: profile,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get applicant profile',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}

export default ApplicantProfileController;
