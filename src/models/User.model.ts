import { Table, Column, Model, DataType, BelongsTo, ForeignKey, HasOne, BeforeCreate, BeforeUpdate, AfterFind } from 'sequelize-typescript';
import { UserInterface } from '../interfaces/model.interface';
import Role from './Role.model';
import { CryptoUtil } from '../utils/crypto.util';
import { DataMaskingUtil, MaskingType, MaskingOptions } from '../utils/masking.util';

@Table({
    tableName: 'users',
    timestamps: true,
})
export class User extends Model<UserInterface> implements UserInterface {
    // Define which fields should be automatically encrypted
    private static readonly ENCRYPTED_FIELDS = ['name', 'email'];
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id!: string;

    @Column({
        type: DataType.TEXT, // Changed to TEXT to store encrypted data
        allowNull: false,
    })
    name!: string;

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
        type: DataType.STRING,
        allowNull: false,
    })
    password!: string;

    @ForeignKey(() => Role)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    roleId!: string;

    @BelongsTo(() => Role)
    role?: Role;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    deletionRequested!: boolean;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    deletionRequestDate?: Date;

    // Lazy loading for profile relationships
    @HasOne(() => require('./Profile.model').Profile)
    profile?: any;

    @HasOne(() => require('./ProfileApplicant.model').ProfileApplicant)
    profileApplicant?: any;

    // Hook: Encrypt sensitive fields before creating
    @BeforeCreate
    static encryptBeforeCreate(instance: User) {
        User.encryptSensitiveFields(instance);
    }

    // Hook: Encrypt sensitive fields before updating
    @BeforeUpdate
    static encryptBeforeUpdate(instance: User) {
        User.encryptSensitiveFields(instance);
    }

    // Hook: Decrypt sensitive fields after finding
    @AfterFind
    static decryptAfterFind(result: User | User[] | null) {
        if (result) {
            if (Array.isArray(result)) {
                result.forEach(instance => User.decryptSensitiveFields(instance));
            } else {
                User.decryptSensitiveFields(result);
            }
        }
    }

    /**
     * Encrypt sensitive fields
     */
    private static encryptSensitiveFields(instance: User): void {
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

                // Create hash for email to enable searching
                if (field === 'email') {
                    instance.emailHash = CryptoUtil.hash(value.toLowerCase());
                }
            }
        }
    }

    /**
     * Decrypt sensitive fields
     */
    private static decryptSensitiveFields(instance: User): void {
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
                    console.warn(`Failed to decrypt field ${field} for user ${instance.id}:`, error?.message || 'Unknown error');
                }
            }
        }
    }

    /**
     * Find user by email (using email hash for efficient searching)
     */
    static async findByEmail(email: string): Promise<User | null> {
        const emailHash = CryptoUtil.hash(email.toLowerCase());
        return await this.findOne({
            where: { emailHash },
            include: ['role'] // Include the role to access role name
        });
    }

    /**
     * Check if email exists (using email hash)
     */
    static async emailExists(email: string): Promise<boolean> {
        const emailHash = CryptoUtil.hash(email.toLowerCase());
        const user = await this.findOne({
            where: { emailHash },
            attributes: ['id']
        });
        return !!user;
    }

    /**
     * Get the list of encrypted fields
     */
    static getEncryptedFields(): string[] {
        return [...this.ENCRYPTED_FIELDS];
    }

    /**
     * Manually encrypt a field value
     */
    static encryptFieldValue(value: string): string {
        const encrypted = CryptoUtil.encrypt(value);
        return JSON.stringify(encrypted);
    }

    /**
     * Manually decrypt a field value
     */
    static decryptFieldValue(encryptedValue: string): string {
        try {
            const encryptionData = JSON.parse(encryptedValue);
            return CryptoUtil.decrypt(encryptionData);
        } catch (error: any) {
            throw new Error(`Failed to decrypt field value: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Apply data masking based on user role
     */
    applyMasking(requestingUserRole: string = 'guest'): Partial<UserInterface> {
        const userData = this.toJSON() as any;

        // Remove sensitive fields that should never be exposed
        const { password, emailHash, ...sanitizedData } = userData;

        // Apply role-based masking
        // switch (requestingUserRole.toLowerCase()) {
        //     case 'admin':
        //         // Admin sees everything unmasked
        //         return sanitizedData;

        //     case 'manager':
        //         // Manager sees partial masking
        //         if (sanitizedData.email) {
        //             sanitizedData.email = DataMaskingUtil.mask(sanitizedData.email, MaskingType.EMAIL, {
        //                 emailKeepDomain: true,
        //                 emailVisibleChars: 3
        //             });
        //         }
        //         if (sanitizedData.name) {
        //             sanitizedData.name = DataMaskingUtil.mask(sanitizedData.name, MaskingType.NAME, {
        //                 nameKeepFirstChar: true,
        //                 nameKeepLastChar: true
        //             });
        //         }
        //         return sanitizedData;

        //     default: // user, guest, or unknown roles
        // Heavy masking for regular users
        if (sanitizedData.email) {
            sanitizedData.email = DataMaskingUtil.mask(sanitizedData.email, MaskingType.EMAIL, {
                emailKeepDomain: false,
                emailVisibleChars: 2
            });
        }
        // if (sanitizedData.name) {
        //     sanitizedData.name = DataMaskingUtil.mask(sanitizedData.name, MaskingType.NAME, {
        //         nameKeepFirstChar: true,
        //         nameKeepLastChar: false
        //     });
        // }
        return sanitizedData;
        // }
    }

    /**
     * Apply masking to multiple user instances
     */
    static applyMaskingToArray(users: User[], requestingUserRole: string = 'guest'): Partial<UserInterface>[] {
        return users.map(user => user.applyMasking(requestingUserRole));
    }

    /**
     * Get masked user data with role information
     */
    getMaskedData(requestingUserRole: string = 'guest'): Partial<UserInterface> {
        return this.applyMasking(requestingUserRole);
    }

    /**
     * Bulk update to encrypt existing unencrypted data
     */
    static async encryptExistingData(): Promise<{ processed: number; errors: number }> {
        let processed = 0;
        let errors = 0;

        try {
            // Get all users without hooks to prevent double encryption
            const allUsers = await this.findAll();

            for (const user of allUsers) {
                try {
                    let needsUpdate = false;
                    const updates: any = {};

                    // Check each encrypted field
                    for (const field of this.ENCRYPTED_FIELDS) {
                        const value = (user as any)[field];
                        if (value && typeof value === 'string') {
                            try {
                                // If it parses as JSON, it's likely already encrypted
                                JSON.parse(value);
                                continue;
                            } catch {
                                // If it doesn't parse, it's plain text - encrypt it
                                updates[field] = this.encryptFieldValue(value);
                                needsUpdate = true;

                                // Create hash for email
                                if (field === 'email') {
                                    updates.emailHash = CryptoUtil.hash(value.toLowerCase());
                                }
                            }
                        }
                    }

                    if (needsUpdate) {
                        await user.update(updates, { hooks: false });
                        processed++;
                    }
                } catch (error: any) {
                    console.error(`Error processing user ${user.id}:`, error?.message || 'Unknown error');
                    errors++;
                }
            }

            return { processed, errors };
        } catch (error: any) {
            throw new Error(`Failed to encrypt existing data: ${error?.message || 'Unknown error'}`);
        }
    }
}

export default User;
