import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    Default,
    CreatedAt,
    UpdatedAt,
    BelongsTo,
    ForeignKey,
    AfterCreate,
    AfterFind,
    BeforeCreate,
    BeforeUpdate
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User.model';
import { CryptoUtil } from '../utils/crypto.util';

export enum ActionType {
    CREATE = 'create',
    READ = 'read',
    UPDATE = 'update',
    DELETE = 'delete',
    LOGIN = 'login',
    LOGOUT = 'logout',
    APPROVE = 'approve',
    REJECT = 'reject',
    UPLOAD = 'upload',
    DOWNLOAD = 'download',
    EXPORT = 'export',
    IMPORT = 'import',
    VERIFY = 'verify',
    REVOKE = 'revoke',
    TRANSFER = 'transfer',
    RESTORE = 'restore'
}

export enum EntityType {
    USER = 'user',
    TEMP_USER = 'temp_user',
    PROFILE = 'profile',
    PROFILE_APPLICANT = 'profile_applicant',
    ROLE = 'role',
    MENU = 'menu',
    SETTINGS = 'settings',
    BLOCKCHAIN_TRANSACTION = 'blockchain_transaction',
    BLOCKCHAIN_ASSET = 'blockchain_asset',
    BLOCKCHAIN_CERTIFICATE = 'blockchain_certificate',
    FILE = 'file',
    SYSTEM = 'system'
}

export enum SeverityLevel {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

export interface AuditTrailInterface {
    id: string;
    userId?: string;
    sessionId?: string;
    action: ActionType;
    entityType: EntityType;
    entityId?: string;
    oldData?: string;
    newData?: string;
    changes?: string;
    ipAddress?: string;
    userAgent?: string;
    endpoint?: string;
    httpMethod?: string;
    statusCode?: number;
    duration?: number;
    severity: SeverityLevel;
    tags?: string;
    metadata?: string;
    success: boolean;
    errorMessage?: string;
    stackTrace?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

@Table({
    tableName: 'audit_trails',
    timestamps: true,
    paranoid: false, // We don't want soft delete for audit trails
})
export class AuditTrail extends Model<AuditTrailInterface> implements AuditTrailInterface {
    @PrimaryKey
    @Default(() => uuidv4())
    @Column(DataType.UUID)
    id!: string;

    @ForeignKey(() => User)
    @Column(DataType.UUID)
    userId?: string;

    @Column(DataType.STRING(255))
    sessionId?: string;

    @Column({
        type: DataType.ENUM(...Object.values(ActionType)),
        allowNull: false
    })
    action!: ActionType;

    @Column({
        type: DataType.ENUM(...Object.values(EntityType)),
        allowNull: false
    })
    entityType!: EntityType;

    @Column(DataType.STRING(255))
    entityId?: string;

    @Column(DataType.TEXT('long'))
    oldData?: string;

    @Column(DataType.TEXT('long'))
    newData?: string;

    @Column(DataType.TEXT('long'))
    changes?: string;

    @Column(DataType.STRING(45))
    ipAddress?: string;

    @Column(DataType.TEXT)
    userAgent?: string;

    @Column(DataType.STRING(500))
    endpoint?: string;

    @Column(DataType.STRING(10))
    httpMethod?: string;

    @Column(DataType.INTEGER)
    statusCode?: number;

    @Column(DataType.INTEGER)
    duration?: number;

    @Column({
        type: DataType.ENUM(...Object.values(SeverityLevel)),
        allowNull: false,
        defaultValue: SeverityLevel.LOW
    })
    severity!: SeverityLevel;

    @Column(DataType.TEXT)
    tags?: string;

    @Column(DataType.TEXT('long'))
    metadata?: string;

    @Default(true)
    @Column(DataType.BOOLEAN)
    success!: boolean;

    @Column(DataType.TEXT)
    errorMessage?: string;

    @Column(DataType.TEXT('long'))
    stackTrace?: string;

    @CreatedAt
    createdAt!: Date;

    @UpdatedAt
    updatedAt!: Date;

    // Relations
    @BelongsTo(() => User, 'userId')
    user?: User;

    // Fields that should be encrypted
    private static readonly ENCRYPTED_FIELDS = [
        'oldData',
        'newData',
        'changes',
        'metadata',
        'stackTrace'
    ];

    @BeforeCreate
    @BeforeUpdate
    static async encryptSensitiveData(instance: AuditTrail) {
        AuditTrail.ENCRYPTED_FIELDS.forEach(field => {
            const value = instance.getDataValue(field as keyof AuditTrailInterface);
            if (value && typeof value === 'string' && !AuditTrail.isAlreadyEncrypted(value)) {
                const encryptedValue = CryptoUtil.encrypt(value);
                instance.setDataValue(field as keyof AuditTrailInterface, encryptedValue as any);
            }
        });
    }

