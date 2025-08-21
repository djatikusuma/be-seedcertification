import { QueryInterface, DataTypes } from 'sequelize';

export = {
    up: async (queryInterface: QueryInterface) => {
        // Add emailHash column for encrypted email searching
        await queryInterface.addColumn('users', 'emailHash', {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        });

        // Modify name column to TEXT for encrypted data
        await queryInterface.changeColumn('users', 'name', {
            type: DataTypes.TEXT,
            allowNull: false,
        });

        // Modify email column to TEXT for encrypted data
        await queryInterface.changeColumn('users', 'email', {
            type: DataTypes.TEXT,
            allowNull: false,
        });

        // Remove unique constraint from email column since encrypted data will be different
        try {
            await queryInterface.removeConstraint('users', 'users_email_key');
        } catch (error) {
            // Constraint might not exist or have different name
            console.log('Note: Could not remove email unique constraint, it might not exist');
        }
    },

    down: async (queryInterface: QueryInterface) => {
        // Remove emailHash column
        await queryInterface.removeColumn('users', 'emailHash');

        // Revert name column back to STRING
        await queryInterface.changeColumn('users', 'name', {
            type: DataTypes.STRING,
            allowNull: false,
        });

        // Revert email column back to STRING
        await queryInterface.changeColumn('users', 'email', {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        });
    },
};
