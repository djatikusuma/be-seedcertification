import request from 'supertest';
import express from 'express';
import { AuthService } from '../../../src/services/auth.service';

// Mock dependencies
jest.mock('../../../src/services/auth.service');

// Import after mocking
import authRoutes from '../../../src/routes/auth.routes';

describe('Auth API Endpoints', () => {
    let app: express.Express;
    const mockToken = 'mocked.jwt.token';
    const validCredentials = {
        email: 'test@example.com',
        password: 'password123'
    };

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/api/auth', authRoutes);

        // Reset mocks
        jest.clearAllMocks();

        // Setup mock implementations
        const mockAuthService = AuthService as jest.MockedClass<typeof AuthService>;
        mockAuthService.prototype.login.mockImplementation(async (credentials) => {
            if (
                credentials.email === validCredentials.email &&
                credentials.password === validCredentials.password
            ) {
                return mockToken;
            }
            return null;
        });
    });

    describe('POST /api/auth/login', () => {
        it('should return a token with status 200 on successful login', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send(validCredentials);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                status: 'success',
                data: { token: mockToken }
            });
        });

        it('should return 401 with invalid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrong_password'
                });

            expect(response.status).toBe(401);
            expect(response.body).toEqual({
                status: 'error',
                message: 'Invalid credentials'
            });
        });

        it('should return 400 with invalid email format', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'invalid-email',
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('errors');
            expect(Array.isArray(response.body.errors)).toBe(true);
        });

        it('should return 400 when password is missing', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('errors');
        });

        it('should return 500 when service throws error', async () => {
            const mockAuthService = AuthService as jest.MockedClass<typeof AuthService>;
            mockAuthService.prototype.login.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .post('/api/auth/login')
                .send(validCredentials);

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                status: 'error',
                message: 'Internal server error'
            });
        });
    });
});
