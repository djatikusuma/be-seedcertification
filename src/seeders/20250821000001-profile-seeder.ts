import { QueryInterface, QueryTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export = {
    up: async (queryInterface: QueryInterface) => {
        // Get some existing user IDs from the user table
        const users = await queryInterface.sequelize.query(
            `SELECT id, roleId FROM users WHERE roleId IN (
                SELECT id FROM roles WHERE roleName IN ('admin', 'user')
            ) LIMIT 3`,
            { type: QueryTypes.SELECT }
        ) as Array<{ id: string; roleId: string }>;

        if (users.length === 0) {
            console.log('No users found for profile seeding');
            return;
        }

        const profilesData = users.map((user, index) => ({
            id: uuidv4(),
            userId: user.id,
            nip: `NIP${String(index + 1).padStart(6, '0')}`,
            nik: `331234567890123${index}`,
            nama: `Pegawai Internal ${index + 1}`,
            jabatan: index === 0 ? 'Kepala Dinas' : index === 1 ? 'Sekretaris' : 'Staff Teknis',
            telepon: `08123456789${index}`,
            alamat: `Jl. Contoh No. ${index + 1}, Jakarta`,
            golongan: index === 0 ? 'IV/a' : index === 1 ? 'III/d' : 'III/a',
            pangkat: index === 0 ? 'Pembina' : index === 1 ? 'Penata Tk. I' : 'Penata',
            fotoUrl: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));

        await queryInterface.bulkInsert('profiles', profilesData);
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.bulkDelete('profiles', {});
    },
};
