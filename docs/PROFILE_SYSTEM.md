# Profile System Documentation

## Overview

The profile system is designed to support two distinct types of user profiles:

1. **Internal Profiles** - For internal users (employees) of the organization
2. **Applicant Profiles** - For external applicants (Petani and Perusahaan)

## Database Tables

### 1. `profiles` (Internal Profiles)
Contains profile information for internal users (employees).

**Fields:**
- `id` - UUID primary key
- `userId` - Foreign key to users table (unique)
- `nip` - Employee ID number (optional)
- `nik` - National ID number (required)
- `nama` - Full name (required)
- `jabatan` - Job position (optional)
- `telepon` - Phone number (optional)
- `alamat` - Address (optional)
- `golongan` - Employee grade (optional)
- `pangkat` - Employee rank (optional)
- `fotoUrl` - Profile photo URL (optional)

### 2. `profile_applicants` (Applicant Profiles)
Contains profile information for external applicants with role "Petani" or "Perusahaan".

**Fields:**
- `id` - UUID primary key
- `userId` - Foreign key to users table (unique)
- `nik` - National ID number (required)
- `npwp` - Tax ID number (optional)
- `email` - Email address (required)
- `namaPemohon` - Applicant name (required)
- `telepon` - Phone number (optional)
- `alamatPemohon` - Applicant address (optional)
- `fotoPemohon` - Applicant photo (optional)
- `alamatPerusahaan` - Company address (optional)
- `lokasiPerbenihan` - Seed location (optional)
- `nikKuasa` - Attorney NIK (optional)
- `namaKuasa` - Attorney name (optional)
- `fotoKuasa` - Attorney photo (optional)
- `fileAktaPendirian` - Company incorporation document (optional)
- `fileKtp` - ID card file (optional)
- `fileNpwp` - Tax ID file (optional)
- `fileSuratKuasa` - Power of attorney document (optional)
- `statusKepemilikan` - Ownership status: 'Milik Sendiri', 'Sewa', 'Bagi Hasil' (optional)

## User Roles

The system supports the following user roles:
- `admin` - System administrator
- `user` - Internal user (can have internal profile)
- `Petani` - Farmer applicant (can have applicant profile)
- `Perusahaan` - Company applicant (can have applicant profile)

## API Endpoints

### Internal Profiles (`/api/internal-profiles`)

**User Endpoints (Authenticated):**
- `GET /my-profile` - Get current user's internal profile
- `POST /my-profile` - Create current user's internal profile
- `PUT /my-profile` - Update current user's internal profile
- `DELETE /my-profile` - Delete current user's internal profile

**Admin Endpoints (Admin Only):**
- `GET /all` - Get all internal profiles
- `GET /user/:userId` - Get internal profile by user ID
- `GET /nik/:nik` - Get internal profile by NIK

### Applicant Profiles (`/api/applicant-profiles`)

**User Endpoints (Authenticated):**
- `GET /my-profile` - Get current user's applicant profile
- `POST /my-profile` - Create current user's applicant profile
- `PUT /my-profile` - Update current user's applicant profile
- `DELETE /my-profile` - Delete current user's applicant profile
- `POST /my-profile/upload-document` - Upload document for applicant profile

**Admin Endpoints (Admin Only):**
- `GET /all` - Get all applicant profiles
- `GET /role/:role` - Get applicant profiles by role (Petani/Perusahaan)
- `GET /petani` - Get all Petani profiles
- `GET /perusahaan` - Get all Perusahaan profiles
- `GET /user/:userId` - Get applicant profile by user ID
- `GET /nik/:nik` - Get applicant profile by NIK
- `GET /email/:email` - Get applicant profile by email

## Authentication & Authorization

- All endpoints require authentication via JWT token
- Users can only access their own profile data (except admin)
- Admin users can access all profile data
- Role-based restrictions apply (Petani/Perusahaan can only have applicant profiles)

## File Upload

The applicant profile system supports document uploads for various file types:
- `foto_pemohon` - Applicant photo
- `foto_kuasa` - Attorney photo
- `file_akta_pendirian` - Company incorporation document
- `file_ktp` - ID card file
- `file_npwp` - Tax ID file
- `file_surat_kuasa` - Power of attorney document

## Sample Data

The system includes seeders that create sample data:
- Users for all roles (admin, user, Petani, Perusahaan)
- Sample internal profiles for admin/user roles
- Sample applicant profiles for Petani/Perusahaan roles

## Usage Examples

### Creating an Internal Profile
```typescript
// POST /api/internal-profiles/my-profile
{
  "nip": "NIP123456",
  "nik": "3312345678901234",
  "nama": "John Doe",
  "jabatan": "Staff IT",
  "telepon": "08123456789",
  "alamat": "Jl. Contoh No. 1",
  "golongan": "III/a",
  "pangkat": "Penata"
}
```

### Creating an Applicant Profile
```typescript
// POST /api/applicant-profiles/my-profile
{
  "nik": "3312345678901234",
  "npwp": "123456789000001",
  "email": "petani@example.com",
  "namaPemohon": "Petani Sukses",
  "telepon": "08123456789",
  "alamatPemohon": "Desa Sukamaju",
  "lokasiPerbenihan": "Lahan Pertanian Desa Sukamaju",
  "statusKepemilikan": "Milik Sendiri"
}
```

### Uploading Documents
```typescript
// POST /api/applicant-profiles/my-profile/upload-document
// Form data with file and documentType
{
  "documentType": "file_ktp",
  "file": [uploaded file]
}
```

## Error Handling

The system includes comprehensive error handling for:
- Duplicate NIK/email validation
- Required field validation
- Authentication/authorization errors
- File upload errors
- Database constraint violations

## Database Relationships

- `profiles.userId` → `users.id` (One-to-One)
- `profile_applicants.userId` → `users.id` (One-to-One)
- `users.roleId` → `roles.id` (Many-to-One)

Each user can have at most one internal profile OR one applicant profile, but not both.
