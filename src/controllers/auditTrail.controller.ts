import { Request, Response } from 'express';
import { validationResult, query, param } from 'express-validator';
import { AuditTrailService, AuditSearchFilters } from '../services/auditTrail.service';
import { ActionType, EntityType, SeverityLevel } from '../models/AuditTrail.model';

/**
 * @swagger
 * components:
 *   schemas:
 *     AuditTrail:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the audit trail entry
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID of the user who performed the action
 *         sessionId:
 *           type: string
 *           description: Session ID of the user
 *         action:
 *           type: string
 *           enum: [create, read, update, delete, login, logout, approve, reject, upload, download, export, import, verify, revoke, transfer, restore]
 *           description: Action performed
 *         entityType:
 *           type: string
 *           enum: [user, temp_user, profile, profile_applicant, role, menu, settings, blockchain_transaction, blockchain_asset, blockchain_certificate, file, system]
 *           description: Type of entity affected
 *         entityId:
 *           type: string
 *           description: ID of the affected entity
 *         oldData:
 *           type: string
 *           description: Previous data state (encrypted)
 *         newData:
 *           type: string
 *           description: New data state (encrypted)
 *         changes:
 *           type: string
 *           description: Summary of changes made (encrypted)
 *         ipAddress:
 *           type: string
 *           description: IP address of the client
 *         userAgent:
 *           type: string
 *           description: User agent string
 *         endpoint:
 *           type: string
 *           description: API endpoint accessed
 *         httpMethod:
 *           type: string
 *           description: HTTP method used
 *         statusCode:
 *           type: integer
 *           description: HTTP status code returned
 *         duration:
 *           type: integer
 *           description: Request duration in milliseconds
 *         severity:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           description: Severity level of the action
 *         tags:
 *           type: string
 *           description: Comma-separated tags
 *         metadata:
 *           type: string
 *           description: Additional metadata (encrypted)
 *         success:
 *           type: boolean
 *           description: Whether the operation was successful
 *         errorMessage:
 *           type: string
 *           description: Error message if operation failed
 *         stackTrace:
 *           type: string
 *           description: Stack trace if error occurred
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the audit entry was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the audit entry was last updated
 *     AuditTrailResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AuditTrail'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             totalPages:
 *               type: integer
 *   tags:
 *     - name: Audit Trail
 *       description: Audit trail management for tracking system activities
 */

export class AuditTrailController {
    private auditTrailService: AuditTrailService;

    constructor() {
        this.auditTrailService = new AuditTrailService();
    }

    // Validation rules for getting audit trails
    static getAuditTrailsValidationRules() {
        return [
            query('page')
                .optional()
                .isInt({ min: 1 })
                .withMessage('Page harus berupa angka positif'),
            query('limit')
                .optional()
                .isInt({ min: 1, max: 100 })
                .withMessage('Limit harus berupa angka 1-100'),
            query('userId')
                .optional()
                .isUUID()
                .withMessage('User ID tidak valid'),
            query('action')
                .optional()
                .isIn(Object.values(ActionType))
                .withMessage('Action tidak valid'),
            query('entityType')
                .optional()
                .isIn(Object.values(EntityType))
                .withMessage('Entity type tidak valid'),
            query('severity')
                .optional()
                .isIn(Object.values(SeverityLevel))
                .withMessage('Severity level tidak valid'),
            query('success')
                .optional()
                .isBoolean()
                .withMessage('Success harus berupa boolean'),
            query('startDate')
                .optional()
                .isISO8601()
                .withMessage('Format tanggal mulai tidak valid'),
            query('endDate')
                .optional()
                .isISO8601()
                .withMessage('Format tanggal akhir tidak valid')
        ];
    }

    // Validation rules for getting audit trail details
    static getAuditTrailDetailsValidationRules() {
        return [
            param('id')
                .isUUID()
                .withMessage('ID audit trail tidak valid')
        ];
    }

    // Validation rules for export
    static getExportValidationRules() {
        return [
            query('format')
                .optional()
                .isIn(['csv', 'json'])
                .withMessage('Format harus csv atau json'),
            ...AuditTrailController.getAuditTrailsValidationRules()
        ];
    }

