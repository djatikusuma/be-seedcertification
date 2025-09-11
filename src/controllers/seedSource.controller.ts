import { Request, Response } from 'express';
import { SeedSourceService } from '../services/seedSource.service';
import { ProfileApplicant } from '../models/ProfileApplicant.model';

export class SeedSourceController {
    private seedSourceService: SeedSourceService;

    constructor() {
        this.seedSourceService = new SeedSourceService();
    }

    /**
     * @swagger
     * /api/seed-source:
     *   get:
     *     summary: Get all seed sources
     *     description: Get all seed sources with filtering. Pemohon sees only their own, others see all.
     *     tags: [Seed Source]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *         description: Page number
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *         description: Items per page
     *       - in: query
     *         name: status
     *         schema:
     *           type: integer
     *           enum: [1, 2, 3]
     *         description: Filter by status (1=Verifikasi Dokumen, 2=Diterima, 3=Ditolak)
     *     responses:
     *       200:
     *         description: List of seed sources
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Server error
     */
    getAllSeedSources = async (req: Request, res: Response) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
            const status = req.query.status ? parseInt(req.query.status as string) : undefined;

            const user = (req as any).user;
            const userRole = user?.role?.roleName;
            let pemohonId: string | undefined;

            // If user is pemohon (petani or perusahaan), filter by their pemohon_id
            if (userRole === 'petani' || userRole === 'perusahaan') {
                const pemohon = await ProfileApplicant.findOne({
                    where: { userId: user.id }
                });

                if (!pemohon) {
                    return res.status(404).json({
                        status: 'error',
                        message: 'Profile pemohon not found'
                    });
                }

                pemohonId = pemohon.id;
            }

            const result = await this.seedSourceService.getAllSeedSources(
                page,
                limit,
                pemohonId,
                status
            );

