import { DashboardRepository } from '../repositories/dashboard.repository';

export interface PetaniPerusahaanStatistics {
    rekomendasi: number;
    sertifikasi: {
        siap_tanam: {
            proses: number;
            tolak: number;
            selesai: number;
        };
        pra_tanam: {
            proses: number;
            tolak: number;
            selesai: number;
        };
    };
}

export interface AdminStatistics {
    petani: number;
    perusahaan: number;
    rekomendasi: {
        proses: number;
        tolak: number;
        selesai: number;
    };
    sertifikasi: {
        siap_tanam: {
            proses: number;
            tolak: number;
            selesai: number;
        };
        pra_tanam: {
            proses: number;
            tolak: number;
            selesai: number;
        };
    };
}

export class DashboardService {
    private dashboardRepository = new DashboardRepository();

    /**
     * Get statistics for Petani and Perusahaan users (personal data only)
     */
    async getPetaniPerusahaanStatistics(userId: string, userRole: string): Promise<PetaniPerusahaanStatistics> {
        try {
            console.log(`Getting statistics for user ${userId} with role ${userRole}`);

            // Get user's recommendations count
            const rekomendasiCount = await this.dashboardRepository.getUserRecommendationCount(userId);

            // Get user's certifications by status and type
            const sertifikasiStats = await this.dashboardRepository.getUserCertificationStats(userId);

            return {
                rekomendasi: rekomendasiCount,
                sertifikasi: {
                    siap_tanam: {
                        proses: sertifikasiStats.siap_tanam.proses,
                        tolak: sertifikasiStats.siap_tanam.tolak,
                        selesai: sertifikasiStats.siap_tanam.selesai
                    },
                    pra_tanam: {
                        proses: sertifikasiStats.pra_tanam.proses,
                        tolak: sertifikasiStats.pra_tanam.tolak,
                        selesai: sertifikasiStats.pra_tanam.selesai
                    }
                }
            };
        } catch (error) {
            console.error('Error getting petani/perusahaan statistics:', error);
            // Return default values instead of throwing error
            return {
                rekomendasi: 0,
                sertifikasi: {
                    siap_tanam: { proses: 0, tolak: 0, selesai: 0 },
                    pra_tanam: { proses: 0, tolak: 0, selesai: 0 }
                }
            };
        }
    }

    /**
     * Get overall system statistics for Admin and other roles
     */
    async getAdminStatistics(): Promise<AdminStatistics> {
        try {
            console.log('Getting admin statistics...');

            // Get user counts by role
            const userCounts = await this.dashboardRepository.getUserCountsByRole();

            // Get overall recommendation statistics
            const rekomendasiStats = await this.dashboardRepository.getAllRecommendationStats();

            // Get overall certification statistics
            const sertifikasiStats = await this.dashboardRepository.getAllCertificationStats();

            const result = {
                petani: userCounts.petani,
                perusahaan: userCounts.perusahaan,
                rekomendasi: {
                    proses: rekomendasiStats.proses,
                    tolak: rekomendasiStats.tolak,
                    selesai: rekomendasiStats.selesai
                },
                sertifikasi: {
                    siap_tanam: {
                        proses: sertifikasiStats.siap_tanam.proses,
                        tolak: sertifikasiStats.siap_tanam.tolak,
                        selesai: sertifikasiStats.siap_tanam.selesai
                    },
                    pra_tanam: {
                        proses: sertifikasiStats.pra_tanam.proses,
                        tolak: sertifikasiStats.pra_tanam.tolak,
                        selesai: sertifikasiStats.pra_tanam.selesai
                    }
                }
            };

            console.log('Admin statistics result:', result);
            return result;
        } catch (error) {
            console.error('Error getting admin statistics:', error);
            // Return default values instead of throwing error
            return {
                petani: 0,
                perusahaan: 0,
                rekomendasi: { proses: 0, tolak: 0, selesai: 0 },
                sertifikasi: {
                    siap_tanam: { proses: 0, tolak: 0, selesai: 0 },
                    pra_tanam: { proses: 0, tolak: 0, selesai: 0 }
                }
            };
        }
    }
}
