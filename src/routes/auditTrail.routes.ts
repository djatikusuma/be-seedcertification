import express from 'express';
import { AuditTrailController } from '../controllers/auditTrail.controller';
import { authMiddleware, rbacMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
const auditTrailController = new AuditTrailController();

// All audit trail routes require authentication
// Role-based access control is handled separately

// Get audit trails with filtering
router.get(
    '/',
    authMiddleware(),
    rbacMiddleware(['admin', 'auditor', 'supervisor']),
    AuditTrailController.getAuditTrailsValidationRules(),
    auditTrailController.getAuditTrails.bind(auditTrailController)
);

// Get audit trail details
router.get(
    '/:id',
    authMiddleware(),
    rbacMiddleware(['admin', 'auditor', 'supervisor']),
    AuditTrailController.getAuditTrailDetailsValidationRules(),
    auditTrailController.getAuditTrailDetails.bind(auditTrailController)
);

// Get user activity summary
router.get(
    '/user/:userId/activity',
    authMiddleware(), // Any authenticated user
    auditTrailController.getUserActivitySummary.bind(auditTrailController)
);

// Get current user activity summary
router.get(
    '/user/activity',
    authMiddleware(), // Any authenticated user
    auditTrailController.getUserActivitySummary.bind(auditTrailController)
);

// Get system activity statistics
router.get(
    '/system/stats',
    authMiddleware(),
    rbacMiddleware(['admin', 'auditor']),
    auditTrailController.getSystemActivityStats.bind(auditTrailController)
);

// Get failed operations
router.get(
    '/system/failed',
    authMiddleware(),
    rbacMiddleware(['admin', 'auditor', 'supervisor']),
    auditTrailController.getFailedOperations.bind(auditTrailController)
);

// Get security events
router.get(
    '/system/security',
    authMiddleware(),
    rbacMiddleware(['admin', 'auditor']),
    auditTrailController.getSecurityEvents.bind(auditTrailController)
);

// Get audit trails by entity
router.get(
    '/entity/:entityType/:entityId',
    authMiddleware(),
    rbacMiddleware(['admin', 'auditor', 'supervisor']),
    auditTrailController.getAuditTrailsByEntity.bind(auditTrailController)
);

// Export audit trails
router.get(
    '/export',
    authMiddleware(),
    rbacMiddleware(['admin', 'auditor']),
    AuditTrailController.getExportValidationRules(),
    auditTrailController.exportAuditTrails.bind(auditTrailController)
);

// Clean old audit trails (maintenance)
router.delete(
    '/clean',
    authMiddleware(),
    rbacMiddleware(['admin']),
    auditTrailController.cleanOldAuditTrails.bind(auditTrailController)
);

export default router;
