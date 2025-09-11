import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.addColumn('recommendations', 'seedsource_id', {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'seed_sources',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('recommendations', 'verifikator_id', {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('recommendations', 'inspektur_ketua_id', {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('recommendations', 'inspektur_id', {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('recommendations', ['seedsource_id'], {
        name: 'idx_recommendations_seedsource_id'
    });

    await queryInterface.addIndex('recommendations', ['verifikator_id'], {
        name: 'idx_recommendations_verifikator_id'
    });

    await queryInterface.addIndex('recommendations', ['inspektur_ketua_id'], {
        name: 'idx_recommendations_inspektur_ketua_id'
    });

    await queryInterface.addIndex('recommendations', ['inspektur_id'], {
        name: 'idx_recommendations_inspektur_id'
    });
}; export const down = async (queryInterface: QueryInterface): Promise<void> => {
    // Remove indexes first
    await queryInterface.removeIndex('recommendations', 'idx_recommendations_inspektur_id');
    await queryInterface.removeIndex('recommendations', 'idx_recommendations_inspektur_ketua_id');
    await queryInterface.removeIndex('recommendations', 'idx_recommendations_verifikator_id');
    await queryInterface.removeIndex('recommendations', 'idx_recommendations_seedsource_id');

    // Remove columns
    await queryInterface.removeColumn('recommendations', 'inspektur_id');
    await queryInterface.removeColumn('recommendations', 'inspektur_ketua_id');
    await queryInterface.removeColumn('recommendations', 'verifikator_id');
    await queryInterface.removeColumn('recommendations', 'seedsource_id');
};
