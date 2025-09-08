import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import sequelize from './config/sequelize';
import { config, isDevelopment } from './config/environment.config';

// Import models to ensure they are registered
import './models';

// Initialize express app
const app: Express = express();
const port = config.PORT;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic routes
app.get('/health', (req: Request, res: Response) => {
    console.log('Health check endpoint accessed');
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV,
        debug: config.DEBUG
    });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled error:', err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({
        success: false,
        message: isDevelopment() ? err.message : 'Internal server error',
        ...(isDevelopment() && { stack: err.stack })
    });
});

const startServer = async () => {
    try {
        // Log startup information
        console.log('Starting server...');
        console.log(`Environment: ${config.NODE_ENV}`);
        console.log(`Debug mode: ${config.DEBUG}`);
        console.log(`Port: ${config.PORT}`);

        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

startServer();

export default app;
