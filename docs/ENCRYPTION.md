# Encryption System Documentation

## Overview

The Sisolehbun Blockchain Backend implements a comprehensive encryption system using **AES-256-CBC** encryption to protect sensitive user data. This document provides detailed information about the encryption implementation, usage, and best practices.

## 🔐 Encryption Specifications

### Algorithm Details
- **Encryption Algorithm**: AES-256-CBC
- **Key Derivation**: PBKDF2 with SHA-256
- **Iterations**: 10,000 (PBKDF2)
- **Salt Length**: 32 bytes (256 bits)
- **IV Length**: 16 bytes (128 bits)
- **Storage Format**: `encrypted:iv:salt` (colon-separated)

### Security Features
- **Unique Salt**: Each encryption generates a new random salt
- **Unique IV**: Each encryption uses a new random initialization vector
- **Key Stretching**: PBKDF2 with 10,000 iterations prevents rainbow table attacks
- **Backward Compatibility**: Supports both new format and legacy JSON format

## 🏗️ Architecture

```
User Data Flow
├── Input (Plain Text)
│   └── "john.doe@example.com"
├── Encryption Process
│   ├── Generate Random Salt (32 bytes)
│   ├── Generate Random IV (16 bytes)
│   ├── Derive Key using PBKDF2
│   └── Encrypt using AES-256-CBC
├── Storage Format
│   └── "Dqi9KjS3C7PqWSFGA2wnqGsSBDvamwIPYEYzt3RgIzY=:176a01e0ee18caf2cee0f256fee555d1:48ed6c1c163de4040bb45fb784533425"
└── Database Storage
    ├── Encrypted Data (TEXT column)
    └── Hash for Search (emailHash)
```

## 📁 File Structure

### Core Encryption Utility
```
src/utils/
└── crypto.util.ts          # Main encryption utility class
```

### Integration Points
```
src/models/
└── User.model.ts           # Model with encryption hooks

src/seeders/
└── 20250710000002-user-seeder.ts  # Manual encryption for seeders

src/migrations/
└── 20250821000001-add-user-encryption-fields.ts  # Database schema
```

## 🔧 CryptoUtil Class

### Methods Overview

#### `encrypt(text: string): string`
Encrypts plain text and returns formatted string.

```typescript
const encrypted = CryptoUtil.encrypt('john.doe@example.com');
// Returns: "encrypted_data:iv_hex:salt_hex"
```

#### `decrypt(encryptedData: string | EncryptionResult): string`
Decrypts data from either new format or legacy JSON format.

```typescript
const decrypted = CryptoUtil.decrypt(encrypted);
// Returns: "john.doe@example.com"
```

#### `hash(text: string): string`
Creates SHA-256 hash for searchable fields.

```typescript
const emailHash = CryptoUtil.hash('john.doe@example.com');
// Returns: "a1b2c3d4e5f6..."
```

#### `encryptFields(data: object, fields: string[]): object`
Encrypts multiple fields in an object.

```typescript
const user = { name: 'John Doe', email: 'john@example.com' };
const encrypted = CryptoUtil.encryptFields(user, ['name', 'email']);
```

#### `decryptFields(data: object, fields: string[]): object`
Decrypts multiple fields in an object.

```typescript
const decrypted = CryptoUtil.decryptFields(encryptedUser, ['name', 'email']);
```

## 🗄️ Database Integration

### User Model Hooks

The User model automatically encrypts/decrypts sensitive fields:

```typescript
// Encrypted fields
private static readonly ENCRYPTED_FIELDS = ['name', 'email'];

// Before create/update - encrypt sensitive fields
User.addHook('beforeCreate', (instance) => {
    UserModel.encryptSensitiveFields(instance);
});

User.addHook('beforeUpdate', (instance) => {
    UserModel.encryptSensitiveFields(instance);
});

// After find - decrypt sensitive fields
User.addHook('afterFind', (instances) => {
    UserModel.decryptSensitiveFields(instances);
});
```

### Search Functionality

For encrypted email fields, we use email hashing:

```typescript
// Find user by email using hash
static async findByEmail(email: string): Promise<User | null> {
    const emailHash = CryptoUtil.hash(email.toLowerCase());
    return await this.findOne({
        where: { emailHash },
        include: ['role']
    });
}
```

### Database Schema

```sql
-- Users table with encryption support
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name TEXT,              -- Encrypted: "encrypted:iv:salt"
    email TEXT,             -- Encrypted: "encrypted:iv:salt"
    emailHash VARCHAR(64),  -- SHA-256 hash for searching
    password VARCHAR(255),  -- Bcrypt hashed (separate from AES)
    roleId VARCHAR(36),
    deletionRequested BOOLEAN DEFAULT FALSE,
    deletionRequestDate DATETIME NULL,
    createdAt DATETIME,
    updatedAt DATETIME
);

-- Index for fast email lookup
CREATE INDEX idx_users_email_hash ON users(emailHash);
```

## 🔄 Migration Process

### From Legacy to New Format

The system supports automatic migration from JSON format to colon-separated format:

```typescript
// Legacy format (still supported)
{
  "encrypted": "U2FsdGVkX1+encrypted_data",
  "iv": "initialization_vector_hex",
  "salt": "salt_hex"
}

// New format (preferred)
"encrypted_data:iv_hex:salt_hex"
```

### Migration Steps

1. **Backward Compatibility**: System reads both formats
2. **Gradual Migration**: New data uses new format
3. **Optional Conversion**: Can convert existing data if needed

## 💻 Usage Examples

### Basic Encryption/Decryption

