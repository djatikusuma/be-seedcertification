import { BaseRepository } from './base.repository';
import { TempUser, UserType, VerificationStatus } from '../models/TempUser.model';
import { TempUserInterface } from '../interfaces/model.interface';
import { CryptoUtil } from '../utils/crypto.util';

export class TempUserRepository extends BaseRepository<TempUser> {
    constructor() {
        super(TempUser);
    }

    // Create new temp user registration
    async createTempUser(data: Omit<TempUserInterface, 'id' | 'createdAt' | 'updatedAt'>): Promise<TempUser> {
        return await this.model.create(data as any);
    }

    // Find temp user by email
    async findByEmail(email: string): Promise<TempUser | null> {
        return await TempUser.findByEmail(email);
    }

    // Find temp user by NIK
    async findByNik(nik: string): Promise<TempUser | null> {
        return await TempUser.findByNik(nik);
    }

    // Get all pending temp users for verification
    async getPendingRegistrations(page: number = 1, limit: number = 10): Promise<{
        data: TempUser[];
        total: number;
        totalPages: number;
        currentPage: number;
    }> {
        const offset = (page - 1) * limit;

        const { count, rows } = await this.model.findAndCountAll({
            where: {
                verificationStatus: VerificationStatus.PENDING
            },
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        return {
            data: rows,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        };
    }

    // Get all temp users with filtering
    async getTempUsersWithFilter(
        filters: {
            verificationStatus?: VerificationStatus;
            userType?: UserType;
            startDate?: Date;
            endDate?: Date;
        },
        page: number = 1,
        limit: number = 10
    ): Promise<{
        data: TempUser[];
        total: number;
        totalPages: number;
        currentPage: number;
    }> {
        const whereClause: any = {};

        if (filters.verificationStatus) {
            whereClause.verificationStatus = filters.verificationStatus;
        }

        if (filters.userType) {
            whereClause.userType = filters.userType;
        }

        if (filters.startDate) {
            whereClause.createdAt = whereClause.createdAt || {};
            whereClause.createdAt.$gte = filters.startDate;
        }

        if (filters.endDate) {
            whereClause.createdAt = whereClause.createdAt || {};
            whereClause.createdAt.$lte = filters.endDate;
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await this.model.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        return {
            data: rows,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        };
    }

    // Update verification status
    async updateVerificationStatus(
        id: string,
        status: VerificationStatus,
        verifiedBy: string,
        notes?: string
    ): Promise<TempUser | null> {
        const tempUser = await this.findById(id);
        if (!tempUser) {
            throw new Error('Temp user not found');
        }

        await tempUser.update({
            verificationStatus: status,
            verifiedBy,
            verifiedAt: new Date(),
            verificationNotes: notes
        });

        return tempUser;
    }

    // Validate unique email and NIK
    async validateUnique(email: string, nik: string, excludeId?: string): Promise<{
        emailExists: boolean;
        nikExists: boolean;
    }> {
        return await TempUser.validateUnique(email, nik, excludeId);
    }

    // Get temp user by ID for verification details
    async getVerificationDetails(id: string): Promise<TempUser | null> {
        return await this.findById(id);
    }

    // Soft delete temp user
    async softDelete(id: string): Promise<boolean> {
        const tempUser = await this.findById(id);
        if (!tempUser) {
            return false;
        }

        await tempUser.update({
            deletedAt: new Date()
        });

        return true;
    }

    // Get statistics for dashboard
    async getVerificationStatistics(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        perusahaan: number;
        perorangan: number;
    }> {
        const total = await this.model.count();

        const pending = await this.model.count({
            where: {
                verificationStatus: VerificationStatus.PENDING
            }
        });

        const approved = await this.model.count({
            where: {
                verificationStatus: VerificationStatus.APPROVED
            }
        });

        const rejected = await this.model.count({
            where: {
                verificationStatus: VerificationStatus.REJECTED
            }
        });

        const perusahaan = await this.model.count({
            where: {
                userType: UserType.PERUSAHAAN
            }
        });

        const perorangan = await this.model.count({
            where: {
                userType: UserType.PERORANGAN
            }
        });

        return {
            total,
            pending,
            approved,
            rejected,
            perusahaan,
            perorangan
        };
    }
}
