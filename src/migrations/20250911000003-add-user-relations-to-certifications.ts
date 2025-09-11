import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.addColumn('certifications', 'verifikator_id', {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('certifications', 'inspektur_ketua_id', {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('certifications', 'inspektur_id', {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('certifications', 'kepala_id', {
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
    await queryInterface.addIndex('certifications', ['verifikator_id'], {
        name: 'idx_certifications_verifikator_id'
    });

    await queryInterface.addIndex('certifications', ['inspektur_ketua_id'], {
        name: 'idx_certifications_inspektur_ketua_id'
    });

    await queryInterface.addIndex('certifications', ['inspektur_id'], {
        name: 'idx_certifications_inspektur_id'
    });

    await queryInterface.addIndex('certifications', ['kepala_id'], {
        name: 'idx_certifications_kepala_id'
    });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
    // Remove indexes first
    await queryInterface.removeIndex('certifications', 'idx_certifications_kepala_id');
    await queryInterface.removeIndex('certifications', 'idx_certifications_inspektur_id');
    await queryInterface.removeIndex('certifications', 'idx_certifications_inspektur_ketua_id');
    await queryInterface.removeIndex('certifications', 'idx_certifications_verifikator_id');

    // Remove columns
    await queryInterface.removeColumn('certifications', 'kepala_id');
    await queryInterface.removeColumn('certifications', 'inspektur_id');
    await queryInterface.removeColumn('certifications', 'inspektur_ketua_id');
    await queryInterface.removeColumn('certifications', 'verifikator_id');
};
