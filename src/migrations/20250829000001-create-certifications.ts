import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('certifications', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        nomor_registrasi: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        nomor_surat_sertifikat: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        tanggal_surat_sertifikat: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        tanggal_expired_sertifikat: {
            type: DataTypes.DATE,
            allowNull: true,
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
        rekomendasi_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'recommendations',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
        },
        komoditas_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'commodities',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
        },
        tipe: {
            type: DataTypes.ENUM('siaptanam', 'pratanam'),
            allowNull: false,
        },
        jumlah_benih: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        satuan: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        varietas: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: '1: Verifikasi Dokumen, 2: Penjadwalan, 3: Verifikasi Lapangan, 4: Pengesahan, 5: Penerbitan, 6: Selesai, 7: Ditolak',
        },
        catatan_administrasi: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        catatan_pemeriksaan: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        catatan_validasi: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        pemeriksa: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Array of inspector user IDs',
        },
        tanggal_jadwal_pemeriksaan: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        tanggal_pemeriksaan: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        file_surat_sertifikat: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        file_asal_benih: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        file_dokumen_pendukung: {
            type: DataTypes.STRING(255),
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

    // Add indexes
    await queryInterface.addIndex('certifications', ['nomor_registrasi']);
    await queryInterface.addIndex('certifications', ['pemohon_id']);
    await queryInterface.addIndex('certifications', ['status']);
    await queryInterface.addIndex('certifications', ['tipe']);
    await queryInterface.addIndex('certifications', ['created_at']);
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('certifications');
};
