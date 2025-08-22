# Documentation

Welcome to the Sisolehbun Blockchain Backend documentation. This folder contains comprehensive guides and documentation for various features and modules.

## 📚 Available Documentation

### Core Features
- [**Masking Guide**](./MASKING_GUIDE.md) - Complete guide for data masking utilities
- [**Profile System**](./PROFILE_SYSTEM.md) - User profile management documentation

### API Documentation
- **Swagger/OpenAPI**: Available at `/api-docs` when running the server
- **Base URL**: `http://localhost:3000/api`

## 🏗️ Architecture Overview

```
Backend Architecture
├── Authentication & Authorization
│   ├── JWT Token-based authentication
│   ├── Role-based access control (RBAC)
│   └── Password encryption with bcrypt
├── Data Security
│   ├── AES-256-CBC encryption for sensitive data
│   ├── Data masking for presentation layer
│   └── Email hashing for search functionality
├── Database
│   ├── MySQL with Sequelize ORM
│   ├── Automated migrations
│   └── Database seeders
└── API Features
    ├── RESTful API design
    ├── Input validation
    ├── Error handling
    └── Comprehensive logging
```

## 🔐 Security Features

### Data Encryption
- **AES-256-CBC** encryption for sensitive user data
- **PBKDF2** key derivation with 10,000 iterations
- **SHA-256** hashing for searchable fields
- **Format**: `encrypted:iv:salt` (compact storage)

### Data Masking
- **Role-based masking** (Admin, Manager, User levels)
- **Multiple masking types**: Email, Phone, Credit Card, Name, etc.
- **Configurable options** for each masking type
- **Auto-detection** of data patterns

### Authentication
- **JWT tokens** with configurable expiration
- **Role-based permissions** for API endpoints
- **Secure password** hashing with bcrypt
- **Token verification** middleware

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MySQL database
- npm or yarn

### Installation
```bash
# Clone repository
git clone <repository-url>
cd be-sisolehbun-blockchain

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npm run migration:run

# Seed database
npm run seed:run

# Start development server
npm run dev
```

### Testing
```bash
# Build project
npm run build

# Test encryption
node dist/utils/crypto.util.test.js

# Test masking
node dist/utils/masking.util.test.js
```

## 📖 Feature Documentation

### 1. Data Masking System
The data masking system provides comprehensive data obfuscation for sensitive information:

- **Email masking**: `john.doe@example.com` → `jo******@example.com`
- **Phone masking**: `+628123456789` → `+628*****6789`
- **Credit card masking**: `1234567890123456` → `****-****-****-3456`
- **Name masking**: `John Doe Smith` → `J*** D** S****`
- **Custom patterns**: Using regex for specific requirements

[→ Read Full Masking Guide](./MASKING_GUIDE.md)

### 2. Profile Management
Comprehensive user profile system with role-based permissions:

- **User profiles** with encrypted sensitive data
- **Role management** (Admin, Manager, User, Petani, Perusahaan)
- **Profile updates** with validation
- **Account deletion** requests

[→ Read Profile System Guide](./PROFILE_SYSTEM.md)

## 🔧 Development Guidelines

### Code Organization
```
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── interfaces/     # TypeScript interfaces
├── middleware/     # Express middleware
├── models/         # Database models
├── repositories/   # Data access layer
├── routes/         # API route definitions
├── services/       # Business logic
├── utils/          # Utility functions
├── migrations/     # Database migrations
└── seeders/        # Database seeders
```

### Best Practices
1. **Security First**: Always encrypt sensitive data at rest
2. **Role-based Access**: Implement proper RBAC for all endpoints
3. **Data Masking**: Apply appropriate masking in presentation layer
4. **Input Validation**: Validate all inputs using express-validator
5. **Error Handling**: Implement comprehensive error handling
6. **Documentation**: Keep API documentation up-to-date

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sisolehbun_blockchain
DB_USERNAME=your_username
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Encryption
CRYPTO_SECRET_KEY=your-32-char-secret-key-here
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users (with masking)
- `GET /api/users/:id` - Get user by ID (with masking)
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Profile
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update current user profile
- `DELETE /api/profile` - Request account deletion

### Roles
- `GET /api/roles` - Get all roles
- `GET /api/roles/:id` - Get role by ID

## 🧪 Testing

### Unit Tests
Run individual utility tests:
```bash
npm run build
node dist/utils/crypto.util.test.js
node dist/utils/masking.util.test.js
```

### API Testing
Use tools like Postman or curl to test API endpoints:
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Get users with token
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🤝 Contributing

1. **Follow coding standards**: Use TypeScript and follow existing patterns
2. **Write tests**: Include tests for new features
3. **Update documentation**: Keep docs current with changes
4. **Security review**: Have security features reviewed
5. **Performance**: Consider performance implications of changes

## 📞 Support

For questions or issues:
1. Check existing documentation
2. Review API responses and error messages
3. Check server logs for detailed error information
4. Verify environment configuration

## 🔄 Version History

- **v1.0.0**: Initial release with basic features
- **v1.1.0**: Added encryption system
- **v1.2.0**: Added data masking system
- **v1.3.0**: Enhanced profile management

---

*Last updated: August 22, 2025*
