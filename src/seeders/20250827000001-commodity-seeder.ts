import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
    const commodities = [
        {
            id: uuidv4(),
            code: 'CPO',
            nama: 'Crude Palm Oil',
            nama_latin: 'Elaeis guineensis',
            smsb: 1,
            smb: 1,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            id: uuidv4(),
            code: 'PKO',
            nama: 'Palm Kernel Oil',
            nama_latin: 'Elaeis guineensis (kernel)',
            smsb: 1,
            smb: 1,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            id: uuidv4(),
            code: 'KOPI',
            nama: 'Kopi Arabika',
            nama_latin: 'Coffea arabica',
            smsb: 1,
            smb: 1,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            id: uuidv4(),
            code: 'KAKAO',
            nama: 'Kakao',
            nama_latin: 'Theobroma cacao',
            smsb: 1,
            smb: 1,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            id: uuidv4(),
            code: 'KARET',
            nama: 'Karet',
            nama_latin: 'Hevea brasiliensis',
            smsb: 1,
            smb: 1,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date(),
        },
    ];

    await queryInterface.bulkInsert('commodities', commodities);
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.bulkDelete('commodities', {}, {});
};
