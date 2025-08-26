import { Router } from 'express';
import { ApplicantProfileController } from '../controllers/applicantProfile.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const applicantProfileController = new ApplicantProfileController();

// Apply authentication middleware to all routes
router.use(authMiddleware());

// User routes (for managing own applicant profile)
router.get('/my-profile', applicantProfileController.getMyProfile.bind(applicantProfileController));
router.post('/my-profile', applicantProfileController.createMyProfile.bind(applicantProfileController));
router.put('/my-profile', applicantProfileController.updateMyProfile.bind(applicantProfileController));
router.delete('/my-profile', applicantProfileController.deleteMyProfile.bind(applicantProfileController));

// Document upload route
router.post('/my-profile/upload-document', applicantProfileController.uploadDocument.bind(applicantProfileController));

// Admin routes (for managing all applicant profiles)
router.get('/all', applicantProfileController.getAllProfiles.bind(applicantProfileController));
router.get('/role/:role', applicantProfileController.getProfilesByRole.bind(applicantProfileController));
router.get('/petani', applicantProfileController.getPetaniProfiles.bind(applicantProfileController));
router.get('/perusahaan', applicantProfileController.getPerusahaanProfiles.bind(applicantProfileController));
router.get('/user/:userId', applicantProfileController.getProfileByUserId.bind(applicantProfileController));
router.get('/nik/:nik', applicantProfileController.getProfileByNik.bind(applicantProfileController));
router.get('/email/:email', applicantProfileController.getProfileByEmail.bind(applicantProfileController));

export default router;
