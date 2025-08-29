import { Router } from 'express';
import userRoutes from './user.routes';
import roleRoutes from './role.routes';
import menuRoutes from './menu.routes';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import internalProfileRoutes from './internalProfile.routes';
import applicantProfileRoutes from './applicantProfile.routes';
import settingsRoutes from './settings.routes';
import registrationRoutes from './registration.routes';
import tempUserRoutes from './tempUser.routes';
import auditTrailRoutes from './auditTrail.routes';
import commodityRoutes from './commodity.routes';
import recommendationRoutes from './recommendation.routes';
import certificationRoutes from './certification.routes';
import { auditLog, loginAudit } from '../middleware/auditLog.middleware';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'API is working properly' });
});

// Register all routes
router.use('/auth', loginAudit(), authRoutes);
router.use('/', auditLog(), registrationRoutes); // Registration routes (public and protected)
router.use('/temp-users', auditLog(), tempUserRoutes);
router.use('/audit-trails', auditLog(), auditTrailRoutes);
router.use('/profile', auditLog(), profileRoutes);
router.use('/internal-profiles', auditLog(), internalProfileRoutes);
router.use('/applicant-profiles', auditLog(), applicantProfileRoutes);
router.use('/users', auditLog(), userRoutes);
router.use('/roles', auditLog(), roleRoutes);
router.use('/menus', auditLog(), menuRoutes);
router.use('/settings', auditLog(), settingsRoutes);
router.use('/commodities', auditLog(), commodityRoutes);
router.use('/recommendations', auditLog(), recommendationRoutes);
router.use('/certifications', auditLog(), certificationRoutes);

export default router;
