import { BaseRepository } from './base.repository';
import { Commodity, CommodityInterface } from '../models/Commodity.model';
import { Op, WhereOptions } from 'sequelize';

export interface CommodityFilterOptions {
    code?: string;
    nama?: string;
    is_active?: boolean;
    search?: string;
}

export class CommodityRepository extends BaseRepository<Commodity> {
    constructor() {
        super(Commodity);
    }

    async findByCode(code: string): Promise<Commodity | null> {
        return await this.model.findOne({
            where: { code },
        });
    }

    async findAllWithFilters(
        filters: CommodityFilterOptions = {},
        page = 1,
        limit = 10
    ): Promise<{ rows: Commodity[]; count: number }> {
        const where: WhereOptions = {};

        if (filters.code) {
            where.code = { [Op.like]: `%${filters.code}%` };
        }

        if (filters.nama) {
            where.nama = { [Op.like]: `%${filters.nama}%` };
        }

        if (filters.is_active !== undefined) {
            where.is_active = filters.is_active;
        }

        if (filters.search) {
            (where as any)[Op.or] = [
                { code: { [Op.like]: `%${filters.search}%` } },
                { nama: { [Op.like]: `%${filters.search}%` } },
                { nama_latin: { [Op.like]: `%${filters.search}%` } },
            ];
        }

        const offset = (page - 1) * limit;

        return await this.model.findAndCountAll({
            where,
            limit,
            offset,
            order: [['created_at', 'DESC']],
        });
    }

    async isCodeExists(code: string, excludeId?: string): Promise<boolean> {
        const where: WhereOptions = { code };

        if (excludeId) {
            where.id = { [Op.ne]: excludeId };
        }

        const commodity = await this.model.findOne({ where });
        return commodity !== null;
    }
}

export default CommodityRepository;
