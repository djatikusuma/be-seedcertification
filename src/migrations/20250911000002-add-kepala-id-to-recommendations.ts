import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.addColumn('recommendations', 'kepala_id', {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    });

    // Add index for better query performance
    await queryInterface.addIndex('recommendations', ['kepala_id'], {
        name: 'idx_recommendations_kepala_id'
    });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
    // Remove index first
    await queryInterface.removeIndex('recommendations', 'idx_recommendations_kepala_id');

    // Remove column
    await queryInterface.removeColumn('recommendations', 'kepala_id');
};
