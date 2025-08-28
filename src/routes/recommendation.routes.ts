import { Router } from 'express';
import RecommendationController from '../controllers/recommendation.controller';
import { authMiddleware, rbacMiddleware } from '../middleware/auth.middleware';
import upload from '../middleware/upload.middleware';

const router = Router();
const recommendationController = new RecommendationController();

/**
 * @swagger
 * tags:
 *   name: Recommendations
 *   description: Recommendation management endpoints
 */

// Get all recommendations (role-based filtering)
router.get('/',
    authMiddleware(),
    rbacMiddleware(['admin', 'verifikatur', 'inspektur_ketua', 'inspektur', 'kepala', 'petani', 'perusahaan']),
    recommendationController.getAllRecommendations
);

// Get recommendation by ID
router.get('/:id',
    authMiddleware(),
    rbacMiddleware(['admin', 'verifikatur', 'inspektur_ketua', 'inspektur', 'kepala', 'petani', 'perusahaan']),
    recommendationController.getRecommendationById
);

// Create new recommendation (pemohon only)
router.post('/',
    authMiddleware(),
    rbacMiddleware(['petani', 'perusahaan']),
    upload.single('file_penguasaan_benih'),
    recommendationController.createRecommendation
);

// Verify recommendation (verifikatur only)
router.post('/:id/verification',
    authMiddleware(),
    rbacMiddleware(['verifikatur']),
    recommendationController.verifyRecommendation
);

// Schedule recommendation (inspektur_ketua only)
router.post('/:id/scheduling',
    authMiddleware(),
    rbacMiddleware(['inspektur_ketua']),
    recommendationController.scheduleRecommendation
);

// Inspect recommendation (verifikatur only)
router.post('/:id/inspection',
    authMiddleware(),
    rbacMiddleware(['inspektur']),
    recommendationController.inspectRecommendation
);

// Publish recommendation (kepala only)
router.post('/:id/publish',
    authMiddleware(),
    rbacMiddleware(['kepala']),
    recommendationController.publishRecommendation
);

export default router;
