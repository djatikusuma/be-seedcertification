import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import CertificationService from '../services/certification.service';
import { UserRepository } from '../repositories/user.repository';
import multer from 'multer';
import path from 'path';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/certifications/';

        if (file.fieldname === 'file_asal_benih') {
            uploadPath += 'asal-benih/';
        } else if (file.fieldname === 'file_dokumen_pendukung') {
            uploadPath += 'dokumen-pendukung/';
        } else if (file.fieldname === 'file_surat_sertifikat') {
            uploadPath += 'surat-sertifikat/';
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req: any, file: any, cb: any) => {
    // Allow only specific file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images and documents are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: fileFilter,
});

export class CertificationController {
    private certificationService: CertificationService;
    private userRepository: UserRepository;

    constructor() {
        this.certificationService = new CertificationService();
        this.userRepository = new UserRepository();
    }

    /**
     * GET /api/certifications
     * Get all certifications based on user role
     */
    async getAllCertifications(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userRole = req.user?.role;
            const userId = req.user?.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            // Extract filters from query
            const filters: any = {};
            if (req.query.status) filters.status = parseInt(req.query.status as string);
            if (req.query.tipe) filters.tipe = req.query.tipe;
            if (req.query.search) filters.search = req.query.search;

            if (!userRole || !userId) {
                res.status(401).json({
                    success: false,
                    message: 'User tidak terautentikasi',
                });
                return;
            }

            const result = await this.certificationService.getCertifications(
                userRole,
                userId,
                filters,
                page,
                limit
            );

            res.status(200).json({
                success: true,
                message: 'Data sertifikasi berhasil diambil',
                data: result.rows,
                pagination: {
                    currentPage: result.currentPage,
                    totalPages: result.totalPages,
                    totalItems: result.count,
                    itemsPerPage: limit,
                },
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Terjadi kesalahan saat mengambil data sertifikasi',
                error: error.message,
            });
        }
    }

    /**
     * POST /api/certifications
     * Create new certification (by pemohon)
     */
    async createCertification(req: AuthenticatedRequest, res: Response): Promise<void> {
        const uploadFields = upload.fields([
            { name: 'file_asal_benih', maxCount: 1 },
            { name: 'file_dokumen_pendukung', maxCount: 1 }
        ]);

        uploadFields(req, res, async (err) => {
            if (err) {
                res.status(400).json({
                    success: false,
                    message: 'Error uploading file: ' + err.message,
                });
                return;
            }

            try {
                const userRole = req.user?.role;
                const userId = req.user?.id;

                // Only petani and perusahaan can create certifications
                if (!['petani', 'perusahaan'].includes(userRole!)) {
                    res.status(403).json({
                        success: false,
                        message: 'Anda tidak memiliki akses untuk membuat sertifikasi',
                    });
                    return;
                }

                // Get user's profile to find pemohon_id
                const user = await this.userRepository.findByIdWithProfile(userId!);
                if (!user?.profileApplicant) {
                    res.status(400).json({
                        success: false,
                        message: 'Profile pemohon tidak ditemukan',
                    });
                    return;
                }

                const files = req.files as { [fieldname: string]: Express.Multer.File[] };

                const certificationData = {
                    rekomendasi_id: req.body.rekomendasi_id,
                    komoditas_id: req.body.komoditas_id,
                    jumlah_benih: parseFloat(req.body.jumlah_benih),
                    satuan: req.body.satuan,
                    varietas: req.body.varietas,
                    tipe: req.body.tipe as 'siaptanam' | 'pratanam',
                    file_asal_benih: files.file_asal_benih?.[0]?.filename,
                    file_dokumen_pendukung: files.file_dokumen_pendukung?.[0]?.filename,
                };

                const certification = await this.certificationService.createCertification(
                    certificationData,
                    user.profileApplicant.id
                );

                res.status(201).json({
                    success: true,
                    message: 'Sertifikasi berhasil dibuat',
                    data: certification,
                });
            } catch (error: any) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Terjadi kesalahan saat membuat sertifikasi',
                    error: error.message,
                });
            }
        });
    }

    /**
     * GET /api/certifications/:id
     * Get certification detail by ID
     */
    async getCertificationById(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const certification = await this.certificationService.getCertificationById(id);

            res.status(200).json({
                success: true,
                message: 'Detail sertifikasi berhasil diambil',
                data: certification,
            });
        } catch (error: any) {
            res.status(404).json({
                success: false,
                message: error.message || 'Sertifikasi tidak ditemukan',
                error: error.message,
            });
        }
    }

    /**
     * POST /api/certifications/:id/verification
     * Verify certification (by verifikatur)
     */
    async verifyCertification(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { catatan_administrasi, status } = req.body;
            const userRole = req.user?.role;

            // Only verifikatur can verify certifications
            if (userRole !== 'verifikatur') {
                res.status(403).json({
                    success: false,
                    message: 'Anda tidak memiliki akses untuk memverifikasi sertifikasi',
                });
                return;
            }

            const approved = status === 'approve';
            const certification = await this.certificationService.verifyCertification(
                id,
                catatan_administrasi || null,
                approved
            );

            res.status(200).json({
                success: true,
                message: `Sertifikasi berhasil ${approved ? 'disetujui' : 'ditolak'}`,
                data: certification,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Terjadi kesalahan saat memverifikasi sertifikasi',
                error: error.message,
            });
        }
    }

    /**
     * POST /api/certifications/:id/scheduling
     * Schedule certification (by inspektur_kepala)
     */
    async scheduleCertification(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { tanggal_jadwal_pemeriksaan, pemeriksa } = req.body;
            const userRole = req.user?.role;

            // Only inspektur_ketua can schedule
            if (userRole !== 'inspektur_ketua') {
                res.status(403).json({
                    success: false,
                    message: 'Anda tidak memiliki akses untuk menjadwalkan pemeriksaan',
                });
                return;
            }

            if (!tanggal_jadwal_pemeriksaan || !pemeriksa) {
                res.status(400).json({
                    success: false,
                    message: 'Tanggal jadwal pemeriksaan dan pemeriksa harus diisi',
                });
                return;
            }

            const pemeriksaArray = Array.isArray(pemeriksa) ? pemeriksa : [pemeriksa];

            const certification = await this.certificationService.scheduleCertification(
                id,
                new Date(tanggal_jadwal_pemeriksaan),
                pemeriksaArray
            );

            res.status(200).json({
                success: true,
                message: 'Sertifikasi berhasil dijadwalkan',
                data: certification,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Terjadi kesalahan saat menjadwalkan sertifikasi',
                error: error.message,
            });
        }
    }

    /**
     * POST /api/certifications/:id/inspection
     * Submit inspection result (by inspektur)
     */
    async inspectCertification(req: AuthenticatedRequest, res: Response): Promise<void> {
        const uploadField = upload.single('file_dokumen_hasil_pemeriksaan');

        uploadField(req, res, async (err) => {
            if (err) {
                res.status(400).json({
                    success: false,
                    message: 'Error uploading file: ' + err.message,
                });
                return;
            }

            try {
                const { id } = req.params;
                const {
                    status,
                    catatan_pemeriksaan,
                    jumlah_benih,
                    jumlah_diperiksa,
                    jumlah_lolos,
                    jumlah_tidak_lolos,
                    jumlah_belum_lolos
                } = req.body;
                const userRole = req.user?.role;
                const userId = req.user?.id;

                // Only inspektur can inspect
                if (userRole !== 'inspektur') {
                    res.status(403).json({
                        success: false,
                        message: 'Anda tidak memiliki akses untuk melakukan pemeriksaan',
                    });
                    return;
                }

                // Validate required fields
                if (!jumlah_benih || !jumlah_diperiksa || !jumlah_lolos || !jumlah_tidak_lolos || !jumlah_belum_lolos) {
                    res.status(400).json({
                        success: false,
                        message: 'Data jumlah benih, diperiksa, lolos, tidak lolos, dan belum lolos harus diisi',
                    });
                    return;
                }

                const inspectionData = {
                    jumlah_benih: parseFloat(jumlah_benih),
                    jumlah_diperiksa: parseFloat(jumlah_diperiksa),
                    jumlah_lolos: parseFloat(jumlah_lolos),
                    jumlah_tidak_lolos: parseFloat(jumlah_tidak_lolos),
                    jumlah_belum_lolos: parseFloat(jumlah_belum_lolos),
                    pemeriksa_id: userId!,
                    file_dokumen_hasil_pemeriksaan: req.file?.filename,
                };

                const approved = status === 'approve';
                const certification = await this.certificationService.inspectCertification(
                    id,
                    inspectionData,
                    catatan_pemeriksaan || null,
                    approved
                );

                res.status(200).json({
                    success: true,
                    message: `Pemeriksaan berhasil ${approved ? 'disetujui' : 'ditolak'}`,
                    data: certification,
                });
            } catch (error: any) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Terjadi kesalahan saat melakukan pemeriksaan',
                    error: error.message,
                });
            }
        });
    }

    /**
     * GET /api/certifications/:id/inspections
     * Get inspection details for a certification
     */
    async getInspectionDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const inspections = await this.certificationService.getInspectionDetails(id);

            res.status(200).json({
                success: true,
                message: 'Data pemeriksaan berhasil diambil',
                data: inspections,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Terjadi kesalahan saat mengambil data pemeriksaan',
                error: error.message,
            });
        }
    }

    /**
     * POST /api/certifications/:id/validation
     * Validate certification (by inspektur_kepala)
     */
    async validateCertification(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { catatan_validasi, status } = req.body;
            const userRole = req.user?.role;

            // Only inspektur_kepala can validate
            if (userRole !== 'inspektur_ketua') {
                res.status(403).json({
                    success: false,
                    message: 'Anda tidak memiliki akses untuk melakukan validasi',
                });
                return;
            }

            const approved = status === 'approve';
            const certification = await this.certificationService.validateCertification(
                id,
                catatan_validasi || null,
                approved
            );

            res.status(200).json({
                success: true,
                message: `Validasi berhasil ${approved ? 'disetujui' : 'ditolak'}`,
                data: certification,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message || 'Terjadi kesalahan saat melakukan validasi',
                error: error.message,
            });
        }
    }

    /**
     * POST /api/certifications/:id/publish
     * Publish certification (by kepala)
     */
    async publishCertification(req: AuthenticatedRequest, res: Response): Promise<void> {
        const uploadField = upload.single('file_surat_sertifikat');

        uploadField(req, res, async (err) => {
            if (err) {
                res.status(400).json({
                    success: false,
                    message: 'Error uploading file: ' + err.message,
                });
                return;
            }

            try {
                const { id } = req.params;
                const { nomor_surat_sertifikat, tanggal_sertifikat, tanggal_expired_sertifikat } = req.body;
                const userRole = req.user?.role;

                // Only kepala can publish
                if (userRole !== 'kepala') {
                    res.status(403).json({
                        success: false,
                        message: 'Anda tidak memiliki akses untuk menerbitkan sertifikat',
                    });
                    return;
                }

                if (!nomor_surat_sertifikat || !tanggal_sertifikat || !tanggal_expired_sertifikat) {
                    res.status(400).json({
                        success: false,
                        message: 'Nomor surat, tanggal sertifikat, dan tanggal expired harus diisi',
                    });
                    return;
                }

                const certification = await this.certificationService.publishCertification(
                    id,
                    nomor_surat_sertifikat,
                    new Date(tanggal_sertifikat),
                    new Date(tanggal_expired_sertifikat),
                    req.file?.filename
                );

                res.status(200).json({
                    success: true,
                    message: 'Sertifikat berhasil diterbitkan',
                    data: certification,
                });
            } catch (error: any) {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Terjadi kesalahan saat menerbitkan sertifikat',
                    error: error.message,
                });
            }
        });
    }
}

export default CertificationController;
