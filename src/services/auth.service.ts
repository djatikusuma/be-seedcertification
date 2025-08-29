import { User } from '../models/User.model';
import { Role } from '../models/Role.model';
import { Profile } from '../models/Profile.model';
import { ProfileApplicant } from '../models/ProfileApplicant.model';
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { jwtConfig, getJwtConfig } from '../config/jwt.config';
import { LoginRequestInterface, JwtPayloadInterface } from '../interfaces/auth.interface';

export class AuthService {
    /**
     * Login a user with email and password
     * @param loginData - Email and password
     * @returns JWT token if authentication is successful
     */
    async login(loginData: LoginRequestInterface): Promise<string | null> {
        try {
            // Find the user by email using the findByEmail method that handles encryption
            const user = await User.findByEmail(loginData.email);

            // If user not found or password doesn't match
            if (!user || !(await this.comparePassword(loginData.password, user.password))) {
                return null;
            }

            // Generate JWT token
            const token = await this.generateToken({
                id: user.id,
                email: user.email, // This will be the decrypted email
                roleId: user.roleId
            });

            return token;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Compare plain password with hashed password
     * @param plainPassword - Plain text password
     * @param hashedPassword - Hashed password from database
     * @returns boolean - True if password matches
     */
    private async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * Generate JWT token
     * @param payload - User data to include in the token
     * @returns JWT token
     */
    private async generateToken(payload: JwtPayloadInterface): Promise<string> {
        // Try to get settings-based configuration
        try {
            const config = await getJwtConfig();
            return jwt.sign(
                payload,
                config.secret as Secret,
                { expiresIn: config.expiresIn } as SignOptions
            );
        } catch (error) {
            console.warn('Failed to load JWT settings, falling back to environment variables:', error);
            // Fall back to environment variables
            return jwt.sign(
                payload,
                jwtConfig.secret as Secret,
                { expiresIn: jwtConfig.expiresIn } as SignOptions
            );
        }
    }

    /**
     * Verify JWT token
     * @param token - JWT token to verify
     * @returns Decoded payload or null if invalid
     */
    async verifyToken(token: string): Promise<JwtPayloadInterface | null> {
        try {
            // Use environment variables for JWT verification to avoid database calls during auth
            // This prevents hanging requests when database is slow
            const secret = jwtConfig.secret as Secret;

            const decoded = jwt.verify(token, secret) as JwtPayloadInterface;
            return decoded;
        } catch (error) {
            console.error('Token verification error:', error);
            return null;
        }
    }

    /**
     * Get current user with profile and role
     * @param userId - User ID from JWT token
     * @returns User data with unified profile and role (automatically decrypted)
     */
    async getCurrentUser(userId: string): Promise<any> {
        try {
            const user = await User.findByPk(userId, {
                include: [
                    {
                        model: Role,
                        as: 'role',
                        attributes: ['id', 'roleName'], // Only include necessary role fields
                    },
                    {
                        model: Profile,
                        as: 'profile',
                        required: false, // Left join - profile might not exist
                    },
                    {
                        model: ProfileApplicant,
                        as: 'profileApplicant',
                        required: false, // Left join - profile applicant might not exist
                    },
                ],
            });

            if (!user) {
                return null;
            }

            // Manual decryption for profile relations since hooks might not work on includes
            if (user.profile) {
                this.decryptProfileData(user.profile);
            }

            if (user.profileApplicant) {
                this.decryptProfileApplicantData(user.profileApplicant);
            }

            // Transform data structure to unify profiles under single 'profile' key
            const userData = user.toJSON() as any;

            // Remove original profile fields
            delete userData.profile;
            delete userData.profileApplicant;

            let unifiedProfile = {};
            if (user.profile) {
                unifiedProfile = user.profile;
            }

            if (user.profileApplicant) {
                unifiedProfile = user.profileApplicant;
            }

            // Merge profiles into single profile object
            // const unifiedProfile = this.mergeProfiles(profile, profileApplicant);

            return {
                ...userData,
                profile: unifiedProfile
            };
        } catch (error) {
            console.error('Get current user error:', error);
            throw error;
        }
    }

    /**
     * Manually decrypt Profile data
     * @param profile - Profile instance to decrypt
     */
    private decryptProfileData(profile: any): void {
        const ENCRYPTED_FIELDS = ['nama', 'nik', 'telepon', 'alamat'];

        for (const field of ENCRYPTED_FIELDS) {
            const value = profile[field];
            if (value && typeof value === 'string') {
                try {
                    // Import CryptoUtil dynamically to avoid circular imports
                    const { CryptoUtil } = require('../utils/crypto.util');

                    // Check if it's new format (encrypted:iv:salt)
                    if (value.includes(':') && value.split(':').length === 3) {
                        profile[field] = CryptoUtil.decrypt(value);
                    } else {
                        // Try old JSON format
                        const encryptionData = JSON.parse(value);
                        if (encryptionData.encrypted && encryptionData.iv && encryptionData.salt) {
                            profile[field] = CryptoUtil.decrypt(encryptionData);
                        }
                    }
                } catch (error: any) {
                    // If decryption fails, leave the field as is
                    console.warn(`Failed to decrypt profile field ${field}:`, error?.message || 'Unknown error');
                }
            }
        }
    }

    /**
     * Manually decrypt ProfileApplicant data
     * @param profileApplicant - ProfileApplicant instance to decrypt
     */
    private decryptProfileApplicantData(profileApplicant: any): void {
        const ENCRYPTED_FIELDS = ['nik', 'npwp', 'email', 'namaPemohon', 'telepon', 'alamatPemohon', 'alamatPerusahaan', 'nikKuasa', 'namaKuasa'];

        for (const field of ENCRYPTED_FIELDS) {
            const value = profileApplicant[field];
            if (value && typeof value === 'string') {
                try {
                    // Import CryptoUtil dynamically to avoid circular imports
                    const { CryptoUtil } = require('../utils/crypto.util');

                    // Check if it's new format (encrypted:iv:salt)
                    if (value.includes(':') && value.split(':').length === 3) {
                        profileApplicant[field] = CryptoUtil.decrypt(value);
                    } else {
                        // Try old JSON format
                        const encryptionData = JSON.parse(value);
                        if (encryptionData.encrypted && encryptionData.iv && encryptionData.salt) {
                            profileApplicant[field] = CryptoUtil.decrypt(encryptionData);
                        }
                    }
                } catch (error: any) {
                    // If decryption fails, leave the field as is
                    console.warn(`Failed to decrypt profile applicant field ${field}:`, error?.message || 'Unknown error');
                }
            }
        }
    }
}
