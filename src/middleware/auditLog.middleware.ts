import { Request, Response, NextFunction } from 'express';
import { AuditTrailService } from '../services/auditTrail.service';
import { ActionType, EntityType, SeverityLevel } from '../models/AuditTrail.model';

export interface AuditConfig {
    action?: ActionType;
    entityType?: EntityType;
    severity?: SeverityLevel;
    skipLogging?: boolean;
    captureRequestBody?: boolean;
    captureResponseBody?: boolean;
    customEntityId?: (req: Request) => string | undefined;
    customMetadata?: (req: Request, res: Response) => any;
}

export class AuditMiddleware {
    private static auditTrailService = new AuditTrailService();

    // Main audit logging middleware
    static auditLog(config: AuditConfig = {}) {
        return async (req: Request, res: Response, next: NextFunction) => {
            // Skip logging if configured
            if (config.skipLogging) {
                return next();
            }

            // Add request start time for duration calculation
            (req as any).requestStartTime = Date.now();

            // Store original response methods
            const originalSend = res.send;
            const originalJson = res.json;
            let responseBody: any = null;

            // Override response methods to capture response body
            if (config.captureResponseBody) {
                res.send = function (body: any) {
                    responseBody = body;
                    return originalSend.call(this, body);
                };

                res.json = function (body: any) {
                    responseBody = body;
                    return originalJson.call(this, body);
                };
            }

            // Override res.end to capture the audit log
            const originalEnd = res.end;
            res.end = function (chunk?: any, encoding?: any) {
                res.end = originalEnd;

                // Create audit log after response is sent
                setImmediate(async () => {
                    try {
                        await AuditMiddleware.createAuditLog(req, res, config, responseBody);
                    } catch (error) {
                        console.error('Failed to create audit log:', error);
                    }
                });

                return originalEnd.call(this, chunk, encoding);
            };

            next();
        };
    }

    // Create audit log entry
    private static async createAuditLog(
        req: Request,
        res: Response,
        config: AuditConfig,
        responseBody?: any
    ) {
        try {
            const action = config.action || AuditMiddleware.inferActionFromMethod(req.method, req.path);
            const entityType = config.entityType || AuditMiddleware.inferEntityTypeFromPath(req.path);
            const entityId = config.customEntityId ? config.customEntityId(req) : AuditMiddleware.extractEntityIdFromPath(req.path);

            const requestStartTime = (req as any).requestStartTime || Date.now();
            const duration = Date.now() - requestStartTime;

            // Determine if the operation was successful
            const success = res.statusCode >= 200 && res.statusCode < 400;

            // Determine severity based on status code and action
            const severity = config.severity || AuditMiddleware.determineSeverity(res.statusCode, action);

            // Prepare metadata
            const metadata: any = {
                requestHeaders: AuditMiddleware.sanitizeHeaders(req.headers),
                responseHeaders: AuditMiddleware.sanitizeHeaders(res.getHeaders()),
                queryParams: req.query,
                params: req.params
            };

            // Add request body if configured
            if (config.captureRequestBody && req.body) {
                metadata.requestBody = AuditMiddleware.sanitizeRequestBody(req.body);
            }

            // Add response body if configured
            if (config.captureResponseBody && responseBody) {
                metadata.responseBody = AuditMiddleware.sanitizeResponseBody(responseBody);
            }

            // Add custom metadata if provided
            if (config.customMetadata) {
                const customMeta = config.customMetadata(req, res);
                metadata.custom = customMeta;
            }

            // Create audit log
            await AuditMiddleware.auditTrailService.createAuditLogFromRequest(req, action, entityType, {
                entityId,
                statusCode: res.statusCode,
                duration,
                severity,
                success,
                metadata,
                tags: AuditMiddleware.generateTags(req, res, action, entityType)
            });

        } catch (error) {
            console.error('Error creating audit log:', error);
        }
    }

    // Infer action from HTTP method and path
    private static inferActionFromMethod(method: string, path: string): ActionType {
        const lowerPath = path.toLowerCase();

        if (lowerPath.includes('/login')) return ActionType.LOGIN;
        if (lowerPath.includes('/logout')) return ActionType.LOGOUT;
        if (lowerPath.includes('/verify')) return ActionType.VERIFY;
        if (lowerPath.includes('/approve')) return ActionType.APPROVE;
        if (lowerPath.includes('/reject')) return ActionType.REJECT;
        if (lowerPath.includes('/upload')) return ActionType.UPLOAD;
        if (lowerPath.includes('/download')) return ActionType.DOWNLOAD;
        if (lowerPath.includes('/export')) return ActionType.EXPORT;
        if (lowerPath.includes('/import')) return ActionType.IMPORT;
        if (lowerPath.includes('/revoke')) return ActionType.REVOKE;
        if (lowerPath.includes('/transfer')) return ActionType.TRANSFER;
        if (lowerPath.includes('/restore')) return ActionType.RESTORE;

        switch (method.toUpperCase()) {
            case 'GET': return ActionType.READ;
            case 'POST': return ActionType.CREATE;
            case 'PUT':
            case 'PATCH': return ActionType.UPDATE;
            case 'DELETE': return ActionType.DELETE;
            default: return ActionType.READ;
        }
    }

