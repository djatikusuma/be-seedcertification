import { BaseService } from './base.service';
import { AuditTrail, ActionType, EntityType, SeverityLevel, AuditTrailInterface } from '../models/AuditTrail.model';
import { AuditTrailRepository } from '../repositories/auditTrail.repository';
import { Request } from 'express';

export interface AuditLogData {
    userId?: string;
    sessionId?: string;
    action: ActionType;
    entityType: EntityType;
    entityId?: string;
    oldData?: any;
    newData?: any;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
    endpoint?: string;
    httpMethod?: string;
    statusCode?: number;
    duration?: number;
    severity?: SeverityLevel;
    tags?: string[];
    metadata?: any;
    success?: boolean;
    errorMessage?: string;
    stackTrace?: string;
}

export interface AuditSearchFilters {
    userId?: string;
    sessionId?: string;
    action?: ActionType | ActionType[];
    entityType?: EntityType | EntityType[];
    entityId?: string;
    startDate?: string;
    endDate?: string;
    severity?: SeverityLevel | SeverityLevel[];
    success?: boolean;
    ipAddress?: string;
    endpoint?: string;
    tags?: string[];
    page?: number;
    limit?: number;
}

export class AuditTrailService extends BaseService<AuditTrail> {
    private auditTrailRepository: AuditTrailRepository;

    constructor() {
        const auditTrailRepository = new AuditTrailRepository();
        super(auditTrailRepository);
        this.auditTrailRepository = auditTrailRepository;
    }

    // Create audit log entry
    async createAuditLog(data: AuditLogData): Promise<AuditTrail> {
        try {
            // Convert arrays and objects to JSON strings
            const auditData: Partial<AuditTrailInterface> = {
                ...data,
                oldData: data.oldData ? JSON.stringify(data.oldData) : undefined,
                newData: data.newData ? JSON.stringify(data.newData) : undefined,
                changes: data.changes ? JSON.stringify(data.changes) : undefined,
                tags: data.tags ? data.tags.join(',') : undefined,
                metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
                severity: data.severity || SeverityLevel.LOW,
                success: data.success !== undefined ? data.success : true
            };

            return await this.auditTrailRepository.createAuditLog(auditData);
        } catch (error) {
            console.error('Error creating audit log:', error);
            throw error;
        }
    }

    // Create audit log from Express request
    async createAuditLogFromRequest(
        req: Request,
        action: ActionType,
        entityType: EntityType,
        data: Partial<AuditLogData> = {}
    ): Promise<AuditTrail> {
        const requestStartTime = (req as any).requestStartTime || Date.now();
        const duration = Date.now() - requestStartTime;

        const auditData: AuditLogData = {
            userId: (req as any).user?.id,
            sessionId: (req as any).sessionID || (req as any).sessionId,
            action,
            entityType,
            ipAddress: this.getClientIP(req),
            userAgent: req.get('User-Agent'),
            endpoint: req.originalUrl || req.url,
            httpMethod: req.method,
            duration,
            ...data
        };

        return await this.createAuditLog(auditData);
    }

    // Get audit trails with filtering and masking
    async getAuditTrailsWithMasking(
        viewerRole: string,
        filters: AuditSearchFilters
    ): Promise<{
        data: Partial<AuditTrailInterface>[];
        pagination: any;
    }> {
        try {
            // Convert string dates to Date objects
            const searchFilters = {
                ...filters,
                startDate: filters.startDate ? new Date(filters.startDate) : undefined,
                endDate: filters.endDate ? new Date(filters.endDate) : undefined
            };

            const result = await this.auditTrailRepository.getAuditTrails(searchFilters);

            // Apply manual decryption and masking based on viewer role
            const maskedData = result.data.map(auditTrail => {
                AuditTrail.manualDecrypt(auditTrail);
                return AuditTrail.getMaskedAuditData(auditTrail, viewerRole);
            });

            return {
                data: maskedData,
                pagination: result.pagination
            };
        } catch (error) {
            console.error('Error getting audit trails with masking:', error);
            throw error;
        }
    }

    // Get audit trail details
    async getAuditTrailDetails(id: string, viewerRole: string): Promise<Partial<AuditTrailInterface> | null> {
        try {
            const auditTrail = await this.auditTrailRepository.getAuditTrailById(id);

            if (!auditTrail) {
                return null;
            }

            // Manually decrypt the data
            AuditTrail.manualDecrypt(auditTrail);

            // Return masked data based on viewer role
            return AuditTrail.getMaskedAuditData(auditTrail, viewerRole);
        } catch (error) {
            console.error('Error getting audit trail details:', error);
            throw error;
        }
    }

    // Get user activity summary
    async getUserActivitySummary(userId: string, days: number = 30) {
        try {
            return await this.auditTrailRepository.getUserActivitySummary(userId, days);
        } catch (error) {
            console.error('Error getting user activity summary:', error);
            throw error;
        }
    }

