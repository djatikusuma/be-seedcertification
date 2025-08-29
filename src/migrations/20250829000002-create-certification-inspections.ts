import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('certification_inspections', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        certification_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'certifications',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        },
        jumlah_benih: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        jumlah_diperiksa: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        jumlah_lolos: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        jumlah_tidak_lolos: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        jumlah_belum_lolos: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        persentase_kemurnian: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            comment: 'Persentase kemurnian dalam %',
        },
        kadar_air: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            comment: 'Kadar air dalam %',
        },
        daya_berkecambah: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            comment: 'Daya berkecambah dalam %',
        },
        catatan: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Catatan hasil pemeriksaan',
        },
        status_pemeriksaan: {
            type: DataTypes.ENUM('lolos', 'tidak_lolos', 'pending'),
            allowNull: false,
            defaultValue: 'pending',
        },
        file_dokumen_hasil_pemeriksaan: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        pemeriksa_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
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

    // Add indexes
    await queryInterface.addIndex('certification_inspections', ['certification_id']);
    await queryInterface.addIndex('certification_inspections', ['pemeriksa_id']);
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('certification_inspections');
};
