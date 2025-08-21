import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('profile_applicants', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        nik: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        npwp: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        namaPemohon: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        telepon: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        alamatPemohon: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        fotoPemohon: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        alamatPerusahaan: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        lokasiPerbenihan: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        nikKuasa: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        namaKuasa: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        fotoKuasa: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        fileAktaPendirian: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        fileKtp: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        fileNpwp: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        fileSuratKuasa: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        statusKepemilikan: {
            type: DataTypes.ENUM('Milik Sendiri', 'Sewa', 'Bagi Hasil'),
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    });

    // Add indexes
    await queryInterface.addIndex('profile_applicants', ['userId'], {
        name: 'idx_profile_applicants_user_id',
        unique: true,
    });

    await queryInterface.addIndex('profile_applicants', ['nik'], {
        name: 'idx_profile_applicants_nik',
    });

    await queryInterface.addIndex('profile_applicants', ['email'], {
        name: 'idx_profile_applicants_email',
    });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('profile_applicants');
}
