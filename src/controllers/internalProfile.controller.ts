import { Request, Response } from 'express';
import { ProfileService } from '../services/profile.service';

/**
 * @swagger
 * components:
 *   schemas:
 *     InternalProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Profile ID
 *         userId:
 *           type: string
 *           format: uuid
 *           description: User ID
 *         nip:
 *           type: string
 *           description: Employee ID number
 *         nik:
 *           type: string
 *           description: National ID number
 *         nama:
 *           type: string
 *           description: Full name
 *         jabatan:
 *           type: string
 *           description: Job position
 *         telepon:
 *           type: string
 *           description: Phone number
 *         alamat:
 *           type: string
 *           description: Address
 *         golongan:
 *           type: string
 *           description: Employee grade
 *         pangkat:
 *           type: string
 *           description: Employee rank
 *         fotoUrl:
 *           type: string
 *           description: Profile photo URL
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - nik
 *         - nama
 *     InternalProfileInput:
 *       type: object
 *       properties:
 *         nip:
 *           type: string
 *           description: Employee ID number
 *         nik:
 *           type: string
 *           description: National ID number
 *         nama:
 *           type: string
 *           description: Full name
 *         jabatan:
 *           type: string
 *           description: Job position
 *         telepon:
 *           type: string
 *           description: Phone number
 *         alamat:
 *           type: string
 *           description: Address
 *         golongan:
 *           type: string
 *           description: Employee grade
 *         pangkat:
 *           type: string
 *           description: Employee rank
 *         fotoUrl:
 *           type: string
 *           description: Profile photo URL
 *       required:
 *         - nik
 *         - nama
 */

export class InternalProfileController {
    private profileService: ProfileService;

    constructor() {
        this.profileService = new ProfileService();
    }

    /**
     * @swagger
     * /api/internal-profiles/my-profile:
     *   get:
     *     summary: Get current user's internal profile
     *     tags: [Profile]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Internal profile retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   $ref: '#/components/schemas/InternalProfile'
     *       401:
     *         description: User not authenticated
     *       404:
     *         description: Internal profile not found
     *       500:
     *         description: Internal server error
     */
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

    /**
     * @swagger
     * /api/internal-profiles/my-profile:
     *   post:
     *     summary: Create internal profile for current user
     *     tags: [Profile]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/InternalProfileInput'
     *     responses:
     *       201:
     *         description: Internal profile created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *                 data:
     *                   $ref: '#/components/schemas/InternalProfile'
     *       400:
     *         description: Validation error
     *       401:
     *         description: User not authenticated
     *       500:
     *         description: Internal server error
     */
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

    /**
     * @swagger
     * /api/internal-profiles/my-profile:
     *   put:
     *     summary: Update current user's internal profile
     *     tags: [Profile]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/InternalProfileInput'
     *     responses:
     *       200:
     *         description: Internal profile updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *                 data:
     *                   $ref: '#/components/schemas/InternalProfile'
     *       400:
     *         description: Validation error
     *       401:
     *         description: User not authenticated
     *       404:
     *         description: Internal profile not found
     *       500:
     *         description: Internal server error
     */
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

    /**
     * @swagger
     * /api/internal-profiles/my-profile:
     *   delete:
     *     summary: Delete current user's internal profile
     *     tags: [Profile]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Internal profile deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *       401:
     *         description: User not authenticated
     *       404:
     *         description: Internal profile not found
     *       500:
     *         description: Internal server error
     */
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

    /**
     * @swagger
     * /api/internal-profiles/all:
     *   get:
     *     summary: Get all internal profiles (Admin only)
     *     tags: [Profile]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Internal profiles retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/InternalProfile'
     *                 total:
     *                   type: number
     *       401:
     *         description: User not authenticated
     *       403:
     *         description: Access denied
     *       500:
     *         description: Internal server error
     */
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
