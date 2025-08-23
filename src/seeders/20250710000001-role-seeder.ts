import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

const adminRoleId = uuidv4();
const userRoleId = uuidv4();
const petaniRoleId = uuidv4();
const perusahaanRoleId = uuidv4();
const inspekturRoleId = uuidv4();
const inspekturKetuaRoleId = uuidv4();
const verifikaturRoleId = uuidv4();
const kepalaRoleId = uuidv4();

export = {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.bulkInsert('roles', [
            {
                id: adminRoleId,
                roleName: 'admin',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: userRoleId,
                roleName: 'user',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: petaniRoleId,
                roleName: 'petani',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: perusahaanRoleId,
                roleName: 'perusahaan',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: inspekturKetuaRoleId,
                roleName: 'inspektur_ketua',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: inspekturRoleId,
                roleName: 'inspektur',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: verifikaturRoleId,
                roleName: 'verifikatur',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: kepalaRoleId,
                roleName: 'kepala',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.bulkDelete('roles', {});
    },
};
