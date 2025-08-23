import { QueryInterface, DataTypes } from 'sequelize';

export = {
    up: async (queryInterface: QueryInterface) => {
        // Add nikHash to profiles table
        try {
            await queryInterface.addColumn('profiles', 'nikHash', {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true
            });
        } catch (error) {
            console.log('Column nikHash already exists in profiles, skipping');
        }

        // Add nikHash and emailHash to profile_applicants table
        try {
            await queryInterface.addColumn('profile_applicants', 'nikHash', {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true
            });
        } catch (error) {
            console.log('Column nikHash already exists in profile_applicants, skipping');
        }

        try {
            await queryInterface.addColumn('profile_applicants', 'emailHash', {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true
            });
        } catch (error) {
            console.log('Column emailHash already exists in profile_applicants, skipping');
        }

        // Remove indexes before changing column types to TEXT
        try {
            await queryInterface.removeIndex('profiles', 'idx_profiles_nik');
        } catch (error) {
            console.log('Index idx_profiles_nik does not exist or already removed');
        }

        try {
            await queryInterface.removeIndex('profile_applicants', 'idx_profile_applicants_nik');
        } catch (error) {
            console.log('Index idx_profile_applicants_nik does not exist or already removed');
        }

        try {
            await queryInterface.removeIndex('profile_applicants', 'idx_profile_applicants_email');
        } catch (error) {
            console.log('Index idx_profile_applicants_email does not exist or already removed');
        }

        // Change data types to TEXT for encrypted fields in profiles
        await queryInterface.changeColumn('profiles', 'nik', {
            type: DataTypes.TEXT,
            allowNull: false
        });

        await queryInterface.changeColumn('profiles', 'nama', {
            type: DataTypes.TEXT,
            allowNull: false
        });

        await queryInterface.changeColumn('profiles', 'telepon', {
            type: DataTypes.TEXT,
            allowNull: true
        });

        await queryInterface.changeColumn('profiles', 'alamat', {
            type: DataTypes.TEXT,
            allowNull: true
        });

        // Change data types to TEXT for encrypted fields in profile_applicants
        await queryInterface.changeColumn('profile_applicants', 'nik', {
            type: DataTypes.TEXT,
            allowNull: false
        });

        await queryInterface.changeColumn('profile_applicants', 'npwp', {
            type: DataTypes.TEXT,
            allowNull: true
        });

        await queryInterface.changeColumn('profile_applicants', 'email', {
            type: DataTypes.TEXT,
            allowNull: false
        });

        await queryInterface.changeColumn('profile_applicants', 'namaPemohon', {
            type: DataTypes.TEXT,
            allowNull: false
        });

        await queryInterface.changeColumn('profile_applicants', 'telepon', {
            type: DataTypes.TEXT,
            allowNull: true
        });

        await queryInterface.changeColumn('profile_applicants', 'alamatPemohon', {
            type: DataTypes.TEXT,
            allowNull: true
        });

        await queryInterface.changeColumn('profile_applicants', 'alamatPerusahaan', {
            type: DataTypes.TEXT,
            allowNull: true
        });

        await queryInterface.changeColumn('profile_applicants', 'nikKuasa', {
            type: DataTypes.TEXT,
            allowNull: true
        });

        await queryInterface.changeColumn('profile_applicants', 'namaKuasa', {
            type: DataTypes.TEXT,
            allowNull: true
        });
    },

    down: async (queryInterface: QueryInterface) => {
        // Remove hash columns
        await queryInterface.removeColumn('profiles', 'nikHash');
        await queryInterface.removeColumn('profile_applicants', 'nikHash');
        await queryInterface.removeColumn('profile_applicants', 'emailHash');

        // Revert data types back to STRING (Note: this might cause data loss if encrypted data is longer than VARCHAR limit)
        await queryInterface.changeColumn('profiles', 'nik', {
            type: DataTypes.STRING,
            allowNull: false
        });

        await queryInterface.changeColumn('profiles', 'nama', {
            type: DataTypes.STRING,
            allowNull: false
        });

        await queryInterface.changeColumn('profiles', 'telepon', {
            type: DataTypes.STRING,
            allowNull: true
        });

        await queryInterface.changeColumn('profiles', 'alamat', {
            type: DataTypes.TEXT, // Keep as TEXT since it was already TEXT
            allowNull: true
        });

        // Revert profile_applicants data types
        await queryInterface.changeColumn('profile_applicants', 'nik', {
            type: DataTypes.STRING,
            allowNull: false
        });

        await queryInterface.changeColumn('profile_applicants', 'npwp', {
            type: DataTypes.STRING,
            allowNull: true
        });

        await queryInterface.changeColumn('profile_applicants', 'email', {
            type: DataTypes.STRING,
            allowNull: false
        });

        await queryInterface.changeColumn('profile_applicants', 'namaPemohon', {
            type: DataTypes.STRING,
            allowNull: false
        });

        await queryInterface.changeColumn('profile_applicants', 'telepon', {
            type: DataTypes.STRING,
            allowNull: true
        });

        await queryInterface.changeColumn('profile_applicants', 'alamatPemohon', {
            type: DataTypes.TEXT, // Keep as TEXT since it was already TEXT
            allowNull: true
        });

        await queryInterface.changeColumn('profile_applicants', 'alamatPerusahaan', {
            type: DataTypes.TEXT, // Keep as TEXT since it was already TEXT
            allowNull: true
        });

        await queryInterface.changeColumn('profile_applicants', 'nikKuasa', {
            type: DataTypes.STRING,
            allowNull: true
        });

        await queryInterface.changeColumn('profile_applicants', 'namaKuasa', {
            type: DataTypes.STRING,
            allowNull: true
        });
    }
};
