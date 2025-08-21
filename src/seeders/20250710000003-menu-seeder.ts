import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export = {
    up: async (queryInterface: QueryInterface) => {
        const dashboardId = uuidv4();
        const usersId = uuidv4();
        const settingsId = uuidv4();

        await queryInterface.bulkInsert('menus', [
            {
                id: dashboardId,
                menuName: 'Dashboard',
                path: '/dashboard',
                icon: 'dashboard-icon',
                parentId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: usersId,
                menuName: 'Users',
                path: '/users',
                icon: 'users-icon',
                parentId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: settingsId,
                menuName: 'Settings',
                path: '/settings',
                icon: 'settings-icon',
                parentId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                menuName: 'User Profiles',
                path: '/users/profiles',
                icon: 'profile-icon',
                parentId: usersId,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                id: uuidv4(),
                menuName: 'User Roles',
                path: '/users/roles',
                icon: 'role-icon',
                parentId: usersId,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.bulkDelete('menus', {});
    },
};
