import { BaseService } from './base.service';
import { Recommendation, RecommendationStatus } from '../models/Recommendation.model';
import { RecommendationRepository, RecommendationFilterOptions } from '../repositories/recommendation.repository';
import { ProfileApplicant } from '../models/ProfileApplicant.model';
import { User } from '../models/User.model';
import { Role } from '../models/Role.model';
import { CryptoUtil } from '../utils/crypto.util';

export interface CreateRecommendationDto {
    pemohon_id: string;
    seedsource_id?: string;
    pemodalan?: number;
    tenaga_kerja_sd?: number;
    tenaga_kerja_smp?: number;
    tenaga_kerja_sma?: number;
    tenaga_kerja_s1_tani?: number;
    tenaga_kerja_s1_nontani?: number;
    file_penguasaan_benih?: string;
    link_dokumen_pendukung?: string;
}

export interface VerificationDto {
    catatan_verifikasi?: string;
    status: 'approve' | 'reject';
    verifikator_id?: string;
}

export interface SchedulingDto {
    tanggal_pemeriksaan: Date;
    pemeriksa: string[];
    inspektur_ketua_id?: string;
}

export interface InspectionDto {
    catatan_pemeriksaan?: string;
    status: 'approve' | 'reject';
    inspektur_id?: string;
}

export interface PublishDto {
    nomor_rekomendasi: string;
    surat_rekomendasi: string;
    kepala_id?: string;
}

export class RecommendationService extends BaseService<Recommendation> {
    private recommendationRepository: RecommendationRepository;

    constructor() {
        const recommendationRepository = new RecommendationRepository();
        super(recommendationRepository);
        this.recommendationRepository = recommendationRepository;
    }

    /**
     * Decrypt sensitive data from User
     * @param user - User instance with potentially encrypted data
     * @returns User with decrypted sensitive fields
     */
    private decryptUserData(user: User): User {
        if (!user) return user;

        try {
            // Fields that should be decrypted in User model
            const fieldsToDecrypt = ['name', 'email'];

            // Create a plain object from the model instance
            const decryptedData: any = user.toJSON();

            // Decrypt each sensitive field
            for (const field of fieldsToDecrypt) {
                if (decryptedData[field] && typeof decryptedData[field] === 'string') {
                    try {
                        // Check if the field is encrypted (contains colons indicating encrypted format)
                        if (decryptedData[field].includes(':') && decryptedData[field].split(':').length === 3) {
                            decryptedData[field] = CryptoUtil.decrypt(decryptedData[field]);
                        }
                        // If not encrypted, leave as is (might be plain text or already decrypted)
                    } catch (error) {
                        console.warn(`Failed to decrypt field ${field} for User ${user.id}:`, (error as Error).message);
                        // Keep original value if decryption fails
                    }
                }
            }

            // Return the User instance with decrypted data
            const result = User.build(decryptedData);
            result.isNewRecord = false;
            return result;
        } catch (error) {
            console.warn(`Failed to decrypt User data for ${user.id}:`, (error as Error).message);
            return user;
        }
    }

    /**
     * Decrypt sensitive data from ProfileApplicant
     * @param profileApplicant - ProfileApplicant instance with potentially encrypted data
     * @returns ProfileApplicant with decrypted sensitive fields
     */
    private decryptProfileApplicantData(profileApplicant: ProfileApplicant): ProfileApplicant {
        if (!profileApplicant) return profileApplicant;

        try {
            // Fields that should be decrypted
            const fieldsToDecrypt = ['nik', 'npwp', 'email', 'namaPemohon', 'telepon', 'alamatPemohon', 'alamatPerusahaan', 'nikKuasa', 'namaKuasa'];

            // Create a plain object from the model instance
            const decryptedData: any = profileApplicant.toJSON();

            // Decrypt each sensitive field
            for (const field of fieldsToDecrypt) {
                if (decryptedData[field] && typeof decryptedData[field] === 'string') {
                    try {
                        // Check if the field is encrypted (contains colons indicating encrypted format)
                        if (decryptedData[field].includes(':') && decryptedData[field].split(':').length === 3) {
                            decryptedData[field] = CryptoUtil.decrypt(decryptedData[field]);
                        }
                        // If not encrypted, leave as is (might be plain text or already decrypted)
                    } catch (error) {
                        console.warn(`Failed to decrypt field ${field} for ProfileApplicant ${profileApplicant.id}:`, (error as Error).message);
                        // Keep original value if decryption fails
                    }
                }
            }

            // Return the ProfileApplicant instance with decrypted data
            const result = ProfileApplicant.build(decryptedData);
            result.isNewRecord = false;
            return result;
        } catch (error) {
            console.warn(`Failed to decrypt ProfileApplicant data for ${profileApplicant.id}:`, (error as Error).message);
            return profileApplicant;
        }
    }

