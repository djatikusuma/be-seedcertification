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

            // Get user with role information for proper role assignment
            const { User } = await import('../models/User.model');
            let userRole = 'user'; // Default fallback

            try {
                const fullUser = await User.findByPk(decodedToken.id, {
                    include: ['role']
                });

                if (fullUser && fullUser.role) {
                    userRole = fullUser.role.roleName;
                }
            } catch (error) {
                console.warn('Could not fetch user role, using default:', error);
            }

            // Add the JWT payload to the request with actual role
            (req as AuthenticatedRequest).user = {
                ...decodedToken,
                role: userRole
            };

            // Check role-based access if roles are specified
            if (allowedRoles && allowedRoles.length > 0) {
                if (!allowedRoles.includes(userRole)) {
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

            // Use the role that's already loaded by authMiddleware
            const userRole = user.role;

            if (!userRole || !allowedRoles.includes(userRole)) {
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
