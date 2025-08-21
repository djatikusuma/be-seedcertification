import { Router } from 'express';
import profileController from '../controllers/profile.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Protect all profile routes with authentication
router.use(authMiddleware);

/**
 * @route   GET /api/profile
 * @desc    Get user's own profile
 * @access  Private
 */
router.get('/', profileController.getProfile);

/**
 * @route   PUT /api/profile
 * @desc    Update user's own profile
 * @access  Private
 */
router.put('/', profileController.updateProfile);

/**
 * @route   GET /api/profile/download
 * @desc    Download user's data as JSON
 * @access  Private
 */
router.get('/download', profileController.downloadProfile);

/**
 * @route   POST /api/profile/delete-request
 * @desc    Request account deletion
 * @access  Private
 */
router.post('/delete-request', profileController.requestDeletion);

export default router;