    /**
 * Process recommendation data and decrypt pemohon information
 * @param recommendation - Recommendation instance
 * @returns Recommendation with decrypted pemohon data
 */
    private async processRecommendationData(recommendation: Recommendation): Promise<any> {
        if (!recommendation) return recommendation;

        try {
            // Create a copy of the recommendation data
            const processedData: any = recommendation.toJSON();

            // Debug: Check if pemohon data exists
            console.log('Processing recommendation:', processedData.id);
            console.log('Pemohon data exists:', !!processedData.pemohon);
            console.log('Pemeriksa IDs exists:', !!processedData.pemeriksa);

            // If pemohon data is included, decrypt it
            if (processedData.pemohon) {
                console.log('Decrypting pemohon data for:', processedData.pemohon.id);
                const pemohonInstance = ProfileApplicant.build(processedData.pemohon);
                pemohonInstance.isNewRecord = false;
                processedData.pemohon = this.decryptProfileApplicantData(pemohonInstance).toJSON();
                console.log('Decrypted pemohon name:', processedData.pemohon.namaPemohon);
            }

            // Decrypt verifikator data if exists
            if (processedData.verifikator) {
                console.log('Decrypting verifikator data for:', processedData.verifikator.id);
                const verifikatorInstance = User.build(processedData.verifikator);
                verifikatorInstance.isNewRecord = false;
                processedData.verifikator = this.decryptUserData(verifikatorInstance).toJSON();
                console.log('Decrypted verifikator name:', processedData.verifikator.name);
            }

            // Decrypt inspektur ketua data if exists
            if (processedData.inspekturKetua) {
                console.log('Decrypting inspektur ketua data for:', processedData.inspekturKetua.id);
                const inspekturKetuaInstance = User.build(processedData.inspekturKetua);
                inspekturKetuaInstance.isNewRecord = false;
                processedData.inspekturKetua = this.decryptUserData(inspekturKetuaInstance).toJSON();
                console.log('Decrypted inspektur ketua name:', processedData.inspekturKetua.name);
            }

            // Decrypt inspektur data if exists
            if (processedData.inspektur) {
                console.log('Decrypting inspektur data for:', processedData.inspektur.id);
                const inspekturInstance = User.build(processedData.inspektur);
                inspekturInstance.isNewRecord = false;
                processedData.inspektur = this.decryptUserData(inspekturInstance).toJSON();
                console.log('Decrypted inspektur name:', processedData.inspektur.name);
            }

            // Decrypt kepala data if exists
            if (processedData.kepala) {
                console.log('Decrypting kepala data for:', processedData.kepala.id);
                const kepalaInstance = User.build(processedData.kepala);
                kepalaInstance.isNewRecord = false;
                processedData.kepala = this.decryptUserData(kepalaInstance).toJSON();
                console.log('Decrypted kepala name:', processedData.kepala.name);
            }

            // If pemeriksa IDs exist, fetch and decrypt user data
            if (processedData.pemeriksa && Array.isArray(processedData.pemeriksa) && processedData.pemeriksa.length > 0) {
                console.log('Fetching pemeriksa data for IDs:', processedData.pemeriksa);

                try {
                    // Fetch user data for all pemeriksa IDs
                    const pemeriksaUsers = await User.findAll({
                        where: {
                            id: processedData.pemeriksa
                        },
                        include: [
                            {
                                model: Role,
                                as: 'role',
                            },
                        ],
                    });

                    console.log('Found pemeriksa users:', pemeriksaUsers.length);

                    // Decrypt each pemeriksa user data
                    const decryptedPemeriksa = pemeriksaUsers.map(user => {
                        const decryptedUser = this.decryptUserData(user).toJSON();
                        console.log('Decrypted pemeriksa name:', decryptedUser.name);
                        return {
                            id: decryptedUser.id,
                            name: decryptedUser.name,
                            email: decryptedUser.email,
                            role: user.role // Use the included role from the query
                        };
                    });

                    // Replace pemeriksa IDs with detailed user data
                    processedData.inspectors = decryptedPemeriksa;
                } catch (error) {
                    console.warn('Failed to fetch pemeriksa data:', (error as Error).message);
                    processedData.inspectors = [];
                }
            } else {
                processedData.inspectors = [];
            }

            // Return the processed data as plain object to maintain pemohon data
            return processedData;
        } catch (error) {
            console.warn(`Failed to process recommendation data for ${recommendation.id}:`, (error as Error).message);
            return recommendation.toJSON();
        }
    }

