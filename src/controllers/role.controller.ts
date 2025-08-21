import { Request, Response } from 'express';
import { RoleService } from '../services/role.service';
import { body, validationResult } from 'express-validator';

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       description: Represents a user role in the system with specific permissions
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the role
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         roleName:
 *           type: string
 *           description: Name of the role (e.g. admin, user, manager)
 *           example: "admin"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation date and time of the role
 *           example: "2025-07-10T15:30:45.123Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update date and time of the role
 *           example: "2025-07-11T08:22:12.345Z"
 *       required:
 *         - roleName
 *       example:
 *         id: "550e8400-e29b-41d4-a716-446655440000"
 *         roleName: "admin"
 *         createdAt: "2025-07-10T15:30:45.123Z"
 *         updatedAt: "2025-07-11T08:22:12.345Z"
 *     RoleCreateRequest:
 *       type: object
 *       description: Request payload for creating a new role
 *       properties:
 *         roleName:
 *           type: string
 *           description: Name of the role to create
 *           example: "editor"
 *       required:
 *         - roleName
 *       example:
 *         roleName: "editor"
 *     RoleUpdateRequest:
 *       type: object
 *       description: Request payload for updating an existing role
 *       properties:
 *         roleName:
 *           type: string
 *           description: New name for the role
 *           example: "content-editor"
 *       example:
 *         roleName: "content-editor"
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           description: Indicates the status of the operation
 *           example: success
 *         data:
 *           type: object
 *           description: The response data
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           description: Indicates that an error occurred
 *           example: error
 *         message:
 *           type: string
 *           description: Describes the error that occurred
 *           example: Role not found
 */

export class RoleController {
    private roleService: RoleService;

    constructor() {
        this.roleService = new RoleService();
    }

    /**
     * @swagger
     * /api/roles:
     *   get:
     *     summary: Get all roles
     *     description: Retrieves a list of all roles. Admin role required.
     *     tags: [Roles]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: A list of roles
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
     *                     $ref: '#/components/schemas/Role'
     *       401:
     *         description: Unauthorized - User not authenticated
     *       403:
     *         description: Forbidden - User does not have admin role
     *       500:
     *         description: Server error
     */
    getAllRoles = async (req: Request, res: Response) => {
        try {
            const roles = await this.roleService.findAll();
            res.status(200).json({ status: 'success', data: roles });
        } catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to fetch roles' });
        }
    };

    /**
     * @swagger
     * /api/roles/{id}:
     *   get:
     *     summary: Get role by ID
     *     description: Retrieves a specific role by its ID. Admin role required.
     *     tags: [Roles]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Unique identifier of the role
     *     responses:
     *       200:
     *         description: Role data retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   $ref: '#/components/schemas/Role'
     *       401:
     *         description: Unauthorized - User not authenticated
     *       403:
     *         description: Forbidden - User does not have admin role
     *       404:
     *         description: Role not found
     *       500:
     *         description: Server error
     */
    getRoleById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const role = await this.roleService.findById(id);

            if (!role) {
                return res.status(404).json({ status: 'error', message: 'Role not found' });
            }

            res.status(200).json({ status: 'success', data: role });
        } catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to fetch role' });
        }
    };

    /**
     * @swagger
     * /api/roles:
     *   post:
     *     summary: Create a new role
     *     description: Creates a new role in the system. Admin role required.
     *     tags: [Roles]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               roleName:
     *                 type: string
     *                 description: Name of the role
     *             required:
     *               - roleName
     *     responses:
     *       201:
     *         description: Role created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   $ref: '#/components/schemas/Role'
     *       400:
     *         description: Bad request - Validation error or role name already exists
     *       401:
     *         description: Unauthorized - User not authenticated
     *       403:
     *         description: Forbidden - User does not have admin role
     *       500:
     *         description: Server error
     */
    createRole = [
        // Validation
        body('roleName').notEmpty().withMessage('Role name is required'),

        async (req: Request, res: Response) => {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ status: 'error', errors: errors.array() });
            }

            try {
                // Check if role name already exists
                const existingRole = await this.roleService.findByName(req.body.roleName);
                if (existingRole) {
                    return res.status(400).json({ status: 'error', message: 'Role name already exists' });
                }

                const role = await this.roleService.create(req.body);
                res.status(201).json({ status: 'success', data: role });
            } catch (error) {
                res.status(500).json({ status: 'error', message: 'Failed to create role' });
            }
        }
    ];

    /**
     * @swagger
     * /api/roles/{id}:
     *   put:
     *     summary: Update a role
     *     description: Updates an existing role by ID. Admin role required.
     *     tags: [Roles]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Unique identifier of the role to update
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               roleName:
     *                 type: string
     *                 description: New name for the role
     *     responses:
     *       200:
     *         description: Role updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   $ref: '#/components/schemas/Role'
     *       400:
     *         description: Bad request - Validation error or role name already exists
     *       401:
     *         description: Unauthorized - User not authenticated
     *       403:
     *         description: Forbidden - User does not have admin role
     *       404:
     *         description: Role not found
     *       500:
     *         description: Server error
     */
    updateRole = [
        // Validation
        body('roleName').optional().notEmpty().withMessage('Role name cannot be empty'),

        async (req: Request, res: Response) => {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ status: 'error', errors: errors.array() });
            }

            try {
                const { id } = req.params;

                // Check if role name is being changed and already exists
                if (req.body.roleName) {
                    const existingRole = await this.roleService.findByName(req.body.roleName);
                    if (existingRole && existingRole.id !== id) {
                        return res.status(400).json({ status: 'error', message: 'Role name already exists' });
                    }
                }

                const role = await this.roleService.update(id, req.body);

                if (!role) {
                    return res.status(404).json({ status: 'error', message: 'Role not found' });
                }

                res.status(200).json({ status: 'success', data: role });
            } catch (error) {
                res.status(500).json({ status: 'error', message: 'Failed to update role' });
            }
        }
    ];

    /**
     * @swagger
     * /api/roles/{id}:
     *   delete:
     *     summary: Delete a role
     *     description: Deletes a role by ID. Admin role required.
     *     tags: [Roles]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Unique identifier of the role to delete
     *     responses:
     *       200:
     *         description: Role deleted successfully
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
     *                   example: Role deleted successfully
     *       401:
     *         description: Unauthorized - User not authenticated
     *       403:
     *         description: Forbidden - User does not have admin role
     *       404:
     *         description: Role not found
     *       500:
     *         description: Server error
     */
    deleteRole = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const deleted = await this.roleService.delete(id);

            if (!deleted) {
                return res.status(404).json({ status: 'error', message: 'Role not found' });
            }

            res.status(200).json({ status: 'success', message: 'Role deleted successfully' });
        } catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to delete role' });
        }
    };
}
