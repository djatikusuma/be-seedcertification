import { Table, Column, Model, DataType, BeforeCreate, BeforeUpdate, AfterFind } from 'sequelize-typescript';
import { TempUserInterface } from '../interfaces/model.interface';
import { CryptoUtil } from '../utils/crypto.util';
import { DataMaskingUtil, MaskingType, MaskingOptions } from '../utils/masking.util';
import { Op } from 'sequelize';

export enum UserType {
    PERUSAHAAN = 'perusahaan',
    PERORANGAN = 'perorangan'
}

export enum VerificationStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

@Table({
    tableName: 'temp_users',
    timestamps: true,
})
export class TempUser extends Model<TempUserInterface> implements TempUserInterface {
    // Define which fields should be automatically encrypted
    private static readonly ENCRYPTED_FIELDS = ['nik', 'namaPemohon', 'email', 'telepon', 'npwp', 'alamatPemohon'];

    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id!: string;

    @Column({
        type: DataType.ENUM(...Object.values(UserType)),
        allowNull: false,
    })
    userType!: UserType;

    @Column({
        type: DataType.TEXT, // Changed to TEXT to store encrypted data
        allowNull: false,
    })
    nik!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        unique: true, // This will be used for searching by NIK
    })
    nikHash?: string;

    @Column({
        type: DataType.TEXT, // Changed to TEXT to store encrypted data
        allowNull: false,
    })
    namaPemohon!: string;

    @Column({
        type: DataType.TEXT, // Changed to TEXT to store encrypted data
        allowNull: false,
        unique: false, // Removed unique constraint since encrypted data will be different
    })
    email!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        unique: true, // This will be used for searching by email
    })
    emailHash?: string;

    @Column({
        type: DataType.TEXT, // Changed to TEXT to store encrypted data
        allowNull: true,
    })
    telepon?: string;

    @Column({
        type: DataType.TEXT, // Changed to TEXT to store encrypted data
        allowNull: true,
    })
    npwp?: string;

    @Column({
        type: DataType.TEXT, // Changed to TEXT to store encrypted data
        allowNull: true,
    })
    alamatPemohon?: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    password!: string;

    @Column({
        type: DataType.ENUM(...Object.values(VerificationStatus)),
        allowNull: false,
        defaultValue: VerificationStatus.PENDING,
    })
    verificationStatus!: VerificationStatus;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    verificationNotes?: string;

    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    verifiedBy?: string; // ID of admin/verifikatur who verified this user

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    verifiedAt?: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    deletedAt?: Date;

    // Hook: Encrypt sensitive fields before creating
    @BeforeCreate
    static encryptBeforeCreate(instance: TempUser) {
        TempUser.encryptSensitiveFields(instance);
    }

    // Hook: Encrypt sensitive fields before updating
    @BeforeUpdate
    static encryptBeforeUpdate(instance: TempUser) {
        TempUser.encryptSensitiveFields(instance);
    }

    // Hook: Decrypt sensitive fields after finding
    @AfterFind
    static decryptAfterFind(instanceOrInstances: TempUser | TempUser[] | null) {
        if (!instanceOrInstances) return;

        const instances = Array.isArray(instanceOrInstances) ? instanceOrInstances : [instanceOrInstances];

        for (const instance of instances) {
            if (instance instanceof TempUser) {
                TempUser.decryptSensitiveFields(instance);
            }
        }
    }

    // Method to encrypt sensitive fields
    private static encryptSensitiveFields(instance: TempUser) {
        TempUser.ENCRYPTED_FIELDS.forEach(field => {
            const value = instance.getDataValue(field as keyof TempUserInterface);
            if (value && typeof value === 'string' && !TempUser.isAlreadyEncrypted(value)) {
                // Encrypt the field
                const encryptedValue = CryptoUtil.encrypt(value);
                instance.setDataValue(field as keyof TempUserInterface, encryptedValue as any);

                // Create hash for searchable fields
                if (field === 'nik') {
                    instance.setDataValue('nikHash', CryptoUtil.hash(value));
                } else if (field === 'email') {
                    instance.setDataValue('emailHash', CryptoUtil.hash(value));
                }
            }
        });
    }

    // Method to decrypt sensitive fields
    private static decryptSensitiveFields(instance: TempUser) {
        TempUser.ENCRYPTED_FIELDS.forEach(field => {
            const value = instance.getDataValue(field as keyof TempUserInterface);
            if (value && typeof value === 'string' && TempUser.isAlreadyEncrypted(value)) {
                try {
                    const decryptedValue = CryptoUtil.decrypt(value);
                    instance.setDataValue(field as keyof TempUserInterface, decryptedValue as any);
                } catch (error) {
                    console.error(`Failed to decrypt field ${field}:`, error);
                }
            }
        });
    }

    // Helper method to check if a value is already encrypted
    private static isAlreadyEncrypted(value: string): boolean {
        // Check if the value follows the encrypted format: "encrypted:iv:salt" or starts with "{"
        return value.startsWith('encrypted:') || value.startsWith('{');
    }

    // Method to get masked data based on user role
    static getMaskedTempUser(tempUser: TempUser, viewerRole: string): Partial<TempUserInterface> {
        const maskedData: Partial<TempUserInterface> = {
            id: tempUser.id,
            userType: tempUser.userType,
            verificationStatus: tempUser.verificationStatus,
            verificationNotes: tempUser.verificationNotes,
            verifiedBy: tempUser.verifiedBy,
            verifiedAt: tempUser.verifiedAt,
            createdAt: tempUser.createdAt,
            updatedAt: tempUser.updatedAt,
        };

        // For admin and verifikatur roles, show unmasked data
        if (['admin', 'verifikatur'].includes(viewerRole.toLowerCase())) {
            return {
                ...maskedData,
                nik: tempUser.nik,
                namaPemohon: tempUser.namaPemohon,
                email: tempUser.email,
                telepon: tempUser.telepon,
                npwp: tempUser.npwp,
                alamatPemohon: tempUser.alamatPemohon,
            };
        }

        // For other roles, apply masking
        const maskingOptions: MaskingOptions = {
            emailKeepDomain: true,
            phoneKeepLastDigits: 4,
            maskChar: '*'
        };

        return {
            ...maskedData,
            nik: DataMaskingUtil.mask(tempUser.nik, MaskingType.PARTIAL, maskingOptions),
            namaPemohon: DataMaskingUtil.mask(tempUser.namaPemohon, MaskingType.NAME, maskingOptions),
            email: DataMaskingUtil.mask(tempUser.email, MaskingType.EMAIL, maskingOptions),
            telepon: DataMaskingUtil.mask(tempUser.telepon || '', MaskingType.PHONE, maskingOptions),
            npwp: DataMaskingUtil.mask(tempUser.npwp || '', MaskingType.PARTIAL, maskingOptions),
            alamatPemohon: DataMaskingUtil.mask(tempUser.alamatPemohon || '', MaskingType.PARTIAL, maskingOptions),
        };
    }

    // Method to search by encrypted email
    static async findByEmail(email: string): Promise<TempUser | null> {
        const emailHash = CryptoUtil.hash(email);
        return await TempUser.findOne({
            where: { emailHash }
        });
    }

    // Method to search by encrypted NIK
    static async findByNik(nik: string): Promise<TempUser | null> {
        const nikHash = CryptoUtil.hash(nik);
        return await TempUser.findOne({
            where: { nikHash }
        });
    }

    // Method to validate if email or NIK already exists
    static async validateUnique(email: string, nik: string, excludeId?: string): Promise<{ emailExists: boolean; nikExists: boolean }> {
        const emailHash = CryptoUtil.hash(email);
        const nikHash = CryptoUtil.hash(nik);

        const whereClause: any = {
            [Op.or]: [
                { emailHash },
                { nikHash }
            ]
        };

        if (excludeId) {
            whereClause.id = { [Op.ne]: excludeId };
        }

        const existingUsers = await TempUser.findAll({
            where: whereClause,
            attributes: ['emailHash', 'nikHash']
        });

        return {
            emailExists: existingUsers.some(user => user.emailHash === emailHash),
            nikExists: existingUsers.some(user => user.nikHash === nikHash)
        };
    }
}

export default TempUser;
