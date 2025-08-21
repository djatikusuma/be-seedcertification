import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { SettingsService } from '../../../src/services/settings.service';

// Mock dependencies
jest.mock('../../../src/services/settings.service');

// Create mock functions
const authMiddlewareMock = jest.fn((req: Request, res: Response, next: NextFunction) => next());
const rbacMiddlewareFactoryMock = jest.fn((roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => next();
});

// Mock the auth middleware module
jest.mock('../../../src/middleware/auth.middleware', () => ({
    authMiddleware: authMiddlewareMock,
    rbacMiddleware: rbacMiddlewareFactoryMock
}));

// Import after mocking
import settingsRoutes from '../../../src/routes/settings.routes';
import { authMiddleware, rbacMiddleware } from '../../../src/middleware/auth.middleware';

describe('Settings API Endpoints', () => {
    let app: express.Express;
    const mockSettings = {
        appName: 'Test App',
        timezone: 'UTC',
        jwtTimeout: '24h',
        appMetaData: { version: '1.0.0' },
        database: 'mysql'
    };

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/api/settings', settingsRoutes);

        // Reset mocks
        jest.clearAllMocks();

        // Setup mock implementations
        const mockSettingsService = SettingsService as jest.MockedClass<typeof SettingsService>;
        mockSettingsService.prototype.getAllSettings.mockResolvedValue(mockSettings);
        mockSettingsService.prototype.updateSettings.mockImplementation(async (updates) => {
            return { ...mockSettings, ...updates };
        });
    });

    describe('GET /api/settings', () => {
        it('should return all settings with status 200', async () => {
            const response = await request(app).get('/api/settings');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                status: 'success',
                data: mockSettings
            });
            expect(authMiddleware).toHaveBeenCalled();
        });

        it('should return 500 when service throws error', async () => {
            const mockSettingsService = SettingsService as jest.MockedClass<typeof SettingsService>;
            mockSettingsService.prototype.getAllSettings.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/settings');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                status: 'error',
                message: 'Failed to fetch settings'
            });
        });
    });

    describe('PUT /api/settings', () => {
        const updateData = {
            appName: 'Updated App Name',
            timezone: 'GMT'
        };

        it('should update settings and return with status 200', async () => {
            // Direct call to the routes will not trigger the middleware mocks
            // We're testing the controller logic, not the middleware here
            const response = await request(app)
                .put('/api/settings')
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                status: 'success',
                data: { ...mockSettings, ...updateData }
            });
        });

        it('should return 400 on validation errors', async () => {
            const response = await request(app)
                .put('/api/settings')
                .send({ jwtTimeout: 123 }); // jwtTimeout should be string

            expect(response.status).toBe(400);
            expect(response.body.status).toBe('error');
            expect(response.body.errors).toBeDefined();
        });

        it('should return 500 when service throws error', async () => {
            const mockSettingsService = SettingsService as jest.MockedClass<typeof SettingsService>;
            mockSettingsService.prototype.updateSettings.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .put('/api/settings')
                .send(updateData);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                status: 'error',
                message: 'Failed to update settings'
            });
        });
    });
});