    @AfterFind
    static async decryptSensitiveData(instances: AuditTrail | AuditTrail[] | null) {
        if (!instances) return;

        const auditTrails = Array.isArray(instances) ? instances : [instances];

        auditTrails.forEach(auditTrail => {
            if (auditTrail instanceof AuditTrail) {
                AuditTrail.decryptFields(auditTrail);
            }
        });
    }

    // Manual decrypt method for explicit decryption
    static manualDecrypt(instance: AuditTrail): void {
        AuditTrail.decryptFields(instance);
    }

    // Method to decrypt fields
    private static decryptFields(instance: AuditTrail) {
        AuditTrail.ENCRYPTED_FIELDS.forEach(field => {
            const value = instance.getDataValue(field as keyof AuditTrailInterface);
            if (value && typeof value === 'string' && AuditTrail.isAlreadyEncrypted(value)) {
                try {
                    const decryptedValue = CryptoUtil.decrypt(value);
                    instance.setDataValue(field as keyof AuditTrailInterface, decryptedValue as any);
                } catch (error) {
                    console.error(`Failed to decrypt field ${field} in audit trail:`, error);
                }
            }
        });
    }

    // Helper method to check if value is encrypted
    private static isAlreadyEncrypted(value: string): boolean {
        const parts = value.split(':');
        return parts.length === 3 &&
            parts[0].length > 0 &&
            parts[1].length > 0 &&
            parts[2].length > 0;
    }

    // Method to get masked audit data based on user role
    static getMaskedAuditData(auditTrail: AuditTrail, viewerRole: string): Partial<AuditTrailInterface> {
        const baseData: Partial<AuditTrailInterface> = {
            id: auditTrail.id,
            action: auditTrail.action,
            entityType: auditTrail.entityType,
            entityId: auditTrail.entityId,
            severity: auditTrail.severity,
            success: auditTrail.success,
            createdAt: auditTrail.createdAt
        };

        // Admin and auditor can see all data
        if (['admin', 'auditor'].includes(viewerRole)) {
            return {
                ...baseData,
                userId: auditTrail.userId,
                sessionId: auditTrail.sessionId,
                oldData: auditTrail.oldData,
                newData: auditTrail.newData,
                changes: auditTrail.changes,
                ipAddress: auditTrail.ipAddress,
                userAgent: auditTrail.userAgent,
                endpoint: auditTrail.endpoint,
                httpMethod: auditTrail.httpMethod,
                statusCode: auditTrail.statusCode,
                duration: auditTrail.duration,
                tags: auditTrail.tags,
                metadata: auditTrail.metadata,
                errorMessage: auditTrail.errorMessage,
                stackTrace: auditTrail.stackTrace
            };
        }

        // Supervisor can see most data but not sensitive details
        if (viewerRole === 'supervisor') {
            return {
                ...baseData,
                userId: auditTrail.userId,
                endpoint: auditTrail.endpoint,
                httpMethod: auditTrail.httpMethod,
                statusCode: auditTrail.statusCode,
                duration: auditTrail.duration,
                errorMessage: auditTrail.errorMessage
            };
        }

        // Regular users can only see basic information
        return baseData;
    }

    // Static method to create audit trail
    static async createAuditLog(data: Partial<AuditTrailInterface>): Promise<AuditTrail> {
        try {
            if (
                !data.action ||
                !data.entityType ||
                !data.severity ||
                typeof data.success !== 'boolean'
            ) {
                throw new Error('Missing required fields for AuditTrail creation');
            }
            return await AuditTrail.create(data as AuditTrailInterface);
        } catch (error) {
            console.error('Failed to create audit log:', error);
            throw error;
        }
    }

    // Method to search audit trails with filters
    static async searchAuditTrails(filters: {
        userId?: string;
        action?: ActionType;
        entityType?: EntityType;
        entityId?: string;
        startDate?: Date;
        endDate?: Date;
        severity?: SeverityLevel;
        success?: boolean;
        ipAddress?: string;
        page?: number;
        limit?: number;
    }) {
        const {
            userId,
            action,
            entityType,
            entityId,
            startDate,
            endDate,
            severity,
            success,
            ipAddress,
            page = 1,
            limit = 50
        } = filters;

        const where: any = {};

        if (userId) where.userId = userId;
        if (action) where.action = action;
        if (entityType) where.entityType = entityType;
        if (entityId) where.entityId = entityId;
        if (severity) where.severity = severity;
        if (success !== undefined) where.success = success;
        if (ipAddress) where.ipAddress = ipAddress;

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = startDate;
            if (endDate) where.createdAt.lte = endDate;
        }

        const offset = (page - 1) * limit;

        const { rows: data, count: total } = await AuditTrail.findAndCountAll({
            where,
            include: [{
                model: User,
                attributes: ['id', 'name', 'email']
            }],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        return {
            data,
            pagination: {
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                limit
            }
        };
    }
}

export default AuditTrail;
