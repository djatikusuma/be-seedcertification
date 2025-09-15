import { Sequelize, Op } from 'sequelize';
import config from '../config/database.config';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env as keyof typeof config];

export class DatabaseUtil {
    /**
     * Get JSON contains query based on dialect
     */
    static getJsonContainsQuery(column: string, value: string): any {
        if (dbConfig.dialect === 'postgres') {
            // PostgreSQL: Use @> operator for JSON contains
            return Sequelize.literal(`${column} @> '"${value}"'`);
        } else {
            // MySQL: Use JSON_CONTAINS function
            return Sequelize.literal(`JSON_CONTAINS(${column}, '"${value}"')`);
        }
    }

    /**
     * Get JSON path query based on dialect
     */
    static getJsonPathQuery(column: string, path: string): any {
        if (dbConfig.dialect === 'postgres') {
            // PostgreSQL: Use ->> operator
            return Sequelize.literal(`${column}->>'${path}'`);
        } else {
            // MySQL: Use JSON_EXTRACT function
            return Sequelize.literal(`JSON_EXTRACT(${column}, '$.${path}')`);
        }
    }

    /**
     * Get case insensitive LIKE query
     */
    static getCaseInsensitiveLike(value: string): any {
        if (dbConfig.dialect === 'postgres') {
            return { [Op.iLike]: `%${value}%` };
        } else {
            return { [Op.like]: `%${value}%` };
        }
    }
}
