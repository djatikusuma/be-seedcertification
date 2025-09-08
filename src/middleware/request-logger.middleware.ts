import { Request, Response, NextFunction } from 'express';
import Logger from '../utils/logger.util';
import { config } from '../config/environment.config';

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    if (!config.ENABLE_REQUEST_LOGGING) {
        next();
        return;
    }

    const startTime = Date.now();
    const { method, url, ip } = req;

    // Log incoming request
    Logger.debug(`Incoming ${method} ${url} from ${ip}`);

    // Log request body in debug mode (but hide sensitive data)
    if (Logger.isDebugMode() && req.body && Object.keys(req.body).length > 0) {
        const sanitizedBody = sanitizeRequestBody(req.body);
        Logger.debug('Request body:', sanitizedBody);
    }

    // Override res.json to log response
    const originalJson = res.json;
    res.json = function (body: any) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // Log response
        Logger.api(method, url, res.statusCode, responseTime);

        // Log response body in debug mode (but hide sensitive data)
        if (Logger.isDebugMode() && body) {
            const sanitizedResponse = sanitizeResponseBody(body);
            Logger.debug('Response body:', sanitizedResponse);
        }

        return originalJson.call(this, body);
    };

    next();
};

/**
 * Sanitize request body to hide sensitive information
 */
const sanitizeRequestBody = (body: any): any => {
    if (!body || typeof body !== 'object') {
        return body;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
        if (sanitized[field]) {
            sanitized[field] = '[HIDDEN]';
        }
    }

    return sanitized;
};

/**
 * Sanitize response body to hide sensitive information
 */
const sanitizeResponseBody = (body: any): any => {
    if (!body || typeof body !== 'object') {
        return body;
    }

    const sensitiveFields = ['token', 'password', 'secret', 'key'];
    const sanitized = { ...body };

    // If response has data field, sanitize it
    if (sanitized.data && typeof sanitized.data === 'object') {
        for (const field of sensitiveFields) {
            if (sanitized.data[field]) {
                sanitized.data[field] = '[HIDDEN]';
            }
        }
    }

    // Sanitize top level fields
    for (const field of sensitiveFields) {
        if (sanitized[field]) {
            sanitized[field] = '[HIDDEN]';
        }
    }

    return sanitized;
};

export default requestLogger;
