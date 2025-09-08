/**
 * Logger utility for handling different environment logging
 */
export class Logger {
    private static isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'debug';
    private static isProduction = process.env.NODE_ENV === 'production';

    /**
     * Log info messages (always show unless in production)
     */
    static info(...args: any[]): void {
        if (!this.isProduction) {
            console.log('[INFO]', new Date().toISOString(), ...args);
        }
    }

    /**
     * Log debug messages (only show in development/debug mode)
     */
    static debug(...args: any[]): void {
        if (this.isDevelopment) {
            console.log('[DEBUG]', new Date().toISOString(), ...args);
        }
    }

    /**
     * Log warning messages (show in all environments)
     */
    static warn(...args: any[]): void {
        console.warn('[WARN]', new Date().toISOString(), ...args);
    }

    /**
     * Log error messages (show in all environments)
     */
    static error(...args: any[]): void {
        console.error('[ERROR]', new Date().toISOString(), ...args);
    }

    /**
     * Log database queries (only in debug mode)
     */
    static query(sql: string, params?: any[]): void {
        if (this.isDevelopment) {
            console.log('[DB QUERY]', new Date().toISOString());
            console.log('SQL:', sql);
            if (params) {
                console.log('Params:', params);
            }
        }
    }

    /**
     * Log API requests (only in debug mode)
     */
    static api(method: string, url: string, statusCode: number, responseTime?: number): void {
        if (this.isDevelopment) {
            const logMessage = `[API] ${method} ${url} - ${statusCode}`;
            if (responseTime) {
                console.log(logMessage + ` (${responseTime}ms)`);
            } else {
                console.log(logMessage);
            }
        }
    }

    /**
     * Log performance metrics (only in debug mode)
     */
    static performance(label: string, startTime: number): void {
        if (this.isDevelopment) {
            const endTime = Date.now();
            const duration = endTime - startTime;
            console.log(`[PERFORMANCE] ${label}: ${duration}ms`);
        }
    }

    /**
     * Check if debug mode is enabled
     */
    static isDebugMode(): boolean {
        return this.isDevelopment;
    }

    /**
     * Check if production mode is enabled
     */
    static isProductionMode(): boolean {
        return this.isProduction;
    }
}

export default Logger;
