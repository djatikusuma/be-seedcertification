import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { SimpleDashboardController } from '../controllers/simple-dashboard.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const dashboardController = new DashboardController();
const simpleDashboardController = new SimpleDashboardController();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard statistics and analytics endpoints
 */

// All dashboard routes require authentication
router.use(authMiddleware());

/**
 * Dashboard statistics endpoint
 * Returns different data structure based on user role:
 * - Petani/Perusahaan: Personal statistics only
 * - Other roles: System-wide statistics
 */
router.get('/statistics', dashboardController.getStatistics);

/**
 * Simple dashboard statistics endpoint (for testing)
 * Returns mock data for testing purposes
 */
router.get('/test-statistics', simpleDashboardController.getStatistics);

export default router;
