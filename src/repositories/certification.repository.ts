import { BaseRepository } from './base.repository';
import { Certification } from '../models/Certification.model';
import { CertificationInterface } from '../interfaces/model.interface';
import { ProfileApplicant } from '../models/ProfileApplicant.model';
import { Recommendation } from '../models/Recommendation.model';
import { Commodity } from '../models/Commodity.model';
import { User } from '../models/User.model';
import { Role } from '../models/Role.model';
import { Op, WhereOptions, Includeable, Sequelize } from 'sequelize';

export interface CertificationFilterOptions {
    status?: number;
    pemohon_id?: string;
    tipe?: 'siaptanam' | 'pratanam';
    pemeriksa_contains?: string; // For filtering by inspector ID
    search?: string;
}

export class CertificationRepository extends BaseRepository<Certification> {
    constructor() {
        super(Certification);
    }

    async findAllWithFilters(
        filters: CertificationFilterOptions = {},
        page = 1,
        limit = 10,
        includeRelations = true
    ): Promise<{ rows: Certification[]; count: number }> {
        const where: WhereOptions = {};
        const include: Includeable[] = [];

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.pemohon_id) {
            where.pemohon_id = filters.pemohon_id;
        }

        if (filters.tipe) {
            where.tipe = filters.tipe;
        }

        if (filters.pemeriksa_contains) {
            // Create a raw where condition for JSON_CONTAINS
            // (where as any)['id'] = {
            //     [Op.and]: [
            //         where.id || {},
            //         Sequelize.literal(`JSON_CONTAINS(pemeriksa, '"${filters.pemeriksa_contains}"')`)
            //     ]
            // };
            // Search for inspector ID in JSON array using JSON_CONTAINS
            console.log('Filtering recommendations by pemeriksa_contains:', filters.pemeriksa_contains);

            (where as any)[Op.and] = Sequelize.literal(`JSON_CONTAINS(certification.pemeriksa, '"${filters.pemeriksa_contains}"')`);

            console.log('Using JSON_CONTAINS query for pemeriksa');
        }

        if (filters.search) {
            (where as any)[Op.or] = [
                { nomor_registrasi: { [Op.like]: `%${filters.search}%` } },
                { nomor_surat_sertifikat: { [Op.like]: `%${filters.search}%` } },
                { varietas: { [Op.like]: `%${filters.search}%` } },
            ];
        }

        if (includeRelations) {
            include.push(
                {
                    model: ProfileApplicant,
                    as: 'pemohon',
                    required: true,
                },
                {
                    model: Recommendation,
                    as: 'rekomendasi',
                    required: true,
                },
                {
                    model: Commodity,
                    as: 'komoditas',
                    required: true,
                },
                {
                    model: User,
                    as: 'verifikator',
                    required: false,
                    include: [
                        {
                            model: Role,
                            as: 'role',
                        },
                    ],
                },
                {
                    model: User,
                    as: 'inspektur_ketua',
                    required: false,
                    include: [
                        {
                            model: Role,
                            as: 'role',
                        },
                    ],
                },
                {
                    model: User,
                    as: 'inspektur',
                    required: false,
                    include: [
                        {
                            model: Role,
                            as: 'role',
                        },
                    ],
                },
                {
                    model: User,
                    as: 'kepala',
                    required: false,
                    include: [
                        {
                            model: Role,
                            as: 'role',
                        },
                    ],
                }
            );
        }

        const offset = (page - 1) * limit;

        const result = await this.model.findAndCountAll({
            where,
            include,
            limit,
            offset,
            order: [['created_at', 'DESC']],
        });

