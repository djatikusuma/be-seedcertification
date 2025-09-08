import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

/**
 * @swagger
 * components:
 *   schemas:
 *     PetaniPerusahaanDashboard:
 *       type: object
 *       description: Dashboard statistics for Petani and Perusahaan roles
 *       properties:
 *         rekomendasi:
 *           type: integer
 *           description: Total recommendations
 *           example: 25
 *         sertifikasi:
 *           type: object
 *           properties:
 *             siap_tanam:
 *               type: object
 *               properties:
 *                 proses:
 *                   type: integer
 *                   description: Certifications in process
 *                   example: 5
 *                 tolak:
 *                   type: integer
 *                   description: Rejected certifications
 *                   example: 2
 *                 selesai:
 *                   type: integer
 *                   description: Completed certifications
 *                   example: 8
 *             pra_tanam:
 *               type: object
 *               properties:
 *                 proses:
 *                   type: integer
 *                   description: Pre-planting certifications in process
 *                   example: 3
 *                 tolak:
 *                   type: integer
 *                   description: Rejected pre-planting certifications
 *                   example: 1
 *                 selesai:
 *                   type: integer
 *                   description: Completed pre-planting certifications
 *                   example: 6
 *     AdminDashboard:
 *       type: object
 *       description: Dashboard statistics for Admin and other roles (except Petani and Perusahaan)
 *       properties:
 *         petani:
 *           type: integer
 *           description: Total number of petani users
 *           example: 150
 *         perusahaan:
 *           type: integer
 *           description: Total number of perusahaan users
 *           example: 45
 *         rekomendasi:
 *           type: object
 *           properties:
 *             proses:
 *               type: integer
 *               description: Recommendations in process
 *               example: 20
 *             tolak:
 *               type: integer
 *               description: Rejected recommendations
 *               example: 5
 *             selesai:
 *               type: integer
 *               description: Completed recommendations
 *               example: 180
 *         sertifikasi:
 *           type: object
 *           properties:
 *             siap_tanam:
 *               type: object
 *               properties:
 *                 proses:
 *                   type: integer
 *                   description: Certifications in process
 *                   example: 25
 *                 tolak:
 *                   type: integer
 *                   description: Rejected certifications
 *                   example: 8
 *                 selesai:
 *                   type: integer
 *                   description: Completed certifications
 *                   example: 120
 *             pra_tanam:
 *               type: object
 *               properties:
 *                 proses:
 *                   type: integer
 *                   description: Pre-planting certifications in process
 *                   example: 15
 *                 tolak:
 *                   type: integer
 *                   description: Rejected pre-planting certifications
 *                   example: 3
 *                 selesai:
 *                   type: integer
 *                   description: Completed pre-planting certifications
 *                   example: 85
 */

export class DashboardController {
    private dashboardService = new DashboardService();

    /**
     * @swagger
     * /api/dashboard/statistics:
     *   get:
     *     summary: Get dashboard statistics
     *     description: |
     *       Get dashboard statistics based on user role:
     *       - For Petani and Perusahaan: Shows their own data (recommendations and certifications)
     *       - For other roles (Admin, Inspektur, etc.): Shows overall system statistics including user counts
     *     tags: [Dashboard]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Dashboard statistics retrieved successfully
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
     *                   example: "Dashboard statistics retrieved successfully"
     *                 data:
     *                   oneOf:
     *                     - $ref: '#/components/schemas/PetaniPerusahaanDashboard'
     *                     - $ref: '#/components/schemas/AdminDashboard'
     *                 meta:
     *                   type: object
     *                   properties:
     *                     userRole:
     *                       type: string
     *                       description: Role of the requesting user
     *                       example: "admin"
     *                     dashboardType:
     *                       type: string
     *                       enum: [petani_perusahaan, admin_overview]
     *                       description: Type of dashboard data returned
     *       401:
     *         description: Unauthorized - User not authenticated
     *       500:
     *         description: Internal server error
     */
    getStatistics = async (req: Request, res: Response): Promise<void> => {
        try {
            // Get user information from authenticated request
            const user = (req as any).user;
            const userRole = user?.role;
            const userId = user?.id;

            if (!user || !userRole) {
                res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
                return;
            }

            let statistics;
            let dashboardType;

            // Check if user is Petani or Perusahaan
            if (userRole === 'petani' || userRole === 'perusahaan') {
                // Get personal statistics for Petani/Perusahaan
                statistics = await this.dashboardService.getPetaniPerusahaanStatistics(userId, userRole);
                dashboardType = 'petani_perusahaan';
            } else {
                // Get overall system statistics for Admin and other roles
                statistics = await this.dashboardService.getAdminStatistics();
                dashboardType = 'admin_overview';
            }

            res.status(200).json({
                success: true,
                message: 'Dashboard statistics retrieved successfully',
                data: statistics,
                meta: {
                    userRole: userRole,
                    dashboardType: dashboardType
                }
            });

        } catch (error) {
            console.error('Error getting dashboard statistics:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve dashboard statistics',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}
