import { authMiddleware, rbacMiddleware } from '../../../src/middleware/auth.middleware';
import { AuthService } from '../../../src/services/auth.service';
import { Request, Response } from 'express';
import { Role } from '../../../src/models/Role.model';
import { AuthenticatedRequest } from '../../../src/interfaces/auth.interface';

// Mock dependencies
jest.mock('../../../src/services/auth.service');
jest.mock('../../../src/models/Role.model');

describe('Auth Middleware', () => {
    let mockRequest: Partial<Request> & Partial<AuthenticatedRequest>;
    let mockResponse: Partial<Response>;
    let nextFunction: jest.Mock;

    beforeEach(() => {
        mockRequest = {
            headers: {},
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        nextFunction = jest.fn();

        // Reset mocks
        jest.clearAllMocks();
    });

    describe('authMiddleware', () => {
        it('should call next() with valid token', async () => {
            // Mock valid token
            const mockToken = 'valid.jwt.token';
            const mockUser = { id: '123', email: 'user@example.com', roleId: '456' };
            mockRequest.headers = {
                authorization: `Bearer ${mockToken}`,
            };

            // Setup AuthService mock
            const mockAuthService = AuthService as jest.MockedClass<typeof AuthService>;
            mockAuthService.prototype.verifyToken = jest.fn().mockResolvedValue(mockUser);

            // Call middleware
            await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

            // Assertions
            expect(mockAuthService.prototype.verifyToken).toHaveBeenCalledWith(mockToken);
            expect(mockRequest.user).toEqual(mockUser);
            expect(nextFunction).toHaveBeenCalled();
            expect(mockResponse.status).not.toHaveBeenCalled();
        });

        it('should return 401 when no authorization header', async () => {
            // Call middleware
            await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

            // Assertions
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'Unauthorized - No token provided'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should return 401 when invalid token format', async () => {
            // Invalid token format (no Bearer prefix)
            mockRequest.headers = {
                authorization: 'invalid-token',
            };

            // Call middleware
            await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

            // Assertions
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'Unauthorized - No token provided'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should return 401 when token verification fails', async () => {
            // Mock invalid token
            mockRequest.headers = {
                authorization: 'Bearer invalid.token',
            };

            // Setup AuthService mock to return null (invalid token)
            const mockAuthService = AuthService as jest.MockedClass<typeof AuthService>;
            mockAuthService.prototype.verifyToken = jest.fn().mockResolvedValue(null);

            // Call middleware
            await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

            // Assertions
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'Unauthorized - Invalid token'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });

    describe('rbacMiddleware', () => {
        const allowedRoles = ['admin'];
        let rbacMiddlewareInstance: ReturnType<typeof rbacMiddleware>;

        beforeEach(() => {
            rbacMiddlewareInstance = rbacMiddleware(allowedRoles);
            mockRequest.user = { id: '123', email: 'user@example.com', roleId: '456' };
        });

        it('should call next() when user has allowed role', async () => {
            // Mock Role.findByPk to return allowed role
            (Role.findByPk as jest.Mock).mockResolvedValue({
                roleName: 'admin',
            });

            // Call middleware
            await rbacMiddlewareInstance(mockRequest as Request, mockResponse as Response, nextFunction);

            // Assertions
            expect(Role.findByPk).toHaveBeenCalledWith('456');
            expect(nextFunction).toHaveBeenCalled();
            expect(mockResponse.status).not.toHaveBeenCalled();
        });

        it('should return 401 when no user in request', async () => {
            // Remove user from request
            delete mockRequest.user;

            // Call middleware
            await rbacMiddlewareInstance(mockRequest as Request, mockResponse as Response, nextFunction);

            // Assertions
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'Unauthorized - Authentication required'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should return 403 when user role not found', async () => {
            // Mock Role.findByPk to return null (role not found)
            (Role.findByPk as jest.Mock).mockResolvedValue(null);

            // Call middleware
            await rbacMiddlewareInstance(mockRequest as Request, mockResponse as Response, nextFunction);

            // Assertions
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'Forbidden - Insufficient permissions'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should return 403 when user role not in allowed roles', async () => {
            // Mock Role.findByPk to return non-allowed role
            (Role.findByPk as jest.Mock).mockResolvedValue({
                roleName: 'user',
            });

            // Call middleware
            await rbacMiddlewareInstance(mockRequest as Request, mockResponse as Response, nextFunction);

            // Assertions
            expect(mockResponse.status).toHaveBeenCalledWith(403);
            expect(mockResponse.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'Forbidden - Insufficient permissions'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });
});
