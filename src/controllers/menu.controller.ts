import { Request, Response } from 'express';
import { MenuService } from '../services/menu.service';
import { body, validationResult } from 'express-validator';

/**
 * @swagger
 * components:
 *   schemas:
 *     Menu:
 *       type: object
 *       description: Represents a menu item in the navigation system
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the menu item
 *           example: "b7f6c5d4-e3b2-41a0-9d8c-746e53a29b1f"
 *         menuName:
 *           type: string
 *           description: Display name of the menu item
 *           example: "Dashboard"
 *         path:
 *           type: string
 *           description: URL path for the menu item
 *           example: "/dashboard"
 *         icon:
 *           type: string
 *           description: Icon identifier for the menu item
 *           example: "dashboard"
 *         parentId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID of parent menu item (null for top-level items)
 *           example: null
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation date and time
 *           example: "2025-07-10T15:30:45.123Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update date and time
 *           example: "2025-07-11T08:22:12.345Z"
 *       required:
 *         - menuName
 *         - path
 *         - icon
 *       example:
 *         id: "b7f6c5d4-e3b2-41a0-9d8c-746e53a29b1f"
 *         menuName: "Dashboard"
 *         path: "/dashboard"
 *         icon: "dashboard"
 *         parentId: null
 *         createdAt: "2025-07-10T15:30:45.123Z"
 *         updatedAt: "2025-07-11T08:22:12.345Z"
 *     MenuTree:
 *       type: object
 *       description: |
 *         Hierarchical representation of menu items with parent-child relationships.
 *         This schema is recursive, as each menu item can contain child menu items with the same structure.
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the menu item
 *           example: "b7f6c5d4-e3b2-41a0-9d8c-746e53a29b1f"
 *         menuName:
 *           type: string
 *           description: Display name of the menu item
 *           example: "Settings"
 *         path:
 *           type: string
 *           description: URL path for the menu item
 *           example: "/settings"
 *         icon:
 *           type: string
 *           description: Icon identifier for the menu item
 *           example: "settings"
 *         parentId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID of parent menu item (null for top-level items)
 *           example: null
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation date and time
 *           example: "2025-07-10T15:30:45.123Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update date and time
 *           example: "2025-07-11T08:22:12.345Z"
 *         children:
 *           type: array
 *           description: |
 *             Array of child menu items, each being a complete menu object.
 *             This creates the recursive tree structure.
 *           items:
 *             $ref: '#/components/schemas/MenuTree'
 *       example:
 *         id: "b7f6c5d4-e3b2-41a0-9d8c-746e53a29b1f"
 *         menuName: "Settings"
 *         path: "/settings"
 *         icon: "settings"
 *         parentId: null
 *         createdAt: "2025-07-10T15:30:45.123Z"
 *         updatedAt: "2025-07-11T08:22:12.345Z"
 *         children: [
 *           {
 *             id: "a1b2c3d4-e5f6-4a3b-8c9d-1e2f3a4b5c6d",
 *             menuName: "User Settings",
 *             path: "/settings/user",
 *             icon: "person",
 *             parentId: "b7f6c5d4-e3b2-41a0-9d8c-746e53a29b1f",
 *             createdAt: "2025-07-10T15:32:21.123Z",
 *             updatedAt: "2025-07-11T08:23:15.789Z",
 *             children: []
 *           },
 *           {
 *             id: "f6e5d4c3-b2a1-4c5d-9e8f-7a6b5c4d3e2",
 *             menuName: "System Settings",
 *             path: "/settings/system",
 *             icon: "build",
 *             parentId: "b7f6c5d4-e3b2-41a0-9d8c-746e53a29b1f",
 *             createdAt: "2025-07-10T15:35:18.456Z",
 *             updatedAt: "2025-07-11T08:24:32.654Z",
 *             children: []
 *           }
 *         ]
 *     MenuCreateRequest:
 *       type: object
 *       description: Request payload for creating a new menu item
 *       properties:
 *         menuName:
 *           type: string
 *           description: Display name for the menu item
 *           example: "Reports"
 *         path:
 *           type: string
 *           description: URL path for the menu item
 *           example: "/reports"
 *         icon:
 *           type: string
 *           description: Icon identifier for the menu item
 *           example: "assessment"
 *         parentId:
 *           type: string
 *           format: uuid
 *           description: ID of parent menu item (optional)
 *           example: "b7f6c5d4-e3b2-41a0-9d8c-746e53a29b1f"
 *       required:
 *         - menuName
 *         - path
 *       example:
 *         menuName: "Reports"
 *         path: "/reports"
 *         icon: "assessment"
 *     MenuUpdateRequest:
 *       type: object
 *       description: Request payload for updating an existing menu item
 *       properties:
 *         menuName:
 *           type: string
 *           description: New display name for the menu item
 *           example: "Analytics Reports"
 *         path:
 *           type: string
 *           description: New URL path for the menu item
 *           example: "/analytics/reports"
 *         icon:
 *           type: string
 *           description: New icon identifier for the menu item
 *           example: "analytics"
 *         parentId:
 *           type: string
 *           format: uuid
 *           description: New parent menu ID (optional)
 *           example: "c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f"
 *       example:
 *         menuName: "Analytics Reports"
 *         path: "/analytics/reports"
 *         icon: "analytics"
 */

