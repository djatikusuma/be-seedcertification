import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { RoleService } from '../../../src/services/role.service';

// Mock dependencies
jest.mock('../../../src/services/role.service');

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
import roleRoutes from '../../../src/routes/role.routes';

describe('Role API Endpoints', () => {
    let app: express.Express;

    // Mock role data
    const mockRoles = [
        {
            id: 'role-1',
            roleName: 'admin',
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 'role-2',
            roleName: 'user',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    beforeEach(() => {
        // Setup Express app
        app = express();
        app.use(express.json());
        app.use('/api/roles', roleRoutes);

        // Reset mocks
        jest.clearAllMocks();

        // Setup mock implementations
        const mockRoleService = RoleService as jest.MockedClass<typeof RoleService>;
        mockRoleService.prototype.findAll = jest.fn().mockResolvedValue(mockRoles);
        mockRoleService.prototype.findById = jest.fn().mockImplementation(async (id) => {
            const role = mockRoles.find(r => r.id === id);
            return role || null;
        });
        mockRoleService.prototype.findByName = jest.fn().mockImplementation(async (name) => {
            const role = mockRoles.find(r => r.roleName === name);
            return role || null;
        });
        mockRoleService.prototype.create = jest.fn().mockImplementation(async (roleData) => ({
            id: 'new-role-id',
            ...roleData,
            createdAt: new Date(),
            updatedAt: new Date()
        }));
        mockRoleService.prototype.update = jest.fn().mockImplementation(async (id, roleData) => {
            const role = mockRoles.find(r => r.id === id);
            if (!role) return null;
            return { ...role, ...roleData, updatedAt: new Date() };
        });
        mockRoleService.prototype.delete = jest.fn().mockResolvedValue(true);
    });

    describe('GET /api/roles', () => {
        it('should return all roles with status 200', async () => {
            const response = await request(app).get('/api/roles');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                status: 'success',
                data: expect.arrayContaining([
                    expect.objectContaining({
                        id: 'role-1',
                        roleName: 'admin'
                    }),
                    expect.objectContaining({
                        id: 'role-2',
                        roleName: 'user'
                    })
                ])
            });
            expect(authMiddlewareMock).toHaveBeenCalled();
            expect(rbacMiddlewareFactoryMock).toHaveBeenCalledWith(['admin']);
        });

        it('should return 500 when service throws error', async () => {
            const mockRoleService = RoleService as jest.MockedClass<typeof RoleService>;
            mockRoleService.prototype.findAll.mockRejectedValue(new Error('Database error'));

            const response = await request(app).get('/api/roles');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                status: 'error',
                message: 'Failed to fetch roles'
            });
        });
    });

    describe('GET /api/roles/:id', () => {
        it('should return a specific role with status 200', async () => {
            const response = await request(app).get('/api/roles/role-1');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                status: 'success',
                data: expect.objectContaining({
                    id: 'role-1',
                    roleName: 'admin'
                })
            });
        });

        it('should return 404 when role not found', async () => {
            const response = await request(app).get('/api/roles/non-existent-id');

            expect(response.status).toBe(404);
            expect(response.body).toEqual({
                status: 'error',
                message: 'Role not found'
            });
        });
    });

    describe('POST /api/roles', () => {
        it('should create a new role with status 201', async () => {
            const newRole = { roleName: 'editor' };

            const response = await request(app)
                .post('/api/roles')
                .send(newRole);

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                status: 'success',
                data: expect.objectContaining({
                    id: 'new-role-id',
                    roleName: 'editor'
                })
            });
        });

        it('should return 400 when role name already exists', async () => {
            const mockRoleService = RoleService as jest.MockedClass<typeof RoleService>;
            mockRoleService.prototype.findByName.mockResolvedValue(mockRoles[0]);

            const response = await request(app)
                .post('/api/roles')
                .send({ roleName: 'admin' });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                status: 'error',
                message: 'Role name already exists'
            });
        });

        it('should return 400 when validation fails', async () => {
            const response = await request(app)
                .post('/api/roles')
                .send({ roleName: '' });

            expect(response.status).toBe(400);
            expect(response.body.status).toBe('error');
            expect(response.body.errors).toBeDefined();
        });
    });
});
