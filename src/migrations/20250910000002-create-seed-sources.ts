import { QueryInterface, DataTypes } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface: QueryInterface) {
        await queryInterface.createTable('seed_sources', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            pemohon_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'profile_applicants',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            nomor_penetapan: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            tanggal_penetapan: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            file_penetapan_sumber_benih: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            status: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
                comment: '1: Verifikasi Dokumen, 2: Diterima, 3: Ditolak',
            },
            verifikator_id: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            catatan_verifikasi: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            verify_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            deleted_at: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        });

        // Add indexes for better performance
        await queryInterface.addIndex('seed_sources', ['pemohon_id']);
        await queryInterface.addIndex('seed_sources', ['verifikator_id']);
        await queryInterface.addIndex('seed_sources', ['status']);
        await queryInterface.addIndex('seed_sources', ['created_at']);
    },

    async down(queryInterface: QueryInterface) {
        await queryInterface.dropTable('seed_sources');
    },
};
