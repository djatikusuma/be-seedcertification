import { Router } from 'express';
import userRoutes from './user.routes';
import roleRoutes from './role.routes';
import menuRoutes from './menu.routes';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import internalProfileRoutes from './internalProfile.routes';
import applicantProfileRoutes from './applicantProfile.routes';
import settingsRoutes from './settings.routes';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'API is working properly' });
});

// Register all routes
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/internal-profiles', internalProfileRoutes);
router.use('/applicant-profiles', applicantProfileRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/menus', menuRoutes);
router.use('/settings', settingsRoutes);

export default router;
