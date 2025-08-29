import { BaseService } from './base.service';
import { Certification } from '../models/Certification.model';
import { CertificationInterface, CertificationInspectionInterface } from '../interfaces/model.interface';
import CertificationRepository, { CertificationFilterOptions } from '../repositories/certification.repository';
import CertificationInspectionRepository from '../repositories/certification-inspection.repository';
import { UserRepository } from '../repositories/user.repository';
import { CryptoUtil } from '../utils/crypto.util';

export interface CreateCertificationData {
    rekomendasi_id: string;
    komoditas_id: string;
    jumlah_benih: number;
    satuan: string;
    varietas: string;
    tipe: 'siaptanam' | 'pratanam';
    file_asal_benih?: string;
    file_dokumen_pendukung?: string;
}

export interface InspectionData {
    jumlah_benih: number;
    jumlah_diperiksa: number;
    jumlah_lolos: number;
    jumlah_tidak_lolos: number;
    jumlah_belum_lolos: number;
    pemeriksa_id: string;
    persentase_kemurnian?: number;
    kadar_air?: number;
    daya_berkecambah?: number;
    catatan?: string;
    file_dokumen_hasil_pemeriksaan?: string;
}

export interface UpdateCertificationData {
    status?: number;
    catatan_administrasi?: string;
    catatan_pemeriksaan?: string;
    catatan_validasi?: string;
    pemeriksa?: string[];
    tanggal_jadwal_pemeriksaan?: Date;
    nomor_surat_sertifikat?: string;
    tanggal_surat_sertifikat?: Date;
    tanggal_expired_sertifikat?: Date;
    file_surat_sertifikat?: string;
}

export class CertificationService extends BaseService<Certification> {
    private certificationRepository: CertificationRepository;
    private certificationInspectionRepository: CertificationInspectionRepository;
    private userRepository: UserRepository;

    constructor() {
        const certificationRepository = new CertificationRepository();
        super(certificationRepository);
        this.certificationRepository = certificationRepository;
        this.certificationInspectionRepository = new CertificationInspectionRepository();
        this.userRepository = new UserRepository();
    }

    /**
     * Get status label from status number
     */
    private getStatusLabel(status: number): string {
        const statusLabels: { [key: number]: string } = {
            1: 'Verifikasi Dokumen',
            2: 'Penjadwalan',
            3: 'Verifikasi Lapangan',
            4: 'Pengesahan Pemeriksaan',
            5: 'Penerbitan Sertifikat',
            6: 'Selesai',
            7: 'Ditolak'
        };
        return statusLabels[status] || 'Status Tidak Diketahui';
    }

    /**
     * Create new certification
     */
    async createCertification(data: CreateCertificationData, pemohonId: string): Promise<Certification> {
        // Generate registration number
        const sequence = await this.certificationRepository.generateSequenceNumber(data.tipe);
        const nomorRegistrasi = Certification.generateRegistrationNumber(data.tipe, sequence);

        const certificationData: Partial<CertificationInterface> = {
            nomor_registrasi: nomorRegistrasi,
            pemohon_id: pemohonId,
            rekomendasi_id: data.rekomendasi_id,
            komoditas_id: data.komoditas_id,
            tipe: data.tipe,
            jumlah_benih: data.jumlah_benih,
            satuan: data.satuan.toLowerCase(),
            varietas: data.varietas.toLowerCase(),
            file_asal_benih: data.file_asal_benih,
            file_dokumen_pendukung: data.file_dokumen_pendukung,
            status: 1, // Status 1: Verifikasi Dokumen
        };

        const certification = await this.certificationRepository.create(certificationData);

        // Add status label to the response
        const certificationWithLabel: any = certification.toJSON();
        certificationWithLabel.status_label = this.getStatusLabel(certificationWithLabel.status);

        return certificationWithLabel;
    }

    /**
     * Get certifications with filters based on user role
     */
    async getCertifications(
        userRole: string,
        userId: string,
        filters: CertificationFilterOptions = {},
        page: number = 1,
        limit: number = 10
    ): Promise<{ rows: any[]; count: number; totalPages: number; currentPage: number }> {
        // Apply role-based filtering
        if (userRole === 'petani' || userRole === 'perusahaan') {
            // Get user's profile to find pemohon_id
            const user = await this.userRepository.findByIdWithProfile(userId);
            if (user?.profileApplicant) {
                filters.pemohon_id = user.profileApplicant.id;
            }
        } else if (userRole === 'inspektur') {
            // Filter by pemeriksa contains user ID
            filters.pemeriksa_contains = userId;
        }

        const { rows, count } = await this.certificationRepository.findWithFilters(
            filters,
            true,
            page,
            limit
        );

        // Decrypt sensitive data for display
        const decryptedRows = rows.map((certification: any) => {
            const certificationData = certification.toJSON();

            if (certificationData.pemohon) {
                certificationData.pemohon = this.decryptProfileData(certificationData.pemohon);
            }

            // Add status label
            certificationData.status_label = this.getStatusLabel(certificationData.status);

            return certificationData;
        });

        const totalPages = Math.ceil(count / limit);

        return {
            rows: decryptedRows,
            count,
            totalPages,
            currentPage: page,
        };
    }

