# Environment Configuration

## Deskripsi
Sistem menggunakan environment variables untuk mengontrol mode debug dan production logging. File ini menjelaskan variable yang diperlukan dan konfigurasi environment.

## Environment Variables

### Required Variables
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=be_sisolehbun
DB_USER=root
DB_PASS=password

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=32-character-encryption-key-here
ENCRYPTION_IV=16-character-iv-here

# Server Configuration
PORT=3000
NODE_ENV=development

# DEBUG Configuration (Optional)
DEBUG=true
ENABLE_DB_LOGGING=true
ENABLE_REQUEST_LOGGING=true
```

### Environment Modes

#### 1. Development/Debug Mode
```env
NODE_ENV=development
DEBUG=true
ENABLE_DB_LOGGING=true
ENABLE_REQUEST_LOGGING=true
```

**Behavior:**
- Menampilkan semua log debug
- Logging database queries
- Request/response logging dengan sanitized data
- Detail error messages dengan stack trace
- Model registration check saat startup

#### 2. Production Mode
```env
NODE_ENV=production
DEBUG=false
ENABLE_DB_LOGGING=false
ENABLE_REQUEST_LOGGING=false
```

**Behavior:**
- Hanya menampilkan log info, warn, dan error
- Tidak ada debug logging
- Minimal database logging
- Request logging disabled untuk performa
- Generic error messages tanpa stack trace

## Logging Levels

### Debug Mode (DEBUG=true)
- `Logger.debug()` - Ditampilkan
- `Logger.info()` - Ditampilkan
- `Logger.warn()` - Ditampilkan
- `Logger.error()` - Ditampilkan
- `Logger.query()` - Ditampilkan (jika ENABLE_DB_LOGGING=true)
- `Logger.api()` - Ditampilkan (jika ENABLE_REQUEST_LOGGING=true)

### Production Mode (DEBUG=false)
- `Logger.debug()` - Disembunyikan
- `Logger.info()` - Ditampilkan
- `Logger.warn()` - Ditampilkan
- `Logger.error()` - Ditampilkan
- `Logger.query()` - Disembunyikan
- `Logger.api()` - Disembunyikan

## File Configuration

### 1. Environment Config (`src/config/environment.config.ts`)
```typescript
// Mengatur default values dan validasi environment variables
export const config = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    DEBUG: process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    // ... other configs
};
```

### 2. Logger Utility (`src/utils/logger.util.ts`)
```typescript
// Logger dengan environment-aware methods
class Logger {
    static debug(message: string, ...args: any[]): void {
        if (config.DEBUG) {
            console.log(`[DEBUG] ${message}`, ...args);
        }
    }
    // ... other methods
}
```

### 3. Request Logger Middleware (`src/middleware/request-logger.middleware.ts`)
```typescript
// Middleware untuk logging API requests
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    if (config.ENABLE_REQUEST_LOGGING) {
        Logger.api(`${req.method} ${req.path}`, sanitizedData);
    }
    next();
};
```

## Setup Instructions

### 1. Create .env file
```bash
cp .env.example .env
```

### 2. Configure for Development
```env
NODE_ENV=development
DEBUG=true
ENABLE_DB_LOGGING=true
ENABLE_REQUEST_LOGGING=true
```

### 3. Configure for Production
```env
NODE_ENV=production
DEBUG=false
ENABLE_DB_LOGGING=false
ENABLE_REQUEST_LOGGING=false
```

## Startup Logs

### Debug Mode Output
```
[INFO] Starting server...
[INFO] Environment: development
[INFO] Debug mode: true
[INFO] Port: 3000
[DEBUG] Checking model registration...
[DEBUG] Model User registered: true
[DEBUG] Model Role registered: true
[INFO] Database connection has been established successfully.
[INFO] Server is running at http://localhost:3000
[INFO] Swagger documentation is available at http://localhost:3000/api-docs
[DEBUG] Debug mode is enabled - detailed logging is active
[DEBUG] Database logging: true
[DEBUG] Request logging: true
```

### Production Mode Output
```
[INFO] Starting server...
[INFO] Environment: production
[INFO] Debug mode: false
[INFO] Port: 3000
[INFO] Database connection has been established successfully.
[INFO] Server is running at http://localhost:3000
[INFO] Swagger documentation is available at http://localhost:3000/api-docs
```

## Health Check Endpoint

Endpoint `/health` menampilkan status environment:

```json
{
    "status": "OK",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "environment": "development",
    "debug": true
}
```

## Testing Environment Setup

```bash
# Test Debug Mode
NODE_ENV=development DEBUG=true npm run dev

# Test Production Mode  
NODE_ENV=production DEBUG=false npm run start
```

## Tips

1. **Development**: Gunakan DEBUG=true untuk debugging dan development
2. **Staging**: Gunakan DEBUG=false tetapi ENABLE_REQUEST_LOGGING=true untuk monitoring
3. **Production**: Gunakan DEBUG=false dan semua logging disabled untuk performa optimal
4. **Monitoring**: Gunakan LOG_LEVEL=info di production untuk monitoring tanpa debug noise
