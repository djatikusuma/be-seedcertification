import { BaseService } from './base.service';
import { TempUser, UserType, VerificationStatus } from '../models/TempUser.model';
import { TempUserRepository } from '../repositories/tempUser.repository';
import { TempUserInterface } from '../interfaces/model.interface';
import { UserRepository } from '../repositories/user.repository';
import { RoleRepository } from '../repositories/role.repository';
import { ProfileApplicantRepository } from '../repositories/profileApplicant.repository';
import { CryptoUtil } from '../utils/crypto.util';
import * as bcrypt from 'bcryptjs';

export interface RegisterTempUserData {
    userType: UserType;
    nik: string;
    namaPemohon: string;
    email: string;
    telepon?: string;
    npwp?: string;
    alamatPemohon?: string;
    password: string;
}

export interface VerificationData {
    status: VerificationStatus;
    notes?: string;
}

export class TempUserService extends BaseService<TempUser> {
    private tempUserRepository: TempUserRepository;
    private userRepository: UserRepository;
    private roleRepository: RoleRepository;
    private profileApplicantRepository: ProfileApplicantRepository;

    constructor() {
        const tempUserRepository = new TempUserRepository();
        super(tempUserRepository);
        this.tempUserRepository = tempUserRepository;
        this.userRepository = new UserRepository();
        this.roleRepository = new RoleRepository();
        this.profileApplicantRepository = new ProfileApplicantRepository();
    }