        // Fetch inspector details if includeRelations is true
        if (includeRelations && result.rows.length > 0) {
            for (const certification of result.rows) {
                if (certification.pemeriksa && certification.pemeriksa.length > 0) {
                    const inspectors = await User.findAll({
                        where: {
                            id: {
                                [Op.in]: certification.pemeriksa,
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
                    (certification as any).inspectors = inspectors;
                }
            }
        }

        return result;
    }

    async findByIdWithDetails(id: string): Promise<Certification | null> {
        const certification = await this.model.findByPk(id, {
            include: [
                {
                    model: ProfileApplicant,
                    as: 'pemohon',
                    required: true,
                },
                {
                    model: Recommendation,
                    as: 'rekomendasi',
                    required: true,
                },
                {
                    model: Commodity,
                    as: 'komoditas',
                    required: true,
                },
                {
                    model: User,
                    as: 'verifikator',
                    required: false,
                    include: [
                        {
                            model: Role,
                            as: 'role',
                        },
                    ],
                },
                {
                    model: User,
                    as: 'inspektur_ketua',
                    required: false,
                    include: [
                        {
                            model: Role,
                            as: 'role',
                        },
                    ],
                },
                {
                    model: User,
                    as: 'inspektur',
                    required: false,
                    include: [
                        {
                            model: Role,
                            as: 'role',
                        },
                    ],
                },
                {
                    model: User,
                    as: 'kepala',
                    required: false,
                    include: [
                        {
                            model: Role,
                            as: 'role',
                        },
                    ],
                },
            ],
        });

        if (certification && certification.pemeriksa && certification.pemeriksa.length > 0) {
            const inspectors = await User.findAll({
                where: {
                    id: {
                        [Op.in]: certification.pemeriksa,
                    },
                },
                include: [
                    {
                        model: Role,
                        as: 'role',
                    },
                ],
            });
            (certification as any).inspectors = inspectors;
        }

        return certification;
    }

    async findByPemohonId(pemohonId: string): Promise<Certification[]> {
        return await this.model.findAll({
            where: { pemohon_id: pemohonId },
            include: [
                {
                    model: Recommendation,
                    as: 'rekomendasi',
                    required: true,
                },
                {
                    model: Commodity,
                    as: 'komoditas',
                    required: true,
                },
            ],
            order: [['created_at', 'DESC']],
        });
    }

    async findByInspectorId(inspectorId: string): Promise<Certification[]> {
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
                {
                    model: Recommendation,
                    as: 'rekomendasi',
                    required: true,
                },
                {
                    model: Commodity,
                    as: 'komoditas',
                    required: true,
                },
            ],
            order: [['created_at', 'DESC']],
        });
    }

    async updateStatus(id: string, status: number, additionalData?: Partial<Certification>): Promise<Certification | null> {
        const updateData: Partial<Certification> = {
            status: status,
            ...additionalData,
        };

        // Set verification/examination dates based on status
        const now = new Date();
        switch (status) {
            case 2:
                updateData.tanggal_jadwal_pemeriksaan = updateData.tanggal_jadwal_pemeriksaan || now;
                break;
            case 3:
                updateData.tanggal_pemeriksaan = now;
                break;
            case 6:
                updateData.tanggal_surat_sertifikat = updateData.tanggal_surat_sertifikat || now;
                break;
        }

        return await this.update(id, updateData);
    }

    async findLastByPrefix(prefix: string): Promise<Certification | null> {
        return await this.model.findOne({
            where: {
                nomor_registrasi: {
                    [Op.like]: `${prefix}%`,
                },
            },
            order: [['nomor_registrasi', 'DESC']],
        });
    }

    /**
     * Generate sequence number for certification registration
     */
    async generateSequenceNumber(tipe: 'siaptanam' | 'pratanam'): Promise<number> {
        const today = new Date();
        const year = today.getFullYear().toString().slice(-2);
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');

        const prefix = tipe === 'siaptanam' ? 'REG-PT' : 'REG-ST';
        const datePrefix = `${prefix}${day}${month}${year}`;

        const lastCertification = await this.findLastByPrefix(datePrefix);

        if (!lastCertification) {
            return 1;
        }

        const lastNumber = lastCertification.nomor_registrasi;
        const sequenceMatch = lastNumber.match(/(\d{4})$/);

        if (sequenceMatch) {
            return parseInt(sequenceMatch[1]) + 1;
        }

        return 1;
    }

    /**
     * Alias for findAllWithFilters to match service expectations
     */
    async findWithFilters(
        filters: CertificationFilterOptions = {},
        includeRelations: boolean = true,
        page: number = 1,
        limit: number = 10
    ): Promise<{ rows: Certification[]; count: number }> {
        return await this.findAllWithFilters(filters, page, limit, includeRelations);
    }

    /**
     * Alias for findByIdWithDetails to match service expectations
     */
    async findByIdWithRelations(id: string): Promise<Certification | null> {
        return await this.findByIdWithDetails(id);
    }
}

export default CertificationRepository;
