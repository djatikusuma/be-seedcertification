import { QueryInterface, DataTypes } from 'sequelize';

export = {
    up: async (queryInterface: QueryInterface) => {
        // Check if emailHash column exists, add only if it doesn't
        const tableInfo = await queryInterface.describeTable('users');

        if (!tableInfo.emailHash) {
            await queryInterface.addColumn('users', 'emailHash', {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true,
            });
        }

        // Check if columns are already TEXT type
        if (tableInfo.name && tableInfo.name.type !== 'TEXT') {
            // Create new column with TEXT type
            await queryInterface.addColumn('users', 'name_new', {
                type: DataTypes.TEXT,
                allowNull: true,
            });

            // Copy data from old column to new column
            await queryInterface.sequelize.query('UPDATE users SET name_new = name');

            // Drop old column and rename new column
            await queryInterface.removeColumn('users', 'name');
            await queryInterface.renameColumn('users', 'name_new', 'name');

            // Make it NOT NULL
            await queryInterface.changeColumn('users', 'name', {
                type: DataTypes.TEXT,
                allowNull: false,
            });
        }

        if (tableInfo.email && tableInfo.email.type !== 'TEXT') {
            // Create new column with TEXT type
            await queryInterface.addColumn('users', 'email_new', {
                type: DataTypes.TEXT,
                allowNull: true,
            });

            // Copy data from old column to new column
            await queryInterface.sequelize.query('UPDATE users SET email_new = email');

            // Drop old column (this will remove the unique constraint automatically)
            await queryInterface.removeColumn('users', 'email');
            await queryInterface.renameColumn('users', 'email_new', 'email');

            // Make it NOT NULL
            await queryInterface.changeColumn('users', 'email', {
                type: DataTypes.TEXT,
                allowNull: false,
            });
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
