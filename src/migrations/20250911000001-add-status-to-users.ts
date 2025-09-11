import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.addColumn('users', 'status', {
        type: DataTypes.ENUM('active', 'not_active', 'revoked'),
        allowNull: false,
        defaultValue: 'active',
        comment: 'User status: active (normal user), not_active (temporarily disabled), revoked (permanently disabled)'
    });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeColumn('users', 'status');
};
