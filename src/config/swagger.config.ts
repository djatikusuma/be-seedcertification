import swaggerJsdoc from 'swagger-jsdoc';
import { SettingsService } from '../services/settings.service';

/**
 * Configure Swagger documentation options
 */
const getSwaggerOptions = async () => {
    // Get app metadata from settings
    const settingsService = new SettingsService();
    const appName = await settingsService.getSetting('appName') || 'Express TypeScript API';
    const appMetaDataStr = await settingsService.getSetting('appMetaData');

    let appMetaData = {};
    try {
        if (typeof appMetaDataStr === 'object') {
            appMetaData = appMetaDataStr;
        } else if (typeof appMetaDataStr === 'string') {
            appMetaData = JSON.parse(appMetaDataStr);
        }
    } catch (error) {
        console.warn('Failed to parse appMetaData from settings:', error);
    }

    const options: swaggerJsdoc.Options = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: appName,
                version: (appMetaData as any)?.version || '1.0.0',
                description: (appMetaData as any)?.description || 'Express TypeScript API with MySQL/PostgreSQL support',
                contact: (appMetaData as any)?.contact || {
                    email: 'admin@example.com'
                },
            },
            tags: [
                {
                    name: 'Authentication',
                    description: 'Endpoints for user authentication and token management'
                },
                {
                    name: 'Users',
                    description: 'User management operations'
                },
                {
                    name: 'Roles',
                    description: 'Role management operations for implementing RBAC'
                },
                {
                    name: 'Menus',
                    description: 'Navigation menu operations supporting hierarchical structures'
                },
                {
                    name: 'Settings',
                    description: 'Global application settings management'
                },
                {
                    name: 'Profile',
                    description: 'User profile management operations'
                }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            },
            security: [{
                bearerAuth: []
            }]
        },
        apis: [
            './src/routes/*.ts',
            './src/controllers/*.ts'
        ],
    };

    return options;
};

/**
 * Generate Swagger specification
 */
export const generateSwaggerSpec = async () => {
    const options = await getSwaggerOptions();
    return swaggerJsdoc(options);
};

export default generateSwaggerSpec;
