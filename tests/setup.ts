import dotenv from 'dotenv';
import { Sequelize } from 'sequelize-typescript';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env.test if available, otherwise from .env
const testEnvPath = path.resolve(process.cwd(), '.env.test');
const envPath = fs.existsSync(testEnvPath) ? testEnvPath : path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Set a timeout for tests
jest.setTimeout(30000);

// Setup global beforeAll and afterAll hooks if needed
// This is where you would setup a test database or perform other test setup
