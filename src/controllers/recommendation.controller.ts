import { Request, Response } from 'express';
import {
    RecommendationService,
    CreateRecommendationDto,
    VerificationDto,
    SchedulingDto,
    InspectionDto,
    PublishDto,
} from '../services/recommendation.service';
import { RecommendationFilterOptions } from '../repositories/recommendation.repository';

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Recommendation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         pemohon_id:
 *           type: string
 *           format: uuid
 *         nomor_rekomendasi:
 *           type: string
 *         surat_rekomendasi:
 *           type: string
 *         tanggal_surat_rekomendasi:
 *           type: string
 *           format: date
 *         pemodalan:
 *           type: number
 *           format: decimal
 *         pemeriksa:
 *           type: array
 *           items:
 *             type: string
 *         inspectors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *                 description: Nama pemeriksa (decrypted)
 *               email:
 *                 type: string
 *                 description: Email pemeriksa (decrypted)
 *               role:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *         tenaga_kerja_sd:
 *           type: integer
 *         tenaga_kerja_smp:
 *           type: integer
 *         tenaga_kerja_sma:
 *           type: integer
 *         tenaga_kerja_s1_tani:
 *           type: integer
 *         tenaga_kerja_s1_nontani:
 *           type: integer
 *         tanggal_verifikasi_dokumen:
 *           type: string
 *           format: date-time
 *         tanggal_verifikasi_penjadwalan:
 *           type: string
 *           format: date-time
 *         tanggal_verifikasi_lapangan:
 *           type: string
 *           format: date-time
 *         tanggal_verifikasi_penerbitan:
 *           type: string
 *           format: date-time
 *         tanggal_pemeriksaan:
 *           type: string
 *           format: date
 *         is_sertifikasi:
 *           type: boolean
 *         status:
 *           type: integer
 *           enum: [1, 2, 3, 4, 5, 6]
 *           description: 1=Verifikasi Dokumen, 2=Penjadwalan Pemeriksaan, 3=Verifikasi Lapangan, 4=Penerbitan Surat, 5=Selesai, 6=Ditolak
 *         catatan_verifikasi:
 *           type: string
 *         catatan_pemeriksaan:
 *           type: string
 *         file_penguasaan_benih:
 *           type: string
 *         link_dokumen_pendukung:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateRecommendationRequest:
 *       type: object
 *       properties:
 *         pemodalan:
 *           type: number
 *           format: decimal
 *           description: Jumlah modal atau dana yang dibutuhkan
 *         tenaga_kerja_sd:
 *           type: integer
 *           default: 0
 *         tenaga_kerja_smp:
 *           type: integer
 *           default: 0
 *         tenaga_kerja_sma:
 *           type: integer
 *           default: 0
 *         tenaga_kerja_s1_tani:
 *           type: integer
 *           default: 0
 *         tenaga_kerja_s1_nontani:
 *           type: integer
 *           default: 0
 *         file_penguasaan_benih:
 *           type: string
 *           format: binary
 *           description: File dokumen penguasaan benih (PDF, DOC, DOCX, JPG, PNG)
 *         link_dokumen_pendukung:
 *           type: string
 *     VerificationRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         catatan_verifikasi:
 *           type: string
 *         status:
 *           type: string
 *           enum: [approve, reject]
 *     SchedulingRequest:
 *       type: object
 *       required:
 *         - tanggal_pemeriksaan
 *         - pemeriksa
 *       properties:
 *         tanggal_pemeriksaan:
 *           type: string
 *           format: date
 *         pemeriksa:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *     InspectionRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         catatan_pemeriksaan:
 *           type: string
 *         status:
 *           type: string
 *           enum: [approve, reject]
 *     PublishRequest:
 *       type: object
 *       required:
 *         - nomor_rekomendasi
 *         - surat_rekomendasi
 *       properties:
 *         nomor_rekomendasi:
 *           type: string
 *         surat_rekomendasi:
 *           type: string
 */

export class RecommendationController {
    private recommendationService: RecommendationService;

    constructor() {
        this.recommendationService = new RecommendationService();
    }

    /**
     * @swagger
     * /api/recommendations:
     *   get:
     *     summary: Get recommendations based on user role
     *     tags: [Recommendations]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *       - in: query
     *         name: status
     *         schema:
     *           type: integer
     *           enum: [1, 2, 3, 4, 5, 6]
     *     responses:
     *       200:
     *         description: Recommendations retrieved successfully
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Internal server error
     */
    getAllRecommendations = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = (req as any).user;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const filters: RecommendationFilterOptions = {
                status: req.query.status ? parseInt(req.query.status as string) : undefined,
            };

