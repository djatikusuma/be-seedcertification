import { User } from '../models/User.model';
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
}
