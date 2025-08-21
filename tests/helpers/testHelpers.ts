import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../../src/models/User.model';
import { Role } from '../../src/models/Role.model';
import { Settings } from '../../src/models/Settings.model';

// Create a test user
export const createTestUser = async (roleId: string, isAdmin = false) => {
    const hashedPassword = await bcrypt.hash('password123', 10);

    return User.create({
        name: `Test User ${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        password: hashedPassword,
        roleId
    });
};

// Create a test admin role
export const createTestAdminRole = async () => {
    return Role.create({
        roleName: 'admin'
    });
};

// Create a test user role
export const createTestUserRole = async () => {
    return Role.create({
        roleName: 'user'
    });
};

// Generate a valid JWT token for testing
export const generateTestToken = (user: any, expiresIn = '1h') => {
    const payload = {
        id: user.id,
        email: user.email,
        roleId: user.roleId
    };

    const options: jwt.SignOptions = { expiresIn };
    return jwt.sign(payload, process.env.JWT_SECRET || 'test_secret', options);
};

// Setup initial settings for testing
export const setupTestSettings = async () => {
    await Settings.destroy({ where: {}, truncate: true });

    await Settings.bulkCreate([
        {
            key: 'appName',
            value: 'Test App',
            description: 'Application name for testing'
        },
        {
            key: 'timezone',
            value: 'UTC',
            description: 'Default timezone for testing'
        },
        {
            key: 'jwtTimeout',
            value: '24h',
            description: 'JWT token expiration time for testing'
        },
        {
            key: 'appMetaData',
            value: JSON.stringify({
                version: '1.0.0',
                description: 'Test description',
                contact: {
                    email: 'test@example.com'
                }
            }),
            description: 'App metadata for testing'
        },
        {
            key: 'database',
            value: 'sqlite',
            description: 'Database type for testing'
        }
    ]);
};

// Clean up test data
export const cleanupTestData = async () => {
    await User.destroy({ where: { email: { [Op.like]: 'test%@example.com' } } });
    await Role.destroy({ where: { roleName: { [Op.like]: '%test%' } } });
};

// Import sequelize operators
import { Op } from 'sequelize';
