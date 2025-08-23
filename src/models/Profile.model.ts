import { Table, Column, Model, DataType, BelongsTo, ForeignKey, BeforeCreate, BeforeUpdate, AfterFind } from 'sequelize-typescript';
import { ProfileInterface } from '../interfaces/model.interface';
import { User } from './User.model';
import { CryptoUtil } from '../utils/crypto.util';
import { DataMaskingUtil, MaskingType, MaskingOptions } from '../utils/masking.util';

@Table({
    tableName: 'profiles',
    timestamps: true,
})
export class Profile extends Model<ProfileInterface> implements ProfileInterface {
    // Define which fields should be automatically encrypted
    private static readonly ENCRYPTED_FIELDS = ['nama', 'nik', 'telepon', 'alamat'];

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
        type: DataType.STRING,
        allowNull: true,
    })
    nip?: string;

    @Column({
        type: DataType.TEXT, // Changed to TEXT to store encrypted data
        allowNull: false,
    })
    nik!: string;

    @Column({
        type: DataType.TEXT, // Changed to TEXT to store encrypted data
        allowNull: false,
    })
    nama!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    nikHash?: string; // For searching encrypted NIK

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    jabatan?: string;

    @Column({
        type: DataType.TEXT, // Changed to TEXT to store encrypted data
        allowNull: true,
    })
    telepon?: string;

    @Column({
        type: DataType.TEXT, // Changed to TEXT to store encrypted data
        allowNull: true,
    })
    alamat?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    golongan?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    pangkat?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    fotoUrl?: string;

    // Hook: Encrypt sensitive fields before creating
    @BeforeCreate
    static encryptBeforeCreate(instance: Profile) {
        Profile.encryptSensitiveFields(instance);
    }

    // Hook: Encrypt sensitive fields before updating
    @BeforeUpdate
    static encryptBeforeUpdate(instance: Profile) {
        Profile.encryptSensitiveFields(instance);
    }

    // Hook: Decrypt sensitive fields after finding
    @AfterFind
    static decryptAfterFind(result: Profile | Profile[] | null) {
        if (result) {
            if (Array.isArray(result)) {
                result.forEach(instance => Profile.decryptSensitiveFields(instance));
            } else {
                Profile.decryptSensitiveFields(result);
            }
        }
    }

    /**
     * Encrypt sensitive fields
     */
    private static encryptSensitiveFields(instance: Profile): void {
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

                // Create hash for NIK to enable searching
                if (field === 'nik') {
                    instance.nikHash = CryptoUtil.hash(value);
                }
            }
        }
    }

    /**
     * Decrypt sensitive fields
     */
    private static decryptSensitiveFields(instance: Profile): void {
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
                    console.warn(`Failed to decrypt field ${field} for profile ${instance.id}:`, error?.message || 'Unknown error');
                }
            }
        }
    }

    /**
     * Find profile by NIK (using NIK hash for efficient searching)
     */
    static async findByNik(nik: string): Promise<Profile | null> {
        const nikHash = CryptoUtil.hash(nik);
        return await this.findOne({
            where: { nikHash },
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
     * Apply data masking based on user role
     */
    applyMasking(requestingUserRole: string = 'guest'): Partial<ProfileInterface> {
        const profileData = this.toJSON() as any;

        // Apply role-based masking
        switch (requestingUserRole.toLowerCase()) {
            case 'admin':
                // Admin sees everything unmasked
                return profileData;

            case 'manager':
                // Manager sees partial masking
                if (profileData.nama) {
                    profileData.nama = DataMaskingUtil.mask(profileData.nama, MaskingType.NAME, {
                        nameKeepFirstChar: true,
                        nameKeepLastChar: true
                    });
                }
                if (profileData.nik) {
                    profileData.nik = DataMaskingUtil.mask(profileData.nik, MaskingType.PARTIAL, {
                        visibleStart: 4,
                        visibleEnd: 4
                    });
                }
                if (profileData.telepon) {
                    profileData.telepon = DataMaskingUtil.mask(profileData.telepon, MaskingType.PHONE);
                }
                if (profileData.alamat) {
                    profileData.alamat = DataMaskingUtil.mask(profileData.alamat, MaskingType.PARTIAL, {
                        visibleStart: 10,
                        visibleEnd: 0
                    });
                }
                return profileData;

            default: // user, guest, or unknown roles
                // Heavy masking for regular users
                if (profileData.nama) {
                    profileData.nama = DataMaskingUtil.mask(profileData.nama, MaskingType.NAME, {
                        nameKeepFirstChar: true,
                        nameKeepLastChar: false
                    });
                }
                if (profileData.nik) {
                    profileData.nik = DataMaskingUtil.mask(profileData.nik, MaskingType.PARTIAL, {
                        visibleStart: 2,
                        visibleEnd: 2
                    });
                }
                if (profileData.telepon) {
                    profileData.telepon = DataMaskingUtil.mask(profileData.telepon, MaskingType.PHONE, {
                        phoneKeepLastDigits: 2
                    });
                }
                if (profileData.alamat) {
                    profileData.alamat = DataMaskingUtil.mask(profileData.alamat, MaskingType.PARTIAL, {
                        visibleStart: 5,
                        visibleEnd: 0
                    });
                }
                return profileData;
        }
    }

    /**
     * Apply masking to multiple profile instances
     */
    static applyMaskingToArray(profiles: Profile[], requestingUserRole: string = 'guest'): Partial<ProfileInterface>[] {
        return profiles.map(profile => profile.applyMasking(requestingUserRole));
    }

    /**
     * Get the list of encrypted fields
     */
    static getEncryptedFields(): string[] {
        return [...this.ENCRYPTED_FIELDS];
    }
}

export default Profile;
