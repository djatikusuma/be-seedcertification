import { QueryInterface, DataTypes } from 'sequelize';

export default {
    up: async (queryInterface: QueryInterface): Promise<void> => {
        await queryInterface.addColumn('users', 'deletionRequested', {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });

        await queryInterface.addColumn('users', 'deletionRequestDate', {
            type: DataTypes.DATE,
            allowNull: true
        });
    },

    down: async (queryInterface: QueryInterface): Promise<void> => {
        await queryInterface.removeColumn('users', 'deletionRequestDate');
        await queryInterface.removeColumn('users', 'deletionRequested');
    }
};
