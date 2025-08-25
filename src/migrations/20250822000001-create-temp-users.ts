import { QueryInterface, DataTypes } from 'sequelize';

export = {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable('temp_users', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            userType: {
                type: DataTypes.ENUM('perusahaan', 'petani'),
                allowNull: false,
            },
            nik: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            nikHash: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true,
            },
            namaPemohon: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            email: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            emailHash: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true,
            },
            telepon: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            npwp: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            alamatPemohon: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            verificationStatus: {
                type: DataTypes.ENUM('pending', 'approved', 'rejected'),
                allowNull: false,
                defaultValue: 'pending',
            },
            verificationNotes: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            verifiedBy: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            },
            verifiedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            deletedAt: {
                type: DataTypes.DATE,
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

        // Add indexes for performance
        await queryInterface.addIndex('temp_users', ['verificationStatus'], {
            name: 'idx_temp_users_verification_status',
        });

        await queryInterface.addIndex('temp_users', ['userType'], {
            name: 'idx_temp_users_user_type',
        });

        await queryInterface.addIndex('temp_users', ['createdAt'], {
            name: 'idx_temp_users_created_at',
        });
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable('temp_users');
    }
};
