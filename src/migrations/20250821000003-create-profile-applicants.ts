import { QueryInterface, DataTypes } from 'sequelize';

export = {
    up: async (queryInterface: QueryInterface) => {
        // Check if table already exists
        const tables = await queryInterface.showAllTables();
        if (tables.includes('profile_applicants')) {
            console.log('Table profile_applicants already exists, skipping creation');
            return;
        }

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

        // Add indexes for search performance (userId already has unique constraint from column definition)
        try {
            await queryInterface.addIndex('profile_applicants', ['nik'], {
                name: 'idx_profile_applicants_nik',
            });
        } catch (error) {
            console.log('Index idx_profile_applicants_nik already exists, skipping');
        }

        try {
            await queryInterface.addIndex('profile_applicants', ['email'], {
                name: 'idx_profile_applicants_email',
            });
        } catch (error) {
            console.log('Index idx_profile_applicants_email already exists, skipping');
        }
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable('profile_applicants');
    }

};