    // Get system activity statistics
    async getSystemActivityStats(days: number = 7) {
        try {
            return await this.auditTrailRepository.getSystemActivityStats(days);
        } catch (error) {
            console.error('Error getting system activity stats:', error);
            throw error;
        }
    }

    // Get failed operations
    async getFailedOperations(viewerRole: string, hours: number = 24) {
        try {
            const failedOps = await this.auditTrailRepository.getFailedOperations(hours);

            // Apply masking based on viewer role
            return failedOps.map(op => {
                AuditTrail.manualDecrypt(op);
                return AuditTrail.getMaskedAuditData(op, viewerRole);
            });
        } catch (error) {
            console.error('Error getting failed operations:', error);
            throw error;
        }
    }

    // Get security events
    async getSecurityEvents(viewerRole: string, days: number = 7) {
        try {
            const securityEvents = await this.auditTrailRepository.getSecurityEvents(days);

            // Apply masking based on viewer role
            return securityEvents.map(event => {
                AuditTrail.manualDecrypt(event);
                return AuditTrail.getMaskedAuditData(event, viewerRole);
            });
        } catch (error) {
            console.error('Error getting security events:', error);
            throw error;
        }
    }

    // Get audit trails by entity
    async getAuditTrailsByEntity(
        entityType: EntityType,
        entityId: string,
        viewerRole: string
    ) {
        try {
            const auditTrails = await this.auditTrailRepository.getAuditTrailsByEntity(entityType, entityId);

            // Apply masking based on viewer role
            return auditTrails.map(trail => {
                AuditTrail.manualDecrypt(trail);
                return AuditTrail.getMaskedAuditData(trail, viewerRole);
            });
        } catch (error) {
            console.error('Error getting audit trails by entity:', error);
            throw error;
        }
    }

    // Export audit trails
    async exportAuditTrails(filters: AuditSearchFilters, format: 'csv' | 'json' = 'csv') {
        try {
            const searchFilters = {
                ...filters,
                startDate: filters.startDate ? new Date(filters.startDate) : undefined,
                endDate: filters.endDate ? new Date(filters.endDate) : undefined
            };

            const auditTrails = await this.auditTrailRepository.exportAuditTrails(searchFilters);

            if (format === 'json') {
                return auditTrails;
            }

            // Convert to CSV format
            return this.convertToCSV(auditTrails);
        } catch (error) {
            console.error('Error exporting audit trails:', error);
            throw error;
        }
    }

    // Clean old audit trails
    async cleanOldAuditTrails(daysToKeep: number = 365) {
        try {
            return await this.auditTrailRepository.cleanOldAuditTrails(daysToKeep);
        } catch (error) {
            console.error('Error cleaning old audit trails:', error);
            throw error;
        }
    }

    // Helper method to get client IP
    private getClientIP(req: Request): string {
        return (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            'unknown';
    }

    // Helper method to convert audit trails to CSV
    private convertToCSV(auditTrails: AuditTrail[]): string {
        if (auditTrails.length === 0) {
            return '';
        }

        const headers = [
            'ID', 'User ID', 'Session ID', 'Action', 'Entity Type', 'Entity ID',
            'IP Address', 'Endpoint', 'HTTP Method', 'Status Code', 'Duration',
            'Severity', 'Success', 'Error Message', 'Created At'
        ];

        const csvRows = [headers.join(',')];

        auditTrails.forEach(trail => {
            const row = [
                trail.id,
                trail.userId || '',
                trail.sessionId || '',
                trail.action,
                trail.entityType,
                trail.entityId || '',
                trail.ipAddress || '',
                trail.endpoint || '',
                trail.httpMethod || '',
                trail.statusCode || '',
                trail.duration || '',
                trail.severity,
                trail.success,
                trail.errorMessage ? `"${trail.errorMessage.replace(/"/g, '""')}"` : '',
                trail.createdAt?.toISOString() || ''
            ];
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    }

    // Utility method to calculate changes between old and new data
    static calculateChanges(oldData: any, newData: any): any {
        const changes: any = {};

        if (!oldData && newData) {
            return { type: 'create', data: newData };
        }

        if (oldData && !newData) {
            return { type: 'delete', data: oldData };
        }

        if (oldData && newData) {
            const oldKeys = Object.keys(oldData);
            const newKeys = Object.keys(newData);
            const allKeys = [...new Set([...oldKeys, ...newKeys])];

            allKeys.forEach(key => {
                if (oldData[key] !== newData[key]) {
                    changes[key] = {
                        from: oldData[key],
                        to: newData[key]
                    };
                }
            });

            return { type: 'update', changes };
        }

        return null;
    }
}
