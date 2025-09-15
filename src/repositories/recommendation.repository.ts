import { BaseRepository } from './base.repository';
import { Recommendation, RecommendationInterface } from '../models/Recommendation.model';
import { ProfileApplicant } from '../models/ProfileApplicant.model';
import { User } from '../models/User.model';
import { Role } from '../models/Role.model';
import { SeedSource } from '../models/SeedSource.model';
import { Op, WhereOptions, Includeable, Sequelize } from 'sequelize';
import { DatabaseUtil } from '../utils/database.util';

export interface RecommendationFilterOptions {
    status?: number;
    pemohon_id?: string;
    pemeriksa_contains?: string; // For filtering by inspector ID
    search?: string;
}

export class RecommendationRepository extends BaseRepository<Recommendation> {
    constructor() {
        super(Recommendation);
    }

    async findAllWithFilters(
        filters: RecommendationFilterOptions = {},
        page = 1,
        limit = 10,
        includeApplicant = false,
        includeInspectors = false
    ): Promise<{ rows: Recommendation[]; count: number }> {
        const where: WhereOptions = {};
        const include: Includeable[] = [];

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.pemohon_id) {
            where.pemohon_id = filters.pemohon_id;
        }

        if (filters.pemeriksa_contains) {
            // Search for inspector ID in JSON array using database-specific query
            console.log('Filtering recommendations by pemeriksa_contains:', filters.pemeriksa_contains);

            (where as any)[Op.and] = DatabaseUtil.getJsonContainsQuery('pemeriksa', filters.pemeriksa_contains);

            console.log('Using database-specific JSON contains query for pemeriksa');
        }

        if (includeApplicant) {
            include.push({
                model: ProfileApplicant,
                as: 'pemohon',
                required: true,
            });
        }

        const offset = (page - 1) * limit;

        const result = await this.model.findAndCountAll({
            where,
            include,
            limit,
            offset,
            order: [['created_at', 'DESC']],
        });

        // If includeInspectors is true, fetch inspector details separately
        if (includeInspectors && result.rows.length > 0) {
            for (const recommendation of result.rows) {
                if (recommendation.pemeriksa && recommendation.pemeriksa.length > 0) {
                    const inspectors = await User.findAll({
                        where: {
                            id: {
                                [Op.in]: recommendation.pemeriksa,
                            },
                        },
                        include: [
                            {
                                model: Role,
                                as: 'role',
                            },
                        ],
                    });
                    // Add inspectors as a virtual property
                    (recommendation as any).inspectors = inspectors;
                }
            }
        }

        return result;
    }

    async findByIdWithDetails(id: string): Promise<Recommendation | null> {
        const recommendation = await this.model.findByPk(id, {
            include: [
                {
                    model: ProfileApplicant,
                    as: 'pemohon',
                    required: true,
                },
                {
                    model: SeedSource,
                    as: 'seedSource',
                    required: false,
                },
                {
                    model: User,
                    as: 'verifikator',
                    required: false,
                    attributes: ['id', 'name', 'email'],
                    include: [
                        {
                            model: Role,
                            as: 'role',
                            attributes: ['id', 'roleName'],
                        },
                    ],
                },
                {
                    model: User,
                    as: 'inspekturKetua',
                    required: false,
                    attributes: ['id', 'name', 'email'],
                    include: [
                        {
                            model: Role,
                            as: 'role',
                            attributes: ['id', 'roleName'],
                        },
                    ],
                },
                {
                    model: User,
                    as: 'inspektur',
                    required: false,
                    attributes: ['id', 'name', 'email'],
                    include: [
                        {
                            model: Role,
                            as: 'role',
                            attributes: ['id', 'roleName'],
                        },
                    ],
                },
                {
                    model: User,
                    as: 'kepala',
                    required: false,
                    attributes: ['id', 'name', 'email'],
                    include: [
                        {
                            model: Role,
                            as: 'role',
                            attributes: ['id', 'roleName'],
                        },
                    ],
                },
            ],
        });

        if (recommendation && recommendation.pemeriksa && recommendation.pemeriksa.length > 0) {
            const inspectors = await User.findAll({
                where: {
                    id: {
                        [Op.in]: recommendation.pemeriksa,
                    },
                },
                include: [
                    {
                        model: Role,
                        as: 'role',
                    },
                ],
            });
            (recommendation as any).inspectors = inspectors;
        }

        return recommendation;
    }

    async findByPemohonId(pemohonId: string): Promise<Recommendation[]> {
        return await this.model.findAll({
            where: { pemohon_id: pemohonId },
            order: [['created_at', 'DESC']],
        });
    }

    async findByInspectorId(inspectorId: string): Promise<Recommendation[]> {
        return await this.model.findAll({
            where: {
                pemeriksa: {
                    [Op.like]: `%"${inspectorId}"%`,
                } as any,
            },
            include: [
                {
                    model: ProfileApplicant,
                    as: 'pemohon',
                    required: true,
                },
            ],
            order: [['created_at', 'DESC']],
        });
    }

    async updateStatus(id: string, status: number, additionalData?: Partial<RecommendationInterface>): Promise<Recommendation | null> {
        const updateData: Partial<RecommendationInterface> = {
            status,
            ...additionalData,
        };

        // Set verification dates based on status
        const now = new Date();
        switch (status) {
            case 2:
                updateData.tanggal_verifikasi_dokumen = now;
                break;
            case 3:
                updateData.tanggal_verifikasi_penjadwalan = now;
                break;
            case 4:
                updateData.tanggal_verifikasi_lapangan = now;
                break;
            case 5:
                updateData.tanggal_verifikasi_penerbitan = now;
                break;
        }

        return await this.update(id, updateData);
    }
}

export default RecommendationRepository;
