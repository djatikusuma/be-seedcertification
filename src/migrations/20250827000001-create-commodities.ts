import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('commodities', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
        },
        nama: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        nama_latin: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        smsb: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        smb: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
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
    await queryInterface.addIndex('commodities', ['code']);
    await queryInterface.addIndex('commodities', ['is_active']);
    await queryInterface.addIndex('commodities', ['deleted_at']);
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('commodities');
};
