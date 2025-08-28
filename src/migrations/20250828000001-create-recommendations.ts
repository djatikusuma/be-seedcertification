import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('recommendations', {
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
        nomor_rekomendasi: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        surat_rekomendasi: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        tanggal_surat_rekomendasi: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        pemodalan: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
        },
        pemeriksa: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Array of inspector user IDs',
        },
        tenaga_kerja_sd: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        tenaga_kerja_smp: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        tenaga_kerja_sma: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        tenaga_kerja_s1_tani: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        tenaga_kerja_s1_nontani: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
        },
        tanggal_verifikasi_dokumen: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        tanggal_verifikasi_penjadwalan: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        tanggal_verifikasi_lapangan: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        tanggal_verifikasi_penerbitan: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        tanggal_pemeriksaan: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        is_sertifikasi: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            comment: '1: Verifikasi Dokumen, 2: Penjadwalan Pemeriksaan Lapangan, 3: Verifikasi Lapangan, 4: Penerbitan Surat Rekomendasi, 5: Selesai, 6: Ditolak',
        },
        catatan_verifikasi: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        catatan_pemeriksaan: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        file_penguasaan_benih: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        link_dokumen_pendukung: {
            type: DataTypes.TEXT,
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
    await queryInterface.addIndex('recommendations', ['pemohon_id']);
    await queryInterface.addIndex('recommendations', ['status']);
    await queryInterface.addIndex('recommendations', ['nomor_rekomendasi']);
    await queryInterface.addIndex('recommendations', ['created_at']);
    await queryInterface.addIndex('recommendations', ['deleted_at']);
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('recommendations');
};
