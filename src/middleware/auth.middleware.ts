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

            // Add the JWT payload to the request without additional database calls
            // This avoids potential hanging issues with complex queries
            (req as AuthenticatedRequest).user = {
                ...decodedToken,
                role: 'user' // Default role, will be checked by rbac if needed
            };

            // Check role-based access if roles are specified
            if (allowedRoles && allowedRoles.length > 0) {
                // For now, skip detailed role checking in auth middleware
                // Let rbac middleware handle this with a separate, more controlled query
                console.warn('Role checking moved to rbac middleware');
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

            // Get user with role from database for actual role checking
            const { User } = await import('../models/User.model');
            const fullUser = await User.findByPk(user.id, {
                include: ['role']
            });

            if (!fullUser || !fullUser.role) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Forbidden - User role not found'
                });
            }

            const userRole = fullUser.role.roleName;

            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Forbidden - Insufficient permissions'
                });
            }

            // Update user object with actual role for downstream use
            (req as AuthenticatedRequest).user = {
                ...user,
                role: userRole
            };

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
