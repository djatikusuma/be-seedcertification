import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { CryptoUtil } from '../utils/crypto.util';

export = {
    up: async (queryInterface: QueryInterface) => {
        // Create some sample temp users for testing
        const tempUsers = [
            {
                id: uuidv4(),
                userType: 'petani',
                nik: CryptoUtil.encrypt('1234567890123456'),
                nikHash: CryptoUtil.hash('1234567890123456'),
                namaPemohon: CryptoUtil.encrypt('John Doe'),
                email: CryptoUtil.encrypt('john.doe@example.com'),
                emailHash: CryptoUtil.hash('john.doe@example.com'),
                telepon: CryptoUtil.encrypt('081234567890'),
                npwp: CryptoUtil.encrypt('123456789012345'),
                alamatPemohon: CryptoUtil.encrypt('Jl. Merdeka No. 123, Jakarta'),
                password: await bcrypt.hash('password123', 12),
                verificationStatus: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                userType: 'perusahaan',
                nik: CryptoUtil.encrypt('9876543210987654'),
                nikHash: CryptoUtil.hash('9876543210987654'),
                namaPemohon: CryptoUtil.encrypt('Jane Smith'),
                email: CryptoUtil.encrypt('jane.smith@company.com'),
                emailHash: CryptoUtil.hash('jane.smith@company.com'),
                telepon: CryptoUtil.encrypt('082345678901'),
                npwp: CryptoUtil.encrypt('987654321098765'),
                alamatPemohon: CryptoUtil.encrypt('Jl. Sudirman No. 456, Surabaya'),
                password: await bcrypt.hash('password456', 12),
                verificationStatus: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                userType: 'petani',
                nik: CryptoUtil.encrypt('1111222233334444'),
                nikHash: CryptoUtil.hash('1111222233334444'),
                namaPemohon: CryptoUtil.encrypt('Bob Wilson'),
                email: CryptoUtil.encrypt('bob.wilson@email.com'),
                emailHash: CryptoUtil.hash('bob.wilson@email.com'),
                telepon: CryptoUtil.encrypt('083456789012'),
                npwp: CryptoUtil.encrypt('111122223333444'),
                alamatPemohon: CryptoUtil.encrypt('Jl. Gatot Subroto No. 789, Bandung'),
                password: await bcrypt.hash('password789', 12),
                verificationStatus: 'approved',
                verificationNotes: 'Data lengkap dan valid',
                verifiedAt: new Date(),
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                userType: 'perusahaan',
                nik: CryptoUtil.encrypt('5555666677778888'),
                nikHash: CryptoUtil.hash('5555666677778888'),
                namaPemohon: CryptoUtil.encrypt('Alice Brown'),
                email: CryptoUtil.encrypt('alice.brown@enterprise.com'),
                emailHash: CryptoUtil.hash('alice.brown@enterprise.com'),
                telepon: CryptoUtil.encrypt('084567890123'),
                npwp: CryptoUtil.encrypt('555566667777888'),
                alamatPemohon: CryptoUtil.encrypt('Jl. Thamrin No. 101, Medan'),
                password: await bcrypt.hash('password101', 12),
                verificationStatus: 'rejected',
                verificationNotes: 'Dokumen NPWP tidak sesuai',
                verifiedAt: new Date(),
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                updatedAt: new Date(),
            },
        ];

        await queryInterface.bulkInsert('temp_users', tempUsers);
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.bulkDelete('temp_users', {});
    },
};
