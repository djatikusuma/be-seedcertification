# User Masking Implementation Guide

## Overview

Sistem masking telah berhasil diimplementasikan pada User model untuk melindungi data sensitif berdasarkan role pengguna yang melakukan request. Implementasi ini menggunakan `DataMaskingUtil` yang telah ada dan terintegrasi penuh dengan sistem enkripsi.

## Implementation Components

### 1. User Model (User.model.ts)

**New Methods Added:**

```typescript
// Apply data masking based on user role
applyMasking(requestingUserRole: string = 'guest'): Partial<UserInterface>

// Apply masking to multiple user instances
static applyMaskingToArray(users: User[], requestingUserRole: string = 'guest'): Partial<UserInterface>[]

// Get masked user data with role information
getMaskedData(requestingUserRole: string = 'guest'): Partial<UserInterface>
```

**Role-based Masking Levels:**

- **Admin**: Tidak ada masking, melihat data asli
- **Manager**: Masking parsial dengan domain email terlihat
- **User/Guest**: Masking penuh untuk keamanan maksimal

### 2. User Service (user.service.ts)

**New Methods Added:**

```typescript
// Get all users with role-based masking
async findAllWithMasking(requestingUserRole: string = 'guest'): Promise<Partial<UserInterface>[]>

// Get user by ID with role-based masking
async findByIdWithMasking(id: string, requestingUserRole: string = 'guest'): Promise<Partial<UserInterface> | null>

// Update user and return masked data
async updateWithMasking(id: string, updateData: Partial<UserInterface>, requestingUserRole: string = 'guest'): Promise<Partial<UserInterface> | null>
```

### 3. User Repository (user.repository.ts)

**New Methods Added:**

```typescript
// Find all users with masking support
async findAllWithMasking(requestingUserRole: string = 'guest'): Promise<Partial<UserInterface>[]>

// Find user by ID with masking support
async findByIdWithMasking(id: string, requestingUserRole: string = 'guest'): Promise<Partial<UserInterface> | null>

// Check if email exists (for encrypted email validation)
async emailExists(email: string): Promise<boolean>
```

### 4. User Controller (user.controller.ts)

**Updated Methods:**

- `getAllUsers`: Menggunakan `userService.findAllWithMasking()`
- `getUserById`: Menggunakan `userService.findByIdWithMasking()`
- `createUser`: Mengembalikan data termasking setelah create
- `updateUser`: Menggunakan `userService.updateWithMasking()`

Removed obsolete masking methods karena sudah digantikan dengan implementasi yang lebih baik di model dan service layer.

## Masking Examples

### Admin Role
```json
{
  "name": "John Doe Smith",
  "email": "john.doe@example.com"
}
```

### Manager Role
```json
{
  "name": "J*** *** S****",
  "email": "joh****@example.com"
}
```

### User/Guest Role
```json
{
  "name": "J*** D** S****",
  "email": "jo**"
}
```

## API Response Format

Semua endpoint user sekarang mengembalikan metadata masking:

```json
{
  "status": "success",
  "data": [...],
  "meta": {
    "total": 10,
    "masking_applied": true,
    "masking_level": "user"
  }
}
```

## Integration with Encryption

Sistem masking bekerja seamlessly dengan sistem enkripsi:

1. **Data Encrypted**: Email dan name disimpan terenkripsi di database
2. **Auto Decryption**: Model hooks otomatis decrypt saat query
3. **Role-based Masking**: Data ter-decrypt kemudian di-mask berdasarkan role
4. **Security**: Password dan emailHash tidak pernah ter-expose

## Testing

Test files telah dibuat untuk memvalidasi implementasi:

- `tests/unit/models/user-masking.test.ts`: Test masking di model level
- `tests/unit/services/user-masking.service.test.ts`: Test masking di service level

## Security Benefits

1. **Defense in Depth**: Enkripsi + masking memberikan perlindungan berlapis
2. **Role-based Access**: Data exposure disesuaikan dengan privilege user
3. **Consistent API**: Semua endpoint menggunakan masking yang sama
4. **Audit Trail**: Metadata response mencatat level masking yang diterapkan

## Usage in Controllers

```typescript
// Get user role from authenticated request
const requestingUserRole = (req as any).user?.role?.roleName || 'guest';

// Use service methods with masking
const users = await this.userService.findAllWithMasking(requestingUserRole);
const user = await this.userService.findByIdWithMasking(id, requestingUserRole);
const updated = await this.userService.updateWithMasking(id, data, requestingUserRole);
```

## Migration Notes

- **Backward Compatibility**: Implementasi tidak mengubah database schema
- **Zero Downtime**: Deployment dapat dilakukan tanpa downtime
- **API Compatibility**: Response format tetap sama, hanya ditambah metadata

Implementasi masking telah selesai dan siap digunakan di production! 🎉
