# Audit Trail API Documentation

## Overview
Modul Audit Trail menyediakan logging komprehensif untuk semua aktivitas user dengan enkripsi/dekripsi otomatis pada payload sensitif.

## Features
- ✅ **Auto Logging**: Middleware otomatis untuk semua HTTP requests
- ✅ **Encryption**: Enkripsi otomatis untuk data sensitif (oldData, newData, changes, metadata, stackTrace)
- ✅ **Role-based Access**: Akses data audit berdasarkan role user
- ✅ **Advanced Filtering**: Filter berdasarkan user, action, entity, tanggal, severity, dll
- ✅ **Export Functionality**: Export audit trails dalam format CSV/JSON
- ✅ **Security Events**: Tracking khusus untuk events dengan severity tinggi
- ✅ **Performance Monitoring**: Tracking durasi response dan failed operations

## API Endpoints

### 1. Get Audit Trails
```
GET /api/audit-trails
```
**Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 100)
- `userId` (optional): Filter by user ID
- `action` (optional): Filter by action type
- `entityType` (optional): Filter by entity type
- `entityId` (optional): Filter by specific entity ID
- `severity` (optional): Filter by severity level
- `success` (optional): Filter by success status (true/false)
- `startDate` (optional): Filter from date (ISO 8601)
- `endDate` (optional): Filter to date (ISO 8601)
- `ipAddress` (optional): Filter by IP address
- `endpoint` (optional): Filter by endpoint pattern
- `tags` (optional): Filter by tags (comma-separated)

**Response:**
```json
{
  "success": true,
  "message": "Audit trails berhasil diambil",
  "data": [
    {
      "id": "uuid",
      "action": "create",
      "entityType": "user",
      "entityId": "uuid",
      "severity": "medium",
      "success": true,
      "createdAt": "2025-08-26T10:30:00Z",
      // Additional fields based on user role
    }
  ],
  "pagination": {
    "total": 150,
    "totalPages": 3,
    "currentPage": 1,
    "limit": 50
  }
}
```

### 2. Get Audit Trail Details
```
GET /api/audit-trails/:id
```
**Response:**
```json
{
  "success": true,
  "message": "Detail audit trail berhasil diambil",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "action": "update",
    "entityType": "user",
    "entityId": "uuid",
    "oldData": "encrypted_data_decrypted_for_admin",
    "newData": "encrypted_data_decrypted_for_admin",
    "changes": "encrypted_changes_decrypted_for_admin",
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "endpoint": "/api/users/123",
    "httpMethod": "PATCH",
    "statusCode": 200,
    "duration": 250,
    "severity": "medium",
    "success": true,
    "metadata": "encrypted_metadata_decrypted_for_admin",
    "createdAt": "2025-08-26T10:30:00Z"
  }
}
```

### 3. Get User Activity Summary
```
GET /api/audit-trails/user/:userId/activity
GET /api/audit-trails/user/activity (current user)
```
**Parameters:**
- `days` (optional): Number of days to look back (default: 30)

### 4. Get System Activity Statistics
```
GET /api/audit-trails/system/stats
```
**Parameters:**
- `days` (optional): Number of days to analyze (default: 7)

### 5. Get Failed Operations
```
GET /api/audit-trails/system/failed
```
**Parameters:**
- `hours` (optional): Number of hours to look back (default: 24)

### 6. Get Security Events
```
GET /api/audit-trails/system/security
```
**Parameters:**
- `days` (optional): Number of days to look back (default: 7)

### 7. Get Audit Trails by Entity
```
GET /api/audit-trails/entity/:entityType/:entityId
```

### 8. Export Audit Trails
```
GET /api/audit-trails/export
```
**Parameters:**
- `format` (optional): Export format ('csv' or 'json', default: 'csv')
- Plus all filter parameters from Get Audit Trails

### 9. Clean Old Audit Trails (Admin Only)
```
DELETE /api/audit-trails/clean
```
**Parameters:**
- `daysToKeep` (optional): Number of days to keep (default: 365)

## Action Types
```typescript
enum ActionType {
    CREATE = 'create',
    READ = 'read',
    UPDATE = 'update',
    DELETE = 'delete',
    LOGIN = 'login',
    LOGOUT = 'logout',
    APPROVE = 'approve',
    REJECT = 'reject',
    UPLOAD = 'upload',
    DOWNLOAD = 'download',
    EXPORT = 'export',
    IMPORT = 'import',
    VERIFY = 'verify',
    REVOKE = 'revoke',
    TRANSFER = 'transfer',
    RESTORE = 'restore'
}
```

## Entity Types
```typescript
enum EntityType {
    USER = 'user',
    TEMP_USER = 'temp_user',
    PROFILE = 'profile',
    PROFILE_APPLICANT = 'profile_applicant',
    ROLE = 'role',
    MENU = 'menu',
    SETTINGS = 'settings',
    BLOCKCHAIN_TRANSACTION = 'blockchain_transaction',
    BLOCKCHAIN_ASSET = 'blockchain_asset',
    BLOCKCHAIN_CERTIFICATE = 'blockchain_certificate',
    FILE = 'file',
    SYSTEM = 'system'
}
```

## Severity Levels
```typescript
enum SeverityLevel {
    LOW = 'low',        // Read operations, successful requests
    MEDIUM = 'medium',  // Create/Update operations, client errors
    HIGH = 'high',      // Approve/Reject operations, server errors
    CRITICAL = 'critical' // Delete/Revoke operations
}
```

## Role-based Data Access

### Admin & Auditor
- Full access to all audit data
- Can see decrypted sensitive fields
- Can export and clean audit trails

### Supervisor
- Can see most audit data except sensitive details
- Cannot see oldData, newData, changes, metadata, stackTrace
- Can view error messages and basic request info

### Regular Users
- Can only see their own activity summary
- Limited access to basic audit information
- Cannot see sensitive operational details

## Middleware Usage Examples

### Basic Auto-Logging
```typescript
// Log all operations with default config
router.use('/api', auditLog());
```

### Login/Logout Specific
```typescript
router.post('/auth/login', loginAudit(), loginController);
router.post('/auth/logout', logoutAudit(), logoutController);
```

### High-Severity Operations
```typescript
router.use('/admin', authMiddleware(['admin']), adminActionAudit());
```

### Custom Audit Configuration
```typescript
router.patch('/users/:id/approve',
    auditLog({
        action: ActionType.APPROVE,
        entityType: EntityType.USER,
        severity: SeverityLevel.HIGH,
        captureRequestBody: true,
        captureResponseBody: true,
        customEntityId: (req) => req.params.id,
        customMetadata: (req, res) => ({
            approverRole: req.user?.role,
            reason: req.body?.reason
        })
    }),
    approvalController
);
```

## Data Encryption

### Encrypted Fields
- `oldData`: Data sebelum perubahan
- `newData`: Data setelah perubahan  
- `changes`: Detail perubahan
- `metadata`: Metadata tambahan
- `stackTrace`: Stack trace error

### Encryption Method
- Algorithm: AES-256-CBC
- Format: `encrypted:iv:salt`
- Auto-encryption before save
- Auto-decryption after find (with manual control)
- Role-based masking for secure access

## Database Indexes
```sql
-- Single column indexes
userId, action, entityType, entityId, severity, success, createdAt, ipAddress, sessionId

-- Composite indexes for performance
(entityType, entityId), (userId, createdAt), (action, entityType), 
(severity, createdAt), (success, createdAt)
```

## Security Features
- Automatic sanitization of sensitive headers
- Request/response body sanitization
- IP address tracking
- Session tracking
- User agent logging
- Role-based access control
- Encrypted storage of sensitive data
