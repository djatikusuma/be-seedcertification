import express, { Express, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import sequelize from './config/sequelize';
import routes from './routes';
import generateSwaggerSpec from './config/swagger.config';
// Import models to ensure they are registered
import './models';
// Explicitly import all models to ensure registration
import { User, Role, Menu, Profile, ProfileApplicant, TempUser, AuditTrail, Settings } from './models';

// Load environment variables
dotenv.config();

// Initialize express app
const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Started`);

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });

    next();
});

// Routes
app.use('/api', routes);

// Set up Swagger UI
const setupSwagger = async () => {
    const swaggerSpec = await generateSwaggerSpec();
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Swagger JSON endpoint
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
};

setupSwagger();

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong',
    });
});

// Database connection and server startup
const startServer = async () => {
    try {
        // Force model registration
        console.log('Registering models...');
        const models = [User, Role, Menu, Profile, ProfileApplicant, TempUser, AuditTrail, Settings];
        models.forEach(model => {
            console.log(`Model ${model.name} registered:`, !!sequelize.models[model.name]);
        });

        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
            console.log(`Swagger documentation is available at http://localhost:${port}/api-docs`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();

export default app;
