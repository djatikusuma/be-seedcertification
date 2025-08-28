import { BaseService } from './base.service';
import { Commodity } from '../models/Commodity.model';
import { CommodityRepository, CommodityFilterOptions } from '../repositories/commodity.repository';

export interface CreateCommodityDto {
    code: string;
    nama: string;
    nama_latin?: string;
    smsb?: number;
    smb?: number;
    is_active?: boolean;
}

export interface UpdateCommodityDto {
    code?: string;
    nama?: string;
    nama_latin?: string;
    smsb?: number;
    smb?: number;
    is_active?: boolean;
}

export class CommodityService extends BaseService<Commodity> {
    private commodityRepository: CommodityRepository;

    constructor() {
        const commodityRepository = new CommodityRepository();
        super(commodityRepository);
        this.commodityRepository = commodityRepository;
    }

    async createCommodity(data: CreateCommodityDto): Promise<Commodity> {
        // Check if code already exists
        const existingCommodity = await this.commodityRepository.findByCode(data.code);
        if (existingCommodity) {
            throw new Error('Code already exists');
        }

        return await this.commodityRepository.create({
            code: data.code,
            nama: data.nama,
            nama_latin: data.nama_latin,
            smsb: data.smsb || 1,
            smb: data.smb || 1,
            is_active: data.is_active !== undefined ? data.is_active : true,
        });
    }

    async updateCommodity(id: string, data: UpdateCommodityDto): Promise<Commodity | null> {
        // Check if code already exists for other commodities
        if (data.code) {
            const isCodeExists = await this.commodityRepository.isCodeExists(data.code, id);
            if (isCodeExists) {
                throw new Error('Code already exists');
            }
        }

        return await this.commodityRepository.update(id, data);
    }

    async getCommodities(
        filters: CommodityFilterOptions = {},
        page = 1,
        limit = 10
    ): Promise<{ rows: Commodity[]; count: number; totalPages: number; currentPage: number }> {
        const result = await this.commodityRepository.findAllWithFilters(filters, page, limit);

        return {
            rows: result.rows,
            count: result.count,
            totalPages: Math.ceil(result.count / limit),
            currentPage: page,
        };
    }

    async getCommodityByCode(code: string): Promise<Commodity | null> {
        return await this.commodityRepository.findByCode(code);
    }

    async activateDeactivateCommodity(id: string, is_active: boolean): Promise<Commodity | null> {
        return await this.commodityRepository.update(id, { is_active });
    }
}

export default CommodityService;
