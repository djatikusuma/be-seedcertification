# Profile Encryption Implementation Guide

## Overview

Sistem enkripsi telah berhasil diimplementasikan pada model Profile dan ProfileApplicant untuk melindungi data sensitif pribadi dan perusahaan. Implementasi ini mengikuti pola yang sama dengan User model dan menggunakan `CryptoUtil` untuk enkripsi AES-256 serta `DataMaskingUtil` untuk masking berbasis role.

## Implementation Components

### 1. Profile Model (Profile.model.ts)

**Encrypted Fields:**
- `nama` - Nama lengkap
- `nik` - Nomor Induk Kependudukan
- `telepon` - Nomor telepon
- `alamat` - Alamat lengkap

**New Fields Added:**
- `nikHash` - Hash untuk pencarian NIK terenkripsi

**New Methods:**
```typescript
// Encryption hooks
@BeforeCreate static encryptBeforeCreate(instance: Profile)
@BeforeUpdate static encryptBeforeUpdate(instance: Profile)
@AfterFind static decryptAfterFind(result: Profile | Profile[] | null)

// Search methods
static async findByNik(nik: string): Promise<Profile | null>
static async nikExists(nik: string): Promise<boolean>

// Masking methods
applyMasking(requestingUserRole: string = 'guest'): Partial<ProfileInterface>
static applyMaskingToArray(profiles: Profile[], requestingUserRole: string = 'guest')
```

### 2. ProfileApplicant Model (ProfileApplicant.model.ts)

**Encrypted Fields:**
- `nik` - Nomor Induk Kependudukan
- `npwp` - Nomor Pokok Wajib Pajak
- `email` - Email pemohon
- `namaPemohon` - Nama pemohon
- `telepon` - Nomor telepon
- `alamatPemohon` - Alamat pemohon
- `alamatPerusahaan` - Alamat perusahaan
- `nikKuasa` - NIK kuasa hukum
- `namaKuasa` - Nama kuasa hukum

**New Fields Added:**
- `nikHash` - Hash untuk pencarian NIK terenkripsi
- `emailHash` - Hash untuk pencarian email terenkripsi

**New Methods:**
```typescript
// Encryption hooks
@BeforeCreate static encryptBeforeCreate(instance: ProfileApplicant)
@BeforeUpdate static encryptBeforeUpdate(instance: ProfileApplicant)
@AfterFind static decryptAfterFind(result: ProfileApplicant | ProfileApplicant[] | null)

// Search methods
static async findByNik(nik: string): Promise<ProfileApplicant | null>
static async findByEmail(email: string): Promise<ProfileApplicant | null>
static async nikExists(nik: string): Promise<boolean>
static async emailExists(email: string): Promise<boolean>

// Masking methods
applyMasking(requestingUserRole: string = 'guest'): Partial<ProfileApplicantInterface>
static applyMaskingToArray(profiles: ProfileApplicant[], requestingUserRole: string = 'guest')
```

## Role-based Masking Levels

### Profile Model Masking

#### Admin Role
- **Data**: Tidak ada masking, semua data terlihat
- **Use Case**: Administrator sistem

#### Manager Role
- **nama**: `J*** *** S****` (first and last char visible)
- **nik**: `1234********3456` (4 char start + 4 char end)
- **telepon**: `+62***567890` (country code + last 4 digits)
- **alamat**: `Jl. Example...` (first 10 chars)

#### User/Guest Role
- **nama**: `J*** D** S****` (first char only)
- **nik**: `12**********56` (2 char start + 2 char end)
- **telepon**: `+6***90` (country code + last 2 digits)
- **alamat**: `Jl. E...` (first 5 chars)

### ProfileApplicant Model Masking

#### Admin Role
- **Data**: Tidak ada masking, semua data terlihat

#### Manager Role
- **namaPemohon**: `J*** *** S****`
- **nik**: `1234********3456`
- **email**: `joh****@example.com`
- **telepon**: `+62***567890`
- **npwp**: `123***********345`
- **nikKuasa**: `9876********4321`
- **namaKuasa**: `J*** A*******`

#### User/Guest Role
- **namaPemohon**: `J*** D** S****`
- **nik**: `12**********56`
- **email**: `jo**`
- **telepon**: `+6***90`
- **npwp**: `***************` (fully masked)
- **nikKuasa**: `98**********21`
- **namaKuasa**: `J*** A*******`

## Service Layer Integration

### Profile Service Updates

**New Methods:**
```typescript
async getProfileByUserIdWithMasking(userId: string, requestingUserRole: string = 'guest')
async getAllProfilesWithMasking(requestingUserRole: string = 'guest')
```