export class MenuController {
    private menuService: MenuService;

    constructor() {
        this.menuService = new MenuService();
    }

    /**
     * @swagger
     * /api/menus:
     *   get:
     *     summary: Get all menus
     *     description: Retrieves a list of all menu items.
     *     tags: [Menus]
     *     responses:
     *       200:
     *         description: A list of menu items
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
     *                     $ref: '#/components/schemas/Menu'
     *       500:
     *         description: Server error
     */
    getAllMenus = async (req: Request, res: Response) => {
        try {
            const menus = await this.menuService.findAll();
            res.status(200).json({ status: 'success', data: menus });
        } catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to fetch menus' });
        }
    };

    /**
     * @swagger
     * /api/menus/{id}:
     *   get:
     *     summary: Get menu by ID
     *     description: Retrieves a specific menu item by its ID.
     *     tags: [Menus]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Unique identifier of the menu item
     *     responses:
     *       200:
     *         description: Menu item data retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   $ref: '#/components/schemas/Menu'
     *       404:
     *         description: Menu item not found
     *       500:
     *         description: Server error
     */
    getMenuById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const menu = await this.menuService.findById(id);

            if (!menu) {
                return res.status(404).json({ status: 'error', message: 'Menu not found' });
            }

            res.status(200).json({ status: 'success', data: menu });
        } catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to fetch menu' });
        }
    };

    /**
     * @swagger
     * /api/menus/tree:
     *   get:
     *     summary: Get menu tree
     *     description: |
     *       Retrieves the hierarchical menu structure with parent-child relationships.
     *       
     *       This endpoint returns a nested tree structure where each menu item may contain children,
     *       and those children may contain their own children, creating a multi-level navigation hierarchy.
     *       
     *       Top-level menus (those with no parent) form the root of the tree, and all child menus
     *       are organized under their respective parents. Each menu contains its full data plus a
     *       `children` array that contains all of its direct child menus.
     *     tags: [Menus]
     *     responses:
     *       200:
     *         description: Hierarchical menu structure successfully retrieved
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   description: Response status
     *                   example: success
     *                 data:
     *                   type: array
     *                   description: Array of top-level menu items with nested children
     *                   items:
     *                     $ref: '#/components/schemas/MenuTree'
     *             examples:
     *               menuTree:
     *                 summary: Sample menu tree structure
     *                 value:
     *                   status: success
     *                   data: [
     *                     {
     *                       id: "b7f6c5d4-e3b2-41a0-9d8c-746e53a29b1f",
     *                       menuName: "Dashboard",
     *                       path: "/dashboard",
     *                       icon: "dashboard",
     *                       parentId: null,
     *                       createdAt: "2025-07-10T15:30:45.123Z",
     *                       updatedAt: "2025-07-11T08:22:12.345Z",
     *                       children: []
     *                     },
     *                     {
     *                       id: "c8d9e0f1-a2b3-4c5d-6e7f-8a9b0c1d2e3f",
     *                       menuName: "Settings",
     *                       path: "/settings",
     *                       icon: "settings",
     *                       parentId: null,
     *                       createdAt: "2025-07-10T15:35:12.987Z",
     *                       updatedAt: "2025-07-11T08:23:45.678Z",
     *                       children: [
     *                         {
     *                           id: "d1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a",
     *                           menuName: "User Settings",
     *                           path: "/settings/user",
     *                           icon: "person",
     *                           parentId: "c8d9e0f1-a2b3-4c5d-6e7f-8a9b0c1d2e3f",
     *                           createdAt: "2025-07-10T15:40:22.456Z",
     *                           updatedAt: "2025-07-11T08:24:15.789Z",
     *                           children: []
     *                         },
     *                         {
     *                           id: "e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b",
     *                           menuName: "System Settings",
     *                           path: "/settings/system",
     *                           icon: "build",
     *                           parentId: "c8d9e0f1-a2b3-4c5d-6e7f-8a9b0c1d2e3f",
     *                           createdAt: "2025-07-10T15:45:33.321Z",
     *                           updatedAt: "2025-07-11T08:25:18.654Z",
     *                           children: []
     *                         }
     *                       ]
     *                     }
     *                   ]
     *       500:
     *         description: Server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: error
     *                 message:
     *                   type: string
     *                   example: Failed to fetch menu tree
     */
    getMenuTree = async (req: Request, res: Response) => {
        try {
            const menuTree = await this.menuService.getMenuTree();
            res.status(200).json({ status: 'success', data: menuTree });
        } catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to fetch menu tree' });
        }
    };

    /**
     * @swagger
     * /api/menus:
     *   post:
     *     summary: Create a new menu item
     *     description: Creates a new menu item in the system. Admin role required.
     *     tags: [Menus]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               menuName:
     *                 type: string
     *                 description: Name of the menu item
     *               path:
     *                 type: string
     *                 description: URL path for the menu item
     *               icon:
     *                 type: string
     *                 description: Icon identifier for the menu item
     *               parentId:
     *                 type: string
     *                 format: uuid
     *                 description: ID of parent menu item (optional)
     *             required:
     *               - menuName
     *               - path
     *     responses:
     *       201:
     *         description: Menu item created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   $ref: '#/components/schemas/Menu'
     *       400:
     *         description: Bad request - Validation error or parent menu not found
     *       401:
     *         description: Unauthorized - User not authenticated
     *       403:
     *         description: Forbidden - User does not have admin role
     *       500:
     *         description: Server error
     */
    createMenu = [
        // Validation
        body('menuName').notEmpty().withMessage('Menu name is required'),
        body('path').notEmpty().withMessage('Path is required'),
        body('icon').optional(),
        body('parentId').optional(),

        async (req: Request, res: Response) => {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ status: 'error', errors: errors.array() });
            }

            try {
                // Check if parent exists if parentId provided
                if (req.body.parentId) {
                    const parentMenu = await this.menuService.findById(req.body.parentId);
                    if (!parentMenu) {
                        return res.status(400).json({ status: 'error', message: 'Parent menu not found' });
                    }
                }

                const menu = await this.menuService.create(req.body);
                res.status(201).json({ status: 'success', data: menu });
            } catch (error) {
                res.status(500).json({ status: 'error', message: 'Failed to create menu' });
            }
        }
    ];

    /**
     * @swagger
     * /api/menus/{id}:
     *   put:
     *     summary: Update a menu item
     *     description: Updates an existing menu item by ID. Admin role required.
     *     tags: [Menus]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Unique identifier of the menu item to update
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               menuName:
     *                 type: string
     *                 description: New name for the menu item
     *               path:
     *                 type: string
     *                 description: New URL path for the menu item
     *               icon:
     *                 type: string
     *                 description: New icon identifier for the menu item
     *               parentId:
     *                 type: string
     *                 format: uuid
     *                 description: New parent menu ID (optional)
     *     responses:
     *       200:
     *         description: Menu item updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: success
     *                 data:
     *                   $ref: '#/components/schemas/Menu'
     *       400:
     *         description: Bad request - Validation error, parent menu not found, or circular reference
     *       401:
     *         description: Unauthorized - User not authenticated
     *       403:
     *         description: Forbidden - User does not have admin role
     *       404:
     *         description: Menu item not found
     *       500:
     *         description: Server error
     */
    updateMenu = [
        // Validation
        body('menuName').optional().notEmpty().withMessage('Menu name cannot be empty'),
        body('path').optional().notEmpty().withMessage('Path cannot be empty'),
        body('icon').optional(),
        body('parentId').optional(),

        async (req: Request, res: Response) => {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ status: 'error', errors: errors.array() });
            }

            try {
                const { id } = req.params;

                // Check if parent exists if parentId provided
                if (req.body.parentId) {
                    // Don't allow setting a menu as its own parent
                    if (req.body.parentId === id) {
                        return res.status(400).json({ status: 'error', message: 'Menu cannot be its own parent' });
                    }

                    const parentMenu = await this.menuService.findById(req.body.parentId);
                    if (!parentMenu) {
                        return res.status(400).json({ status: 'error', message: 'Parent menu not found' });
                    }
                }

                const menu = await this.menuService.update(id, req.body);

                if (!menu) {
                    return res.status(404).json({ status: 'error', message: 'Menu not found' });
                }

                res.status(200).json({ status: 'success', data: menu });
            } catch (error) {
                res.status(500).json({ status: 'error', message: 'Failed to update menu' });
            }
        }
    ];

    /**
     * @swagger
     * /api/menus/{id}:
     *   delete:
     *     summary: Delete a menu item
     *     description: Deletes a menu item by ID. Admin role required.
     *     tags: [Menus]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: Unique identifier of the menu item to delete
     *     responses:
     *       200:
     *         description: Menu item deleted successfully
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
     *                   example: Menu deleted successfully
     *       401:
     *         description: Unauthorized - User not authenticated
     *       403:
     *         description: Forbidden - User does not have admin role
     *       404:
     *         description: Menu item not found
     *       500:
     *         description: Server error
     */
    deleteMenu = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const deleted = await this.menuService.delete(id);

            if (!deleted) {
                return res.status(404).json({ status: 'error', message: 'Menu not found' });
            }

            res.status(200).json({ status: 'success', message: 'Menu deleted successfully' });
        } catch (error) {
            res.status(500).json({ status: 'error', message: 'Failed to delete menu' });
        }
    };
}
