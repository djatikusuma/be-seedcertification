import { Router } from 'express';
import SettingsController from '../controllers/settings.controller';
import { authMiddleware, rbacMiddleware } from '../middleware/auth.middleware';

const router = Router();
const settingsController = new SettingsController();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Global application settings management
 */

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get all application settings
 *     description: Retrieves all global application settings. Requires authentication.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success - Returns all application settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Settings'
 *       401:
 *         description: Unauthorized - User not authenticated
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware(), settingsController.getAllSettings);

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Update application settings
 *     description: Updates global application settings. Admin role is required.
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Settings'
 *     responses:
 *       200:
 *         description: Success - Returns updated settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Settings'
 *       400:
 *         description: Bad request - Validation errors
 *       401:
 *         description: Unauthorized - User not authenticated
 *       403:
 *         description: Forbidden - User does not have admin role
 *       500:
 *         description: Server error
 */
router.put('/', authMiddleware(), rbacMiddleware(['admin']), settingsController.updateSettings);

export default router;
