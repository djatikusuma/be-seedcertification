import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Configure Swagger documentation options
 */
const getSwaggerOptions = async () => {
    // Use environment variables and defaults instead of database calls during startup
    // This avoids blocking the application startup with database queries
    const appName = process.env.APP_NAME || 'Express TypeScript API';
    const appVersion = process.env.APP_VERSION || '1.0.0';
    const appDescription = process.env.APP_DESCRIPTION || 'Express TypeScript API with MySQL/PostgreSQL support';

    const options: swaggerJsdoc.Options = {
        definition: {
            openapi: '3.0.0',
            info: {
                title: appName,
                version: appVersion,
                description: appDescription,
                contact: {
                    email: process.env.CONTACT_EMAIL || 'admin@example.com'
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
                },
                {
                    name: 'Internal Profiles',
                    description: 'Internal user profile management for employees'
                },
                {
                    name: 'Applicant Profiles',
                    description: 'External applicant profile management for Petani and Perusahaan'
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