    /**
     * @swagger
     * /api/audit-trails:
     *   get:
     *     summary: Get audit trails with filtering
     *     description: Retrieve audit trail entries with optional filtering and pagination. Requires authentication and admin role.
     *     tags: [Audit Trail]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           minimum: 1
     *         description: Page number for pagination
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 100
     *         description: Number of items per page
     *       - in: query
     *         name: userId
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Filter by user ID
     *       - in: query
     *         name: action
     *         schema:
     *           type: string
     *           enum: [create, read, update, delete, login, logout, approve, reject, upload, download, export, import, verify, revoke, transfer, restore]
     *         description: Filter by action type
     *       - in: query
     *         name: entityType
     *         schema:
     *           type: string
     *           enum: [user, temp_user, profile, profile_applicant, role, menu, settings, blockchain_transaction, blockchain_asset, blockchain_certificate, file, system]
     *         description: Filter by entity type
     *       - in: query
     *         name: severity
     *         schema:
     *           type: string
     *           enum: [low, medium, high, critical]
     *         description: Filter by severity level
     *       - in: query
     *         name: success
     *         schema:
     *           type: boolean
     *         description: Filter by success status
     *       - in: query
     *         name: startDate
     *         schema:
     *           type: string
     *           format: date-time
     *         description: Filter entries after this date
     *       - in: query
     *         name: endDate
     *         schema:
     *           type: string
     *           format: date-time
     *         description: Filter entries before this date
     *     responses:
     *       200:
     *         description: Success - Returns filtered audit trails
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/AuditTrailResponse'
     *       400:
     *         description: Bad Request - Invalid parameters
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden - Admin role required
     *       500:
     *         description: Internal Server Error
     */
    // Get audit trails with filtering
    getAuditTrails = async (req: Request, res: Response): Promise<void> => {
        try {
            // Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: errors.array()
                });
                return;
            }

            const viewerRole = (req as any).user?.role || 'user';

            // Only admin and auditor can access audit trails
            if (!['admin', 'auditor', 'supervisor'].includes(viewerRole)) {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden - Insufficient permissions'
                });
                return;
            }

            const filters: AuditSearchFilters = {
                page: parseInt(req.query.page as string) || 1,
                limit: parseInt(req.query.limit as string) || 50,
                userId: req.query.userId as string,
                sessionId: req.query.sessionId as string,
                action: req.query.action as ActionType,
                entityType: req.query.entityType as EntityType,
                entityId: req.query.entityId as string,
                startDate: req.query.startDate as string,
                endDate: req.query.endDate as string,
                severity: req.query.severity as SeverityLevel,
                success: req.query.success ? req.query.success === 'true' : undefined,
                ipAddress: req.query.ipAddress as string,
                endpoint: req.query.endpoint as string,
                tags: req.query.tags ? (req.query.tags as string).split(',') : undefined
            };

            const result = await this.auditTrailService.getAuditTrailsWithMasking(viewerRole, filters);

            res.status(200).json({
                success: true,
                message: 'Audit trails berhasil diambil',
                data: result.data,
                meta: result.pagination,
                filters
            });

        } catch (error) {
            console.error('Error in getAuditTrails:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    // Get audit trail details
    getAuditTrailDetails = async (req: Request, res: Response): Promise<void> => {
        try {
            // Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: errors.array()
                });
                return;
            }

            const viewerRole = (req as any).user?.role || 'user';

            // Only admin and auditor can access audit trail details
            if (!['admin', 'auditor', 'supervisor'].includes(viewerRole)) {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden - Insufficient permissions'
                });
                return;
            }

            const { id } = req.params;
            const auditTrail = await this.auditTrailService.getAuditTrailDetails(id, viewerRole);

            if (!auditTrail) {
                res.status(404).json({
                    success: false,
                    message: 'Audit trail tidak ditemukan'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Detail audit trail berhasil diambil',
                data: auditTrail
            });

        } catch (error) {
            console.error('Error in getAuditTrailDetails:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    // Get user activity summary
    getUserActivitySummary = async (req: Request, res: Response): Promise<void> => {
        try {
            const viewerRole = (req as any).user?.role || 'user';
            const viewerId = (req as any).user?.id;

            // Users can only see their own activity, admin/auditor can see any user's activity
            let userId = req.params.userId || viewerId;

            if (!['admin', 'auditor', 'supervisor'].includes(viewerRole) && userId !== viewerId) {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden - You can only view your own activity'
                });
                return;
            }

            const days = parseInt(req.query.days as string) || 30;
            const summary = await this.auditTrailService.getUserActivitySummary(userId, days);

            res.status(200).json({
                success: true,
                message: 'User activity summary berhasil diambil',
                data: summary
            });

        } catch (error) {
            console.error('Error in getUserActivitySummary:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    // Get system activity statistics
    getSystemActivityStats = async (req: Request, res: Response): Promise<void> => {
        try {
            const viewerRole = (req as any).user?.role || 'user';

            // Only admin and auditor can access system statistics
            if (!['admin', 'auditor'].includes(viewerRole)) {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden - Insufficient permissions'
                });
                return;
            }

            const days = parseInt(req.query.days as string) || 7;
            const stats = await this.auditTrailService.getSystemActivityStats(days);

            res.status(200).json({
                success: true,
                message: 'System activity statistics berhasil diambil',
                data: stats
            });

        } catch (error) {
            console.error('Error in getSystemActivityStats:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    // Get failed operations
    getFailedOperations = async (req: Request, res: Response): Promise<void> => {
        try {
            const viewerRole = (req as any).user?.role || 'user';

            // Only admin and auditor can access failed operations
            if (!['admin', 'auditor', 'supervisor'].includes(viewerRole)) {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden - Insufficient permissions'
                });
                return;
            }

            const hours = parseInt(req.query.hours as string) || 24;
            const failedOps = await this.auditTrailService.getFailedOperations(viewerRole, hours);

            res.status(200).json({
                success: true,
                message: 'Failed operations berhasil diambil',
                data: failedOps
            });

        } catch (error) {
            console.error('Error in getFailedOperations:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    // Get security events
    getSecurityEvents = async (req: Request, res: Response): Promise<void> => {
        try {
            const viewerRole = (req as any).user?.role || 'user';

            // Only admin and auditor can access security events
            if (!['admin', 'auditor'].includes(viewerRole)) {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden - Insufficient permissions'
                });
                return;
            }

            const days = parseInt(req.query.days as string) || 7;
            const securityEvents = await this.auditTrailService.getSecurityEvents(viewerRole, days);

            res.status(200).json({
                success: true,
                message: 'Security events berhasil diambil',
                data: securityEvents
            });

        } catch (error) {
            console.error('Error in getSecurityEvents:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    // Get audit trails by entity
    getAuditTrailsByEntity = async (req: Request, res: Response): Promise<void> => {
        try {
            const viewerRole = (req as any).user?.role || 'user';

            // Only admin and auditor can access entity audit trails
            if (!['admin', 'auditor', 'supervisor'].includes(viewerRole)) {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden - Insufficient permissions'
                });
                return;
            }

            const { entityType, entityId } = req.params;

            if (!Object.values(EntityType).includes(entityType as EntityType)) {
                res.status(400).json({
                    success: false,
                    message: 'Entity type tidak valid'
                });
                return;
            }

            const auditTrails = await this.auditTrailService.getAuditTrailsByEntity(
                entityType as EntityType,
                entityId,
                viewerRole
            );

            res.status(200).json({
                success: true,
                message: 'Entity audit trails berhasil diambil',
                data: auditTrails
            });

        } catch (error) {
            console.error('Error in getAuditTrailsByEntity:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    /**
     * @swagger
     * /api/audit-trails/export:
     *   get:
     *     summary: Export audit trails
     *     description: Export audit trail data in CSV or JSON format. Requires authentication and admin role.
     *     tags: [Audit Trail]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: format
     *         required: true
     *         schema:
     *           type: string
     *           enum: [csv, json]
     *         description: Export format
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           minimum: 1
     *         description: Page number for pagination
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 100
     *         description: Number of items per page
     *       - in: query
     *         name: userId
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Filter by user ID
     *       - in: query
     *         name: action
     *         schema:
     *           type: string
     *           enum: [create, read, update, delete, login, logout, approve, reject, upload, download, export, import, verify, revoke, transfer, restore]
     *         description: Filter by action type
     *       - in: query
     *         name: entityType
     *         schema:
     *           type: string
     *           enum: [user, temp_user, profile, profile_applicant, role, menu, settings, blockchain_transaction, blockchain_asset, blockchain_certificate, file, system]
     *         description: Filter by entity type
     *     responses:
     *       200:
     *         description: Success - Returns exported data
     *         content:
     *           text/csv:
     *             schema:
     *               type: string
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/AuditTrailResponse'
     *       400:
     *         description: Bad Request - Invalid parameters
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden - Admin role required
     *       500:
     *         description: Internal Server Error
     */
    // Export audit trails
    exportAuditTrails = async (req: Request, res: Response): Promise<void> => {
        try {
            // Check validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: errors.array()
                });
                return;
            }

            const viewerRole = (req as any).user?.role || 'user';

            // Only admin and auditor can export audit trails
            if (!['admin', 'auditor'].includes(viewerRole)) {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden - Insufficient permissions'
                });
                return;
            }

            const format = (req.query.format as 'csv' | 'json') || 'csv';

            const filters: AuditSearchFilters = {
                userId: req.query.userId as string,
                action: req.query.action as ActionType,
                entityType: req.query.entityType as EntityType,
                entityId: req.query.entityId as string,
                startDate: req.query.startDate as string,
                endDate: req.query.endDate as string,
                severity: req.query.severity as SeverityLevel,
                success: req.query.success ? req.query.success === 'true' : undefined
            };

            const exportData = await this.auditTrailService.exportAuditTrails(filters, format);

            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=audit_trails.csv');
                res.send(exportData);
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename=audit_trails.json');
                res.json({
                    success: true,
                    data: exportData
                });
            }

        } catch (error) {
            console.error('Error in exportAuditTrails:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

    // Clean old audit trails (maintenance endpoint)
    cleanOldAuditTrails = async (req: Request, res: Response): Promise<void> => {
        try {
            const viewerRole = (req as any).user?.role || 'user';

            // Only admin can clean audit trails
            if (viewerRole !== 'admin') {
                res.status(403).json({
                    success: false,
                    message: 'Forbidden - Only admin can perform this action'
                });
                return;
            }

            const daysToKeep = parseInt(req.query.daysToKeep as string) || 365;
            const result = await this.auditTrailService.cleanOldAuditTrails(daysToKeep);

            res.status(200).json({
                success: true,
                message: 'Old audit trails cleaned successfully',
                data: result
            });

        } catch (error) {
            console.error('Error in cleanOldAuditTrails:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };
}
