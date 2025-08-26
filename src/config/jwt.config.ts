import dotenv from 'dotenv';
import { SettingsService } from '../services/settings.service';

dotenv.config();

// Cache for JWT config to avoid repeated database calls
let cachedJwtConfig: { secret: string; expiresIn: string } | null = null;

/**
 * Get JWT configuration from settings service with fallback to environment variables
 */
export const getJwtConfig = async () => {
    // Return cached config if available
    if (cachedJwtConfig) {
        return cachedJwtConfig;
    }

    const settingsService = new SettingsService();

    // Try to get values from settings
    let secret, expiresIn;

    try {
        // Get secret from settings with fallback to env var
        secret = await settingsService.getSetting('jwtSecret');
        if (!secret) {
            console.warn('JWT secret not found in settings, using environment variable');
            secret = process.env.JWT_SECRET || 'default_jwt_secret';
        }

        // Get expiration time from settings with fallback to env var
        expiresIn = await settingsService.getSetting('jwtTimeout');
        if (!expiresIn) {
            console.warn('JWT timeout not found in settings, using environment variable');
            expiresIn = process.env.JWT_EXPIRES_IN || '24h';
        }
    } catch (error) {
        console.error('Error loading JWT settings:', error);
        // Fall back to environment variables if settings service fails
        secret = process.env.JWT_SECRET || 'default_jwt_secret';
        expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    }

    // Cache the config
    cachedJwtConfig = {
        secret,
        expiresIn
    };

    return cachedJwtConfig;
};

// Legacy synchronous config for backwards compatibility - use environment variables only
export const jwtConfig = {
    secret: process.env.JWT_SECRET || 'default_jwt_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
};
