import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware, rbacMiddleware } from '../middleware/auth.middleware';

const router = Router();
const userController = new UserController();

// Routes accessible by authenticated users
// Update user by ID - users can update their own data, admin can update any user
router.put('/:id', authMiddleware(), userController.updateUser);

// Admin-only routes for user management
router.use(authMiddleware(), rbacMiddleware(['admin', 'inspektur_ketua', 'kepala']));

// CRUD operations for users (admin only)
router.get('/', userController.getAllUsers);
router.get('/search', userController.searchUsers); // Must be before /:id route
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.patch('/:id/status', rbacMiddleware(['admin', 'kepala']), userController.updateUserStatus); // Only admin and kepala can update status
router.delete('/:id', userController.deleteUser);

export default router;
