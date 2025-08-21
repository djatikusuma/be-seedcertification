import { Router } from 'express';
import { MenuController } from '../controllers/menu.controller';
import { authMiddleware, rbacMiddleware } from '../middleware/auth.middleware';

const router = Router();
const menuController = new MenuController();

// Protect all profile routes with authentication
router.use(authMiddleware);
// Public routes for reading menus - accessible by anyone
router.get('/', menuController.getAllMenus);
router.get('/tree', menuController.getMenuTree);
router.get('/:id', menuController.getMenuById);

// Protected routes for modifying menus - admin only
router.use(authMiddleware, rbacMiddleware(['admin']));
router.post('/', menuController.createMenu);
router.put('/:id', menuController.updateMenu);
router.delete('/:id', menuController.deleteMenu);

export default router;
