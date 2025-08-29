import { BaseRepository } from './base.repository';
import { CertificationInspection } from '../models/CertificationInspection.model';
import { CertificationInspectionInterface } from '../interfaces/model.interface';
import { Certification } from '../models/Certification.model';
import { User } from '../models/User.model';
import { Role } from '../models/Role.model';
import { WhereOptions, Includeable } from 'sequelize';

export interface CertificationInspectionFilterOptions {
    certification_id?: string;
    pemeriksa_id?: string;
}

export class CertificationInspectionRepository extends BaseRepository<CertificationInspection> {
    constructor() {
        super(CertificationInspection);
    }

    /**
     * Find inspections with filters
     */
    async findWithFilters(
        filters: CertificationInspectionFilterOptions = {},
        includeRelations: boolean = true,
        page: number = 1,
        limit: number = 10
    ): Promise<{ rows: CertificationInspection[]; count: number }> {
        const where: WhereOptions = {};
        const include: Includeable[] = [];

        // Apply filters
        if (filters.certification_id) {
            where.certification_id = filters.certification_id;
        }

        if (filters.pemeriksa_id) {
            where.pemeriksa_id = filters.pemeriksa_id;
        }

        // Include relations if requested
        if (includeRelations) {
            include.push(
                {
                    model: Certification,
                    as: 'certification',
                },
                {
                    model: User,
                    as: 'pemeriksa',
                    include: [
                        {
                            model: Role,
                            as: 'role',
                        }
                    ],
                }
            );
        }

        const offset = (page - 1) * limit;

        return await this.model.findAndCountAll({
            where,
            include,
            offset,
            limit,
            order: [['createdAt', 'DESC']],
        });
    }

    /**
     * Find by certification ID
     */
    async findByCertificationId(certificationId: string): Promise<CertificationInspection[]> {
        return await this.model.findAll({
            where: { certification_id: certificationId },
            include: [
                {
                    model: User,
                    as: 'pemeriksa',
                    include: [
                        {
                            model: Role,
                            as: 'role',
                        }
                    ],
                }
            ],
            order: [['createdAt', 'DESC']],
        });
    }

    /**
     * Find by pemeriksa ID
     */
    async findByPemeriksaId(pemeriksaId: string): Promise<CertificationInspection[]> {
        return await this.model.findAll({
            where: { pemeriksa_id: pemeriksaId },
            include: [
                {
                    model: Certification,
                    as: 'certification',
                }
            ],
            order: [['createdAt', 'DESC']],
        });
    }
}

export default CertificationInspectionRepository;
