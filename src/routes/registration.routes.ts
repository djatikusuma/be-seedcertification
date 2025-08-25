import { Router } from 'express';
import { TempUserController } from '../controllers/tempUser.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const tempUserController = new TempUserController();

// Public routes
/**
 * @swagger
 * /api/registration:
 *   post:
 *     summary: Register new temp user
 *     tags: [Registration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userType
 *               - nik
 *               - namaPemohon
 *               - email
 *               - password
 *             properties:
 *               userType:
 *                 type: string
 *                 enum: [perusahaan, perorangan]
 *                 description: Type of user registration
 *               nik:
 *                 type: string
 *                 minLength: 16
 *                 maxLength: 16
 *                 description: National Identity Number (NIK)
 *               namaPemohon:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Applicant name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *               telepon:
 *                 type: string
 *                 description: Phone number (optional)
 *               npwp:
 *                 type: string
 *                 minLength: 15
 *                 maxLength: 15
 *                 description: Tax ID number (optional)
 *               alamatPemohon:
 *                 type: string
 *                 maxLength: 500
 *                 description: Applicant address (optional)
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Password (must contain lowercase, uppercase, and number)
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Registrasi berhasil. Menunggu verifikasi admin."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                       format: email
 *                     userType:
 *                       type: string
 *                       enum: [perusahaan, perorangan]
 *                     verificationStatus:
 *                       type: string
 *                       enum: [pending, approved, rejected]
 *       400:
 *         description: Validation error or email/NIK already exists
 *       500:
 *         description: Internal server error
 */
router.post('/registration',
    TempUserController.getRegistrationValidationRules(),
    tempUserController.register
);

// Protected routes - requires authentication
/**
 * @swagger
 * /api/registration/pending:
 *   get:
 *     summary: Get pending registrations (Admin/Verifikatur only)
 *     tags: [Registration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Pending registrations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Data berhasil diambil"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.get('/registration/pending',
    authMiddleware(['admin', 'verifikatur']),
    TempUserController.getListValidationRules(),
    tempUserController.getPendingRegistrations
);

/**
 * @swagger
 * /api/registration:
 *   get:
 *     summary: Get all temp users with filtering (Admin/Verifikatur only)
 *     tags: [Registration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: verificationStatus
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by verification status
 *       - in: query
 *         name: userType
 *         schema:
 *           type: string
 *           enum: [perusahaan, perorangan]
 *         description: Filter by user type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date (ISO 8601 format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date (ISO 8601 format)
 *     responses:
 *       200:
 *         description: Temp users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.get('/registration',
    authMiddleware(['admin', 'verifikatur']),
    TempUserController.getListValidationRules(),
    tempUserController.getTempUsers
);

/**
 * @swagger
 * /api/registration/{id}:
 *   get:
 *     summary: Get temp user details (Admin/Verifikatur only)
 *     tags: [Registration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Temp user ID
 *     responses:
 *       200:
 *         description: Temp user details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Temp user not found
 */
router.get('/registration/:id',
    authMiddleware(['admin', 'verifikatur']),
    tempUserController.getTempUserDetails
);

/**
 * @swagger
 * /api/registration/{id}/verification:
 *   post:
 *     summary: Verify temp user registration (Admin/Verifikatur only)
 *     tags: [Registration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Temp user ID
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
 *                 enum: [approved, rejected]
 *                 description: Verification decision
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Verification notes (optional)
 *     responses:
 *       200:
 *         description: Verification successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Registrasi disetujui dan akun user telah dibuat"
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error or registration already processed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Temp user not found
 */
router.post('/registration/:id/verification',
    authMiddleware(['admin', 'verifikatur']),
    TempUserController.getVerificationValidationRules(),
    tempUserController.verifyRegistration
);

/**
 * @swagger
 * /api/registration/statistics:
 *   get:
 *     summary: Get registration statistics (Admin/Verifikatur only)
 *     tags: [Registration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Statistik berhasil diambil"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total registrations
 *                     pending:
 *                       type: integer
 *                       description: Pending registrations
 *                     approved:
 *                       type: integer
 *                       description: Approved registrations
 *                     rejected:
 *                       type: integer
 *                       description: Rejected registrations
 *                     perusahaan:
 *                       type: integer
 *                       description: Company registrations
 *                     perorangan:
 *                       type: integer
 *                       description: Individual registrations
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 */
router.get('/registration/statistics',
    authMiddleware(['admin', 'verifikatur']),
    tempUserController.getStatistics
);

/**
 * @swagger
 * /api/registration/{id}:
 *   delete:
 *     summary: Delete temp user registration (Admin only)
 *     tags: [Registration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Temp user ID
 *     responses:
 *       200:
 *         description: Temp user deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Temp user not found
 */
router.delete('/registration/:id',
    authMiddleware(['admin']),
    tempUserController.deleteTempUser
);

export default router;
