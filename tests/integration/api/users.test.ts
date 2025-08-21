import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { User } from '../../../src/models/User.model';

// Mock dependencies
jest.mock('../../../src/models/User.model');

// Create mock middleware functions
const authMiddlewareMock = jest.fn((req: Request, res: Response, next: NextFunction) => {
    // Add user to request for RBAC middleware
    (req as any).user = { id: 'admin-user-id', email: 'admin@example.com', roleId: 'admin-role-id' };
    next();
});

const rbacMiddlewareFactoryMock = jest.fn((roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => next();
});

// Mock the middleware module
jest.mock('../../../src/middleware/auth.middleware', () => ({
    authMiddleware: authMiddlewareMock,
    rbacMiddleware: rbacMiddlewareFactoryMock
}));

// Import routes after mocking dependencies
import userRoutes from '../../../src/routes/user.routes';

describe('User API Endpoints', () => {
    let app: express.Express;

    // Mock user data
    const mockUsers = [
        {
            id: 'user-1',
            name: 'Test User 1',
            email: 'user1@example.com',
            roleId: 'role-1',
            role: { id: 'role-1', roleName: 'admin' },
            createdAt: new Date(),
            updatedAt: new Date(),
            toJSON: function () { return { ...this, password: undefined }; }
        },
        {
            id: 'user-2',
            name: 'Test User 2',
            email: 'user2@example.com',
            roleId: 'role-2',
            role: { id: 'role-2', roleName: 'user' },
            createdAt: new Date(),
            updatedAt: new Date(),
            toJSON: function () { return { ...this, password: undefined }; }
        }
    ];

    beforeEach(() => {
        // Setup Express app
        app = express();
        app.use(express.json());
        app.use('/api/users', userRoutes);

        // Reset mocks
        jest.clearAllMocks();

        // Default mock implementations for User model
        (User.findAll as jest.Mock).mockResolvedValue(mockUsers);
        (User.findByPk as jest.Mock).mockImplementation(async (id) => {
            const user = mockUsers.find(u => u.id === id);
            return user || null;
        });
        (User.create as jest.Mock).mockImplementation(async (userData) => ({
            id: 'new-user-id',
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date(),
            toJSON: function () { return { ...this, password: undefined }; }
        }));
    });

    describe('GET /api/users', () => {
        it('should return all users with status 200', async () => {
            const response = await request(app).get('/api/users');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                status: 'success',
                data: expect.arrayContaining([
                    expect.objectContaining({
                        id: 'user-1',
                        name: 'Test User 1',
                        email: 'user1@example.com'
                    }),
                    expect.objectContaining({
                        id: 'user-2',
                        name: 'Test User 2',
                        email: 'user2@example.com'
                    })
                ])
            });
            expect(authMiddlewareMock).toHaveBeenCalled();
            expect(rbacMiddlewareFactoryMock).toHaveBeenCalledWith(['admin']);
        });

        it('should return 500 when service throws error', async () => {
            (User.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/users');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                status: 'error',
                message: 'Failed to fetch users'
            });
        });
    });

    describe('GET /api/users/:id', () => {
        it('should return a specific user with status 200', async () => {
            const response = await request(app).get('/api/users/user-1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                status: 'success',
                data: expect.objectContaining({
                    id: 'user-1',
                    name: 'Test User 1',
                    email: 'user1@example.com'
                })
            });
        });

        it('should return 404 when user not found', async () => {
            const response = await request(app).get('/api/users/non-existent-id');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                status: 'error',
                message: 'User not found'
            });
        });

        it('should return 500 when service throws error', async () => {
            (User.findByPk as jest.Mock).mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/users/user-1');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                status: 'error',
                message: 'Failed to fetch user'
            });
        });
    });
});
