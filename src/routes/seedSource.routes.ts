import { Router } from 'express';
import { SeedSourceController } from '../controllers/seedSource.controller';
import { authMiddleware, rbacMiddleware } from '../middleware/auth.middleware';
import seedSourceUpload from '../middleware/seedSourceUpload.middleware';

const router = Router();
const seedSourceController = new SeedSourceController();

// All routes require authentication
router.use(authMiddleware());

// GET /api/seed-source - Get all seed sources (accessible by all authenticated users)
router.get('/', seedSourceController.getAllSeedSources);

// GET /api/seed-source/:id - Get specific seed source (accessible by all authenticated users)
router.get('/:id', seedSourceController.getSeedSourceById);

// POST /api/seed-source - Create new seed source (only petani and perusahaan) with file upload
router.post('/',
    rbacMiddleware(['petani', 'perusahaan']),
    seedSourceUpload.single('file_penetapan_sumber_benih'), // Middleware untuk upload file
    seedSourceController.createSeedSource
);

// POST /api/seed-source/:id/verification - Verify seed source (only verifikatur)
router.post('/:id/verification', rbacMiddleware(['verifikatur']), seedSourceController.verifySeedSource);

export default router;
