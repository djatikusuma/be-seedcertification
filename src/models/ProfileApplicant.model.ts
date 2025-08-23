import { Table, Column, Model, DataType, BelongsTo, ForeignKey, BeforeCreate, BeforeUpdate, AfterFind } from 'sequelize-typescript';
import { ProfileApplicantInterface } from '../interfaces/model.interface';
import { User } from './User.model';
import { CryptoUtil } from '../utils/crypto.util';
import { DataMaskingUtil, MaskingType, MaskingOptions } from '../utils/masking.util';

@Table({
    tableName: 'profile_applicants',
    timestamps: true,
})
export class ProfileApplicant extends Model<ProfileApplicantInterface> implements ProfileApplicantInterface {
    // Define which fields should be automatically encrypted
    private static readonly ENCRYPTED_FIELDS = ['nik', 'npwp', 'email', 'namaPemohon', 'telepon', 'alamatPemohon', 'alamatPerusahaan', 'nikKuasa', 'namaKuasa'];

    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id!: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        unique: true,
    })
    userId!: string;

    @BelongsTo(() => User)
    user?: User;

    @Column({
        type: DataType.TEXT, // Changed to TEXT to store encrypted data
        allowNull: false,
    })
    nik!: string;

    @Column({
        type: DataType.TEXT, // Changed to TEXT to store encrypted data
        allowNull: true,
    })
    npwp?: string;

    @Column({
        type: DataType.TEXT, // Changed to TEXT to store encrypted data
        allowNull: false,
    })
    email!: string;

    @Column({
        type: DataType.TEXT, // Changed to TEXT to store encrypted data
        allowNull: false,
    })
    namaPemohon!: string;

    @Column({
        type: DataType.TEXT, // Changed to TEXT to store encrypted data
        allowNull: true,
    })
    telepon?: string;

    @Column({
        type: DataType.TEXT, // Changed to TEXT to store encrypted data
        allowNull: true,
    })
    alamatPemohon?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    nikHash?: string; // For searching encrypted NIK

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    emailHash?: string; // For searching encrypted email

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    fotoPemohon?: string;

    @Column({
        type: DataType.TEXT, // Changed to TEXT to store encrypted data
        allowNull: true,
    })
    alamatPerusahaan?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    lokasiPerbenihan?: string;

    @Column({
        type: DataType.TEXT, // Changed to TEXT to store encrypted data
        allowNull: true,
    })
    nikKuasa?: string;

    @Column({
        type: DataType.TEXT, // Changed to TEXT to store encrypted data
        allowNull: true,
    })
    namaKuasa?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    fotoKuasa?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    fileAktaPendirian?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    fileKtp?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    fileNpwp?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    fileSuratKuasa?: string;

    @Column({
        type: DataType.ENUM('Milik Sendiri', 'Sewa', 'Bagi Hasil'),
        allowNull: true,
    })
    statusKepemilikan?: string;

    // Hook: Encrypt sensitive fields before creating
    @BeforeCreate
    static encryptBeforeCreate(instance: ProfileApplicant) {
        ProfileApplicant.encryptSensitiveFields(instance);
    }

    // Hook: Encrypt sensitive fields before updating
    @BeforeUpdate
    static encryptBeforeUpdate(instance: ProfileApplicant) {
        ProfileApplicant.encryptSensitiveFields(instance);
    }

    // Hook: Decrypt sensitive fields after finding
    @AfterFind
    static decryptAfterFind(result: ProfileApplicant | ProfileApplicant[] | null) {
        if (result) {
            if (Array.isArray(result)) {
                result.forEach(instance => ProfileApplicant.decryptSensitiveFields(instance));
            } else {
                ProfileApplicant.decryptSensitiveFields(result);
            }
        }
    }

    /**
     * Encrypt sensitive fields
     */
    private static encryptSensitiveFields(instance: ProfileApplicant): void {
        for (const field of this.ENCRYPTED_FIELDS) {
            const value = (instance as any)[field];
            if (value && typeof value === 'string') {
                // Check if already encrypted (new format: encrypted:iv:salt)
                if (value.includes(':') && value.split(':').length === 3) {
                    // Already encrypted in new format, skip
                    continue;
                }

                // Check if already encrypted (old JSON format)
                try {
                    const parsed = JSON.parse(value);
                    if (parsed.encrypted && parsed.iv && parsed.salt) {
                        // Already encrypted in old format, skip
                        continue;
                    }
                } catch {
                    // Not JSON, proceed with encryption
                }

                // Not encrypted, encrypt it
                const encrypted = CryptoUtil.encrypt(value);
                (instance as any)[field] = encrypted;

                // Create hashes for searchable fields
                if (field === 'nik') {
                    instance.nikHash = CryptoUtil.hash(value);
                }
                if (field === 'email') {
                    instance.emailHash = CryptoUtil.hash(value.toLowerCase());
                }
            }
        }
    }

    /**
     * Decrypt sensitive fields
     */
    private static decryptSensitiveFields(instance: ProfileApplicant): void {
        if (!instance) return;

        for (const field of this.ENCRYPTED_FIELDS) {
            const value = (instance as any)[field];
            if (value && typeof value === 'string') {
                try {
                    // Check if it's new format (encrypted:iv:salt)
                    if (value.includes(':') && value.split(':').length === 3) {
                        (instance as any)[field] = CryptoUtil.decrypt(value);
                    } else {
                        // Try old JSON format
                        const encryptionData = JSON.parse(value);
                        if (encryptionData.encrypted && encryptionData.iv && encryptionData.salt) {
                            (instance as any)[field] = CryptoUtil.decrypt(encryptionData);
                        }
                    }
                } catch (error: any) {
                    // If decryption fails, leave the field as is
                    console.warn(`Failed to decrypt field ${field} for profile applicant ${instance.id}:`, error?.message || 'Unknown error');
                }
            }
        }
    }

    /**
     * Find profile by NIK (using NIK hash for efficient searching)
     */
    static async findByNik(nik: string): Promise<ProfileApplicant | null> {
        const nikHash = CryptoUtil.hash(nik);
        return await this.findOne({
            where: { nikHash },
            include: ['user']
        });
    }

    /**
     * Find profile by email (using email hash for efficient searching)
     */
    static async findByEmail(email: string): Promise<ProfileApplicant | null> {
        const emailHash = CryptoUtil.hash(email.toLowerCase());
        return await this.findOne({
            where: { emailHash },
            include: ['user']
        });
    }

    /**
     * Check if NIK exists (using NIK hash)
     */
    static async nikExists(nik: string): Promise<boolean> {
        const nikHash = CryptoUtil.hash(nik);
        const profile = await this.findOne({
            where: { nikHash },
            attributes: ['id']
        });
        return !!profile;
    }

    /**
     * Check if email exists (using email hash)
     */
    static async emailExists(email: string): Promise<boolean> {
        const emailHash = CryptoUtil.hash(email.toLowerCase());
        const profile = await this.findOne({
            where: { emailHash },
            attributes: ['id']
        });
        return !!profile;
    }

    /**
     * Apply data masking based on user role
     */
    applyMasking(requestingUserRole: string = 'guest'): Partial<ProfileApplicantInterface> {
        const profileData = this.toJSON() as any;

        // Remove sensitive hash fields
        const { nikHash, emailHash, ...sanitizedData } = profileData;

        // Apply role-based masking
        switch (requestingUserRole.toLowerCase()) {
            case 'admin':
                // Admin sees everything unmasked
                return sanitizedData;

            case 'manager':
                // Manager sees partial masking
                if (sanitizedData.namaPemohon) {
                    sanitizedData.namaPemohon = DataMaskingUtil.mask(sanitizedData.namaPemohon, MaskingType.NAME, {
                        nameKeepFirstChar: true,
                        nameKeepLastChar: true
                    });
                }
                if (sanitizedData.nik) {
                    sanitizedData.nik = DataMaskingUtil.mask(sanitizedData.nik, MaskingType.PARTIAL, {
                        visibleStart: 4,
                        visibleEnd: 4
                    });
                }
                if (sanitizedData.email) {
                    sanitizedData.email = DataMaskingUtil.mask(sanitizedData.email, MaskingType.EMAIL, {
                        emailKeepDomain: true,
                        emailVisibleChars: 3
                    });
                }
                if (sanitizedData.telepon) {
                    sanitizedData.telepon = DataMaskingUtil.mask(sanitizedData.telepon, MaskingType.PHONE);
                }
                if (sanitizedData.npwp) {
                    sanitizedData.npwp = DataMaskingUtil.mask(sanitizedData.npwp, MaskingType.PARTIAL, {
                        visibleStart: 3,
                        visibleEnd: 3
                    });
                }
                if (sanitizedData.nikKuasa) {
                    sanitizedData.nikKuasa = DataMaskingUtil.mask(sanitizedData.nikKuasa, MaskingType.PARTIAL, {
                        visibleStart: 4,
                        visibleEnd: 4
                    });
                }
                if (sanitizedData.namaKuasa) {
                    sanitizedData.namaKuasa = DataMaskingUtil.mask(sanitizedData.namaKuasa, MaskingType.NAME, {
                        nameKeepFirstChar: true,
                        nameKeepLastChar: true
                    });
                }
                return sanitizedData;

            default: // user, guest, or unknown roles
                // Heavy masking for regular users
                if (sanitizedData.namaPemohon) {
                    sanitizedData.namaPemohon = DataMaskingUtil.mask(sanitizedData.namaPemohon, MaskingType.NAME, {
                        nameKeepFirstChar: true,
                        nameKeepLastChar: false
                    });
                }
                if (sanitizedData.nik) {
                    sanitizedData.nik = DataMaskingUtil.mask(sanitizedData.nik, MaskingType.PARTIAL, {
                        visibleStart: 2,
                        visibleEnd: 2
                    });
                }
                if (sanitizedData.email) {
                    sanitizedData.email = DataMaskingUtil.mask(sanitizedData.email, MaskingType.EMAIL, {
                        emailKeepDomain: false,
                        emailVisibleChars: 2
                    });
                }
                if (sanitizedData.telepon) {
                    sanitizedData.telepon = DataMaskingUtil.mask(sanitizedData.telepon, MaskingType.PHONE, {
                        phoneKeepLastDigits: 2
                    });
                }
                if (sanitizedData.npwp) {
                    sanitizedData.npwp = DataMaskingUtil.mask(sanitizedData.npwp, MaskingType.FULL);
                }
                if (sanitizedData.nikKuasa) {
                    sanitizedData.nikKuasa = DataMaskingUtil.mask(sanitizedData.nikKuasa, MaskingType.PARTIAL, {
                        visibleStart: 2,
                        visibleEnd: 2
                    });
                }
                if (sanitizedData.namaKuasa) {
                    sanitizedData.namaKuasa = DataMaskingUtil.mask(sanitizedData.namaKuasa, MaskingType.NAME, {
                        nameKeepFirstChar: true,
                        nameKeepLastChar: false
                    });
                }
                return sanitizedData;
        }
    }

    /**
     * Apply masking to multiple profile applicant instances
     */
    static applyMaskingToArray(profiles: ProfileApplicant[], requestingUserRole: string = 'guest'): Partial<ProfileApplicantInterface>[] {
        return profiles.map(profile => profile.applyMasking(requestingUserRole));
    }

    /**
     * Get the list of encrypted fields
     */
    static getEncryptedFields(): string[] {
        return [...this.ENCRYPTED_FIELDS];
    }
}

export default ProfileApplicant;
