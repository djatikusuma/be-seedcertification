import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware, rbacMiddleware } from '../middleware/auth.middleware';

const router = Router();
const userController = new UserController();

// Protect all user management routes with authentication and admin role check
router.use(authMiddleware(), rbacMiddleware(['admin']));

// CRUD operations for users (admin only)
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