    async createRecommendation(data: CreateRecommendationDto): Promise<Recommendation> {
        // Verify that pemohon exists
        const pemohon = await ProfileApplicant.findByPk(data.pemohon_id);
        if (!pemohon) {
            throw new Error('Pemohon not found');
        }

        return await this.recommendationRepository.create({
            pemohon_id: data.pemohon_id,
            seedsource_id: data.seedsource_id || undefined,
            pemodalan: data.pemodalan,
            tenaga_kerja_sd: data.tenaga_kerja_sd || 0,
            tenaga_kerja_smp: data.tenaga_kerja_smp || 0,
            tenaga_kerja_sma: data.tenaga_kerja_sma || 0,
            tenaga_kerja_s1_tani: data.tenaga_kerja_s1_tani || 0,
            tenaga_kerja_s1_nontani: data.tenaga_kerja_s1_nontani || 0,
            file_penguasaan_benih: data.file_penguasaan_benih,
            link_dokumen_pendukung: data.link_dokumen_pendukung,
            status: RecommendationStatus.VERIFIKASI_DOKUMEN,
            is_sertifikasi: false,
        });
    }

    async getRecommendationsByRole(
        userRole: string,
        userId: string,
        filters: RecommendationFilterOptions = {},
        page = 1,
        limit = 10
    ): Promise<{ rows: any[]; count: number; totalPages: number; currentPage: number }> {
        let result;

        switch (userRole) {
            case 'petani':
            case 'perusahaan':
                // Find pemohon by user_id
                const pemohon = await ProfileApplicant.findOne({ where: { userId: userId } as any });
                if (!pemohon) {
                    throw new Error('Profile applicant not found');
                }

                result = await this.recommendationRepository.findAllWithFilters(
                    { ...filters, pemohon_id: pemohon.id },
                    page,
                    limit,
                    false,
                    false
                );

                // Transform data for pemohon - only show basic info
                const pemohonRows = await Promise.all(result.rows.map(async (rec) => {
                    // We don't need to process recommendation data for petani, just basic info
                    return {
                        id: rec.id,
                        nomor_rekomendasi: rec.nomor_rekomendasi,
                        status: rec.status,
                        status_text: rec.getStatusText(),
                        created_at: rec.createdAt,
                        updated_at: rec.updatedAt
                    };
                }));

                return {
                    rows: pemohonRows,
                    count: result.count,
                    totalPages: Math.ceil(result.count / limit),
                    currentPage: page,
                };

            case 'inspektur':
                console.log('Fetching recommendations for inspektur with includeApplicant=true');
                result = await this.recommendationRepository.findAllWithFilters(
                    { ...filters, pemeriksa_contains: userId },
                    page,
                    limit,
                    true,
                    false
                );
                console.log('Found recommendations:', result.rows.length);
                console.log('First recommendation has pemohon:', !!(result.rows[0] && (result.rows[0] as any).pemohon));

                // Transform data for inspektur with decrypted pemohon data
                const inspekturRows = await Promise.all(result.rows.map(async (rec) => {
                    const processedRec = await this.processRecommendationData(rec);
                    return {
                        id: processedRec.id,
                        nomor_rekomendasi: rec.nomor_rekomendasi,
                        pemohon: processedRec.pemohon ? {
                            id: processedRec.pemohon.id,
                            namaPemohon: processedRec.pemohon.namaPemohon,
                            email: processedRec.pemohon.email,
                            telepon: processedRec.pemohon.telepon,
                            alamatPemohon: processedRec.pemohon.alamatPemohon,
                        } : null,
                        inspectors: processedRec.inspectors || [],
                        status: processedRec.status,
                        status_text: rec.getStatusText(),
                        created_at: processedRec.created_at,
                        updated_at: processedRec.updated_at,
                    };
                }));

                return {
                    rows: inspekturRows,
                    count: result.count,
                    totalPages: Math.ceil(result.count / limit),
                    currentPage: page,
                };

            case 'verifikatur':
            case 'inspektur_ketua':
            case 'kepala':
            case 'admin':
                console.log('Fetching recommendations for admin/verifikatur with includeApplicant=true');
                result = await this.recommendationRepository.findAllWithFilters(
                    filters,
                    page,
                    limit,
                    true,
                    false
                );
                console.log('Found recommendations:', result.rows.length);
                console.log('First recommendation has pemohon:', !!(result.rows[0] && (result.rows[0] as any).pemohon));

                // Transform data for admin/verifikatur/etc with decrypted pemohon data
                const adminRows = await Promise.all(result.rows.map(async (rec) => {
                    const processedRec = await this.processRecommendationData(rec);
                    return {
                        id: processedRec.id,
                        nomor_rekomendasi: rec.nomor_rekomendasi,
                        pemohon: processedRec.pemohon ? {
                            id: processedRec.pemohon.id,
                            namaPemohon: processedRec.pemohon.namaPemohon,
                            email: processedRec.pemohon.email,
                            telepon: processedRec.pemohon.telepon,
                            alamatPemohon: processedRec.pemohon.alamatPemohon,
                            nik: processedRec.pemohon.nik,
                        } : null,
                        inspectors: processedRec.inspectors || [],
                        status: processedRec.status,
                        status_text: rec.getStatusText(),
                        created_at: processedRec.created_at,
                        updated_at: processedRec.updated_at,
                    };
                }));

                return {
                    rows: adminRows,
                    count: result.count,
                    totalPages: Math.ceil(result.count / limit),
                    currentPage: page,
                };

            default:
                throw new Error('Unauthorized role');
        }
    }