**Updated Methods:**
- `createProfile()` - Now validates NIK uniqueness using encrypted search
- `updateProfile()` - Now validates NIK conflicts using encrypted search

### ProfileApplicant Service Updates

**New Methods:**
```typescript
async getProfileByUserIdWithMasking(userId: string, requestingUserRole: string = 'guest')
async getAllProfilesWithMasking(requestingUserRole: string = 'guest')
async updateProfileWithMasking(userId: string, profileData: Partial<ProfileApplicant>, requestingUserRole: string = 'guest')
```

**Updated Methods:**
- `createProfile()` - Now validates NIK and email uniqueness using encrypted search
- `updateProfile()` - Now validates NIK and email conflicts using encrypted search

## Repository Layer Updates

### Profile Repository
- `findByNik()` - Updated to use model's encrypted search method

### ProfileApplicant Repository
- `findByNik()` - Updated to use model's encrypted search method
- `findByEmail()` - Updated to use model's encrypted search method

## Database Migration

**Migration File**: `20250812000001-add-profile-encryption-fields.ts`

**Changes Applied:**
1. **Added hash columns**:
   - `profiles.nikHash` (STRING, unique)
   - `profile_applicants.nikHash` (STRING, unique)
   - `profile_applicants.emailHash` (STRING, unique)

2. **Changed data types to TEXT** for encrypted fields:
   - All sensitive string fields converted to TEXT to accommodate encrypted data

3. **Maintained backward compatibility** in rollback

## Security Benefits

### Defense in Depth
1. **Database Level**: Data stored encrypted with AES-256-CBC
2. **Application Level**: Role-based masking for data presentation
3. **Search Optimization**: Hash-based searching without decryption

### Key Features
- **Automatic Encryption**: Transparent encryption/decryption via model hooks
- **Efficient Search**: Hash-based indexing for encrypted fields
- **Role-based Access**: Dynamic masking based on user privileges
- **Data Integrity**: Validation of unique constraints on encrypted data

## Testing

**Test Files Created:**
- `tests/unit/models/profile-encryption.test.ts`
- `tests/unit/models/profileApplicant-encryption.test.ts`

**Test Coverage:**
- ✅ Field encryption validation
- ✅ Role-based masking scenarios
- ✅ Static method functionality
- ✅ Hash-based search operations
- ✅ Array masking operations

## Usage Examples

### Creating Profile with Automatic Encryption
```typescript
const profile = await Profile.create({
    userId: 'user-123',
    nik: '1234567890123456', // Will be automatically encrypted
    nama: 'John Doe Smith',  // Will be automatically encrypted
    telepon: '+621234567890', // Will be automatically encrypted
    alamat: 'Jl. Example Street No. 123' // Will be automatically encrypted
});
```

### Searching by Encrypted Fields
```typescript
// Search by NIK (uses nikHash automatically)
const profile = await Profile.findByNik('1234567890123456');

// Check NIK existence
const exists = await ProfileApplicant.nikExists('1234567890123456');
const emailExists = await ProfileApplicant.emailExists('john@example.com');
```

### Getting Masked Data
```typescript
// Get profile with role-based masking
const maskedProfile = await profileService.getProfileByUserIdWithMasking(
    'user-123', 
    'manager'
);

// Get all profiles with masking
const maskedProfiles = await profileService.getAllProfilesWithMasking('user');
```

## Migration Notes

### Before Migration
```bash
npm run migration:run
```

### Data Migration (if needed)
If you have existing unencrypted data, you'll need to create a data migration script to encrypt existing records and generate hash values.

### Verification
After migration, verify:
1. New hash columns are created
2. Data type changes are applied
3. Unique constraints are properly set
4. Existing data integrity is maintained

## Performance Considerations

1. **Hash Indexing**: nikHash and emailHash columns are indexed for fast lookups
2. **Encryption Overhead**: Minimal impact due to efficient AES-256 implementation
3. **Memory Usage**: TEXT fields accommodate encrypted data without truncation
4. **Search Performance**: Hash-based search maintains O(1) lookup performance

## Security Compliance

- **AES-256-CBC Encryption**: Industry standard encryption algorithm
- **PBKDF2 Key Derivation**: 10,000 iterations with SHA-256
- **Unique Salt per Field**: Each encrypted value uses unique salt
- **Hash-based Search**: No plaintext storage for searchable fields
- **Role-based Access Control**: Fine-grained data exposure control

Implementasi enkripsi Profile telah selesai dan siap untuk production deployment! 🔐✨
