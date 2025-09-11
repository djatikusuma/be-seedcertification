import { SeedSource, SeedSourceInterface, SeedSourceStatus } from '../models/SeedSource.model';
import { SeedSourceRepository } from '../repositories/seedSource.repository';
import { ProfileApplicant } from '../models/ProfileApplicant.model';
import { CryptoUtil } from '../utils/crypto.util';
import { UserRepository } from '../repositories/user.repository';

export class SeedSourceService {
    private seedSourceRepository: SeedSourceRepository;
    private userRepository: UserRepository;

    constructor() {
        this.seedSourceRepository = new SeedSourceRepository();
        this.userRepository = new UserRepository();
    }

    async createSeedSource(data: {
        pemohonId: string;
        nomorPenetapan: string;
        tanggalPenetapan: Date;
        filePenetapanSumberBenih: string;
    }): Promise<SeedSource> {
        // Validate pemohon exists
        const pemohon = await ProfileApplicant.findByPk(data.pemohonId);
        if (!pemohon) {
            throw new Error('Pemohon not found');
        }

        // Check if nomor_penetapan already exists
        const existingSeedSource = await SeedSource.findOne({
            where: { nomor_penetapan: data.nomorPenetapan }
        });

        if (existingSeedSource) {
            throw new Error('Nomor penetapan already exists');
        }

        const seedSourceData: Partial<SeedSourceInterface> = {
            pemohon_id: data.pemohonId,
            nomor_penetapan: data.nomorPenetapan,
            tanggal_penetapan: data.tanggalPenetapan,
            file_penetapan_sumber_benih: data.filePenetapanSumberBenih,
            status: SeedSourceStatus.VERIFIKASI_DOKUMEN
        };

        return await this.seedSourceRepository.create(seedSourceData);
    }

    async getAllSeedSources(
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
        const result = await this.seedSourceRepository.findAllWithDetails(page, limit, pemohonId, status);

        // Decrypt sensitive data for display
        const decryptedItems = await Promise.all(result.items.map(async (seedSource: any) => {
            const seedSourceData = seedSource.toJSON();

            // Decrypt pemohon data
            if (seedSourceData.pemohon) {
                seedSourceData.pemohon = this.decryptProfileData(seedSourceData.pemohon);

                // Decrypt user data in pemohon if exists
                if (seedSourceData.pemohon.user) {
                    seedSourceData.pemohon.user = this.decryptUserData(seedSourceData.pemohon.user);
                }
            }

            // Decrypt verifikator data if exists
            if (seedSourceData.verifikator) {
                seedSourceData.verifikator = this.decryptUserData(seedSourceData.verifikator);
            }

            return seedSourceData;
        }));

        return {
            ...result,
            items: decryptedItems
        };
    }

    async getSeedSourceById(id: string): Promise<SeedSource | null> {
        const seedSource = await this.seedSourceRepository.findByIdWithDetails(id);

        if (!seedSource) {
            return null;
        }

        const seedSourceData = seedSource.toJSON();

        // Decrypt pemohon data
        if (seedSourceData.pemohon) {
            seedSourceData.pemohon = this.decryptProfileData(seedSourceData.pemohon);

            // Decrypt user data in pemohon if exists
            if (seedSourceData.pemohon.user) {
                seedSourceData.pemohon.user = this.decryptUserData(seedSourceData.pemohon.user);
            }
        }

        // Decrypt verifikator data if exists
        if (seedSourceData.verifikator) {
            seedSourceData.verifikator = this.decryptUserData(seedSourceData.verifikator);
        }

        return seedSourceData as SeedSource;
    }

    async getSeedSourcesByPemohon(pemohonId: string): Promise<SeedSource[]> {
        const seedSources = await this.seedSourceRepository.findByPemohonId(pemohonId);

        // Decrypt sensitive data for each seed source
        const decryptedSeedSources = await Promise.all(seedSources.map(async (seedSource: any) => {
            const seedSourceData = seedSource.toJSON();

            // Decrypt verifikator data if exists
            if (seedSourceData.verifikator) {
                seedSourceData.verifikator = this.decryptUserData(seedSourceData.verifikator);
            }

            return seedSourceData;
        }));

        return decryptedSeedSources as SeedSource[];
    }

    async verifySeedSource(
        id: string,
        verifikatorId: string,
        action: 'approve' | 'reject',
        catatanVerifikasi?: string
    ): Promise<SeedSource | null> {
        const seedSource = await this.seedSourceRepository.findById(id);
        if (!seedSource) {
            throw new Error('Seed source not found');
        }

        if (seedSource.status !== SeedSourceStatus.VERIFIKASI_DOKUMEN) {
            throw new Error('Seed source is not in verification status');
        }

        const newStatus = action === 'approve'
            ? SeedSourceStatus.DITERIMA
            : SeedSourceStatus.DITOLAK;

        const verifiedSeedSource = await this.seedSourceRepository.updateVerification(
            id,
            verifikatorId,
            newStatus,
            catatanVerifikasi
        );

        // Decrypt the result before returning
        if (verifiedSeedSource) {
            return await this.getSeedSourceById(verifiedSeedSource.id);
        }

        return null;
    }

