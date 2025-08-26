import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { SettingsService } from '../services/settings.service';

/**
 * @swagger
 * components:
 *   schemas:
 *     Settings:
 *       type: object
 *       properties:
 *         appName:
 *           type: string
 *           description: Name of the application
 *           example: Express TypeScript Starter
 *         timezone:
 *           type: string
 *           description: Default timezone for date/time operations
 *           example: UTC
 *         jwtTimeout:
 *           type: string
 *           description: JWT token expiration time
 *           example: 24h
 *         appMetaData:
 *           type: object
 *           description: Additional metadata about the application
 *           properties:
 *             version:
 *               type: string
 *               example: 1.0.0
 *             description:
 *               type: string
 *               example: Express TypeScript API with MySQL/PostgreSQL support
 *         database:
 *           type: string
 *           description: Active database configuration
 *           example: mysql
 *           enum: [mysql, postgres]
 */

export class SettingsController {
    private settingsService: SettingsService;

    constructor() {
        this.settingsService = new SettingsService();
    }

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
     *         description: Returns all application settings
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
     *         description: Unauthorized
     *       403:
     *         description: Forbidden - Insufficient permissions
     *       500:
     *         description: Server error
     */
    getAllSettings = async (req: Request, res: Response) => {
        try {
            const settings = await this.settingsService.getAllSettings();
            res.status(200).json({ status: 'success', data: settings });
        } catch (error) {
            console.error('Error fetching settings:', error);
            res.status(500).json({ status: 'error', message: 'Failed to fetch settings' });
        }
    };

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
     *             type: object
     *             properties:
     *               appName:
     *                 type: string
     *                 description: Name of the application
     *               timezone:
     *                 type: string
     *                 description: Default timezone for date/time operations
     *               jwtTimeout:
     *                 type: string
     *                 description: JWT token expiration time (e.g. '24h', '7d')
     *               appMetaData:
     *                 type: object
     *                 description: Additional metadata about the application
     *               database:
     *                 type: string
     *                 description: Active database configuration
     *                 enum: [mysql, postgres]
     *     responses:
     *       200:
     *         description: Returns updated settings
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
     *         description: Unauthorized
     *       403:
     *         description: Forbidden - Insufficient permissions
     *       500:
     *         description: Server error
     */
    updateSettings = [
        // Validation rules
        body('appName').optional().isString().withMessage('Application name must be a string'),
        body('timezone').optional().isString().withMessage('Timezone must be a string'),
        body('jwtTimeout').optional().isString().withMessage('JWT timeout must be a string'),
        body('appMetaData').optional().isObject().withMessage('App metadata must be an object'),
        body('database').optional().isIn(['mysql', 'postgres']).withMessage('Database must be either mysql or postgres'),

        async (req: Request, res: Response) => {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ status: 'error', errors: errors.array() });
            }

            try {
                const updatedSettings = await this.settingsService.updateSettings(req.body);
                res.status(200).json({ status: 'success', data: updatedSettings });
            } catch (error) {
                console.error('Error updating settings:', error);
                res.status(500).json({ status: 'error', message: 'Failed to update settings' });
            }
        }
    ];
}

export default SettingsController;
