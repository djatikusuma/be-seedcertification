import { Router } from 'express';
import CommodityController from '../controllers/commodity.controller';
import { authMiddleware, rbacMiddleware } from '../middleware/auth.middleware';

const router = Router();
const commodityController = new CommodityController();

/**
 * @swagger
 * tags:
 *   name: Commodities
 *   description: Commodity management endpoints
 */

// Get all commodities with filters and pagination
router.get('/', authMiddleware(), rbacMiddleware(['admin', 'verifikatur']), commodityController.getAllCommodities);

// Get commodity by ID
router.get('/:id', authMiddleware(), rbacMiddleware(['admin', 'verifikatur']), commodityController.getCommodityById);

// Create new commodity
router.post('/', authMiddleware(), rbacMiddleware(['admin']), commodityController.createCommodity);

// Update commodity
router.put('/:id', authMiddleware(), rbacMiddleware(['admin']), commodityController.updateCommodity);

// Delete commodity (soft delete)
router.delete('/:id', authMiddleware(), rbacMiddleware(['admin']), commodityController.deleteCommodity);

// Toggle commodity status
router.patch('/:id/toggle-status', authMiddleware(), rbacMiddleware(['admin']), commodityController.toggleCommodityStatus);

export default router;
