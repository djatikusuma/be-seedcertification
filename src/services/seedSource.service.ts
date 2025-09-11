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
        items: any[];
        total: number;
        totalPages: number;
        currentPage: number;
    }> {
        const result = await this.seedSourceRepository.findAllWithDetails(page, limit, pemohonId, status);

        // Properly serialize and decrypt sensitive data for display
        const decryptedItems = result.items.map((seedSource: any) => {
            // Convert to plain object safely
            const seedSourceData: any = {
                id: seedSource.id,
                pemohon_id: seedSource.pemohon_id,
                nomor_penetapan: seedSource.nomor_penetapan,
                tanggal_penetapan: seedSource.tanggal_penetapan,
                file_penetapan_sumber_benih: seedSource.file_penetapan_sumber_benih,
                status: seedSource.status,
                status_label: seedSource.getStatusLabel(),
                verifikator_id: seedSource.verifikator_id,
                catatan_verifikasi: seedSource.catatan_verifikasi,
                tanggal_verifikasi: seedSource.tanggal_verifikasi,
                created_at: seedSource.created_at,
                updated_at: seedSource.updated_at
            };

            // Add pemohon data if exists
            if (seedSource.pemohon) {
                const pemohonData = {
                    id: seedSource.pemohon.id,
                    userId: seedSource.pemohon.userId,
                    nik: seedSource.pemohon.nik,
                    npwp: seedSource.pemohon.npwp,
                    email: seedSource.pemohon.email,
                    namaPemohon: seedSource.pemohon.namaPemohon,
                    telepon: seedSource.pemohon.telepon,
                    alamatPemohon: seedSource.pemohon.alamatPemohon,
                    alamatPerusahaan: seedSource.pemohon.alamatPerusahaan,
                    nikKuasa: seedSource.pemohon.nikKuasa,
                    namaKuasa: seedSource.pemohon.namaKuasa
                };

                // Decrypt pemohon data
                seedSourceData.pemohon = this.decryptProfileData(pemohonData);

                // Add user data if exists
                if (seedSource.pemohon.user) {
                    const userData = {
                        id: seedSource.pemohon.user.id,
                        name: seedSource.pemohon.user.name,
                        email: seedSource.pemohon.user.email,
                        role: seedSource.pemohon.user.role ? {
                            id: seedSource.pemohon.user.role.id,
                            roleName: seedSource.pemohon.user.role.roleName
                        } : null
                    };
                    seedSourceData.pemohon.user = this.decryptUserData(userData);
                }
            }

            // Add verifikator data if exists
            if (seedSource.verifikator) {
                const verifikatorData = {
                    id: seedSource.verifikator.id,
                    name: seedSource.verifikator.name,
                    email: seedSource.verifikator.email
                };
                seedSourceData.verifikator = this.decryptUserData(verifikatorData);
            }

            return seedSourceData;
        });

        return {
            ...result,
            items: decryptedItems
        };
    }

    async getSeedSourceById(id: string): Promise<any | null> {
        const seedSource = await this.seedSourceRepository.findByIdWithDetails(id);

        if (!seedSource) {
            return null;
        }

        // Convert to plain object safely
        const seedSourceData: any = {
            id: seedSource.id,
            pemohon_id: seedSource.pemohon_id,
            nomor_penetapan: seedSource.nomor_penetapan,
            tanggal_penetapan: seedSource.tanggal_penetapan,
            file_penetapan_sumber_benih: seedSource.file_penetapan_sumber_benih,
            status: seedSource.status,
            status_label: seedSource.getStatusLabel(),
            verifikator_id: seedSource.verifikator_id,
            catatan_verifikasi: seedSource.catatan_verifikasi,
            verify_at: seedSource.verify_at,
            created_at: seedSource.created_at,
            updated_at: seedSource.updated_at
        };

        // Add pemohon data if exists
        if (seedSource.pemohon) {
            const pemohonData = {
                id: seedSource.pemohon.id,
                userId: seedSource.pemohon.userId,
                nik: seedSource.pemohon.nik,
                npwp: seedSource.pemohon.npwp,
                email: seedSource.pemohon.email,
                namaPemohon: seedSource.pemohon.namaPemohon,
                telepon: seedSource.pemohon.telepon,
                alamatPemohon: seedSource.pemohon.alamatPemohon,
                alamatPerusahaan: seedSource.pemohon.alamatPerusahaan,
                nikKuasa: seedSource.pemohon.nikKuasa,
                namaKuasa: seedSource.pemohon.namaKuasa
            };

            // Decrypt pemohon data
            seedSourceData.pemohon = this.decryptProfileData(pemohonData);

            // Add user data if exists
            if (seedSource.pemohon.user) {
                const userData = {
                    id: seedSource.pemohon.user.id,
                    name: seedSource.pemohon.user.name,
                    email: seedSource.pemohon.user.email,
                    role: seedSource.pemohon.user.role ? {
                        id: seedSource.pemohon.user.role.id,
                        roleName: seedSource.pemohon.user.role.roleName
                    } : null
                };
                seedSourceData.pemohon.user = this.decryptUserData(userData);
            }
        }

        // Add verifikator data if exists
        if (seedSource.verifikator) {
            const verifikatorData = {
                id: seedSource.verifikator.id,
                name: seedSource.verifikator.name,
                email: seedSource.verifikator.email
            };
            seedSourceData.verifikator = this.decryptUserData(verifikatorData);
        }

        return seedSourceData;
    }

    async getSeedSourcesByPemohon(pemohonId: string): Promise<any[]> {
        const seedSources = await this.seedSourceRepository.findByPemohonId(pemohonId);

        // Properly serialize and decrypt sensitive data for each seed source
        const decryptedSeedSources = seedSources.map((seedSource: any) => {
            const seedSourceData: any = {
                id: seedSource.id,
                pemohon_id: seedSource.pemohon_id,
                nomor_penetapan: seedSource.nomor_penetapan,
                tanggal_penetapan: seedSource.tanggal_penetapan,
                file_penetapan_sumber_benih: seedSource.file_penetapan_sumber_benih,
                status: seedSource.status,
                status_label: seedSource.getStatusLabel(),
                verifikator_id: seedSource.verifikator_id,
                catatan_verifikasi: seedSource.catatan_verifikasi,
                tanggal_verifikasi: seedSource.tanggal_verifikasi,
                created_at: seedSource.created_at,
                updated_at: seedSource.updated_at
            };

            // Add verifikator data if exists
            if (seedSource.verifikator) {
                const verifikatorData = {
                    id: seedSource.verifikator.id,
                    name: seedSource.verifikator.name,
                    email: seedSource.verifikator.email
                };
                seedSourceData.verifikator = this.decryptUserData(verifikatorData);
            }

            return seedSourceData;
        });

        return decryptedSeedSources;
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

    async getPendingVerifications(): Promise<any[]> {
        const seedSources = await this.seedSourceRepository.findPendingVerification();

        // Properly serialize and decrypt sensitive data for each seed source
        const decryptedSeedSources = seedSources.map((seedSource: any) => {
            const seedSourceData: any = {
                id: seedSource.id,
                pemohon_id: seedSource.pemohon_id,
                nomor_penetapan: seedSource.nomor_penetapan,
                tanggal_penetapan: seedSource.tanggal_penetapan,
                file_penetapan_sumber_benih: seedSource.file_penetapan_sumber_benih,
                status: seedSource.status,
                status_label: seedSource.getStatusLabel(),
                verifikator_id: seedSource.verifikator_id,
                catatan_verifikasi: seedSource.catatan_verifikasi,
                tanggal_verifikasi: seedSource.tanggal_verifikasi,
                created_at: seedSource.created_at,
                updated_at: seedSource.updated_at
            };

            // Add pemohon data if exists
            if (seedSource.pemohon) {
                const pemohonData = {
                    id: seedSource.pemohon.id,
                    userId: seedSource.pemohon.userId,
                    nik: seedSource.pemohon.nik,
                    npwp: seedSource.pemohon.npwp,
                    email: seedSource.pemohon.email,
                    namaPemohon: seedSource.pemohon.namaPemohon,
                    telepon: seedSource.pemohon.telepon,
                    alamatPemohon: seedSource.pemohon.alamatPemohon,
                    alamatPerusahaan: seedSource.pemohon.alamatPerusahaan,
                    nikKuasa: seedSource.pemohon.nikKuasa,
                    namaKuasa: seedSource.pemohon.namaKuasa
                };

                // Decrypt pemohon data
                seedSourceData.pemohon = this.decryptProfileData(pemohonData);

                // Add user data if exists
                if (seedSource.pemohon.user) {
                    const userData = {
                        id: seedSource.pemohon.user.id,
                        name: seedSource.pemohon.user.name,
                        email: seedSource.pemohon.user.email,
                        role: seedSource.pemohon.user.role ? {
                            id: seedSource.pemohon.user.role.id,
                            roleName: seedSource.pemohon.user.role.roleName
                        } : null
                    };
                    seedSourceData.pemohon.user = this.decryptUserData(userData);
                }
            }

            return seedSourceData;
        });

        return decryptedSeedSources;
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
