import express from 'express';
import { TempUserController } from '../controllers/tempUser.controller';
import { authMiddleware, rbacMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
const tempUserController = new TempUserController();

// Public routes for registration
router.post('/register', tempUserController.register.bind(tempUserController));

// Protected routes for admin/verifikatur
router.get('/pending', authMiddleware(), rbacMiddleware(['admin', 'verifikatur']), tempUserController.getPendingRegistrations.bind(tempUserController));
router.get('/statistics', authMiddleware(), rbacMiddleware(['admin', 'verifikatur']), tempUserController.getStatistics.bind(tempUserController));
router.get('/:id', authMiddleware(), rbacMiddleware(['admin', 'verifikatur']), tempUserController.getTempUserDetails.bind(tempUserController));
router.patch('/:id/verify', authMiddleware(), rbacMiddleware(['admin', 'verifikatur']), tempUserController.verifyRegistration.bind(tempUserController));

export default router;
