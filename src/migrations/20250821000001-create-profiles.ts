import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
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

    // Add indexes
    await queryInterface.addIndex('profiles', ['userId'], {
        name: 'idx_profiles_user_id',
        unique: true,
    });

    await queryInterface.addIndex('profiles', ['nik'], {
        name: 'idx_profiles_nik',
    });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('profiles');
}