            res.status(200).json({
                status: 'success',
                data: result.items,
                meta: {
                    total: result.total,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                    limit: limit,
                    filters: {
                        status: status,
                        pemohon_id: pemohonId
                    }
                }
            });
        } catch (error) {
            console.error('Error fetching seed sources:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch seed sources',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * @swagger
     * /api/seed-source/{id}:
     *   get:
     *     summary: Get seed source by ID
     *     description: Get detailed information about a specific seed source
     *     tags: [Seed Source]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Seed source ID
     *     responses:
     *       200:
     *         description: Seed source details
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     *       404:
     *         description: Seed source not found
     *       500:
     *         description: Server error
     */
    getSeedSourceById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const user = (req as any).user;
            const userRole = user?.role?.roleName;

            const seedSource = await this.seedSourceService.getSeedSourceById(id);

            if (!seedSource) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Seed source not found'
                });
            }

            // Check permission: pemohon can only view their own
            if (userRole === 'petani' || userRole === 'perusahaan') {
                const pemohon = await ProfileApplicant.findOne({
                    where: { userId: user.id }
                });

                if (!pemohon || seedSource.pemohon_id !== pemohon.id) {
                    return res.status(403).json({
                        status: 'error',
                        message: 'Access denied'
                    });
                }
            }

            res.status(200).json({
                status: 'success',
                data: seedSource
            });
        } catch (error) {
            console.error('Error fetching seed source:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch seed source',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * @swagger
     * /api/seed-source:
     *   post:
     *     summary: Create new seed source
     *     description: Create a new seed source application (only for petani and perusahaan roles)
     *     tags: [Seed Source]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             required:
     *               - nomor_penetapan
     *               - tanggal_penetapan
     *               - file_penetapan_sumber_benih
     *             properties:
     *               nomor_penetapan:
     *                 type: string
     *                 description: Nomor penetapan sumber benih
     *                 example: "SP-001/2024"
     *               tanggal_penetapan:
     *                 type: string
     *                 format: date
     *                 description: Tanggal penetapan
     *                 example: "2024-01-15"
     *               file_penetapan_sumber_benih:
     *                 type: string
     *                 format: binary
     *                 description: File penetapan sumber benih (PDF, DOC, DOCX)
     *     responses:
     *       201:
     *         description: Seed source created successfully
     *       400:
     *         description: Bad request - Missing required fields or invalid file
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     *       500:
     *         description: Server error
     */
    createSeedSource = async (req: Request, res: Response) => {
        try {
            const { nomor_penetapan, tanggal_penetapan } = req.body;
            const uploadedFile = req.file; // File dari multer middleware
            const user = (req as any).user;
            const userRole = user?.role;

            // Only petani and perusahaan can create seed sources
            if (userRole !== 'petani' && userRole !== 'perusahaan') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Only petani and perusahaan can create seed source applications'
                });
            }

            // Validate required fields
            if (!nomor_penetapan || !tanggal_penetapan || !uploadedFile) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Missing required fields: nomor_penetapan, tanggal_penetapan, and file_penetapan_sumber_benih (uploaded file)'
                });
            }

            // Validate file type (optional - you can add more restrictions)
            const allowedMimeTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];

            if (!allowedMimeTypes.includes(uploadedFile.mimetype)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed'
                });
            }

            // Validate file size (optional - e.g., max 5MB)
            const maxFileSize = 5 * 1024 * 1024; // 5MB
            if (uploadedFile.size > maxFileSize) {
                return res.status(400).json({
                    status: 'error',
                    message: 'File size too large. Maximum allowed size is 5MB'
                });
            }

            // Get pemohon profile
            const pemohon = await ProfileApplicant.findOne({
                where: { userId: user.id }
            });

            if (!pemohon) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Profile pemohon not found'
                });
            }

            // Create seed source with uploaded file path
            const seedSource = await this.seedSourceService.createSeedSource({
                pemohonId: pemohon.id,
                nomorPenetapan: nomor_penetapan,
                tanggalPenetapan: new Date(tanggal_penetapan),
                filePenetapanSumberBenih: uploadedFile.filename || uploadedFile.path // Path to the uploaded file
            });

            res.status(201).json({
                status: 'success',
                message: 'Seed source created successfully',
                data: {
                    ...seedSource.toJSON(),
                    file_info: {
                        original_name: uploadedFile.originalname,
                        filename: uploadedFile.filename,
                        file_size: uploadedFile.size,
                        mime_type: uploadedFile.mimetype,
                        uploaded_at: new Date()
                    }
                }
            });
        } catch (error) {
            console.error('Error creating seed source:', error);

            // Handle multer errors
            if (error instanceof Error) {
                // Handle file upload errors
                if (error.message.includes('Invalid file type')) {
                    return res.status(400).json({
                        status: 'error',
                        message: error.message
                    });
                }
                if (error.message.includes('File too large')) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'File size too large. Maximum allowed size is 5MB'
                    });
                }
                // Handle business logic errors
                if (error.message === 'Nomor penetapan already exists') {
                    return res.status(400).json({
                        status: 'error',
                        message: error.message
                    });
                }
                if (error.message === 'Pemohon not found') {
                    return res.status(404).json({
                        status: 'error',
                        message: error.message
                    });
                }
            }

            res.status(500).json({
                status: 'error',
                message: 'Failed to create seed source',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * @swagger
     * /api/seed-source/{id}/verification:
     *   post:
     *     summary: Verify seed source
     *     description: Approve or reject a seed source application (only for verifikatur role)
     *     tags: [Seed Source]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Seed source ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - status
     *             properties:
     *               status:
     *                 type: string
     *                 enum: [approve, reject]
     *                 description: Verification decision
     *               catatan_verifikasi:
     *                 type: string
     *                 description: Verification notes (optional)
     *     responses:
     *       200:
     *         description: Verification completed successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     *       404:
     *         description: Seed source not found
     *       500:
     *         description: Server error
     */
    verifySeedSource = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { status, catatan_verifikasi } = req.body;
            const user = (req as any).user;
            const userRole = user?.role?.roleName;

            // Only verifikatur can perform verification
            if (userRole !== 'verifikatur') {
                return res.status(403).json({
                    status: 'error',
                    message: 'Only verifikatur can perform verification'
                });
            }

            // Validate status
            if (!status || !['approve', 'reject'].includes(status)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid status. Must be "approve" or "reject"'
                });
            }

            const verifiedSeedSource = await this.seedSourceService.verifySeedSource(
                id,
                user.id,
                status,
                catatan_verifikasi
            );

            if (!verifiedSeedSource) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Seed source not found'
                });
            }

            res.status(200).json({
                status: 'success',
                message: `Seed source ${status === 'approve' ? 'approved' : 'rejected'} successfully`,
                data: verifiedSeedSource
            });
        } catch (error) {
            console.error('Error verifying seed source:', error);

            // Handle specific errors
            if (error instanceof Error) {
                if (error.message === 'Seed source not found') {
                    return res.status(404).json({
                        status: 'error',
                        message: error.message
                    });
                }
                if (error.message === 'Seed source is not in verification status') {
                    return res.status(400).json({
                        status: 'error',
                        message: error.message
                    });
                }
            }

            res.status(500).json({
                status: 'error',
                message: 'Failed to verify seed source',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}

export default SeedSourceController;
