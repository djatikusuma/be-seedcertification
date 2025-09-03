import { Request, Response } from 'express';
import { CommodityService, CreateCommodityDto, UpdateCommodityDto } from '../services/commodity.service';
import { CommodityFilterOptions } from '../repositories/commodity.repository';

/**
 * @swagger
 * components:
 *   schemas:
 *     Commodity:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Primary key
 *         code:
 *           type: string
 *           description: Commodity code (unique)
 *           maxLength: 50
 *         nama:
 *           type: string
 *           description: Commodity name
 *           maxLength: 255
 *         nama_latin:
 *           type: string
 *           description: Latin name (optional)
 *           maxLength: 255
 *         smsb:
 *           type: integer
 *           description: SMSB value
 *           default: 1
 *           minimum: 0
 *         smb:
 *           type: integer
 *           description: SMB value
 *           default: 1
 *           minimum: 0
 *         is_active:
 *           type: boolean
 *           description: Active status
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateCommodityRequest:
 *       type: object
 *       required:
 *         - code
 *         - nama
 *       properties:
 *         code:
 *           type: string
 *           description: Commodity code (unique)
 *           maxLength: 50
 *         nama:
 *           type: string
 *           description: Commodity name
 *           maxLength: 255
 *         nama_latin:
 *           type: string
 *           description: Latin name (optional)
 *           maxLength: 255
 *         smsb:
 *           type: integer
 *           description: SMSB value
 *           default: 1
 *           minimum: 0
 *         smb:
 *           type: integer
 *           description: SMB value
 *           default: 1
 *           minimum: 0
 *         is_active:
 *           type: boolean
 *           description: Active status
 *           default: true
 *     UpdateCommodityRequest:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           description: Commodity code (unique)
 *           maxLength: 50
 *         nama:
 *           type: string
 *           description: Commodity name
 *           maxLength: 255
 *         nama_latin:
 *           type: string
 *           description: Latin name (optional)
 *           maxLength: 255
 *         smsb:
 *           type: integer
 *           description: SMSB value
 *           minimum: 0
 *         smb:
 *           type: integer
 *           description: SMB value
 *           minimum: 0
 *         is_active:
 *           type: boolean
 *           description: Active status
 *     CommodityListResponse:
 *       type: object
 *       properties:
 *         rows:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Commodity'
 *         count:
 *           type: integer
 *           description: Total number of records
 *         totalPages:
 *           type: integer
 *           description: Total number of pages
 *         currentPage:
 *           type: integer
 *           description: Current page number
 */

export class CommodityController {
    private commodityService: CommodityService;

    constructor() {
        this.commodityService = new CommodityService();
    }

    /**
     * @swagger
     * /api/commodities:
     *   get:
     *     summary: Get all commodities with filtering and pagination
     *     tags: [Commodities]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *         description: Page number
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *         description: Number of items per page
     *       - in: query
     *         name: code
     *         schema:
     *           type: string
     *         description: Filter by code (partial match)
     *       - in: query
     *         name: nama
     *         schema:
     *           type: string
     *         description: Filter by name (partial match)
     *       - in: query
     *         name: is_active
     *         schema:
     *           type: boolean
     *         description: Filter by active status
     *       - in: query
     *         name: search
     *         schema:
     *           type: string
     *         description: Search in code, nama, or nama_latin
     *     responses:
     *       200:
     *         description: Commodities retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *                 data:
     *                   $ref: '#/components/schemas/CommodityListResponse'
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Internal server error
     */
    getAllCommodities = async (req: Request, res: Response): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const filters: CommodityFilterOptions = {
                code: req.query.code as string,
                nama: req.query.nama as string,
                is_active: req.query.is_active ? req.query.is_active === 'true' : undefined,
                search: req.query.search as string,
            };

            // Remove undefined values
            Object.keys(filters).forEach(key => {
                if (filters[key as keyof CommodityFilterOptions] === undefined) {
                    delete filters[key as keyof CommodityFilterOptions];
                }
            });

