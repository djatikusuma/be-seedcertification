# Documentation Index

Welcome to the comprehensive documentation for Sisolehbun Blockchain Backend. This index will help you navigate through all available documentation.

## 📖 Core Documentation

### [Main Documentation](./README.md) 
**Complete architecture overview and getting started guide**
- System architecture and security features
- Installation and setup instructions
- Development guidelines and best practices
- Environment configuration
- Quick start examples

### [API Documentation](./API.md)
**Complete API endpoint reference with examples**
- All API endpoints with request/response examples
- Authentication flow and token usage
- Response format standards
- Error codes and handling
- Rate limiting and headers
- Testing examples with cURL and JavaScript

## 🔐 Security Documentation

### [Encryption System Guide](./ENCRYPTION.md)
**AES-256 encryption implementation details**
- Encryption algorithm specifications (AES-256-CBC)
- Key derivation with PBKDF2 and SHA-256
- Database integration and model hooks
- Migration from legacy formats
- Performance considerations and benchmarks
- Security best practices and troubleshooting

### [Data Masking Guide](./MASKING_GUIDE.md)
**Comprehensive data masking and obfuscation system**
- All masking types: Email, Phone, Credit Card, Name, etc.
- Role-based masking configurations
- Custom pattern masking with regex
- Integration examples and middleware
- Best practices and security notes
- Performance optimization tips

### [User Masking Implementation](./USER_MASKING_IMPLEMENTATION.md)
**Complete implementation guide for User module masking**
- Step-by-step implementation in User model, service, repository, and controller
- Role-based masking levels (Admin, Manager, User, Guest)
- Integration with encryption system
- API response format with masking metadata
- Testing examples and security benefits

## 👤 Feature Documentation

### [Profile System Guide](./PROFILE_SYSTEM.md)
**User profile management and features**
- Profile creation and management
- Role-based access controls
- Account deletion workflows
- Data privacy features
- Profile validation and security

## 🚀 Quick Navigation

### For Developers
1. **Getting Started**: [Main Documentation](./README.md) → Installation section
2. **API Integration**: [API Documentation](./API.md) → Authentication flow
3. **Security Implementation**: [Encryption Guide](./ENCRYPTION.md) → Usage examples
4. **Data Presentation**: [Masking Guide](./MASKING_GUIDE.md) → Basic usage

### For Security Engineers
1. **Encryption Details**: [Encryption Guide](./ENCRYPTION.md) → Security specifications
2. **Data Protection**: [Masking Guide](./MASKING_GUIDE.md) → Security considerations
3. **Access Control**: [API Documentation](./API.md) → Role-based endpoints
4. **Best Practices**: All guides → Security sections

### For System Architects
1. **Architecture Overview**: [Main Documentation](./README.md) → Architecture section
2. **API Design**: [API Documentation](./API.md) → Response format and patterns
3. **Data Flow**: [Encryption Guide](./ENCRYPTION.md) → Architecture diagrams
4. **Integration Patterns**: [Masking Guide](./MASKING_GUIDE.md) → Advanced usage

## 📊 Documentation Matrix

| Topic | Main Docs | API Docs | Encryption | Masking | Profile |
|-------|-----------|----------|------------|---------|---------|
| **Getting Started** | ✅ Primary | ⚠️ Auth Flow | ⚠️ Basic Usage | ⚠️ Basic Usage | ⚠️ User Guide |
| **Security** | ⚠️ Overview | ⚠️ Auth Details | ✅ Primary | ✅ Primary | ⚠️ Access Control |
| **API Integration** | ⚠️ Quick Start | ✅ Primary | ⚠️ Model Hooks | ⚠️ Controller Integration | ⚠️ Endpoints |
| **Architecture** | ✅ Primary | ⚠️ Endpoints | ✅ Data Flow | ⚠️ Presentation Layer | ⚠️ User Management |
| **Performance** | ⚠️ Guidelines | ⚠️ Rate Limiting | ✅ Benchmarks | ✅ Optimization | ❌ Not Applicable |
| **Testing** | ⚠️ Scripts | ✅ Examples | ✅ Test Suite | ✅ Test Suite | ⚠️ Test Cases |

**Legend**: ✅ Primary Focus | ⚠️ Secondary Information | ❌ Not Covered

## 🔍 Search Guide

### Looking for specific information?

**Authentication & Security**
- JWT Token usage → [API Documentation](./API.md#authentication-endpoints)
- Password hashing → [Encryption Guide](./ENCRYPTION.md#security-considerations)
- Role permissions → [API Documentation](./API.md#role-based-access)

**Data Protection**
- Field encryption → [Encryption Guide](./ENCRYPTION.md#database-integration)
- Data masking → [Masking Guide](./MASKING_GUIDE.md#basic-usage-examples)
- Privacy controls → [Profile System](./PROFILE_SYSTEM.md)

**Development**
- Installation steps → [Main Documentation](./README.md#quick-start)
- API endpoints → [API Documentation](./API.md#api-endpoints)
- Code examples → All guides have extensive examples

**Troubleshooting**
- Common issues → Each guide has troubleshooting sections
- Error codes → [API Documentation](./API.md#error-codes)
- Debug mode → [Encryption Guide](./ENCRYPTION.md#troubleshooting)

## 📚 External Resources

### Related Technologies
- **Express.js**: [Official Documentation](https://expressjs.com/)
- **Sequelize ORM**: [Official Documentation](https://sequelize.org/)
- **TypeScript**: [Official Documentation](https://www.typescriptlang.org/)
- **JWT**: [Introduction to JSON Web Tokens](https://jwt.io/introduction)

### Security References
- **AES Encryption**: [NIST Standards](https://csrc.nist.gov/publications/detail/fips/197/final)
- **PBKDF2**: [RFC 2898](https://tools.ietf.org/html/rfc2898)
- **bcrypt**: [bcrypt Wikipedia](https://en.wikipedia.org/wiki/Bcrypt)

### Best Practices
- **OWASP**: [Web Application Security](https://owasp.org/)
- **Node.js Security**: [Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## 🔄 Documentation Updates

This documentation is actively maintained. For the latest updates:

1. **Check commit history** for recent changes
2. **Review version tags** for major updates  
3. **Follow semantic versioning** for compatibility
4. **Submit issues** for documentation improvements

### Contributing to Documentation

1. **Follow the established format** and structure
2. **Include practical examples** for all features
3. **Update cross-references** when adding new sections
4. **Test all code examples** before submission
5. **Keep security information** current and accurate

---

*This documentation covers Sisolehbun Blockchain Backend v1.3.0 and later. For older versions, check the git history.*

**Need help?** Start with [Main Documentation](./README.md) for overview, then dive into specific guides based on your needs.