    async getPendingVerifications(): Promise<SeedSource[]> {
        const seedSources = await this.seedSourceRepository.findPendingVerification();

        // Decrypt sensitive data for each seed source
        const decryptedSeedSources = await Promise.all(seedSources.map(async (seedSource: any) => {
            const seedSourceData = seedSource.toJSON();

            // Decrypt pemohon data
            if (seedSourceData.pemohon) {
                seedSourceData.pemohon = this.decryptProfileData(seedSourceData.pemohon);

                // Decrypt user data in pemohon if exists
                if (seedSourceData.pemohon.user) {
                    seedSourceData.pemohon.user = this.decryptUserData(seedSourceData.pemohon.user);
                }
            }

            return seedSourceData;
        }));

        return decryptedSeedSources as SeedSource[];
    }

    async updateSeedSource(
        id: string,
        data: Partial<SeedSourceInterface>
    ): Promise<SeedSource | null> {
        const seedSource = await this.seedSourceRepository.findById(id);
        if (!seedSource) {
            throw new Error('Seed source not found');
        }

        // Only allow updates if status is still VERIFIKASI_DOKUMEN
        if (seedSource.status !== SeedSourceStatus.VERIFIKASI_DOKUMEN) {
            throw new Error('Cannot update seed source that has been verified');
        }

        // Prevent updating certain fields
        const allowedFields = [
            'nomor_penetapan',
            'tanggal_penetapan',
            'file_penetapan_sumber_benih'
        ];

        const updateData: any = {};
        Object.keys(data).forEach(key => {
            if (allowedFields.includes(key)) {
                updateData[key] = data[key as keyof SeedSourceInterface];
            }
        });

        await this.seedSourceRepository.update(id, updateData);
        return await this.getSeedSourceById(id);
    }

    // Helper method to get status statistics
    async getStatusStatistics(): Promise<{
        total: number;
        verifikasi_dokumen: number;
        diterima: number;
        ditolak: number;
    }> {
        const [total, verifikasiDokumen, diterima, ditolak] = await Promise.all([
            SeedSource.count(),
            SeedSource.count({ where: { status: SeedSourceStatus.VERIFIKASI_DOKUMEN } }),
            SeedSource.count({ where: { status: SeedSourceStatus.DITERIMA } }),
            SeedSource.count({ where: { status: SeedSourceStatus.DITOLAK } })
        ]);

        return {
            total,
            verifikasi_dokumen: verifikasiDokumen,
            diterima,
            ditolak
        };
    }

    async findById(id: string): Promise<SeedSource | null> {
        return await this.seedSourceRepository.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        return await this.seedSourceRepository.delete(id);
    }

    // Private methods for decryption
    private decryptProfileData(profile: any): any {
        if (!profile) return profile;

        try {
            const decryptedProfile = { ...profile };

            // List of fields that are encrypted in ProfileApplicant
            const encryptedFields = [
                'nik', 'npwp', 'email', 'namaPemohon', 'telepon',
                'alamatPemohon', 'alamatPerusahaan', 'nikKuasa', 'namaKuasa'
            ];

            // Decrypt each field if it exists
            encryptedFields.forEach(field => {
                if (decryptedProfile[field] && typeof decryptedProfile[field] === 'string') {
                    try {
                        // Try to decrypt the field
                        decryptedProfile[field] = CryptoUtil.decrypt(decryptedProfile[field]);
                    } catch (error) {
                        // If decryption fails, keep original value (might already be decrypted)
                        console.warn(`Failed to decrypt field ${field}:`, error);
                    }
                }
            });

            return decryptedProfile;
        } catch (error) {
            console.error('Error decrypting profile data:', error);
            return profile;
        }
    }

    private decryptUserData(user: any): any {
        if (!user) return user;

        try {
            const decryptedUser = { ...user };

            // Decrypt name if encrypted
            if (decryptedUser.name && typeof decryptedUser.name === 'string') {
                try {
                    decryptedUser.name = CryptoUtil.decrypt(decryptedUser.name);
                } catch (error) {
                    console.warn('Failed to decrypt user name:', error);
                }
            }

            // Decrypt email if encrypted
            if (decryptedUser.email && typeof decryptedUser.email === 'string') {
                try {
                    decryptedUser.email = CryptoUtil.decrypt(decryptedUser.email);
                } catch (error) {
                    console.warn('Failed to decrypt user email:', error);
                }
            }

            // Decrypt profile data if exists
            if (decryptedUser.profile) {
                decryptedUser.profile = this.decryptProfileData(decryptedUser.profile);
            }

            return decryptedUser;
        } catch (error) {
            console.error('Error decrypting user data:', error);
            return user;
        }
    }
}

export default SeedSourceService;