    // Infer entity type from path
    private static inferEntityTypeFromPath(path: string): EntityType {
        const lowerPath = path.toLowerCase();

        if (lowerPath.includes('/users')) return EntityType.USER;
        if (lowerPath.includes('/temp-users')) return EntityType.TEMP_USER;
        if (lowerPath.includes('/profiles')) return EntityType.PROFILE;
        if (lowerPath.includes('/applicant-profiles')) return EntityType.PROFILE_APPLICANT;
        if (lowerPath.includes('/roles')) return EntityType.ROLE;
        if (lowerPath.includes('/menus')) return EntityType.MENU;
        if (lowerPath.includes('/settings')) return EntityType.SETTINGS;
        if (lowerPath.includes('/blockchain')) return EntityType.BLOCKCHAIN_TRANSACTION;
        if (lowerPath.includes('/files')) return EntityType.FILE;

        return EntityType.SYSTEM;
    }

    // Extract entity ID from path
    private static extractEntityIdFromPath(path: string): string | undefined {
        // Look for UUID pattern in path
        const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
        const match = path.match(uuidRegex);
        return match ? match[0] : undefined;
    }

    // Determine severity based on status code and action
    private static determineSeverity(statusCode: number, action: ActionType): SeverityLevel {
        // Critical operations
        if ([ActionType.DELETE, ActionType.REVOKE].includes(action)) {
            return SeverityLevel.CRITICAL;
        }

        // High severity for certain actions or error codes
        if ([ActionType.APPROVE, ActionType.REJECT, ActionType.TRANSFER].includes(action) ||
            statusCode >= 500) {
            return SeverityLevel.HIGH;
        }

        // Medium severity for modifications or client errors
        if ([ActionType.CREATE, ActionType.UPDATE, ActionType.UPLOAD].includes(action) ||
            statusCode >= 400) {
            return SeverityLevel.MEDIUM;
        }

        // Low severity for read operations and successful requests
        return SeverityLevel.LOW;
    }

    // Generate tags for categorization
    private static generateTags(req: Request, res: Response, action: ActionType, entityType: EntityType): string[] {
        const tags: string[] = [action, entityType];

        // Add status tag
        if (res.statusCode >= 500) {
            tags.push('server-error');
        } else if (res.statusCode >= 400) {
            tags.push('client-error');
        } else if (res.statusCode >= 200) {
            tags.push('success');
        }

        // Add method tag
        tags.push(req.method.toLowerCase());

        // Add authentication tag
        if ((req as any).user) {
            tags.push('authenticated');
            tags.push(`role:${(req as any).user.role}`);
        } else {
            tags.push('anonymous');
        }

        // Add API version tag if present
        if (req.headers['api-version']) {
            tags.push(`api:${req.headers['api-version']}`);
        }

        return tags;
    }

    // Sanitize headers to remove sensitive information
    private static sanitizeHeaders(headers: any): any {
        const sanitized = { ...headers };

        // Remove sensitive headers
        const sensitiveHeaders = [
            'authorization',
            'cookie',
            'x-api-key',
            'x-auth-token'
        ];

        sensitiveHeaders.forEach(header => {
            if (sanitized[header]) {
                sanitized[header] = '[REDACTED]';
            }
        });

        return sanitized;
    }

    // Sanitize request body to remove sensitive information
    private static sanitizeRequestBody(body: any): any {
        if (!body || typeof body !== 'object') {
            return body;
        }

        const sanitized = { ...body };

        // Remove sensitive fields
        const sensitiveFields = [
            'password',
            'newPassword',
            'oldPassword',
            'confirmPassword',
            'token',
            'accessToken',
            'refreshToken',
            'secret',
            'privateKey',
            'apiKey'
        ];

        sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        });

        return sanitized;
    }

    // Sanitize response body to remove sensitive information
    private static sanitizeResponseBody(body: any): any {
        if (!body) {
            return body;
        }

        try {
            const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;

            if (parsedBody.data && parsedBody.data.token) {
                parsedBody.data.token = '[REDACTED]';
            }

            if (parsedBody.data && parsedBody.data.accessToken) {
                parsedBody.data.accessToken = '[REDACTED]';
            }

            return parsedBody;
        } catch (error) {
            return '[UNPARSEABLE_RESPONSE]';
        }
    }

    // Specific middleware for different types of operations
    static loginAudit() {
        return AuditMiddleware.auditLog({
            action: ActionType.LOGIN,
            entityType: EntityType.USER,
            severity: SeverityLevel.MEDIUM,
            captureRequestBody: true,
            captureResponseBody: false
        });
    }

    static logoutAudit() {
        return AuditMiddleware.auditLog({
            action: ActionType.LOGOUT,
            entityType: EntityType.USER,
            severity: SeverityLevel.LOW
        });
    }

    static adminActionAudit() {
        return AuditMiddleware.auditLog({
            severity: SeverityLevel.HIGH,
            captureRequestBody: true,
            captureResponseBody: true
        });
    }

    static fileOperationAudit() {
        return AuditMiddleware.auditLog({
            entityType: EntityType.FILE,
            severity: SeverityLevel.MEDIUM,
            captureRequestBody: false,
            captureResponseBody: false
        });
    }

    static blockchainAudit() {
        return AuditMiddleware.auditLog({
            entityType: EntityType.BLOCKCHAIN_TRANSACTION,
            severity: SeverityLevel.CRITICAL,
            captureRequestBody: true,
            captureResponseBody: true
        });
    }
}

// Export individual middleware functions for convenience
export const auditLog = AuditMiddleware.auditLog;
export const loginAudit = AuditMiddleware.loginAudit;
export const logoutAudit = AuditMiddleware.logoutAudit;
export const adminActionAudit = AuditMiddleware.adminActionAudit;
export const fileOperationAudit = AuditMiddleware.fileOperationAudit;
export const blockchainAudit = AuditMiddleware.blockchainAudit;
