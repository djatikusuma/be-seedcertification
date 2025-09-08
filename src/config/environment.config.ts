import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Environment configuration
 */
export interface EnvironmentConfig {
    NODE_ENV: 'development' | 'production' | 'test' | 'debug';
    PORT: number;
    DEBUG: boolean;

    // Database
    DB_HOST: string;
    DB_PORT: number;
    DB_NAME: string;
    DB_USER: string;
    DB_PASS: string;

    // JWT
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;

    // Encryption
    ENCRYPTION_KEY: string;
    ENCRYPTION_IV: string;

    // Logging
    LOG_LEVEL: 'error' | 'warn' | 'info' | 'debug';
    ENABLE_REQUEST_LOGGING: boolean;
    ENABLE_DB_LOGGING: boolean;
}

/**
 * Get environment configuration
 */
export const getEnvironmentConfig = (): EnvironmentConfig => {
    const nodeEnv = (process.env.NODE_ENV || 'development') as EnvironmentConfig['NODE_ENV'];
    const isDebug = nodeEnv === 'development' || nodeEnv === 'debug' || process.env.APP_DEBUG === 'true';

    return {
        NODE_ENV: nodeEnv,
        PORT: parseInt(process.env.PORT || '3000', 10),
        DEBUG: isDebug,

        // Database
        DB_HOST: process.env.DB_HOST || 'localhost',
        DB_PORT: parseInt(process.env.DB_PORT || '3306', 10),
        DB_NAME: process.env.DB_NAME || 'be_sisolehbun',
        DB_USER: process.env.DB_USER || 'root',
        DB_PASS: process.env.DB_PASS || process.env.DB_PASSWORD || '',

        // JWT
        JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

        // Encryption
        ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '',
        ENCRYPTION_IV: process.env.ENCRYPTION_IV || '',

        // Logging
        LOG_LEVEL: (process.env.LOG_LEVEL as EnvironmentConfig['LOG_LEVEL']) || (isDebug ? 'debug' : 'info'),
        ENABLE_REQUEST_LOGGING: process.env.ENABLE_REQUEST_LOGGING === 'true' || isDebug,
        ENABLE_DB_LOGGING: process.env.ENABLE_DB_LOGGING === 'true' || isDebug,
    };
};

/**
 * Global environment configuration instance
 */
export const config = getEnvironmentConfig();

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
    return config.NODE_ENV === 'development' || config.NODE_ENV === 'debug';
};

/**
 * Check if running in production mode
 */
export const isProduction = (): boolean => {
    return config.NODE_ENV === 'production';
};

/**
 * Check if running in test mode
 */
export const isTest = (): boolean => {
    return config.NODE_ENV === 'test';
};

/**
 * Check if debug mode is enabled
 */
export const isDebugMode = (): boolean => {
    return config.DEBUG;
};

export default config;
