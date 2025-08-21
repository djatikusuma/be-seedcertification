import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import config from './database.config';
import path from 'path';

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
    logging: false,
    models: [path.join(__dirname, '..', 'models', '*.model.ts')],
});

export default sequelize;
