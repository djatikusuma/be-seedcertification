import { QueryInterface, DataTypes } from 'sequelize';

export = {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable('audit_trails', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            sessionId: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            action: {
                type: DataTypes.ENUM(
                    'create', 'read', 'update', 'delete', 'login', 'logout',
                    'approve', 'reject', 'upload', 'download', 'export', 'import',
                    'verify', 'revoke', 'transfer', 'restore'
                ),
                allowNull: false
            },
            entityType: {
                type: DataTypes.ENUM(
                    'user', 'temp_user', 'profile', 'profile_applicant', 'role',
                    'menu', 'settings', 'blockchain_transaction', 'blockchain_asset',
                    'blockchain_certificate', 'file', 'system'
                ),
                allowNull: false
            },
            entityId: {
                type: DataTypes.STRING(255),
                allowNull: true
            },
            oldData: {
                type: DataTypes.TEXT('long'),
                allowNull: true
            },
            newData: {
                type: DataTypes.TEXT('long'),
                allowNull: true
            },
            changes: {
                type: DataTypes.TEXT('long'),
                allowNull: true
            },
            ipAddress: {
                type: DataTypes.STRING(45),
                allowNull: true
            },
            userAgent: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            endpoint: {
                type: DataTypes.STRING(500),
                allowNull: true
            },
            httpMethod: {
                type: DataTypes.STRING(10),
                allowNull: true
            },
            statusCode: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            duration: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            severity: {
                type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
                allowNull: false,
                defaultValue: 'low'
            },
            tags: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            metadata: {
                type: DataTypes.TEXT('long'),
                allowNull: true
            },
            success: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            errorMessage: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            stackTrace: {
                type: DataTypes.TEXT('long'),
                allowNull: true
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            }
        });

        // Add indexes for better query performance
        await queryInterface.addIndex('audit_trails', ['userId']);
        await queryInterface.addIndex('audit_trails', ['action']);
        await queryInterface.addIndex('audit_trails', ['entityType']);
        await queryInterface.addIndex('audit_trails', ['entityId']);
        await queryInterface.addIndex('audit_trails', ['severity']);
        await queryInterface.addIndex('audit_trails', ['success']);
        await queryInterface.addIndex('audit_trails', ['createdAt']);
        await queryInterface.addIndex('audit_trails', ['ipAddress']);
        await queryInterface.addIndex('audit_trails', ['sessionId']);

        // Composite indexes for common query patterns
        await queryInterface.addIndex('audit_trails', ['entityType', 'entityId']);
        await queryInterface.addIndex('audit_trails', ['userId', 'createdAt']);
        await queryInterface.addIndex('audit_trails', ['action', 'entityType']);
        await queryInterface.addIndex('audit_trails', ['severity', 'createdAt']);
        await queryInterface.addIndex('audit_trails', ['success', 'createdAt']);
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable('audit_trails');
    }
};
