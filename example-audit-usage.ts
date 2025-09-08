// Contoh penggunaan Audit Trail Middleware dalam routes

import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
    auditLog,
    loginAudit,
    logoutAudit,
    adminActionAudit,
    fileOperationAudit,
    blockchainAudit
} from '../middleware/auditLog.middleware';
import { ActionType, EntityType, SeverityLevel } from '../models/AuditTrail.model';

const router = express.Router();

// 1. Audit untuk semua operasi dengan konfigurasi default
router.use('/api', auditLog());

// 2. Audit khusus untuk login
router.post('/auth/login',
    loginAudit(),
    // login controller here
);

// 3. Audit khusus untuk logout
router.post('/auth/logout',
    authMiddleware(),
    logoutAudit(),
    // logout controller here
);

// 4. Audit untuk operasi admin dengan severity tinggi
router.use('/admin',
    authMiddleware(['admin']),
    adminActionAudit()
);

// 5. Audit untuk operasi file
router.post('/files/upload',
    authMiddleware(),
    fileOperationAudit(),
    // file upload controller
);

// 6. Audit untuk operasi blockchain dengan severity critical
router.use('/blockchain',
    authMiddleware(),
    blockchainAudit()
);

// 7. Audit kustom dengan konfigurasi spesifik
router.patch('/users/:id/approve',
    authMiddleware(['admin', 'supervisor']),
    auditLog({
        action: ActionType.APPROVE,
        entityType: EntityType.USER,
        severity: SeverityLevel.HIGH,
        captureRequestBody: true,
        captureResponseBody: true,
        customEntityId: (req) => req.params.id,
        customMetadata: (req, res) => ({
            approverRole: (req as any).user?.role,
            approvalReason: req.body?.reason
        })
    }),
    // approval controller
);

// 8. Audit untuk operasi sensitive dengan enkripsi data
router.delete('/users/:id',
    authMiddleware(['admin']),
    auditLog({
        action: ActionType.DELETE,
        entityType: EntityType.USER,
        severity: SeverityLevel.CRITICAL,
        captureRequestBody: false, // Jangan capture request body untuk operasi delete
        captureResponseBody: false,
        customEntityId: (req) => req.params.id,
        customMetadata: (req, res) => ({
            deletionReason: req.body?.reason,
            confirmedBy: (req as any).user?.id,
            ipAddress: req.ip
        })
    }),
    // delete controller
);

// 9. Skip audit untuk endpoint tertentu (misalnya health check)
router.get('/health',
    auditLog({ skipLogging: true }),
    (req, res) => res.json({ status: 'ok' })
);

// 10. Audit untuk temp user operations
router.use('/temp-users',
    authMiddleware(),
    auditLog({
        entityType: EntityType.TEMP_USER,
        severity: SeverityLevel.MEDIUM,
        captureRequestBody: true
    })
);

export default router;
