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
     *     summary: Get all users
     *     description: Retrieves a list of all users. Admin role required.
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: A list of users
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

            // Use service method with masking
            const maskedUsers = await this.userService.findAllWithMasking(requestingUserRole);

            res.status(200).json({
                status: 'success',
                data: maskedUsers,
                meta: {
                    total: maskedUsers.length,
                    masking_applied: true,
                    masking_level: requestingUserRole
                }
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ status: 'error', message: 'Failed to fetch users' });
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
     *     description: Updates an existing user's information. Admin role required.
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
     *                 description: ID of the role to assign to the user
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
     *         description: Forbidden - User does not have admin role
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

                // Get requesting user's role from the authenticated user
                const requestingUserRole = (req as any).user?.role?.roleName || 'guest';

                // Use service method with masking
                const updatedUser = await this.userService.updateWithMasking(id, req.body, requestingUserRole);

                if (!updatedUser) {
                    return res.status(404).json({ status: 'error', message: 'User not found' });
                }

                res.status(200).json({
                    status: 'success',
                    data: updatedUser,
                    meta: {
                        masking_applied: true,
                        masking_level: requestingUserRole
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
}