    // Register new temp user
    async registerTempUser(data: RegisterTempUserData): Promise<{
        success: boolean;
        message: string;
        data?: TempUser;
    }> {
        try {
            // Validate unique email and NIK
            const validation = await this.tempUserRepository.validateUnique(data.email, data.nik);

            if (validation.emailExists) {
                return {
                    success: false,
                    message: 'Email sudah terdaftar'
                };
            }

            if (validation.nikExists) {
                return {
                    success: false,
                    message: 'NIK sudah terdaftar'
                };
            }

            // Check if email or NIK already exists in main users table
            const existingUserByEmail = await this.userRepository.findByEmail(data.email);
            if (existingUserByEmail) {
                return {
                    success: false,
                    message: 'Email sudah terdaftar sebagai user aktif'
                };
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(data.password, 12);

            // Create temp user
            const tempUser = await this.tempUserRepository.createTempUser({
                ...data,
                password: hashedPassword,
                verificationStatus: VerificationStatus.PENDING
            });

            return {
                success: true,
                message: 'Registrasi berhasil. Menunggu verifikasi admin.',
                data: tempUser
            };

        } catch (error) {
            console.error('Error registering temp user:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan saat registrasi'
            };
        }
    }

    // Get pending registrations for admin/verifikatur
    async getPendingRegistrations(
        page: number = 1,
        limit: number = 10
    ): Promise<{
        data: TempUser[];
        total: number;
        totalPages: number;
        currentPage: number;
    }> {
        const result = await this.tempUserRepository.getPendingRegistrations(page, limit);

        // Ensure all data is properly decrypted
        result.data.forEach(tempUser => {
            TempUser.manualDecrypt(tempUser);
        });

        return result;
    }

    // Get pending registrations with masking for admin/verifikatur
    async getPendingRegistrationsWithMasking(
        viewerRole: string,
        page: number = 1,
        limit: number = 10
    ): Promise<{
        data: Partial<TempUserInterface>[];
        total: number;
        totalPages: number;
        currentPage: number;
    }> {
        const result = await this.tempUserRepository.getPendingRegistrations(page, limit);

        // Ensure data is decrypted (AfterFind hook should handle this, but let's be explicit)
        const maskedData = result.data.map(tempUser => {
            // Force decryption for each temp user before masking
            TempUser.manualDecrypt(tempUser);
            return TempUser.getMaskedTempUser(tempUser, viewerRole);
        });

        return {
            ...result,
            data: maskedData
        };
    }

    // Get temp users with filter and masking
    async getTempUsersWithMasking(
        viewerRole: string,
        filters: {
            verificationStatus?: VerificationStatus;
            userType?: UserType;
            startDate?: Date;
            endDate?: Date;
        } = {},
        page: number = 1,
        limit: number = 10
    ): Promise<{
        data: Partial<TempUserInterface>[];
        total: number;
        totalPages: number;
        currentPage: number;
    }> {
        const result = await this.tempUserRepository.getTempUsersWithFilter(filters, page, limit);

        // Ensure data is decrypted and then apply masking based on role
        const maskedData = result.data.map(tempUser => {
            // Force decryption for each temp user before masking
            TempUser.manualDecrypt(tempUser);
            return TempUser.getMaskedTempUser(tempUser, viewerRole);
        });

        return {
            ...result,
            data: maskedData
        };
    }

    // Verify temp user (approve/reject)
    async verifyTempUser(
        id: string,
        verificationData: VerificationData,
        verifiedBy: string
    ): Promise<{
        success: boolean;
        message: string;
        data?: any;
    }> {
        try {
            const tempUser = await this.tempUserRepository.getVerificationDetails(id);
            if (!tempUser) {
                return {
                    success: false,
                    message: 'Data registrasi tidak ditemukan'
                };
            }

            // Ensure temp user data is decrypted for verification processing
            TempUser.manualDecrypt(tempUser);

            if (tempUser.verificationStatus !== VerificationStatus.PENDING) {
                return {
                    success: false,
                    message: `Registrasi sudah ${tempUser.verificationStatus}`
                };
            }

            // Update verification status
            await this.tempUserRepository.updateVerificationStatus(
                id,
                verificationData.status,
                verifiedBy,
                verificationData.notes
            );

            // If approved, create user account
            if (verificationData.status === VerificationStatus.APPROVED) {
                const userCreationResult = await this.createUserFromTempUser(tempUser);

                if (!userCreationResult.success) {
                    // Rollback verification if user creation fails
                    await this.tempUserRepository.updateVerificationStatus(
                        id,
                        VerificationStatus.PENDING,
                        verifiedBy,
                        'Gagal membuat akun user: ' + userCreationResult.message
                    );

                    return userCreationResult;
                }

                return {
                    success: true,
                    message: 'Registrasi disetujui dan akun user telah dibuat',
                    data: userCreationResult.data
                };
            } else {
                return {
                    success: true,
                    message: 'Registrasi ditolak',
                };
            }

        } catch (error) {
            console.error('Error verifying temp user:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan saat memverifikasi'
            };
        }
    }

    // Create user account from approved temp user
    private async createUserFromTempUser(tempUser: TempUser): Promise<{
        success: boolean;
        message: string;
        data?: any;
    }> {
        try {
            // Get default role for new users (assuming 'user' role exists)
            const defaultRole = await this.roleRepository.findByName('user');
            if (!defaultRole) {
                return {
                    success: false,
                    message: 'Role default tidak ditemukan'
                };
            }

            // Create user account
            const newUser = await this.userRepository.create({
                name: tempUser.namaPemohon,
                email: tempUser.email,
                password: tempUser.password, // Already hashed
                roleId: defaultRole.id
            });

            // Create profile applicant with all temp user data
            const profileApplicant = await this.profileApplicantRepository.create({
                userId: newUser.id,
                nik: tempUser.nik,
                npwp: tempUser.npwp || undefined,
                email: tempUser.email,
                namaPemohon: tempUser.namaPemohon,
                telepon: tempUser.telepon || undefined,
                alamatPemohon: tempUser.alamatPemohon || undefined
            });

            return {
                success: true,
                message: 'Akun user dan profile applicant berhasil dibuat',
                data: {
                    userId: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    profileApplicantId: profileApplicant.id,
                    userType: tempUser.userType
                }
            };

        } catch (error) {
            console.error('Error creating user from temp user:', error);
            return {
                success: false,
                message: 'Gagal membuat akun user dan profile applicant'
            };
        }
    }

    // Get verification statistics
    async getVerificationStatistics(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        perusahaan: number;
        perorangan: number;
    }> {
        return await this.tempUserRepository.getVerificationStatistics();
    }

    // Get temp user details for verification
    async getTempUserDetails(id: string, viewerRole: string): Promise<{
        success: boolean;
        message: string;
        data?: Partial<TempUserInterface>;
    }> {
        try {
            const tempUser = await this.tempUserRepository.getVerificationDetails(id);

            if (!tempUser) {
                return {
                    success: false,
                    message: 'Data registrasi tidak ditemukan'
                };
            }

            // Ensure data is decrypted before masking
            TempUser.manualDecrypt(tempUser);
            const maskedData = TempUser.getMaskedTempUser(tempUser, viewerRole);

            return {
                success: true,
                message: 'Data berhasil diambil',
                data: maskedData
            };

        } catch (error) {
            console.error('Error getting temp user details:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan saat mengambil data'
            };
        }
    }

    // Delete temp user registration
    async deleteTempUser(id: string): Promise<{
        success: boolean;
        message: string;
    }> {
        try {
            const result = await this.tempUserRepository.softDelete(id);

            if (!result) {
                return {
                    success: false,
                    message: 'Data registrasi tidak ditemukan'
                };
            }

            return {
                success: true,
                message: 'Data registrasi berhasil dihapus'
            };

        } catch (error) {
            console.error('Error deleting temp user:', error);
            return {
                success: false,
                message: 'Terjadi kesalahan saat menghapus data'
            };
        }
    }
}
