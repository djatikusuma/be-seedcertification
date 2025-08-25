import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { JwtPayloadInterface, AuthenticatedRequest } from '../interfaces/auth.interface';

/**
 * Authentication middleware to verify JWT tokens
 * @param allowedRoles - Optional array of roles allowed to access the route
 */
export const authMiddleware = (allowedRoles?: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get token from Authorization header
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Unauthorized - No token provided'
                });
            }

            // Extract the token
            const token = authHeader.split(' ')[1];

            // Verify the token
            const authService = new AuthService();
            const decodedToken = await authService.verifyToken(token);

            if (!decodedToken) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Unauthorized - Invalid token'
                });
            }

            // Get full user data with role information for masking purposes
            const { User } = await import('../models/User.model');
            const fullUser = await User.findByPk(decodedToken.id, {
                include: ['role']
            });

            if (!fullUser) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Unauthorized - User not found'
                });
            }

            // Add both the JWT payload and full user data to the request
            (req as AuthenticatedRequest).user = {
                ...decodedToken,
                role: fullUser.role?.roleName || 'user' // Provide default role
            };

            // Check role-based access if roles are specified
            if (allowedRoles && allowedRoles.length > 0) {
                const userRole = fullUser.role?.roleName;
                if (!userRole || !allowedRoles.includes(userRole)) {
                    return res.status(403).json({
                        status: 'error',
                        message: 'Forbidden - Insufficient permissions'
                    });
                }
            }

            next();
        } catch (error) {
            console.error('Authentication error:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    };
};

/**
 * Role-based access control middleware
 * @param allowedRoles - Array of roles allowed to access the route
 */
export const rbacMiddleware = (allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = (req as AuthenticatedRequest).user;

            // Check if user exists in request (should be set by authMiddleware)
            if (!user) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Unauthorized - Authentication required'
                });
            }

            // Get user role from database to ensure it's current
            const { Role } = await import('../models/Role.model');
            const role = await Role.findByPk(user.roleId);

            if (!role || !allowedRoles.includes(role.roleName)) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Forbidden - Insufficient permissions'
                });
            }

            next();
        } catch (error) {
            console.error('RBAC error:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    };
};
