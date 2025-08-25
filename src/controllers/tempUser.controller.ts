import { Request, Response } from 'express';
import { TempUserService, RegisterTempUserData, VerificationData } from '../services/tempUser.service';
import { UserType, VerificationStatus } from '../models/TempUser.model';
import { body, validationResult, param, query } from 'express-validator';

export class TempUserController {
    private tempUserService: TempUserService;

    constructor() {
        this.tempUserService = new TempUserService();
    }

    // Validation rules for registration
    static getRegistrationValidationRules() {
        return [
            body('userType')
                .isIn([UserType.PERUSAHAAN, UserType.PERORANGAN])
                .withMessage('Tipe user harus perusahaan atau perorangan'),
            body('nik')
                .isLength({ min: 16, max: 16 })
                .withMessage('NIK harus 16 digit')
                .isNumeric()
                .withMessage('NIK harus berupa angka'),
            body('namaPemohon')
                .isLength({ min: 2, max: 100 })
                .withMessage('Nama pemohon harus 2-100 karakter')
                .trim(),
            body('email')
                .isEmail()
                .withMessage('Format email tidak valid')
                .normalizeEmail(),
            body('telepon')
                .optional()
                .isMobilePhone('id-ID')
                .withMessage('Format nomor telepon tidak valid'),
            body('npwp')
                .optional()
                .isLength({ min: 15, max: 15 })
                .withMessage('NPWP harus 15 digit')
                .isNumeric()
                .withMessage('NPWP harus berupa angka'),
            body('alamatPemohon')
                .optional()
                .isLength({ max: 500 })
                .withMessage('Alamat maksimal 500 karakter'),
            body('password')
                .isLength({ min: 8 })
                .withMessage('Password minimal 8 karakter')
                .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
                .withMessage('Password harus mengandung huruf kecil, huruf besar, dan angka')
        ];
    }

    // Validation rules for verification
    static getVerificationValidationRules() {
        return [
            param('id')
                .isUUID()
                .withMessage('ID tidak valid'),
            body('status')
                .isIn([VerificationStatus.APPROVED, VerificationStatus.REJECTED])
                .withMessage('Status harus approved atau rejected'),
            body('notes')
                .optional()
                .isLength({ max: 1000 })
                .withMessage('Catatan maksimal 1000 karakter')
        ];
    }

    // Validation rules for getting temp users
    static getListValidationRules() {
        return [
            query('page')
                .optional()
                .isInt({ min: 1 })
                .withMessage('Page harus berupa angka positif'),
            query('limit')
                .optional()
                .isInt({ min: 1, max: 100 })
                .withMessage('Limit harus berupa angka 1-100'),
            query('verificationStatus')
                .optional()
                .isIn(Object.values(VerificationStatus))
                .withMessage('Status verifikasi tidak valid'),
            query('userType')
                .optional()
                .isIn(Object.values(UserType))
                .withMessage('Tipe user tidak valid'),
            query('startDate')
                .optional()
                .isISO8601()
                .withMessage('Format tanggal mulai tidak valid'),
            query('endDate')
                .optional()
                .isISO8601()
                .withMessage('Format tanggal akhir tidak valid')
        ];
    }

    // Register new temp user
    register = async (req: Request, res: Response): Promise<void> => {
        try {
            // Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: errors.array()
                });
                return;
            }

            const registrationData: RegisterTempUserData = req.body;
            const result = await this.tempUserService.registerTempUser(registrationData);

            if (result.success) {
                res.status(201).json({
                    success: true,
                    message: result.message,
                    data: {
                        id: result.data?.id,
                        email: result.data?.email,
                        userType: result.data?.userType,
                        verificationStatus: result.data?.verificationStatus
                    }
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message
                });
            }

        } catch (error) {
            console.error('Error in register:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    // Get pending registrations for admin/verifikatur
    getPendingRegistrations = async (req: Request, res: Response): Promise<void> => {
        try {
            // Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: errors.array()
                });
                return;
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const viewerRole = (req as any).user?.role || 'user';

            const result = await this.tempUserService.getPendingRegistrationsWithMasking(
                viewerRole,
                page,
                limit
            );

            res.status(200).json({
                success: true,
                message: 'Data berhasil diambil',
                data: result.data,
                pagination: {
                    total: result.total,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                    limit
                }
            });

        } catch (error) {
            console.error('Error in getPendingRegistrations:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    // Get all temp users with filtering
    getTempUsers = async (req: Request, res: Response): Promise<void> => {
        try {
            // Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: errors.array()
                });
                return;
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const viewerRole = (req as any).user?.role || 'user';

            const filters: any = {};

            if (req.query.verificationStatus) {
                filters.verificationStatus = req.query.verificationStatus as VerificationStatus;
            }

            if (req.query.userType) {
                filters.userType = req.query.userType as UserType;
            }

            if (req.query.startDate) {
                filters.startDate = new Date(req.query.startDate as string);
            }

            if (req.query.endDate) {
                filters.endDate = new Date(req.query.endDate as string);
            }

            const result = await this.tempUserService.getTempUsersWithMasking(
                viewerRole,
                filters,
                page,
                limit
            );

            res.status(200).json({
                success: true,
                message: 'Data berhasil diambil',
                data: result.data,
                pagination: {
                    total: result.total,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                    limit
                },
                filters
            });

        } catch (error) {
            console.error('Error in getTempUsers:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    // Verify temp user (approve/reject)
    verifyRegistration = async (req: Request, res: Response): Promise<void> => {
        try {
            // Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: errors.array()
                });
                return;
            }

            const { id } = req.params;
            const verificationData: VerificationData = req.body;
            const verifiedBy = (req as any).user?.id;

            if (!verifiedBy) {
                res.status(401).json({
                    success: false,
                    message: 'User tidak terautentikasi'
                });
                return;
            }

            const result = await this.tempUserService.verifyTempUser(
                id,
                verificationData,
                verifiedBy
            );

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: result.message
                });
            }

        } catch (error) {
            console.error('Error in verifyRegistration:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    // Get temp user details
    getTempUserDetails = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const viewerRole = (req as any).user?.role || 'user';

            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'ID tidak valid'
                });
                return;
            }

            const result = await this.tempUserService.getTempUserDetails(id, viewerRole);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message,
                    data: result.data
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: result.message
                });
            }

        } catch (error) {
            console.error('Error in getTempUserDetails:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    // Get verification statistics
    getStatistics = async (req: Request, res: Response): Promise<void> => {
        try {
            const statistics = await this.tempUserService.getVerificationStatistics();

            res.status(200).json({
                success: true,
                message: 'Statistik berhasil diambil',
                data: statistics
            });

        } catch (error) {
            console.error('Error in getStatistics:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    // Delete temp user
    deleteTempUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'ID tidak valid'
                });
                return;
            }

            const result = await this.tempUserService.deleteTempUser(id);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: result.message
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: result.message
                });
            }

        } catch (error) {
            console.error('Error in deleteTempUser:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };
}
