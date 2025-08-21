import { QueryInterface, QueryTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Get role IDs from the database
const getRoles = async (queryInterface: QueryInterface) => {
    const roles = await queryInterface.sequelize.query(
        'SELECT id, roleName FROM roles',
        { type: QueryTypes.SELECT }
    ) as Array<{ id: string; roleName: string }>;

    const roleMap: Record<string, string> = {};
    roles.forEach(role => {
        roleMap[role.roleName] = role.id;
    });

    return roleMap;
};

export = {
    up: async (queryInterface: QueryInterface) => {
        // Get role IDs
        const roles = await getRoles(queryInterface);

        // Hash passwords
        const salt = await bcrypt.genSalt(10);
        const adminPassword = await bcrypt.hash('admin123', salt);
        const userPassword = await bcrypt.hash('user123', salt);
        const petaniPassword = await bcrypt.hash('petani123', salt);
        const perusahaanPassword = await bcrypt.hash('perusahaan123', salt);

        const users = [
            // Admin user
            {
                id: uuidv4(),
                name: 'Admin User',
                email: 'admin@example.com',
                password: adminPassword,
                roleId: roles.admin,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Regular users (for internal profiles)
            {
                id: uuidv4(),
                name: 'User Internal 1',
                email: 'internal1@example.com',
                password: userPassword,
                roleId: roles.user,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                name: 'User Internal 2',
                email: 'internal2@example.com',
                password: userPassword,
                roleId: roles.user,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Petani users
            {
                id: uuidv4(),
                name: 'Petani User 1',
                email: 'petani1@example.com',
                password: petaniPassword,
                roleId: roles.Petani,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                name: 'Petani User 2',
                email: 'petani2@example.com',
                password: petaniPassword,
                roleId: roles.Petani,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Perusahaan users
            {
                id: uuidv4(),
                name: 'Perusahaan User 1',
                email: 'perusahaan1@example.com',
                password: perusahaanPassword,
                roleId: roles.Perusahaan,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                name: 'Perusahaan User 2',
                email: 'perusahaan2@example.com',
                password: perusahaanPassword,
                roleId: roles.Perusahaan,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        await queryInterface.bulkInsert('users', users);
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.bulkDelete('users', {});
    },
};
