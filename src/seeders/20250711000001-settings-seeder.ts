import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export default {
    up: async (queryInterface: QueryInterface): Promise<void> => {
        const now = new Date();
        const defaultSettings = [
            {
                id: uuidv4(),
                key: 'appName',
                value: 'Express TypeScript Starter',
                description: 'Application name displayed in various parts of the UI',
                createdAt: now,
                updatedAt: now,
            },
            {
                id: uuidv4(),
                key: 'timezone',
                value: 'UTC',
                description: 'Default timezone for date/time operations',
                createdAt: now,
                updatedAt: now,
            },
            {
                id: uuidv4(),
                key: 'jwtTimeout',
                value: '24h',
                description: 'JWT token expiration time',
                createdAt: now,
                updatedAt: now,
            },
            {
                id: uuidv4(),
                key: 'jwtSecret',
                value: process.env.JWT_SECRET || 'default_jwt_secret',
                description: 'Secret key used to sign JWT tokens',
                createdAt: now,
                updatedAt: now,
            },
            {
                id: uuidv4(),
                key: 'appMetaData',
                value: JSON.stringify({
                    version: '1.0.0',
                    description: 'Express TypeScript API with MySQL/PostgreSQL support',
                    contact: {
                        email: 'admin@example.com'
                    }
                }),
                description: 'Additional metadata about the application',
                createdAt: now,
                updatedAt: now,
            },
            {
                id: uuidv4(),
                key: 'database',
                value: process.env.DB_DIALECT || 'mysql',
                description: 'Active database configuration',
                createdAt: now,
                updatedAt: now,
            }
        ];

        await queryInterface.bulkInsert('settings', defaultSettings);
    },

    down: async (queryInterface: QueryInterface): Promise<void> => {
        await queryInterface.bulkDelete('settings', {});
    }
};
