import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

const adminRoleId = uuidv4();
const userRoleId = uuidv4();
const petaniRoleId = uuidv4();
const perusahaanRoleId = uuidv4();

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
                roleName: 'Petani',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: perusahaanRoleId,
                roleName: 'Perusahaan',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.bulkDelete('roles', {});
    },
};
