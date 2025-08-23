import { QueryInterface, DataTypes } from 'sequelize';

export = {
    up: async (queryInterface: QueryInterface) => {
        // Check if table already exists
        const tables = await queryInterface.showAllTables();
        if (tables.includes('profiles')) {
            console.log('Table profiles already exists, skipping creation');
            return;
        }

        await queryInterface.createTable('profiles', {
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
            nip: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            nik: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            nama: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            jabatan: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            telepon: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            alamat: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            golongan: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            pangkat: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            fotoUrl: {
                type: DataTypes.STRING,
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

        // Add index for nik (non-unique for search performance) - check if exists first
        try {
            await queryInterface.addIndex('profiles', ['nik'], {
                name: 'idx_profiles_nik',
            });
        } catch (error) {
            console.log('Index idx_profiles_nik already exists, skipping');
        }
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable('profiles');
    }

};
