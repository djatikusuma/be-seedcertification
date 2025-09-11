import { BaseRepository } from './base.repository';
import { SeedSource, SeedSourceInterface } from '../models/SeedSource.model';
import { ProfileApplicant } from '../models/ProfileApplicant.model';
import { User } from '../models/User.model';
import { Role } from '../models/Role.model';
import { Op } from 'sequelize';

export class SeedSourceRepository extends BaseRepository<SeedSource> {
    constructor() {
        super(SeedSource);
    }

    async findAllWithDetails(
        page: number = 1,
        limit: number = 10,
        pemohonId?: string,
        status?: number
    ): Promise<{
        items: SeedSource[];
        total: number;
        totalPages: number;
        currentPage: number;
    }> {
        const offset = (page - 1) * limit;
        const whereClause: any = {};

        if (pemohonId) {
            whereClause.pemohon_id = pemohonId;
        }

        if (status !== undefined) {
            whereClause.status = status;
        }

        const { count, rows } = await SeedSource.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: ProfileApplicant,
                    as: 'pemohon',
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'name', 'email'],
                            include: [
                                {
                                    model: Role,
                                    as: 'role',
                                    attributes: ['id', 'roleName']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: User,
                    as: 'verifikator',
                    attributes: ['id', 'name', 'email'],
                    required: false
                }
            ],
            limit: limit,
            offset: offset,
            order: [['created_at', 'DESC']]
        });

        return {
            items: rows,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        };
    }

    async findByIdWithDetails(id: string): Promise<SeedSource | null> {
        return await SeedSource.findByPk(id, {
            include: [
                {
                    model: ProfileApplicant,
                    as: 'pemohon',
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'name', 'email'],
                            include: [
                                {
                                    model: Role,
                                    as: 'role',
                                    attributes: ['id', 'roleName']
                                }
                            ]
                        }
                    ]
                },
                {
                    model: User,
                    as: 'verifikator',
                    attributes: ['id', 'name', 'email'],
                    required: false
                }
            ]
        });
    }

    async updateVerification(
        id: string,
        verifikatorId: string,
        status: number,
        catatanVerifikasi?: string
    ): Promise<SeedSource | null> {
        const seedSource = await SeedSource.findByPk(id);
        if (!seedSource) {
            return null;
        }

        await seedSource.update({
            verifikator_id: verifikatorId,
            status: status,
            catatan_verifikasi: catatanVerifikasi,
            verify_at: new Date()
        });

        return await this.findByIdWithDetails(id);
    }

    async findByPemohonId(pemohonId: string): Promise<SeedSource[]> {
        return await SeedSource.findAll({
            where: { pemohon_id: pemohonId },
            include: [
                {
                    model: User,
                    as: 'verifikator',
                    attributes: ['id', 'name', 'email'],
                    required: false
                }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    async findPendingVerification(): Promise<SeedSource[]> {
        return await SeedSource.findAll({
            where: { status: 1 }, // VERIFIKASI_DOKUMEN
            include: [
                {
                    model: ProfileApplicant,
                    as: 'pemohon',
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'name', 'email']
                        }
                    ]
                }
            ],
            order: [['created_at', 'ASC']]
        });
    }
}

export default SeedSourceRepository;