    /**
     * Get certification detail by ID
     */
    async getCertificationById(id: string): Promise<any> {
        const certification = await this.certificationRepository.findByIdWithRelations(id);

        if (!certification) {
            throw new Error('Sertifikasi tidak ditemukan');
        }

        const certificationData: any = certification.toJSON();

        // Decrypt pemohon data
        if (certificationData.pemohon) {
            certificationData.pemohon = this.decryptProfileData(certificationData.pemohon);
        }

        // Decrypt pemeriksa data if exists
        if (certificationData.pemeriksa && Array.isArray(certificationData.pemeriksa)) {
            const pemeriksaUsers = await this.userRepository.findByIds(certificationData.pemeriksa);
            certificationData.pemeriksa_detail = pemeriksaUsers.map((user: any) => {
                const userData = user.toJSON();

                // Decrypt user data if it has encrypted fields
                if (userData.name && typeof userData.name === 'string') {
                    try {
                        userData.name = CryptoUtil.decrypt(userData.name);
                    } catch (error) {
                        console.warn('Failed to decrypt user name:', error);
                    }
                }

                if (userData.email && typeof userData.email === 'string') {
                    try {
                        userData.email = CryptoUtil.decrypt(userData.email);
                    } catch (error) {
                        console.warn('Failed to decrypt user email:', error);
                    }
                }

                // Decrypt profile data if exists
                if (userData.profile) {
                    userData.profile = this.decryptProfileData(userData.profile);
                }

                return userData;
            });
        }

        // Add status label
        certificationData.status_label = this.getStatusLabel(certificationData.status);

        return certificationData;
    }

    /**
     * Verify certification (by verifikator)
     */
    async verifyCertification(
        id: string,
        catatanAdministrasi: string | null,
        approved: boolean
    ): Promise<Certification | null> {
        const certification = await this.certificationRepository.findById(id);
        if (!certification) {
            throw new Error('Sertifikasi tidak ditemukan');
        }

        if (certification.status !== 1) {
            throw new Error('Sertifikasi tidak dalam status verifikasi dokumen');
        }

        const newStatus = approved ? 2 : 7; // 2: Penjadwalan, 7: Ditolak
        const updateData: Partial<CertificationInterface> = {
            catatan_administrasi: catatanAdministrasi || undefined,
        };

        const updatedCertification = await this.certificationRepository.updateStatus(id, newStatus, updateData);

        if (updatedCertification) {
            const certificationWithLabel: any = updatedCertification.toJSON();
            certificationWithLabel.status_label = this.getStatusLabel(certificationWithLabel.status);
            return certificationWithLabel;
        }

        return updatedCertification;
    }

    /**
     * Schedule certification (by inspektur_kepala)
     */
    async scheduleCertification(
        id: string,
        tanggalJadwalPemeriksaan: Date,
        pemeriksa: string[]
    ): Promise<Certification | null> {
        const certification = await this.certificationRepository.findById(id);
        if (!certification) {
            throw new Error('Sertifikasi tidak ditemukan');
        }

        if (certification.status !== 2) {
            throw new Error('Sertifikasi tidak dalam status penjadwalan');
        }

        // Validate inspectors
        const inspectors = await this.userRepository.findByIds(pemeriksa);
        if (inspectors.length !== pemeriksa.length) {
            throw new Error('Beberapa pemeriksa tidak ditemukan');
        }

        for (const inspector of inspectors) {
            if (inspector.role?.roleName !== 'inspektur') {
                throw new Error(`User ${inspector.name} bukan inspektur`);
            }
        }

        const updatedCertification = await this.certificationRepository.updateStatus(id, 3, {
            tanggal_jadwal_pemeriksaan: tanggalJadwalPemeriksaan,
            pemeriksa: pemeriksa,
        }); // Status 3: Verifikasi Lapangan

        if (updatedCertification) {
            const certificationWithLabel: any = updatedCertification.toJSON();
            certificationWithLabel.status_label = this.getStatusLabel(certificationWithLabel.status);
            return certificationWithLabel;
        }

        return updatedCertification;
    }

