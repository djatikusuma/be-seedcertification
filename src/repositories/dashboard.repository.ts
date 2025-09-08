import sequelize from '../config/sequelize';
import { QueryTypes } from 'sequelize';
import User from '../models/User.model';

export interface UserCounts {
    petani: number;
    perusahaan: number;
}

export interface StatusStats {
    proses: number;
    tolak: number;
    selesai: number;
}

export interface CertificationStats {
    siap_tanam: StatusStats;
    pra_tanam: StatusStats;
}

export class DashboardRepository {

    /**
     * Get count of users by role (petani and perusahaan)
     */
    async getUserCountsByRole(): Promise<UserCounts> {
        try {
            console.log('Getting user counts by role...');
            const result = await sequelize.query(`
                SELECT 
                    r.roleName,
                    COUNT(u.id) as count
                FROM users u
                INNER JOIN roles r ON u.roleId = r.id
                WHERE r.roleName IN ('petani', 'perusahaan')
                GROUP BY r.roleName
            `, {
                type: QueryTypes.SELECT
            }) as any[];

            console.log('User counts query result:', result);

            const counts: UserCounts = {
                petani: 0,
                perusahaan: 0
            };

            result.forEach((row: any) => {
                if (row.roleName === 'petani') {
                    counts.petani = parseInt(row.count);
                } else if (row.roleName === 'perusahaan') {
                    counts.perusahaan = parseInt(row.count);
                }
            });

            console.log('Final user counts:', counts);
            return counts;
        } catch (error) {
            console.error('Error getting user counts by role:', error);
            // Return default values instead of throwing error
            return {
                petani: 0,
                perusahaan: 0
            };
        }
    }

    /**
     * Get recommendation count for specific user
     */
    async getUserRecommendationCount(userId: string): Promise<number> {
        try {
            // Get recommendations for user through profile_applicants
            const result = await sequelize.query(`
                SELECT COUNT(*) as count
                FROM recommendations r
                INNER JOIN profile_applicants pa ON r.pemohon_id = pa.id
                WHERE pa.userId = :userId
                AND r.deleted_at IS NULL
            `, {
                replacements: { userId },
                type: QueryTypes.SELECT
            }) as any[];

            return parseInt(result[0]?.count || 0);
        } catch (error) {
            console.error('Error getting user recommendation count:', error);
            // Return 0 if table doesn't exist or other error
            return 0;
        }
    }

    /**
     * Get overall recommendation statistics by status
     */
    async getAllRecommendationStats(): Promise<StatusStats> {
        try {
            // Status mapping: 1-5: proses, 6: tolak, 5: selesai
            const result = await sequelize.query(`
                SELECT 
                    status,
                    COUNT(*) as count
                FROM recommendations
                WHERE deleted_at IS NULL
                GROUP BY status
            `, {
                type: QueryTypes.SELECT
            }) as any[];

            const stats: StatusStats = {
                proses: 0,
                tolak: 0,
                selesai: 0
            };

            result.forEach((row: any) => {
                const count = parseInt(row.count);
                const status = parseInt(row.status);

                if (status === 6) {
                    stats.tolak += count;
                } else if (status === 5) {
                    stats.selesai += count;
                } else if (status >= 1 && status <= 4) {
                    stats.proses += count;
                }
            });

            return stats;
        } catch (error) {
            console.error('Error getting recommendation stats:', error);
            // Return default values if table doesn't exist
            return { proses: 0, tolak: 0, selesai: 0 };
        }
    }

    /**
     * Get certification statistics for specific user
     */
    async getUserCertificationStats(userId: string): Promise<CertificationStats> {
        try {
            // Get certifications for user through profile_applicants
            const result = await sequelize.query(`
                SELECT 
                    c.tipe,
                    c.status,
                    COUNT(*) as count
                FROM certifications c
                INNER JOIN profile_applicants pa ON c.pemohon_id = pa.id
                WHERE pa.userId = :userId
                AND c.deleted_at IS NULL
                GROUP BY c.tipe, c.status
            `, {
                replacements: { userId },
                type: QueryTypes.SELECT
            }) as any[];

            const stats: CertificationStats = {
                siap_tanam: { proses: 0, tolak: 0, selesai: 0 },
                pra_tanam: { proses: 0, tolak: 0, selesai: 0 }
            };

            result.forEach((row: any) => {
                const count = parseInt(row.count);
                const type = row.tipe === 'siaptanam' ? 'siap_tanam' : 'pra_tanam';
                const status = parseInt(row.status);

                if (status === 7) {
                    stats[type].tolak += count;
                } else if (status === 6) {
                    stats[type].selesai += count;
                } else if (status >= 1 && status <= 5) {
                    stats[type].proses += count;
                }
            });

            return stats;
        } catch (error) {
            console.error('Error getting user certification stats:', error);
            // Return default values if table doesn't exist
            return {
                siap_tanam: { proses: 0, tolak: 0, selesai: 0 },
                pra_tanam: { proses: 0, tolak: 0, selesai: 0 }
            };
        }
    }    /**
     * Get overall certification statistics
     */
    async getAllCertificationStats(): Promise<CertificationStats> {
        try {
            // Status mapping: 1-5: proses, 7: tolak, 6: selesai
            const result = await sequelize.query(`
                SELECT 
                    tipe,
                    status,
                    COUNT(*) as count
                FROM certifications
                WHERE deleted_at IS NULL
                GROUP BY tipe, status
            `, {
                type: QueryTypes.SELECT
            }) as any[];

            const stats: CertificationStats = {
                siap_tanam: { proses: 0, tolak: 0, selesai: 0 },
                pra_tanam: { proses: 0, tolak: 0, selesai: 0 }
            };

            result.forEach((row: any) => {
                const count = parseInt(row.count);
                const type = row.tipe === 'siaptanam' ? 'siap_tanam' : 'pra_tanam';
                const status = parseInt(row.status);

                if (status === 7) {
                    stats[type].tolak += count;
                } else if (status === 6) {
                    stats[type].selesai += count;
                } else if (status >= 1 && status <= 5) {
                    stats[type].proses += count;
                }
            });

            return stats;
        } catch (error) {
            console.error('Error getting all certification stats:', error);
            // Return default values if table doesn't exist
            return {
                siap_tanam: { proses: 0, tolak: 0, selesai: 0 },
                pra_tanam: { proses: 0, tolak: 0, selesai: 0 }
            };
        }
    }
}
