import { Request, Response } from 'express';

/**
 * Simple dashboard endpoint for testing
 */
export class SimpleDashboardController {

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
                // Return mock data for Petani/Perusahaan
                statistics = {
                    rekomendasi: 5,
                    sertifikasi: {
                        siap_tanam: {
                            proses: 2,
                            tolak: 1,
                            selesai: 3
                        },
                        pra_tanam: {
                            proses: 1,
                            tolak: 0,
                            selesai: 2
                        }
                    }
                };
                dashboardType = 'petani_perusahaan';
            } else {
                // Return mock data for Admin and other roles
                statistics = {
                    petani: 50,
                    perusahaan: 25,
                    rekomendasi: {
                        proses: 15,
                        tolak: 5,
                        selesai: 30
                    },
                    sertifikasi: {
                        siap_tanam: {
                            proses: 10,
                            tolak: 3,
                            selesai: 20
                        },
                        pra_tanam: {
                            proses: 8,
                            tolak: 2,
                            selesai: 15
                        }
                    }
                };
                dashboardType = 'admin_overview';
            }

            res.status(200).json({
                success: true,
                message: 'Dashboard statistics retrieved successfully',
                data: statistics,
                meta: {
                    userRole: userRole,
                    dashboardType: dashboardType,
                    note: 'This is test data. Real implementation will query actual database.'
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