    /**
     * Submit inspection result (by inspektur)
     */
    async inspectCertification(
        id: string,
        inspectionData: InspectionData,
        catatanPemeriksaan: string | null,
        approved: boolean
    ): Promise<Certification | null> {
        const certification = await this.certificationRepository.findById(id);
        if (!certification) {
            throw new Error('Sertifikasi tidak ditemukan');
        }

        if (certification.status !== 3) {
            throw new Error('Sertifikasi tidak dalam status verifikasi lapangan');
        }

        // Validate inspector is assigned to this certification
        if (!certification.pemeriksa || !certification.pemeriksa.includes(inspectionData.pemeriksa_id)) {
            throw new Error('Anda tidak ditugaskan untuk memeriksa sertifikasi ini');
        }

        // Save inspection details
        const inspectionRecord: Partial<CertificationInspectionInterface> = {
            certification_id: id,
            jumlah_benih: inspectionData.jumlah_benih,
            jumlah_diperiksa: inspectionData.jumlah_diperiksa,
            jumlah_lolos: inspectionData.jumlah_lolos,
            jumlah_tidak_lolos: inspectionData.jumlah_tidak_lolos,
            jumlah_belum_lolos: inspectionData.jumlah_belum_lolos,
            pemeriksa_id: inspectionData.pemeriksa_id,
            persentase_kemurnian: inspectionData.persentase_kemurnian,
            kadar_air: inspectionData.kadar_air,
            daya_berkecambah: inspectionData.daya_berkecambah,
            catatan: inspectionData.catatan,
            file_dokumen_hasil_pemeriksaan: inspectionData.file_dokumen_hasil_pemeriksaan,
            status_pemeriksaan: approved ? 'lolos' : 'tidak_lolos',
        };

        await this.certificationInspectionRepository.create(inspectionRecord);

        const newStatus = approved ? 4 : 7; // 4: Pengesahan, 7: Ditolak
        const updateData: Partial<CertificationInterface> = {
            catatan_pemeriksaan: catatanPemeriksaan || undefined,
        };

        const updatedCertification = await this.certificationRepository.updateStatus(id, newStatus, updateData);

        if (updatedCertification) {
            const certificationWithLabel: any = updatedCertification.toJSON();
            certificationWithLabel.status_label = this.getStatusLabel(certificationWithLabel.status);
            return certificationWithLabel;
        }

        return updatedCertification;
    }

    /**
     * Get inspection details for a certification
     */
    async getInspectionDetails(certificationId: string): Promise<any[]> {
        const inspections = await this.certificationInspectionRepository.findByCertificationId(certificationId);

        return inspections.map((inspection: any) => {
            const inspectionData = inspection.toJSON();

            // Decrypt pemeriksa data if needed
            if (inspectionData.pemeriksa) {
                const pemeriksaData = { ...inspectionData.pemeriksa };

                // Decrypt user fields
                if (pemeriksaData.name && typeof pemeriksaData.name === 'string') {
                    try {
                        pemeriksaData.name = CryptoUtil.decrypt(pemeriksaData.name);
                    } catch (error) {
                        console.warn('Failed to decrypt pemeriksa name:', error);
                    }
                }

                if (pemeriksaData.email && typeof pemeriksaData.email === 'string') {
                    try {
                        pemeriksaData.email = CryptoUtil.decrypt(pemeriksaData.email);
                    } catch (error) {
                        console.warn('Failed to decrypt pemeriksa email:', error);
                    }
                }

                inspectionData.pemeriksa = pemeriksaData;
            }

            return inspectionData;
        });
    }    /**
     * Validate certification (by inspektur_kepala)
     */
    async validateCertification(
        id: string,
        catatanValidasi: string | null,
        approved: boolean
    ): Promise<Certification | null> {
        const certification = await this.certificationRepository.findById(id);
        if (!certification) {
            throw new Error('Sertifikasi tidak ditemukan');
        }

        if (certification.status !== 4) {
            throw new Error('Sertifikasi tidak dalam status pengesahan pemeriksaan');
        }

        const newStatus = approved ? 5 : 7; // 5: Penerbitan, 7: Ditolak
        const updateData: Partial<CertificationInterface> = {
            catatan_validasi: catatanValidasi || undefined,
        };

        const updatedCertification = await this.certificationRepository.updateStatus(id, newStatus, updateData);

        if (updatedCertification) {
            const certificationWithLabel: any = updatedCertification.toJSON();
            certificationWithLabel.status_label = this.getStatusLabel(certificationWithLabel.status);
            return certificationWithLabel;
        }

        return updatedCertification;
    }

    /**
     * Publish certification (by kepala)
     */
    async publishCertification(
        id: string,
        nomorSuratSertifikat: string,
        tanggalSertifikat: Date,
        tanggalExpiredSertifikat: Date,
        fileSuratSertifikat?: string
    ): Promise<Certification | null> {
        const certification = await this.certificationRepository.findById(id);
        if (!certification) {
            throw new Error('Sertifikasi tidak ditemukan');
        }

        if (certification.status !== 5) {
            throw new Error('Sertifikasi tidak dalam status penerbitan surat rekomendasi');
        }

        const updatedCertification = await this.certificationRepository.updateStatus(id, 6, {
            nomor_surat_sertifikat: nomorSuratSertifikat,
            tanggal_surat_sertifikat: tanggalSertifikat,
            tanggal_expired_sertifikat: tanggalExpiredSertifikat,
            file_surat_sertifikat: fileSuratSertifikat,
        }); // Status 6: Selesai

        if (updatedCertification) {
            const certificationWithLabel: any = updatedCertification.toJSON();
            certificationWithLabel.status_label = this.getStatusLabel(certificationWithLabel.status);
            return certificationWithLabel;
        }

        return updatedCertification;
    }

    /**
     * Decrypt profile data for display
     */
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
}

export default CertificationService;
