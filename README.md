# Sisolehbun Blockchain Backend

A secure, enterprise-grade backend API built with Express.js, TypeScript, and advanced security features including **AES-256 encryption** and **intelligent data masking**.

## 🚀 Features

- **TypeScript** - Full type safety and modern JavaScript features
- **Express.js** - Fast, unopinionated web framework
- **Sequelize ORM** - Database abstraction with MySQL support
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control (RBAC)** - Granular permission system
- **AES-256 Encryption** - Military-grade encryption for sensitive data
- **Smart Data Masking** - Role-based data obfuscation
- **UUID Primary Keys** - Secure, non-sequential identifiers
- **Database Migrations** - Version-controlled schema changes
- **Comprehensive Testing** - Unit and integration tests
- **OpenAPI/Swagger** - Interactive API documentation
- **ESLint & Prettier** - Code quality and formatting

## 🔐 Security Features

### Data Encryption
- **AES-256-CBC** encryption for sensitive user data
- **PBKDF2** key derivation with 10,000 iterations
- **Unique salt and IV** for each encryption
- **Compact storage format**: `encrypted:iv:salt`

### Data Masking
- **Role-based masking** (Admin, Manager, User levels)
- **Multiple masking types**: Email, Phone, Credit Card, Name
- **Auto-detection** of sensitive data patterns
- **Configurable masking options**

### Authentication & Authorization
- **JWT tokens** with configurable expiration
- **bcrypt password hashing** with salt rounds
- **Role-based permissions** for all endpoints
- **Secure middleware** for request validation

## 📁 Project Structure

```
.
├── src/
│   ├── config/         # Database and application configuration
│   ├── controllers/    # API request handlers
│   ├── interfaces/     # TypeScript interfaces and types
│   ├── middleware/     # Authentication and validation middleware
│   ├── migrations/     # Database schema migrations
│   ├── models/         # Sequelize data models with encryption
│   ├── repositories/   # Data access layer (Repository pattern)
│   ├── routes/         # API route definitions
│   ├── seeders/        # Database seeders with encrypted data
│   ├── services/       # Business logic layer
│   ├── utils/          # Utility functions (crypto, masking, etc.)
│   └── app.ts          # Main application entry point
├── docs/               # 📚 Complete documentation
│   ├── README.md       # Main documentation hub
│   ├── API.md          # API endpoint documentation
│   ├── ENCRYPTION.md   # Encryption system guide
│   ├── MASKING_GUIDE.md # Data masking documentation
│   └── PROFILE_SYSTEM.md # Profile management guide
├── .env                # Environment variables
├── package.json        # Project dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## 📚 Documentation

**Complete documentation is available in the [`docs/`](./docs/) folder:**

- **[� Documentation Index](./docs/INDEX.md)** - Complete navigation guide to all docs
- **[�📖 Main Documentation](./docs/README.md)** - Architecture overview and getting started
- **[🔌 API Documentation](./docs/API.md)** - Complete API endpoint reference
- **[🔐 Encryption Guide](./docs/ENCRYPTION.md)** - AES-256 encryption system
- **[🎭 Masking Guide](./docs/MASKING_GUIDE.md)** - Data masking and obfuscation
- **[👤 Profile System](./docs/PROFILE_SYSTEM.md)** - User profile management

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or yarn
- **MySQL** database
- **Git** for version control

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd be-sisolehbun-blockchain
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your database credentials and encryption key
```

4. **Setup database**
```bash
npm run migration:run    # Create database schema
npm run seed:run        # Insert sample data with encryption
```

5. **Start development server**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Environment Configuration

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sisolehbun_blockchain
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
CRYPTO_SECRET_KEY=your-32-character-secret-key

# Application Configuration
NODE_ENV=development
PORT=3000
```

## 🧪 Testing

### Run Tests
```bash
npm run test              # Run all tests
npm run test:coverage     # Run with coverage report
npm run build            # Build for production
```

### Manual Testing
```bash
# Test encryption system
node dist/utils/crypto.util.test.js

# Test masking system  
node dist/utils/masking.util.test.js

# Test API endpoints
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## 🔌 API Access

### Swagger Documentation
Interactive API documentation: `http://localhost:3000/api-docs`

### Authentication Flow
1. **Login**: `POST /api/auth/login` with email/password
2. **Get Token**: Extract JWT token from response
3. **Use Token**: Include in `Authorization: Bearer <token>` header

### Example API Usage
```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.data.token')

# 2. Get Users (with masking applied)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN"
```

## 🏗️ Architecture Highlights

### Security First Design
- **Encryption at Rest**: All sensitive data encrypted with AES-256
- **Role-based Masking**: Data visibility based on user permissions  
- **Secure Authentication**: JWT tokens with role-based access control
- **Input Validation**: Comprehensive request validation

### Performance Optimized
- **Efficient Encryption**: Optimized crypto operations
- **Smart Masking**: Applied only at presentation layer
- **Database Indexing**: Hash-based searching for encrypted fields
- **Connection Pooling**: Efficient database connections

### Developer Experience
- **TypeScript**: Full type safety throughout
- **Documentation**: Comprehensive guides and API docs
- **Testing**: Built-in test suites for all features
- **Hot Reload**: Fast development iteration

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Follow** TypeScript and security best practices
4. **Add tests** for new features
5. **Update documentation** as needed
6. **Submit** a pull request

## 📞 Support

- **Documentation**: Check [`docs/`](./docs/) folder first
- **API Issues**: Review Swagger docs at `/api-docs`
- **Security**: Follow encryption and masking guides
- **Performance**: Monitor logs and database queries

## 🔄 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run lint` - Run ESLint code analysis
- `npm run migration:run` - Apply database migrations
- `npm run seed:run` - Run database seeders with encryption
- `npm test` - Run test suites
- `npm run test:coverage` - Run tests with coverage report

## 🏆 Features in Action

### Data Security Example
```typescript
// User creation with automatic encryption
const user = await User.create({
    name: 'John Doe',           // → Encrypted: "Dqi9K...Y=:176a...d1:48ed...25"
    email: 'john@example.com',  // → Encrypted + Hashed for search
    password: 'securePass123',  // → bcrypt hashed separately
    roleId: userRoleId
});

// Retrieval with automatic decryption and masking
const users = await User.findAll(); // Decrypted automatically
// API response applies masking based on requesting user's role
```

### Role-based Data Masking
```json
// Admin sees more data
{
  "email": "john****@example.com",
  "name": "John Doe"
}

// Regular user sees less data  
{
  "email": "jo******@example.com", 
  "name": "J*** D**"
}
```

---

**For detailed documentation, examples, and advanced features, visit the [`docs/`](./docs/) folder.**

*Built with ❤️ for secure, scalable backend applications.*

The following settings can be managed via the Settings API:

- `appName` - The name of the application
- `timezone` - Default timezone for the application
- `jwtTimeout` - JWT token expiration time (e.g., '24h')
- `appMetaData` - Additional metadata about the application (JSON object)
- `database` - The active database configuration (mysql/postgres)

## Testing

This project uses Jest and Supertest for testing. To run the tests:

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage
```

Tests are organized into:
- Unit tests: Testing individual components in isolation
- Integration tests: Testing API endpoints and component interactions

## License

This project is licensed under the ISC License.
