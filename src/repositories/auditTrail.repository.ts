import { BaseRepository } from './base.repository';
import { AuditTrail, ActionType, EntityType, SeverityLevel, AuditTrailInterface } from '../models/AuditTrail.model';
import { User } from '../models/User.model';
import { Op } from 'sequelize';

export class AuditTrailRepository extends BaseRepository<AuditTrail> {
    constructor() {
        super(AuditTrail);
    }

    // Create audit log entry
    async createAuditLog(data: Partial<AuditTrailInterface>): Promise<AuditTrail> {
        try {
            return await this.create(data);
        } catch (error) {
            console.error('Error creating audit log:', error);
            throw error;
        }
    }

    // Get audit trails with advanced filtering
    async getAuditTrails(filters: {
        userId?: string;
        sessionId?: string;
        action?: ActionType | ActionType[];
        entityType?: EntityType | EntityType[];
        entityId?: string;
        startDate?: Date;
        endDate?: Date;
        severity?: SeverityLevel | SeverityLevel[];
        success?: boolean;
        ipAddress?: string;
        endpoint?: string;
        tags?: string[];
        page?: number;
        limit?: number;
    }) {
        const {
            userId,
            sessionId,
            action,
            entityType,
            entityId,
            startDate,
            endDate,
            severity,
            success,
            ipAddress,
            endpoint,
            tags,
            page = 1,
            limit = 50
        } = filters;

        const where: any = {};

        // Build where conditions
        if (userId) where.userId = userId;
        if (sessionId) where.sessionId = sessionId;
        if (action) {
            where.action = Array.isArray(action) ? { [Op.in]: action } : action;
        }
        if (entityType) {
            where.entityType = Array.isArray(entityType) ? { [Op.in]: entityType } : entityType;
        }
        if (entityId) where.entityId = entityId;
        if (severity) {
            where.severity = Array.isArray(severity) ? { [Op.in]: severity } : severity;
        }
        if (success !== undefined) where.success = success;
        if (ipAddress) where.ipAddress = ipAddress;
        if (endpoint) where.endpoint = { [Op.like]: `%${endpoint}%` };

        if (tags && tags.length > 0) {
            const tagConditions = tags.map(tag => ({ tags: { [Op.like]: `%${tag}%` } }));
            where[Op.or] = tagConditions;
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt[Op.gte] = startDate;
            if (endDate) where.createdAt[Op.lte] = endDate;
        }

        const offset = (page - 1) * limit;

        try {
            const { rows: data, count: total } = await this.model.findAndCountAll({
                where,
                include: [{
                    model: User,
                    attributes: ['id', 'name', 'email'],
                    required: false
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
        } catch (error) {
            console.error('Error getting audit trails:', error);
            throw error;
        }
    }

    // Get audit trail by ID
    async getAuditTrailById(id: string): Promise<AuditTrail | null> {
        try {
            return await this.model.findByPk(id, {
                include: [{
                    model: User,
                    attributes: ['id', 'name', 'email']
                }]
            });
        } catch (error) {
            console.error('Error getting audit trail by ID:', error);
            throw error;
        }
    }

    // Get user activity summary
    async getUserActivitySummary(userId: string, days: number = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const activities = await this.model.findAll({
                where: {
                    userId,
                    createdAt: {
                        [Op.gte]: startDate
                    }
                },
                attributes: [
                    'action',
                    'entityType',
                    'success',
                    [this.model.sequelize!.fn('COUNT', '*'), 'count'],
                    [this.model.sequelize!.fn('DATE', this.model.sequelize!.col('createdAt')), 'date']
                ],
                group: ['action', 'entityType', 'success', 'date'],
                order: [['date', 'DESC']]
            });

            return activities;
        } catch (error) {
            console.error('Error getting user activity summary:', error);
            throw error;
        }
    }

    // Get system activity statistics
    async getSystemActivityStats(days: number = 7) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const stats = await this.model.findAll({
                where: {
                    createdAt: {
                        [Op.gte]: startDate
                    }
                },
                attributes: [
                    'action',
                    'entityType',
                    'severity',
                    'success',
                    [this.model.sequelize!.fn('COUNT', '*'), 'count'],
                    [this.model.sequelize!.fn('AVG', this.model.sequelize!.col('duration')), 'avgDuration']
                ],
                group: ['action', 'entityType', 'severity', 'success'],
                order: [[this.model.sequelize!.fn('COUNT', '*'), 'DESC']]
            });

            return stats;
        } catch (error) {
            console.error('Error getting system activity stats:', error);
            throw error;
        }
    }

    // Get failed operations
    async getFailedOperations(hours: number = 24) {
        try {
            const startDate = new Date();
            startDate.setHours(startDate.getHours() - hours);

            return await this.model.findAll({
                where: {
                    success: false,
                    createdAt: {
                        [Op.gte]: startDate
                    }
                },
                include: [{
                    model: User,
                    attributes: ['id', 'name', 'email']
                }],
                order: [['createdAt', 'DESC']],
                limit: 100
            });
        } catch (error) {
            console.error('Error getting failed operations:', error);
            throw error;
        }
    }

    // Get security events (high/critical severity)
    async getSecurityEvents(days: number = 7) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            return await this.model.findAll({
                where: {
                    severity: {
                        [Op.in]: [SeverityLevel.HIGH, SeverityLevel.CRITICAL]
                    },
                    createdAt: {
                        [Op.gte]: startDate
                    }
                },
                include: [{
                    model: User,
                    attributes: ['id', 'name', 'email']
                }],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            console.error('Error getting security events:', error);
            throw error;
        }
    }

    // Get audit trails by entity
    async getAuditTrailsByEntity(entityType: EntityType, entityId: string) {
        try {
            return await this.model.findAll({
                where: {
                    entityType,
                    entityId
                },
                include: [{
                    model: User,
                    attributes: ['id', 'name', 'email']
                }],
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            console.error('Error getting audit trails by entity:', error);
            throw error;
        }
    }

    // Clean old audit trails (for maintenance)
    async cleanOldAuditTrails(daysToKeep: number = 365) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            const result = await this.model.destroy({
                where: {
                    createdAt: {
                        [Op.lt]: cutoffDate
                    },
                    severity: {
                        [Op.notIn]: [SeverityLevel.HIGH, SeverityLevel.CRITICAL]
                    }
                }
            });

            return { deletedCount: result };
        } catch (error) {
            console.error('Error cleaning old audit trails:', error);
            throw error;
        }
    }

    // Export audit trails to CSV format
    async exportAuditTrails(filters: any) {
        try {
            const result = await this.getAuditTrails({
                ...filters,
                limit: 10000 // Large limit for export
            });

            // Decrypt data for export
            result.data.forEach(trail => {
                AuditTrail.manualDecrypt(trail);
            });

            return result.data;
        } catch (error) {
            console.error('Error exporting audit trails:', error);
            throw error;
        }
    }
}
