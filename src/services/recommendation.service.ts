import { BaseService } from './base.service';
import { Recommendation, RecommendationStatus } from '../models/Recommendation.model';
import { RecommendationRepository, RecommendationFilterOptions } from '../repositories/recommendation.repository';
import { ProfileApplicant } from '../models/ProfileApplicant.model';
import { User } from '../models/User.model';
import { Role } from '../models/Role.model';

export interface CreateRecommendationDto {
    pemohon_id: string;
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
}

export interface SchedulingDto {
    tanggal_pemeriksaan: Date;
    pemeriksa: string[];
}

export interface InspectionDto {
    catatan_pemeriksaan?: string;
    status: 'approve' | 'reject';
}

export interface PublishDto {
    nomor_rekomendasi: string;
    surat_rekomendasi: string;
}

export class RecommendationService extends BaseService<Recommendation> {
    private recommendationRepository: RecommendationRepository;

    constructor() {
        const recommendationRepository = new RecommendationRepository();
        super(recommendationRepository);
        this.recommendationRepository = recommendationRepository;
    }

    async createRecommendation(data: CreateRecommendationDto): Promise<Recommendation> {
        // Verify that pemohon exists
        const pemohon = await ProfileApplicant.findByPk(data.pemohon_id);
        if (!pemohon) {
            throw new Error('Pemohon not found');
        }

        return await this.recommendationRepository.create({
            pemohon_id: data.pemohon_id,
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
                const pemohonRows = result.rows.map(rec => ({
                    id: rec.id,
                    nomor_rekomendasi: rec.nomor_rekomendasi,
                    status: rec.status,
                    status_text: rec.getStatusText(),
                    created_at: rec.createdAt,
                }));

                return {
                    rows: pemohonRows,
                    count: result.count,
                    totalPages: Math.ceil(result.count / limit),
                    currentPage: page,
                };

            case 'inspektur':
                result = await this.recommendationRepository.findAllWithFilters(
                    { ...filters, pemeriksa_contains: userId },
                    page,
                    limit,
                    true,
                    false
                );

                // Transform data for inspektur
                const inspekturRows = result.rows.map(rec => ({
                    id: rec.id,
                    pemohon: rec.pemohon,
                    status: rec.status,
                    status_text: rec.getStatusText(),
                    created_at: rec.createdAt,
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
                result = await this.recommendationRepository.findAllWithFilters(
                    filters,
                    page,
                    limit,
                    true,
                    false
                );

                // Transform data for admin/verifikatur/etc
                const adminRows = result.rows.map(rec => ({
                    id: rec.id,
                    pemohon: rec.pemohon,
                    status: rec.status,
                    status_text: rec.getStatusText(),
                    created_at: rec.createdAt,
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

    async getRecommendationById(id: string): Promise<Recommendation | null> {
        return await this.recommendationRepository.findByIdWithDetails(id);
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

        return await this.recommendationRepository.updateStatus(id, newStatus, {
            catatan_verifikasi: data.catatan_verifikasi,
        });
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
        });
    }
}

export default RecommendationService;
