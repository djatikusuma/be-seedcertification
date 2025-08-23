import { QueryInterface, QueryTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { User } from '../models/User.model';
import { CryptoUtil } from '../utils/crypto.util';

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
        const inspekturPassword = await bcrypt.hash('inspektur123', salt);
        const inspekturKetuaPassword = await bcrypt.hash('inspektur_ketua123', salt);
        const verifikaturPassword = await bcrypt.hash('verifikatur123', salt);
        const kepalaPassword = await bcrypt.hash('kepala123', salt);

        const users = [
            // Admin user
            {
                id: uuidv4(),
                name: 'Admin User',
                email: 'admin@example.com',
                password: adminPassword,
                roleId: roles.admin,
            },
            // Regular users (for internal profiles)
            {
                id: uuidv4(),
                name: 'User Internal 1',
                email: 'internal1@example.com',
                password: userPassword,
                roleId: roles.user,
            },
            {
                id: uuidv4(),
                name: 'User Internal 2',
                email: 'internal2@example.com',
                password: userPassword,
                roleId: roles.user,
            },
            // Petani users
            {
                id: uuidv4(),
                name: 'Petani User 1',
                email: 'petani1@example.com',
                password: petaniPassword,
                roleId: roles.petani,
            },
            {
                id: uuidv4(),
                name: 'Petani User 2',
                email: 'petani2@example.com',
                password: petaniPassword,
                roleId: roles.petani,
            },
            // Perusahaan users
            {
                id: uuidv4(),
                name: 'Perusahaan User 1',
                email: 'perusahaan1@example.com',
                password: perusahaanPassword,
                roleId: roles.perusahaan,
            },
            {
                id: uuidv4(),
                name: 'Perusahaan User 2',
                email: 'perusahaan2@example.com',
                password: perusahaanPassword,
                roleId: roles.perusahaan,
            },
            // Inspektur users
            {
                id: uuidv4(),
                name: 'Inspektur User 1',
                email: 'inspektur1@example.com',
                password: inspekturPassword,
                roleId: roles.inspektur,
            },
            {
                id: uuidv4(),
                name: 'Inspektur User 2',
                email: 'inspektur2@example.com',
                password: inspekturPassword,
                roleId: roles.inspektur,
            },
            // Inspektur Ketua users
            {
                id: uuidv4(),
                name: 'Inspektur Ketua User 1',
                email: 'inspektur_ketua1@example.com',
                password: inspekturKetuaPassword,
                roleId: roles.inspektur_ketua,
            },
            // Verifikatur users
            {
                id: uuidv4(),
                name: 'Verifikatur User 1',
                email: 'verifikatur1@example.com',
                password: verifikaturPassword,
                roleId: roles.verifikatur,
            },
            {
                id: uuidv4(),
                name: 'Verifikatur User 2',
                email: 'verifikatur2@example.com',
                password: verifikaturPassword,
                roleId: roles.verifikatur,
            },
            // Kepala users
            {
                id: uuidv4(),
                name: 'Kepala Balai',
                email: 'kepala1@example.com',
                password: kepalaPassword,
                roleId: roles.kepala,
            },
        ];

        // Manually encrypt fields before inserting
        console.log('🔐 Encrypting user data before seeding...');
        const encryptedUsers = users.map(user => {
            // Encrypt name and email using new format
            const encryptedName = CryptoUtil.encrypt(user.name);
            const encryptedEmail = CryptoUtil.encrypt(user.email);

            // Create email hash for searching
            const emailHash = CryptoUtil.hash(user.email.toLowerCase());

            return {
                id: user.id,
                name: encryptedName,
                email: encryptedEmail,
                emailHash: emailHash,
                password: user.password,
                roleId: user.roleId,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        });

        await queryInterface.bulkInsert('users', encryptedUsers);
        console.log('✅ All users seeded with encrypted data!');
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.bulkDelete('users', {});
        console.log('🗑️  All users deleted');
    },
};
