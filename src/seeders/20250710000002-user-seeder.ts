import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Get roles from the database
const getAdminRole = async (queryInterface: QueryInterface) => {
    const roles = await queryInterface.sequelize.query(
        'SELECT id FROM roles WHERE roleName = "admin"',
        { type: 'SELECT' }
    );
    if (roles.length > 0 && typeof roles[0] === 'object' && roles[0] !== null) {
        return (roles[0] as any).id;
    }
    return uuidv4();
};

export = {
    up: async (queryInterface: QueryInterface) => {
        // Get admin role ID
        const adminRoleId = await getAdminRole(queryInterface);

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        await queryInterface.bulkInsert('users', [
            {
                id: uuidv4(),
                name: 'Admin User',
                email: 'admin@example.com',
                password: hashedPassword,
                roleId: adminRoleId,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.bulkDelete('users', {});
    },
};
