import { Router } from 'express';
import { InternalProfileController } from '../controllers/internalProfile.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const internalProfileController = new InternalProfileController();

// Apply authentication middleware to all routes
router.use(authMiddleware());

// User routes (for managing own internal profile)
router.get('/my-profile', internalProfileController.getMyProfile.bind(internalProfileController));
router.post('/my-profile', internalProfileController.createMyProfile.bind(internalProfileController));
router.put('/my-profile', internalProfileController.updateMyProfile.bind(internalProfileController));
router.delete('/my-profile', internalProfileController.deleteMyProfile.bind(internalProfileController));

// Admin routes (for managing all internal profiles)
router.get('/all', internalProfileController.getAllProfiles.bind(internalProfileController));
router.get('/user/:userId', internalProfileController.getProfileByUserId.bind(internalProfileController));
router.post('/user/:userId', internalProfileController.createProfileByUserId.bind(internalProfileController));
router.put('/user/:userId', internalProfileController.updateProfileByUserId.bind(internalProfileController));
router.delete('/user/:userId', internalProfileController.deleteProfileByUserId.bind(internalProfileController));
router.get('/nik/:nik', internalProfileController.getProfileByNik.bind(internalProfileController));

export default router;