```typescript
import { CryptoUtil } from '../utils/crypto.util';

// Encrypt sensitive data
const plainText = 'sensitive information';
const encrypted = CryptoUtil.encrypt(plainText);
console.log(encrypted);
// Output: "Dqi9KjS3C7PqWSFGA2wnqGsSBDvamwIPYEYzt3RgIzY=:176a01e0ee18caf2cee0f256fee555d1:48ed6c1c163de4040bb45fb784533425"

// Decrypt data
const decrypted = CryptoUtil.decrypt(encrypted);
console.log(decrypted);
// Output: "sensitive information"
```

### Multiple Fields Encryption

```typescript
const userData = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    role: 'user'
};

// Encrypt sensitive fields
const encryptedData = CryptoUtil.encryptFields(userData, ['name', 'email']);

// Decrypt back
const decryptedData = CryptoUtil.decryptFields(encryptedData, ['name', 'email']);
```

### Model Integration Example

```typescript
// Creating a user (automatic encryption)
const user = await User.create({
    name: 'Jane Smith',           // Will be encrypted
    email: 'jane@example.com',    // Will be encrypted + hashed
    password: 'hashedPassword',   // Already bcrypt hashed
    roleId: 'role-uuid'
});

// Finding by email (uses hash)
const foundUser = await User.findByEmail('jane@example.com');
// Returns user with decrypted name and email
```

### Manual Encryption (for Seeders)

```typescript
// In seeders, bypass model hooks with manual encryption
const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        roleId: adminRoleId
    }
];

const encryptedUsers = users.map(user => ({
    ...user,
    name: CryptoUtil.encrypt(user.name),
    email: CryptoUtil.encrypt(user.email),
    emailHash: CryptoUtil.hash(user.email.toLowerCase()),
    createdAt: new Date(),
    updatedAt: new Date()
}));

await queryInterface.bulkInsert('users', encryptedUsers);
```

## 🔒 Security Considerations

### Best Practices

1. **Environment Variables**: Store encryption key in environment variables
```env
CRYPTO_SECRET_KEY=your-32-character-secret-key-here
```

2. **Key Rotation**: Plan for periodic key rotation (requires data re-encryption)

3. **Access Control**: Limit access to encryption utilities

4. **Logging**: Never log decrypted sensitive data

5. **Memory Management**: Clear sensitive data from memory when possible

### Security Features

- **Salt Uniqueness**: Each encryption uses a unique salt
- **IV Randomness**: Each encryption uses a random IV
- **Key Stretching**: PBKDF2 with 10,000 iterations
- **Algorithm Strength**: AES-256 is cryptographically secure
- **Format Validation**: Input validation before encryption/decryption

### Potential Risks

1. **Key Exposure**: If encryption key is compromised, all data is at risk
2. **Backward Compatibility**: Supporting legacy format increases complexity
3. **Performance**: Encryption/decryption adds computational overhead
4. **Search Limitations**: Only exact hash matches for encrypted fields

## 🧪 Testing

### Running Tests

```bash
# Build project
npm run build

# Run encryption tests
node dist/utils/crypto.util.test.js
```

### Test Coverage

The test suite covers:
- Basic encryption/decryption
- Multiple format support (JSON and colon-separated)
- Field-level encryption
- Edge cases and error handling
- Performance benchmarks

### Example Test Output

```
🔐 Testing AES-256 Encryption Utility
====================================

✅ Basic encryption/decryption: PASSED
✅ Multiple fields encryption: PASSED
✅ Hash generation: PASSED
✅ Backward compatibility: PASSED
✅ Edge cases: PASSED

All encryption tests completed successfully!
```

## 🚀 Performance Considerations

### Benchmarks

- **Encryption Speed**: ~1000 operations/second
- **Decryption Speed**: ~1000 operations/second
- **Memory Usage**: Minimal overhead
- **Database Impact**: TEXT columns for encrypted data

### Optimization Tips

1. **Batch Operations**: Encrypt multiple fields together
2. **Caching**: Cache frequently accessed decrypted data (carefully)
3. **Indexing**: Use hash indexes for searchable encrypted fields
4. **Lazy Loading**: Only decrypt when data is actually needed

## 🔮 Future Enhancements

### Planned Features

1. **Key Rotation**: Automated key rotation system
2. **Multiple Keys**: Support for different keys per data type
3. **Compression**: Data compression before encryption
4. **Audit Logging**: Detailed encryption/decryption audit logs
5. **Performance Optimization**: Hardware acceleration support

### Migration Path

For future key rotation:
1. Support multiple encryption keys
2. Track which key was used for each record
3. Gradually re-encrypt with new keys
4. Retire old keys after all data is migrated

## 📞 Troubleshooting

### Common Issues

#### Decryption Failures
```typescript
// Check format
if (encryptedData.includes(':') && encryptedData.split(':').length === 3) {
    // New format
} else {
    // Try JSON format
}
```

#### Performance Issues
```typescript
// Batch encryption for better performance
const encryptedData = CryptoUtil.encryptFields(data, ['field1', 'field2']);
```

#### Search Not Working
```typescript
// Ensure email hash is created
const emailHash = CryptoUtil.hash(email.toLowerCase());
```

### Debug Mode

Enable detailed logging:
```env
NODE_ENV=development
DEBUG=crypto:*
```

## 🔗 Related Documentation

- [Data Masking Guide](./MASKING_GUIDE.md) - Data presentation security
- [API Documentation](./API.md) - API endpoint details
- [Profile System](./PROFILE_SYSTEM.md) - User profile management

---

*For technical questions about the encryption system, refer to the source code documentation in `src/utils/crypto.util.ts`.*
