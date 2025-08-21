import { BaseService } from './base.service';
import { ProfileApplicant } from '../models/ProfileApplicant.model';
import { ProfileApplicantRepository } from '../repositories/profileApplicant.repository';

export class ProfileApplicantService extends BaseService<ProfileApplicant> {
    private profileApplicantRepository: ProfileApplicantRepository;

    constructor() {
        const profileApplicantRepository = new ProfileApplicantRepository();
        super(profileApplicantRepository);
        this.profileApplicantRepository = profileApplicantRepository;
    }

    async getProfileByUserId(userId: string): Promise<ProfileApplicant | null> {
        return await this.profileApplicantRepository.findByUserId(userId);
    }

    async getProfileByNik(nik: string): Promise<ProfileApplicant | null> {
        return await this.profileApplicantRepository.findByNik(nik);
    }

    async getProfileByEmail(email: string): Promise<ProfileApplicant | null> {
        return await this.profileApplicantRepository.findByEmail(email);
    }

    async getProfilesByRole(roleName: 'Petani' | 'Perusahaan'): Promise<ProfileApplicant[]> {
        return await this.profileApplicantRepository.findByRoleName(roleName);
    }

    async getPetaniProfiles(): Promise<ProfileApplicant[]> {
        return await this.getProfilesByRole('Petani');
    }

    async getPerusahaanProfiles(): Promise<ProfileApplicant[]> {
        return await this.getProfilesByRole('Perusahaan');
    }

    async createProfile(profileData: Partial<ProfileApplicant>): Promise<ProfileApplicant> {
        // Validate required fields
        if (!profileData.userId || !profileData.nik || !profileData.email || !profileData.namaPemohon) {
            throw new Error('userId, nik, email, and namaPemohon are required fields');
        }

        // Check if profile already exists for this user
        const existingProfile = await this.profileApplicantRepository.findByUserId(profileData.userId);
        if (existingProfile) {
            throw new Error('Profile already exists for this user');
        }

        // Check if NIK is already used
        const existingNik = await this.profileApplicantRepository.findByNik(profileData.nik);
        if (existingNik) {
            throw new Error('NIK already exists');
        }

        // Check if email is already used
        const existingEmail = await this.profileApplicantRepository.findByEmail(profileData.email);
        if (existingEmail) {
            throw new Error('Email already exists');
        }

        return await this.profileApplicantRepository.createProfile(profileData);
    }

    async updateProfile(userId: string, profileData: Partial<ProfileApplicant>): Promise<ProfileApplicant | null> {
        // Remove userId from update data to prevent modification
        const { userId: _, ...updateData } = profileData;

        // If updating NIK, check for duplicates
        if (updateData.nik) {
            const existingNik = await this.profileApplicantRepository.findByNik(updateData.nik);
            if (existingNik && existingNik.userId !== userId) {
                throw new Error('NIK already exists');
            }
        }

        // If updating email, check for duplicates
        if (updateData.email) {
            const existingEmail = await this.profileApplicantRepository.findByEmail(updateData.email);
            if (existingEmail && existingEmail.userId !== userId) {
                throw new Error('Email already exists');
            }
        }

        return await this.profileApplicantRepository.updateByUserId(userId, updateData);
    }

    async deleteProfile(userId: string): Promise<boolean> {
        return await this.profileApplicantRepository.deleteByUserId(userId);
    }

    async getAllProfiles(): Promise<ProfileApplicant[]> {
        return await this.profileApplicantRepository.findAll();
    }

    async uploadDocument(userId: string, documentType: string, filePath: string): Promise<ProfileApplicant | null> {
        const updateData: Partial<ProfileApplicant> = {};

        switch (documentType) {
            case 'foto_pemohon':
                updateData.fotoPemohon = filePath;
                break;
            case 'foto_kuasa':
                updateData.fotoKuasa = filePath;
                break;
            case 'file_akta_pendirian':
                updateData.fileAktaPendirian = filePath;
                break;
            case 'file_ktp':
                updateData.fileKtp = filePath;
                break;
            case 'file_npwp':
                updateData.fileNpwp = filePath;
                break;
            case 'file_surat_kuasa':
                updateData.fileSuratKuasa = filePath;
                break;
            default:
                throw new Error('Invalid document type');
        }

        return await this.profileApplicantRepository.updateByUserId(userId, updateData);
    }
}

export default ProfileApplicantService;