            const result = await this.recommendationService.getRecommendationsByRole(
                user.role,
                user.id,
                filters,
                page,
                limit
            );

            res.status(200).json({
                success: true,
                message: 'Recommendations retrieved successfully',
                data: result.rows,
                meta: {
                    total: result.count,
                    totalPage: result.totalPages,
                    currentPage: result.currentPage,
                    limit: limit
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving recommendations',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };

    /**
     * @swagger
     * /api/recommendations/{id}:
     *   get:
     *     summary: Get recommendation by ID
     *     tags: [Recommendations]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Recommendation retrieved successfully
     *       404:
     *         description: Recommendation not found
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Internal server error
     */
    getRecommendationById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const recommendation = await this.recommendationService.getRecommendationById(id);

            if (!recommendation) {
                res.status(404).json({
                    success: false,
                    message: 'Recommendation not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Recommendation retrieved successfully',
                data: recommendation,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving recommendation',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };

    /**
     * @swagger
     * /api/recommendations:
     *   post:
     *     summary: Create a new recommendation
     *     tags: [Recommendations]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               pemodalan:
     *                 type: number
     *                 format: decimal
     *                 description: Jumlah modal atau dana yang dibutuhkan
     *               tenaga_kerja_sd:
     *                 type: integer
     *                 default: 0
     *               tenaga_kerja_smp:
     *                 type: integer
     *                 default: 0
     *               tenaga_kerja_sma:
     *                 type: integer
     *                 default: 0
     *               tenaga_kerja_s1_tani:
     *                 type: integer
     *                 default: 0
     *               tenaga_kerja_s1_nontani:
     *                 type: integer
     *                 default: 0
     *               file_penguasaan_benih:
     *                 type: string
     *                 format: binary
     *                 description: File dokumen penguasaan benih (PDF, DOC, DOCX, JPG, PNG)
     *               link_dokumen_pendukung:
     *                 type: string
     *                 description: Link to supporting documents
     *             required:
     *               - file_penguasaan_benih
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateRecommendationRequest'
     *     responses:
     *       201:
     *         description: Recommendation created successfully
     *       400:
     *         description: Bad request
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Internal server error
     */
    createRecommendation = async (req: MulterRequest, res: Response): Promise<void> => {
        try {
            const user = (req as any).user;

            // Only petani and perusahaan can create recommendations
            if (!['petani', 'perusahaan'].includes(user.role)) {
                res.status(403).json({
                    success: false,
                    message: 'Only petani and perusahaan can create recommendations',
                });
                return;
            }

            // Find profile applicant for this user
            const profileApplicant = await this.recommendationService.findProfileApplicantByUserId(user.id);
            if (!profileApplicant) {
                res.status(404).json({
                    success: false,
                    message: 'Profile applicant not found',
                });
                return;
            }

            // Handle file upload for file_penguasaan_benih
            let filePath: string | undefined;
            if (req.file) {
                filePath = req.file?.filename;
            } else if (req.body.file_penguasaan_benih && typeof req.body.file_penguasaan_benih === 'string') {
                // If it's a string (direct file path), keep it as is
                filePath = req.body.file_penguasaan_benih;
            }

            if (!filePath) {
                res.status(400).json({
                    success: false,
                    message: 'File penguasaan benih is required',
                });
                return;
            }

            const recommendationData: CreateRecommendationDto = {
                pemohon_id: profileApplicant.id,
                ...req.body,
                file_penguasaan_benih: filePath,
            };

            const recommendation = await this.recommendationService.createRecommendation(recommendationData);

            res.status(201).json({
                success: true,
                message: 'Recommendation created successfully',
                data: recommendation,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating recommendation',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };

    /**
     * @swagger
     * /api/recommendations/{id}/verification:
     *   post:
     *     summary: Verify recommendation (verifikatur only)
     *     tags: [Recommendations]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/VerificationRequest'
     *     responses:
     *       200:
     *         description: Recommendation verified successfully
     *       400:
     *         description: Bad request
     *       403:
     *         description: Forbidden
     *       404:
     *         description: Recommendation not found
     *       500:
     *         description: Internal server error
     */
    verifyRecommendation = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = (req as any).user;
            const { id } = req.params;

            if (user.role !== 'verifikatur') {
                res.status(403).json({
                    success: false,
                    message: 'Only verifikatur can verify recommendations',
                });
                return;
            }

            const verificationData: VerificationDto = req.body;

            if (!['approve', 'reject'].includes(verificationData.status)) {
                res.status(400).json({
                    success: false,
                    message: 'Status must be approve or reject',
                });
                return;
            }

            const recommendation = await this.recommendationService.verifyRecommendation(id, verificationData);

            res.status(200).json({
                success: true,
                message: 'Recommendation verified successfully',
                data: recommendation,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error verifying recommendation',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };

    /**
     * @swagger
     * /api/recommendations/{id}/scheduling:
     *   post:
     *     summary: Schedule recommendation inspection (inspektur_ketua only)
     *     tags: [Recommendations]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/SchedulingRequest'
     *     responses:
     *       200:
     *         description: Recommendation scheduled successfully
     *       400:
     *         description: Bad request
     *       403:
     *         description: Forbidden
     *       404:
     *         description: Recommendation not found
     *       500:
     *         description: Internal server error
     */
    scheduleRecommendation = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = (req as any).user;
            const { id } = req.params;

            if (user.role !== 'inspektur_ketua') {
                res.status(403).json({
                    success: false,
                    message: 'Only inspektur_ketua can schedule recommendations',
                });
                return;
            }

            const schedulingData: SchedulingDto = req.body;

            if (!schedulingData.tanggal_pemeriksaan || !schedulingData.pemeriksa || !Array.isArray(schedulingData.pemeriksa)) {
                res.status(400).json({
                    success: false,
                    message: 'tanggal_pemeriksaan and pemeriksa array are required',
                });
                return;
            }

            schedulingData.tanggal_pemeriksaan = new Date(schedulingData.tanggal_pemeriksaan);

            const recommendation = await this.recommendationService.scheduleRecommendation(id, schedulingData);

            res.status(200).json({
                success: true,
                message: 'Recommendation scheduled successfully',
                data: recommendation,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error scheduling recommendation',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };

    /**
     * @swagger
     * /api/recommendations/{id}/inspection:
     *   post:
     *     summary: Inspect recommendation (inspektur only)
     *     tags: [Recommendations]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/InspectionRequest'
     *     responses:
     *       200:
     *         description: Recommendation inspected successfully
     *       400:
     *         description: Bad request
     *       403:
     *         description: Forbidden
     *       404:
     *         description: Recommendation not found
     *       500:
     *         description: Internal server error
     */
    inspectRecommendation = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = (req as any).user;
            const { id } = req.params;

            if (user.role !== 'inspektur') {
                res.status(403).json({
                    success: false,
                    message: 'Only inspektur can inspect recommendations',
                });
                return;
            }

            const inspectionData: InspectionDto = req.body;

            if (!['approve', 'reject'].includes(inspectionData.status)) {
                res.status(400).json({
                    success: false,
                    message: 'Status must be approve or reject',
                });
                return;
            }

            const recommendation = await this.recommendationService.inspectRecommendation(id, inspectionData);

            res.status(200).json({
                success: true,
                message: 'Recommendation inspected successfully',
                data: recommendation,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error inspecting recommendation',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };

    /**
     * @swagger
     * /api/recommendations/{id}/publish:
     *   post:
     *     summary: Publish recommendation (kepala only)
     *     tags: [Recommendations]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               nomor_rekomendasi:
     *                 type: string
     *                 description: Recommendation number
     *               surat_rekomendasi:
     *                 type: string
     *                 format: binary
     *                 description: Recommendation letter file (PDF, DOC, DOCX, or images)
     *             required:
     *               - nomor_rekomendasi
     *               - surat_rekomendasi
     *     responses:
     *       200:
     *         description: Recommendation published successfully
     *       400:
     *         description: Bad request
     *       403:
     *         description: Forbidden
     *       404:
     *         description: Recommendation not found
     *       500:
     *         description: Internal server error
     */
    publishRecommendation = async (req: MulterRequest, res: Response): Promise<void> => {
        try {
            const user = (req as any).user;
            const { id } = req.params;

            if (user.role !== 'kepala') {
                res.status(403).json({
                    success: false,
                    message: 'Only kepala can publish recommendations',
                });
                return;
            }

            const { nomor_rekomendasi } = req.body;
            const surat_rekomendasi = req.file?.filename;

            if (!nomor_rekomendasi || !surat_rekomendasi) {
                res.status(400).json({
                    success: false,
                    message: 'nomor_rekomendasi and surat_rekomendasi file are required',
                });
                return;
            }

            const publishData: PublishDto = {
                nomor_rekomendasi,
                surat_rekomendasi,
            };

            const recommendation = await this.recommendationService.publishRecommendation(id, publishData);

            res.status(200).json({
                success: true,
                message: 'Recommendation published successfully',
                data: recommendation,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error publishing recommendation',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };
}

export default RecommendationController;
