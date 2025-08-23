import { QueryInterface, QueryTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../models/User.model';
import { CryptoUtil } from '../utils/crypto.util';

export = {
    up: async (queryInterface: QueryInterface) => {
        // Get Petani and Perusahaan role users
        const petaniUsers = await queryInterface.sequelize.query(
            `SELECT u.id, u.roleId FROM users u 
             JOIN roles r ON u.roleId = r.id 
             WHERE r.roleName = 'Petani' LIMIT 2`,
            { type: QueryTypes.SELECT }
        ) as Array<{ id: string; roleId: string }>;

        const perusahaanUsers = await queryInterface.sequelize.query(
            `SELECT u.id, u.roleId FROM users u 
             JOIN roles r ON u.roleId = r.id 
             WHERE r.roleName = 'Perusahaan' LIMIT 2`,
            { type: QueryTypes.SELECT }
        ) as Array<{ id: string; roleId: string }>;

        const profileApplicantsData: any[] = [];

        // Create Petani profiles
        petaniUsers.forEach((user, index) => {
            profileApplicantsData.push({
                id: uuidv4(),
                userId: user.id,
                nik: CryptoUtil.encrypt(`321234567890123${index}`),
                npwp: CryptoUtil.encrypt(`12345678900000${index}`),
                email: CryptoUtil.encrypt(`petani${index + 1}@example.com`),
                namaPemohon: CryptoUtil.encrypt(`Petani Pemohon ${index + 1}`),
                telepon: CryptoUtil.encrypt(`08234567890${index}`),
                alamatPemohon: CryptoUtil.encrypt(`Desa Contoh ${index + 1}, Kecamatan Pertanian`),
                fotoPemohon: null,
                alamatPerusahaan: null,
                lokasiPerbenihan: CryptoUtil.encrypt(`Lahan Pertanian Desa Contoh ${index + 1}`),
                nikKuasa: null,
                namaKuasa: null,
                fotoKuasa: null,
                fileAktaPendirian: null,
                fileKtp: null,
                fileNpwp: null,
                fileSuratKuasa: null,
                statusKepemilikan: index === 0 ? 'Milik Sendiri' : 'Sewa',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        });

        // Create Perusahaan profiles
        perusahaanUsers.forEach((user, index) => {
            profileApplicantsData.push({
                id: uuidv4(),
                userId: user.id,
                nik: CryptoUtil.encrypt(`331234567890789${index}`),
                npwp: CryptoUtil.encrypt(`98765432100000${index}`),
                email: CryptoUtil.encrypt(`perusahaan${index + 1}@company.com`),
                namaPemohon: CryptoUtil.encrypt(`PT Pertanian ${index + 1}`),
                telepon: CryptoUtil.encrypt(`08345678901${index}`),
                alamatPemohon: CryptoUtil.encrypt(`Jl. Industri No. ${index + 1}, Jakarta`),
                fotoPemohon: null,
                alamatPerusahaan: CryptoUtil.encrypt(`Kawasan Industri Blok ${String.fromCharCode(65 + index)}`),
                lokasiPerbenihan: CryptoUtil.encrypt(`Fasilitas Perbenihan PT Pertanian ${index + 1}`),
                nikKuasa: CryptoUtil.encrypt(`331987654321012${index}`),
                namaKuasa: CryptoUtil.encrypt(`Kuasa Hukum ${index + 1}`),
                fotoKuasa: null,
                fileAktaPendirian: null,
                fileKtp: null,
                fileNpwp: null,
                fileSuratKuasa: null,
                statusKepemilikan: 'Milik Sendiri',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        });

        if (profileApplicantsData.length > 0) {
            await queryInterface.bulkInsert('profile_applicants', profileApplicantsData);
        } else {
            console.log('No Petani or Perusahaan users found for applicant profile seeding');
        }
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.bulkDelete('profile_applicants', {});
    },
};
