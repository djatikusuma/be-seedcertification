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

/**
 * @swagger
 * components:
 *   schemas:
 *     ApplicantProfile:
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
 *         nik:
 *           type: string
 *           description: National ID number
 *         npwp:
 *           type: string
 *           description: Tax ID number
 *         email:
 *           type: string
 *           format: email
 *           description: Email address
 *         namaPemohon:
 *           type: string
 *           description: Applicant name
 *         telepon:
 *           type: string
 *           description: Phone number
 *         alamatPemohon:
 *           type: string
 *           description: Applicant address
 *         fotoPemohon:
 *           type: string
 *           description: Applicant photo URL
 *         alamatPerusahaan:
 *           type: string
 *           description: Company address
 *         lokasiPerbenihan:
 *           type: string
 *           description: Seed location
 *         nikKuasa:
 *           type: string
 *           description: Attorney NIK
 *         namaKuasa:
 *           type: string
 *           description: Attorney name
 *         fotoKuasa:
 *           type: string
 *           description: Attorney photo URL
 *         fileAktaPendirian:
 *           type: string
 *           description: Company incorporation document URL
 *         fileKtp:
 *           type: string
 *           description: ID card file URL
 *         fileNpwp:
 *           type: string
 *           description: Tax ID file URL
 *         fileSuratKuasa:
 *           type: string
 *           description: Power of attorney document URL
 *         statusKepemilikan:
 *           type: string
 *           enum: [Milik Sendiri, Sewa, Bagi Hasil]
 *           description: Ownership status
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - nik
 *         - email
 *         - namaPemohon
 *     ApplicantProfileInput:
 *       type: object
 *       properties:
 *         nik:
 *           type: string
 *           description: National ID number
 *         npwp:
 *           type: string
 *           description: Tax ID number
 *         email:
 *           type: string
 *           format: email
 *           description: Email address
 *         namaPemohon:
 *           type: string
 *           description: Applicant name
 *         telepon:
 *           type: string
 *           description: Phone number
 *         alamatPemohon:
 *           type: string
 *           description: Applicant address
 *         alamatPerusahaan:
 *           type: string
 *           description: Company address
 *         lokasiPerbenihan:
 *           type: string
 *           description: Seed location
 *         nikKuasa:
 *           type: string
 *           description: Attorney NIK
 *         namaKuasa:
 *           type: string
 *           description: Attorney name
 *         statusKepemilikan:
 *           type: string
 *           enum: [Milik Sendiri, Sewa, Bagi Hasil]
 *           description: Ownership status
 *       required:
 *         - nik
 *         - email
 *         - namaPemohon
 */

export class ApplicantProfileController {
    private profileApplicantService: ProfileApplicantService;

    constructor() {
        this.profileApplicantService = new ProfileApplicantService();
    }

    /**
     * @swagger
     * /api/applicant-profiles/my-profile:
     *   get:
     *     summary: Get current user's applicant profile
     *     tags: [Profile]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Applicant profile retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   $ref: '#/components/schemas/ApplicantProfile'
     *       401:
     *         description: User not authenticated
     *       404:
     *         description: Applicant profile not found
     *       500:
     *         description: Internal server error
     */
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

    /**
     * @swagger
     * /api/applicant-profiles/my-profile:
     *   post:
     *     summary: Create applicant profile for current user
     *     tags: [Profile]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ApplicantProfileInput'
     *     responses:
     *       201:
     *         description: Applicant profile created successfully
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
     *                   $ref: '#/components/schemas/ApplicantProfile'
     *       400:
     *         description: Validation error
     *       401:
     *         description: User not authenticated
     *       500:
     *         description: Internal server error
     */
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

    /**
     * @swagger
     * /api/applicant-profiles/my-profile/upload-document:
     *   post:
     *     summary: Upload document for current user's applicant profile
     *     tags: [Profile]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               documentType:
     *                 type: string
     *                 enum: [foto_pemohon, foto_kuasa, file_akta_pendirian, file_ktp, file_npwp, file_surat_kuasa]
     *                 description: Type of document to upload
     *               file:
     *                 type: string
     *                 format: binary
     *                 description: Document file to upload
     *             required:
     *               - documentType
     *               - file
     *     responses:
     *       200:
     *         description: Document uploaded successfully
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
     *                   $ref: '#/components/schemas/ApplicantProfile'
     *       400:
     *         description: Validation error
     *       401:
     *         description: User not authenticated
     *       404:
     *         description: Applicant profile not found
     *       500:
     *         description: Internal server error
     */
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

    /**
     * @swagger
     * /api/applicant-profiles/all:
     *   get:
     *     summary: Get all applicant profiles (Admin only)
     *     tags: [Profile]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Applicant profiles retrieved successfully
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
     *                     $ref: '#/components/schemas/ApplicantProfile'
     *                 total:
     *                   type: number
     *       401:
     *         description: User not authenticated
     *       403:
     *         description: Access denied
     *       500:
     *         description: Internal server error
     */
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

    /**
     * @swagger
     * /api/applicant-profiles/petani:
     *   get:
     *     summary: Get all Petani profiles (Admin only)
     *     tags: [Profile]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Petani profiles retrieved successfully
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
     *                     $ref: '#/components/schemas/ApplicantProfile'
     *                 total:
     *                   type: number
     *       401:
     *         description: User not authenticated
     *       403:
     *         description: Access denied
     *       500:
     *         description: Internal server error
     */
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

    /**
     * @swagger
     * /api/applicant-profiles/perusahaan:
     *   get:
     *     summary: Get all Perusahaan profiles (Admin only)
     *     tags: [Profile]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Perusahaan profiles retrieved successfully
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
     *                     $ref: '#/components/schemas/ApplicantProfile'
     *                 total:
     *                   type: number
     *       401:
     *         description: User not authenticated
     *       403:
     *         description: Access denied
     *       500:
     *         description: Internal server error
     */
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
