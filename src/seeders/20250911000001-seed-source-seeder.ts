import { QueryInterface, Sequelize, QueryTypes } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface: QueryInterface, Sequelize: Sequelize) {
        // First, get some existing pemohon IDs from profile_applicants
        const pemohonData = await queryInterface.sequelize.query(
            `SELECT id FROM profile_applicants LIMIT 3`,
            { type: QueryTypes.SELECT }
        ) as any[];

        if (pemohonData.length === 0) {
            console.log('No pemohon data found. Skipping seed source seeder.');
            return;
        }

        const seedSourcesData = [
            {
                id: '550e8400-e29b-41d4-a716-446655440001',
                pemohon_id: pemohonData[0]?.id,
                nomor_penetapan: 'SP-001/2024',
                tanggal_penetapan: new Date('2024-01-15'),
                file_penetapan_sumber_benih: '/uploads/penetapan/sp-001-2024.pdf',
                status: 1, // VERIFIKASI_DOKUMEN
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440002',
                pemohon_id: pemohonData[1]?.id || pemohonData[0]?.id,
                nomor_penetapan: 'SP-002/2024',
                tanggal_penetapan: new Date('2024-02-10'),
                file_penetapan_sumber_benih: '/uploads/penetapan/sp-002-2024.pdf',
                status: 2, // DITERIMA
                verifikator_id: null, // Will be updated with actual verifikator ID if needed
                catatan_verifikasi: 'Dokumen lengkap dan sesuai persyaratan',
                verify_at: new Date('2024-02-15'),
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                id: '550e8400-e29b-41d4-a716-446655440003',
                pemohon_id: pemohonData[2]?.id || pemohonData[0]?.id,
                nomor_penetapan: 'SP-003/2024',
                tanggal_penetapan: new Date('2024-03-05'),
                file_penetapan_sumber_benih: '/uploads/penetapan/sp-003-2024.pdf',
                status: 3, // DITOLAK
                verifikator_id: null, // Will be updated with actual verifikator ID if needed
                catatan_verifikasi: 'Dokumen tidak lengkap, silakan lengkapi persyaratan yang kurang',
                verify_at: new Date('2024-03-10'),
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        // Filter out entries with null pemohon_id
        const validSeedSourcesData = seedSourcesData.filter(item => item.pemohon_id);

        if (validSeedSourcesData.length > 0) {
            await queryInterface.bulkInsert('seed_sources', validSeedSourcesData);
            console.log(`Inserted ${validSeedSourcesData.length} seed source records`);
        } else {
            console.log('No valid pemohon data available for seed source seeder');
        }
    },

    async down(queryInterface: QueryInterface, Sequelize: Sequelize) {
        await queryInterface.bulkDelete('seed_sources', {
            id: [
                '550e8400-e29b-41d4-a716-446655440001',
                '550e8400-e29b-41d4-a716-446655440002',
                '550e8400-e29b-41d4-a716-446655440003',
            ]
        });
    },
};
