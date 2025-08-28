import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import config from './database.config';
import { User, Role, Menu, Profile, ProfileApplicant, TempUser, AuditTrail, Settings, Commodity } from '../models';

dotenv.config();

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env as keyof typeof config];

const sequelize = new Sequelize({
    dialect: dbConfig.dialect,
    host: dbConfig.host,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    port: dbConfig.port,
    logging: console.log, // Enable logging to see what queries are slow
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: {
        connectTimeout: 10000,
        acquireTimeout: 10000,
    }
});

// Add models to the Sequelize instance
sequelize.addModels([User, Role, Menu, Profile, ProfileApplicant, TempUser, AuditTrail, Settings, Commodity]);

export default sequelize;
