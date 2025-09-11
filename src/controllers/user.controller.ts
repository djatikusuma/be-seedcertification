import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User.model';
import { DataMaskingUtil, MaskingType } from '../utils/masking.util';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the user
 *         name:
 *           type: string
 *           description: User's full name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         roleId:
 *           type: string
 *           format: uuid
 *           description: ID of the user's role
 *         role:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             roleName:
 *               type: string
 *             description:
 *               type: string
 *         deletionRequested:
 *           type: boolean
 *           description: Whether the user has requested account deletion
 *         deletionRequestDate:
 *           type: string
 *           format: date-time
 *           description: When the user requested deletion
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - name
 *         - email
 *         - roleId
 */

export class UserController {
    private userService = new UserService();

    /**
    * @swagger
    * /api/users:
    *   get:
    *     summary: Get all users with pagination and filtering
    *     description: Retrieves all users with pagination and role-based filtering. Admin role required. Data is masked based on requesting user's role.
    *     tags: [Users]
    *     security:
    *       - bearerAuth: []
    *     parameters:
    *       - in: query
    *         name: page
    *         schema:
    *           type: integer
    *           minimum: 1
    *           default: 1
    *         description: Page number
    *       - in: query
    *         name: limit
    *         schema:
    *           type: integer
    *           minimum: 1
    *           maximum: 100
    *           default: 10
    *         description: Number of items per page
    *       - in: query
    *         name: role
    *         schema:
    *           type: string
    *           enum: [admin, user, petani, perusahaan, inspektur, inspektur_ketua, verifikatur, kepala]
    *         description: Filter users by role name. Use GET /api/roles to see all available roles.
    *       - in: query
    *         name: status
    *         schema:
    *           type: string
    *           enum: [active, not_active, revoked]
    *         description: Filter users by status (active, not_active, revoked)
    *     responses:
    *       200:
    *         description: Users data retrieved successfully
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 status:
    *                   type: string
    *                   example: success
    *                 data:
    *                   type: array
    *                   items:
    *                     $ref: '#/components/schemas/User'
    *                 meta:
    *                   type: object
    *                   properties:
    *                     total:
    *                       type: integer
    *                       description: Total number of users
    *                     totalPages:
    *                       type: integer
    *                       description: Total number of pages
    *                     currentPage:
    *                       type: integer
    *                       description: Current page number
    *                     limit:
    *                       type: integer
    *                       description: Items per page
    *                     roleFilter:
    *                       type: string
    *                       nullable: true
    *                       description: Applied role filter (null if no filter)
    *                       example: admin
    *                     masking_applied:
    *                       type: boolean
    *                       example: true
    *                     masking_level:
    *                       type: string
    *                       example: admin
    *       401:
    *         description: Unauthorized - User not authenticated
    *       403:
    *         description: Forbidden - User does not have admin role
    *       500:
    *         description: Server error
    */
    getAllUsers = async (req: Request, res: Response) => {
        try {
            // Get requesting user's role from the authenticated user
            const requestingUserRole = (req as any).user?.role?.roleName || 'guest';

            // Parse pagination parameters
            const page = parseInt(req.query.page as string) || 1;
            const limit = Math.min(parseInt(req.query.limit as string) || 10, 100); // Max 100 items per page

            // Parse filter parameters
            const roleFilter = req.query.role as string || null;
            const statusFilter = req.query.status as string || null;

            // Validate pagination parameters
            if (page < 1) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Page number must be greater than 0'
                });
            }

            if (limit < 1) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Limit must be greater than 0'
                });
            }

            // Validate status filter if provided
            if (statusFilter && !['active', 'not_active', 'revoked'].includes(statusFilter)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid status filter. Must be one of: active, not_active, revoked'
                });
            }

            // Use service method with pagination, filtering and masking
            const result = await this.userService.findAllWithMasking(requestingUserRole, page, limit, roleFilter, statusFilter);

            res.status(200).json({
                status: 'success',
                data: result.users,
                meta: {
                    total: result.total,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                    limit: limit,
                    roleFilter: roleFilter,
                    statusFilter: statusFilter,
                    masking_applied: true,
                    masking_level: requestingUserRole
                }
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to fetch users',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * @swagger
     * /api/users/search:
     *   get:
     *     summary: Search users by name or email with pagination
     *     description: Search users by name or email with pagination. Admin role required. Data is masked based on requesting user's role.
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: q
     *         required: true
     *         schema:
     *           type: string
     *           minLength: 2
     *         description: Search term (name or email)
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           minimum: 1
     *           default: 1
     *         description: Page number
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 100
     *           default: 10
     *         description: Number of items per page
     *     responses:
     *       200:
     *         description: Users search results retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/User'
     *                 meta:
     *                   type: object
     *                   properties:
     *                     total:
     *                       type: integer
     *                       description: Total number of matching users
     *                     totalPages:
     *                       type: integer
     *                       description: Total number of pages
     *                     currentPage:
     *                       type: integer
     *                       description: Current page number
     *                     limit:
     *                       type: integer
     *                       description: Items per page
     *                     searchTerm:
     *                       type: string
     *                       description: Search term used
     *                     masking_applied:
     *                       type: boolean
     *                       example: true
     *                     masking_level:
     *                       type: string
     *                       example: admin
     *       400:
     *         description: Bad request - Invalid search parameters
     *       401:
     *         description: Unauthorized - User not authenticated
     *       403:
     *         description: Forbidden - User does not have admin role
     *       500:
     *         description: Server error
     */
    searchUsers = async (req: Request, res: Response) => {
        try {
            // Get requesting user's role from the authenticated user
            const requestingUserRole = (req as any).user?.role?.roleName || 'guest';

            // Parse search and pagination parameters
            const searchTerm = req.query.q as string;
            const page = parseInt(req.query.page as string) || 1;
            const limit = Math.min(parseInt(req.query.limit as string) || 10, 100); // Max 100 items per page

            // Validate search term
            if (!searchTerm || searchTerm.trim().length < 2) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Search term must be at least 2 characters long'
                });
            }

            // Validate pagination parameters
            if (page < 1) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Page number must be greater than 0'
                });
            }

            if (limit < 1) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Limit must be greater than 0'
                });
            }

            // Use service method with search, pagination and masking
            const result = await this.userService.searchUsersWithMasking(
                searchTerm.trim(),
                requestingUserRole,
                page,
                limit
            );

            res.status(200).json({
                status: 'success',
                data: result.users,
                meta: {
                    total: result.total,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                    limit: limit,
                    searchTerm: searchTerm.trim(),
                    masking_applied: true,
                    masking_level: requestingUserRole
                }
            });
        } catch (error) {
            console.error('Error searching users:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to search users',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * @swagger
     * /api/users/{id}:
     *   get:
     *     summary: Get user by ID
     *     description: Retrieves a specific user by their ID. Admin role required.
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Unique identifier of the user
     *     responses:
     *       200:
     *         description: User data retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   $ref: '#/components/schemas/User'
     *       401:
     *         description: Unauthorized - User not authenticated
     *       403:
     *         description: Forbidden - User does not have admin role
     *       404:
     *         description: User not found
     *       500:
     *         description: Server error
     */
    getUserById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            // Get requesting user's role from the authenticated user
            const requestingUserRole = (req as any).user?.role?.roleName || 'guest';

            // Use service method with masking
            const maskedUser = await this.userService.findByIdWithMasking(id, requestingUserRole);

            if (!maskedUser) {
                return res.status(404).json({ status: 'error', message: 'User not found' });
            }

            res.status(200).json({
                status: 'success',
                data: maskedUser,
                meta: {
                    masking_applied: true,
                    masking_level: requestingUserRole
                }
            });
        } catch (error) {
            console.error('Error fetching user by ID:', error);
            res.status(500).json({ status: 'error', message: 'Failed to fetch user' });
        }
    };

    /**
     * @swagger
     * /api/users:
     *   post:
     *     summary: Create a new user
     *     description: Creates a new user in the system. Admin role required.
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 description: User's full name
     *               email:
     *                 type: string
     *                 format: email
     *                 description: User's email address
     *               password:
     *                 type: string
     *                 format: password
     *                 minLength: 6
     *                 description: User's password (min 6 characters)
     *               roleId:
     *                 type: string
     *                 format: uuid
     *                 description: ID of the role to assign to the user
     *             required:
     *               - name
     *               - email
     *               - password
     *               - roleId
     *     responses:
     *       201:
     *         description: User created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   $ref: '#/components/schemas/User'
     *       400:
     *         description: Validation error or email already in use
     *       401:
     *         description: Unauthorized - User not authenticated
     *       403:
     *         description: Forbidden - User does not have admin role
     *       500:
     *         description: Server error
     */
    createUser = [
        // Validation
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Must be a valid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('roleId').notEmpty().withMessage('Role ID is required'),

        async (req: Request, res: Response) => {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ status: 'error', errors: errors.array() });
            }

            try {
                // Check if email already exists using the new encrypted method
                const existingUser = await User.findByEmail(req.body.email);
                if (existingUser) {
                    return res.status(400).json({ status: 'error', message: 'Email already in use' });
                }

                // Create the user
                const user = await this.userService.create(req.body);

                // Get requesting user's role from the authenticated user
                const requestingUserRole = (req as any).user?.role?.roleName || 'guest';

                // Get the created user with masking
                const createdUser = await this.userService.findByIdWithMasking(user.id, requestingUserRole);

                res.status(201).json({
                    status: 'success',
                    data: createdUser,
                    meta: {
                        masking_applied: true,
                        masking_level: requestingUserRole
                    }
                });
            } catch (error) {
                res.status(500).json({ status: 'error', message: 'Failed to create user' });
            }
        }
    ];

    /**
     * @swagger
     * /api/users/{id}:
     *   put:
     *     summary: Update a user
     *     description: Updates an existing user's information. Users can update their own data, or admin role can update any user.
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Unique identifier of the user to update
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 description: User's full name
     *               email:
     *                 type: string
     *                 format: email
     *                 description: User's email address
     *               password:
     *                 type: string
     *                 format: password
     *                 minLength: 6
     *                 description: User's password (min 6 characters)
     *               roleId:
     *                 type: string
     *                 format: uuid
     *                 description: ID of the role to assign to the user (admin only)
     *     responses:
     *       200:
     *         description: User updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   $ref: '#/components/schemas/User'
     *       400:
     *         description: Validation error or email already in use
     *       401:
     *         description: Unauthorized - User not authenticated
     *       403:
     *         description: Forbidden - User can only update their own data or need admin role
     *       404:
     *         description: User not found
     *       500:
     *         description: Server error
     */
    updateUser = [
        // Validation
        body('name').optional().notEmpty().withMessage('Name cannot be empty'),
        body('email').optional().isEmail().withMessage('Must be a valid email'),
        body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

        async (req: Request, res: Response) => {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ status: 'error', errors: errors.array() });
            }

            try {
                const { id } = req.params;

                // Get requesting user's information
                const requestingUser = (req as any).user;
                const requestingUserId = requestingUser?.id;
                const requestingUserRole = requestingUser?.role?.roleName || 'guest';
                const isAdmin = requestingUserRole === 'admin';
                const isOwnProfile = requestingUserId === id;

                // Check permission: user can update their own data OR admin can update any user
                if (!isOwnProfile && !isAdmin) {
                    return res.status(403).json({
                        status: 'error',
                        message: 'Access denied. You can only update your own profile or need admin privileges.'
                    });
                }

                // Prepare update data - filter based on permissions
                let updateData = { ...req.body };

                // Non-admin users cannot update roleId (only admin can change roles)
                if (!isAdmin && updateData.roleId) {
                    delete updateData.roleId;
                    console.log('Non-admin user attempted to change role, field removed from update');
                }

                // Check if there's any data to update after filtering
                if (Object.keys(updateData).length === 0) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'No valid fields provided for update'
                    });
                }

                // Use service method with masking
                const updatedUser = await this.userService.updateWithMasking(id, updateData, requestingUserRole);

                if (!updatedUser) {
                    return res.status(404).json({ status: 'error', message: 'User not found' });
                }

                res.status(200).json({
                    status: 'success',
                    data: updatedUser,
                    meta: {
                        masking_applied: true,
                        masking_level: requestingUserRole,
                        updated_by: isOwnProfile ? 'self' : 'admin'
                    }
                });
            } catch (error: any) {
                if (error.message === 'Email already exists') {
                    return res.status(400).json({ status: 'error', message: error.message });
                }
                console.error('Error updating user:', error);
                res.status(500).json({ status: 'error', message: 'Failed to update user' });
            }
        }
    ];

    /**
     * @swagger
     * /api/users/{id}:
     *   delete:
     *     summary: Delete a user
     *     description: Deletes a user from the system. Admin role required.
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Unique identifier of the user to delete
     *     responses:
     *       200:
     *         description: User deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 message:
     *                   type: string
     *                   example: User deleted successfully
     *       401:
     *         description: Unauthorized - User not authenticated
     *       403:
     *         description: Forbidden - User does not have admin role
     *       404:
     *         description: User not found
     *       500:
     *         description: Server error
     */
    deleteUser = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const deleted = await this.userService.delete(id);

            if (!deleted) {
                return res.status(404).json({ status: 'error', message: 'User not found' });
            }

            res.status(200).json({ status: 'success', message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to delete user' });
        }
    };

    /**
     * @swagger
     * /api/users/{id}/status:
     *   patch:
     *     summary: Update user status
     *     description: Update the status of a user. Only accessible by admin and kepala roles.
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: User ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - status
     *             properties:
     *               status:
     *                 type: string
     *                 enum: [active, not_active, revoked]
     *                 description: New status for the user
     *                 example: active
     *               reason:
     *                 type: string
     *                 description: Optional reason for status change
     *                 example: Account suspended for policy violation
     *     responses:
     *       200:
     *         description: User status updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 message:
     *                   type: string
     *                   example: User status updated successfully
     *                 data:
     *                   type: object
     *                   properties:
     *                     id:
     *                       type: string
     *                       format: uuid
     *                     status:
     *                       type: string
     *                       enum: [active, not_active, revoked]
     *                     updatedAt:
     *                       type: string
     *                       format: date-time
     *       400:
     *         description: Bad request - Invalid status value or missing required fields
     *       401:
     *         description: Unauthorized - User not authenticated
     *       403:
     *         description: Forbidden - User does not have admin or kepala role
     *       404:
     *         description: User not found
     *       500:
     *         description: Server error
     */
    updateUserStatus = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { status, reason } = req.body;

            // Validate required fields
            if (!status) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Status is required'
                });
            }

            // Validate status value
            const validStatuses = ['active', 'not_active', 'revoked'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    status: 'error',
                    message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
                });
            }

            // Check if user exists
            const existingUser = await this.userService.findById(id);
            if (!existingUser) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }

            // Update user status
            const updatedUser = await this.userService.updateUserStatus(id, status, reason);

            res.status(200).json({
                status: 'success',
                message: 'User status updated successfully',
                data: {
                    id: updatedUser.id,
                    status: updatedUser.status,
                    updatedAt: updatedUser.updatedAt
                }
            });
        } catch (error) {
            console.error('Error updating user status:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to update user status',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}