            const result = await this.commodityService.getCommodities(filters, page, limit);

            res.status(200).json({
                success: true,
                message: 'Commodities retrieved successfully',
                status: 'success',
                data: result.rows,
                meta: {
                    total: result.count,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                    limit: limit
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving commodities',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };

    /**
     * @swagger
     * /api/commodities/{id}:
     *   get:
     *     summary: Get commodity by ID
     *     tags: [Commodities]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Commodity ID
     *     responses:
     *       200:
     *         description: Commodity retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *                 data:
     *                   $ref: '#/components/schemas/Commodity'
     *       404:
     *         description: Commodity not found
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Internal server error
     */
    getCommodityById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            // Validate id parameter
            if (!id || id.trim() === '') {
                res.status(400).json({
                    success: false,
                    message: 'Commodity ID is required',
                });
                return;
            }

            const commodity = await this.commodityService.findById(id);

            if (!commodity) {
                res.status(404).json({
                    success: false,
                    message: 'Commodity not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Commodity retrieved successfully',
                data: commodity,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving commodity',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };

    /**
     * @swagger
     * /api/commodities:
     *   post:
     *     summary: Create a new commodity
     *     tags: [Commodities]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateCommodityRequest'
     *     responses:
     *       201:
     *         description: Commodity created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *                 data:
     *                   $ref: '#/components/schemas/Commodity'
     *       400:
     *         description: Bad request or validation error
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Internal server error
     */
    createCommodity = async (req: Request, res: Response): Promise<void> => {
        try {
            // Check if request body exists
            if (!req.body) {
                res.status(400).json({
                    success: false,
                    message: 'Request body is required',
                });
                return;
            }

            const commodityData: CreateCommodityDto = req.body;

            // Basic validation for required fields
            if (!commodityData.code || commodityData.code.trim() === '') {
                res.status(400).json({
                    success: false,
                    message: 'Code is required and cannot be empty',
                });
                return;
            }

            if (!commodityData.nama || commodityData.nama.trim() === '') {
                res.status(400).json({
                    success: false,
                    message: 'Nama is required and cannot be empty',
                });
                return;
            }

            // Validate data types
            if (commodityData.smsb !== undefined && (!Number.isInteger(commodityData.smsb) || commodityData.smsb < 0)) {
                res.status(400).json({
                    success: false,
                    message: 'SMSB must be a non-negative integer',
                });
                return;
            }

            if (commodityData.smb !== undefined && (!Number.isInteger(commodityData.smb) || commodityData.smb < 0)) {
                res.status(400).json({
                    success: false,
                    message: 'SMB must be a non-negative integer',
                });
                return;
            }

            if (commodityData.is_active !== undefined && typeof commodityData.is_active !== 'boolean') {
                res.status(400).json({
                    success: false,
                    message: 'is_active must be a boolean',
                });
                return;
            }

            const commodity = await this.commodityService.createCommodity(commodityData);

            res.status(201).json({
                success: true,
                message: 'Commodity created successfully',
                data: commodity,
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'Code already exists') {
                res.status(400).json({
                    success: false,
                    message: 'Code already exists',
                });
                return;
            }

            res.status(500).json({
                success: false,
                message: 'Error creating commodity',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };

    /**
     * @swagger
     * /api/commodities/{id}:
     *   put:
     *     summary: Update commodity by ID
     *     tags: [Commodities]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Commodity ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateCommodityRequest'
     *     responses:
     *       200:
     *         description: Commodity updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *                 data:
     *                   $ref: '#/components/schemas/Commodity'
     *       400:
     *         description: Bad request or validation error
     *       404:
     *         description: Commodity not found
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Internal server error
     */
    updateCommodity = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            // Check if request body exists
            if (!req.body) {
                res.status(400).json({
                    success: false,
                    message: 'Request body is required',
                });
                return;
            }

            const updateData: UpdateCommodityDto = req.body;

            // Check if at least one field is provided for update
            const hasUpdateData = Object.keys(updateData).length > 0;
            if (!hasUpdateData) {
                res.status(400).json({
                    success: false,
                    message: 'At least one field must be provided for update',
                });
                return;
            }

            // Validate individual fields if provided
            if (updateData.code !== undefined && (!updateData.code || updateData.code.trim() === '')) {
                res.status(400).json({
                    success: false,
                    message: 'Code cannot be empty',
                });
                return;
            }

            if (updateData.nama !== undefined && (!updateData.nama || updateData.nama.trim() === '')) {
                res.status(400).json({
                    success: false,
                    message: 'Nama cannot be empty',
                });
                return;
            }

            if (updateData.smsb !== undefined && (!Number.isInteger(updateData.smsb) || updateData.smsb < 0)) {
                res.status(400).json({
                    success: false,
                    message: 'SMSB must be a non-negative integer',
                });
                return;
            }

            if (updateData.smb !== undefined && (!Number.isInteger(updateData.smb) || updateData.smb < 0)) {
                res.status(400).json({
                    success: false,
                    message: 'SMB must be a non-negative integer',
                });
                return;
            }

            if (updateData.is_active !== undefined && typeof updateData.is_active !== 'boolean') {
                res.status(400).json({
                    success: false,
                    message: 'is_active must be a boolean',
                });
                return;
            }

            const commodity = await this.commodityService.updateCommodity(id, updateData);

            if (!commodity) {
                res.status(404).json({
                    success: false,
                    message: 'Commodity not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Commodity updated successfully',
                data: commodity,
            });
        } catch (error) {
            if (error instanceof Error && error.message === 'Code already exists') {
                res.status(400).json({
                    success: false,
                    message: 'Code already exists',
                });
                return;
            }

            res.status(500).json({
                success: false,
                message: 'Error updating commodity',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };

    /**
     * @swagger
     * /api/commodities/{id}:
     *   delete:
     *     summary: Delete commodity by ID (soft delete)
     *     tags: [Commodities]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Commodity ID
     *     responses:
     *       200:
     *         description: Commodity deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *       404:
     *         description: Commodity not found
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Internal server error
     */
    deleteCommodity = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            // Validate id parameter
            if (!id || id.trim() === '') {
                res.status(400).json({
                    success: false,
                    message: 'Commodity ID is required',
                });
                return;
            }

            const deleted = await this.commodityService.delete(id);

            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'Commodity not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Commodity deleted successfully',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting commodity',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };

    /**
     * @swagger
     * /api/commodities/{id}/toggle-status:
     *   patch:
     *     summary: Toggle commodity active status
     *     tags: [Commodities]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: Commodity ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               is_active:
     *                 type: boolean
     *                 description: New active status
     *             required:
     *               - is_active
     *     responses:
     *       200:
     *         description: Commodity status updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 message:
     *                   type: string
     *                 data:
     *                   $ref: '#/components/schemas/Commodity'
     *       400:
     *         description: Bad request
     *       404:
     *         description: Commodity not found
     *       401:
     *         description: Unauthorized
     *       500:
     *         description: Internal server error
     */
    toggleCommodityStatus = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            // Check if request body exists
            if (!req.body) {
                res.status(400).json({
                    success: false,
                    message: 'Request body is required',
                });
                return;
            }

            const { is_active } = req.body;

            // Check if is_active is provided
            if (is_active === undefined || is_active === null) {
                res.status(400).json({
                    success: false,
                    message: 'is_active field is required',
                });
                return;
            }

            // Check if is_active is boolean
            if (typeof is_active !== 'boolean') {
                res.status(400).json({
                    success: false,
                    message: 'is_active must be a boolean (true or false)',
                });
                return;
            }

            const commodity = await this.commodityService.activateDeactivateCommodity(id, is_active);

            if (!commodity) {
                res.status(404).json({
                    success: false,
                    message: 'Commodity not found',
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: `Commodity ${is_active ? 'activated' : 'deactivated'} successfully`,
                data: commodity,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating commodity status',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };
}

export default CommodityController;
