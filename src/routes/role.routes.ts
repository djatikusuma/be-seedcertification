import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { authMiddleware, rbacMiddleware } from '../middleware/auth.middleware';

const router = Router();
const roleController = new RoleController();

// Protect all role routes with authentication and admin role check
router.use(authMiddleware(), rbacMiddleware(['admin', 'inspektur_ketua', 'verifikatur']));

// CRUD operations for roles
router.get('/', roleController.getAllRoles);
router.get('/:id', roleController.getRoleById);
router.post('/', roleController.createRole);
router.put('/:id', roleController.updateRole);
router.delete('/:id', roleController.deleteRole);

export default router;