    async getRecommendationById(id: string): Promise<any> {
        const recommendation = await this.recommendationRepository.findByIdWithDetails(id);
        if (!recommendation) {
            return null;
        }
        // Process and decrypt the recommendation data
        return await this.processRecommendationData(recommendation);
    }

    async findProfileApplicantByUserId(userId: string): Promise<ProfileApplicant | null> {
        return await ProfileApplicant.findOne({ where: { userId: userId } as any });
    }

    async verifyRecommendation(id: string, data: VerificationDto): Promise<Recommendation | null> {
        const recommendation = await this.recommendationRepository.findById(id);
        if (!recommendation) {
            throw new Error('Recommendation not found');
        }

        if (recommendation.status !== RecommendationStatus.VERIFIKASI_DOKUMEN) {
            throw new Error('Recommendation is not in verification stage');
        }

        const newStatus = data.status === 'approve'
            ? RecommendationStatus.PENJADWALAN_PEMERIKSAAN
            : RecommendationStatus.DITOLAK;

        const updateData: any = {
            catatan_verifikasi: data.catatan_verifikasi,
        };

        // Add verifikator_id if provided
        if (data.verifikator_id) {
            updateData.verifikator_id = data.verifikator_id;
        }

        return await this.recommendationRepository.updateStatus(id, newStatus, updateData);
    }

    async scheduleRecommendation(id: string, data: SchedulingDto): Promise<Recommendation | null> {
        const recommendation = await this.recommendationRepository.findById(id);
        if (!recommendation) {
            throw new Error('Recommendation not found');
        }

        if (recommendation.status !== RecommendationStatus.PENJADWALAN_PEMERIKSAAN) {
            throw new Error('Recommendation is not in scheduling stage');
        }

        // Verify that all pemeriksa are inspectors
        const inspectors = await User.findAll({
            where: { id: data.pemeriksa },
            include: [{ model: Role, as: 'role' }],
        });

        const invalidInspectors = inspectors.filter(user => user.role?.roleName !== 'inspektur');
        if (invalidInspectors.length > 0) {
            throw new Error('All pemeriksa must have inspektur role');
        }

        return await this.recommendationRepository.updateStatus(id, RecommendationStatus.VERIFIKASI_LAPANGAN, {
            tanggal_pemeriksaan: data.tanggal_pemeriksaan,
            pemeriksa: data.pemeriksa,
            inspektur_ketua_id: data.inspektur_ketua_id,
        });
    }

    async inspectRecommendation(id: string, data: InspectionDto): Promise<Recommendation | null> {
        const recommendation = await this.recommendationRepository.findById(id);
        if (!recommendation) {
            throw new Error('Recommendation not found');
        }

        if (recommendation.status !== RecommendationStatus.VERIFIKASI_LAPANGAN) {
            throw new Error('Recommendation is not in field verification stage');
        }

        const newStatus = data.status === 'approve'
            ? RecommendationStatus.PENERBITAN_SURAT
            : RecommendationStatus.DITOLAK;

        return await this.recommendationRepository.updateStatus(id, newStatus, {
            catatan_pemeriksaan: data.catatan_pemeriksaan,
            inspektur_id: data.inspektur_id,
        });
    }

    async publishRecommendation(id: string, data: PublishDto): Promise<Recommendation | null> {
        const recommendation = await this.recommendationRepository.findById(id);
        if (!recommendation) {
            throw new Error('Recommendation not found');
        }

        if (recommendation.status !== RecommendationStatus.PENERBITAN_SURAT) {
            throw new Error('Recommendation is not in publication stage');
        }

        return await this.recommendationRepository.updateStatus(id, RecommendationStatus.SELESAI, {
            nomor_rekomendasi: data.nomor_rekomendasi,
            surat_rekomendasi: data.surat_rekomendasi,
            tanggal_surat_rekomendasi: new Date(),
            kepala_id: data.kepala_id,
        });
    }
}

export default RecommendationService;
