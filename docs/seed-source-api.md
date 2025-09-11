# API Documentation - Seed Source (Kebun Sumber Benih)

## Overview
API untuk mengelola Kebun Sumber Benih dengan fitur upload file untuk dokumen penetapan sumber benih.

**⚠️ Data Security**: Semua data sensitif (nama pemohon, email, NIK, dll.) akan otomatis di-decrypt sebelum dikembalikan oleh API untuk tampilan. Data dalam database tetap terenkripsi untuk keamanan.

## Authentication
Semua endpoint memerlukan autentikasi menggunakan Bearer Token.

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. GET /api/seed-source
Mendapatkan daftar semua kebun sumber benih.

**Access Control:**
- **Pemohon (petani/perusahaan)**: Hanya melihat data milik sendiri
- **Verifikator/Inspektur/Admin**: Melihat semua data

**Query Parameters:**
- `page` (optional): Nomor halaman (default: 1)
- `limit` (optional): Jumlah item per halaman (default: 10, max: 100)
- `status` (optional): Filter berdasarkan status (1=Verifikasi Dokumen, 2=Diterima, 3=Ditolak)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "pemohon_id": "uuid",
      "nomor_penetapan": "SP-001/2024",
      "tanggal_penetapan": "2024-01-15",
      "file_penetapan_sumber_benih": "/uploads/seed-sources/seedsource-123456.pdf",
      "status": 1,
      "status_label": "Verifikasi Dokumen",
      "verifikator_id": null,
      "catatan_verifikasi": null,
      "verify_at": null,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z",
      "pemohon": {
        "id": "uuid",
        "namaPemohon": "John Doe", // Data sudah ter-decrypt
        "email": "john@example.com", // Data sudah ter-decrypt  
        "nik": "1234567890123456", // Data sudah ter-decrypt
        "telepon": "081234567890", // Data sudah ter-decrypt
        "alamatPemohon": "Jl. Merdeka No. 123", // Data sudah ter-decrypt
        "user": {
          "id": "uuid",
          "name": "John Doe", // Data sudah ter-decrypt
          "email": "john@example.com", // Data sudah ter-decrypt
          "role": {
            "roleName": "petani"
          }
        }
      },
      "verifikator": null
    }
  ],
  "meta": {
    "total": 1,
    "totalPages": 1,
    "currentPage": 1,
    "limit": 10,
    "filters": {
      "status": null,
      "pemohon_id": "uuid"
    }
  }
}
```

### 2. GET /api/seed-source/{id}
Mendapatkan detail kebun sumber benih berdasarkan ID.

**Access Control:**
- **Pemohon (petani/perusahaan)**: Hanya melihat data milik sendiri
- **Verifikator/Inspektur/Admin**: Melihat semua data

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "pemohon_id": "uuid",
    "nomor_penetapan": "SP-001/2024",
    "tanggal_penetapan": "2024-01-15",
    "file_penetapan_sumber_benih": "/uploads/seed-sources/seedsource-123456.pdf",
    "status": 1,
    "status_label": "Verifikasi Dokumen",
    "verifikator_id": null,
    "catatan_verifikasi": null,
    "verify_at": null,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "pemohon": {
      "id": "uuid",
      "namaPemohon": "John Doe", // Data sudah ter-decrypt
      "email": "john@example.com", // Data sudah ter-decrypt
      "nik": "1234567890123456", // Data sudah ter-decrypt
      "telepon": "081234567890", // Data sudah ter-decrypt
      "alamatPemohon": "Jl. Merdeka No. 123", // Data sudah ter-decrypt
      "user": {
        "id": "uuid",
        "name": "John Doe", // Data sudah ter-decrypt
        "email": "john@example.com", // Data sudah ter-decrypt
        "role": {
          "roleName": "petani"
        }
      }
    },
    "verifikator": null
  }
}
```

### 3. POST /api/seed-source
Membuat pengajuan kebun sumber benih baru.

**Access Control:** Hanya role `petani` dan `perusahaan`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `nomor_penetapan` (required): String - Nomor penetapan sumber benih
- `tanggal_penetapan` (required): Date - Tanggal penetapan (format: YYYY-MM-DD)
- `file_penetapan_sumber_benih` (required): File - Dokumen penetapan (PDF, DOC, DOCX, max 5MB)

**cURL Example:**
```bash
curl -X POST \
  http://localhost:3000/api/seed-source \
  -H 'Authorization: Bearer <your-jwt-token>' \
  -F 'nomor_penetapan=SP-001/2024' \
  -F 'tanggal_penetapan=2024-01-15' \
  -F 'file_penetapan_sumber_benih=@/path/to/your/document.pdf'
```

**JavaScript/Fetch Example:**
```javascript
const formData = new FormData();
formData.append('nomor_penetapan', 'SP-001/2024');
formData.append('tanggal_penetapan', '2024-01-15');
formData.append('file_penetapan_sumber_benih', fileInput.files[0]);

fetch('/api/seed-source', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

**Response:**
```json
{
  "status": "success",
  "message": "Seed source created successfully",
  "data": {
    "id": "uuid",
    "pemohon_id": "uuid",
    "nomor_penetapan": "SP-001/2024",
    "tanggal_penetapan": "2024-01-15",
    "file_penetapan_sumber_benih": "/uploads/seed-sources/seedsource-123456.pdf",
    "status": 1,
    "status_label": "Verifikasi Dokumen",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "file_info": {
      "original_name": "document.pdf",
      "file_size": 1024000,
      "mime_type": "application/pdf",
      "uploaded_at": "2024-01-15T10:00:00Z"
    }
  }
}
```

### 4. POST /api/seed-source/{id}/verification
Melakukan verifikasi (approve/reject) terhadap pengajuan kebun sumber benih.

**Access Control:** Hanya role `verifikatur`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "status": "approve", // atau "reject"
  "catatan_verifikasi": "Dokumen lengkap dan sesuai persyaratan" // optional
}
```

**Response (Approve):**
```json
{
  "status": "success",
  "message": "Seed source approved successfully",
  "data": {
    "id": "uuid",
    "pemohon_id": "uuid",
    "nomor_penetapan": "SP-001/2024",
    "tanggal_penetapan": "2024-01-15",
    "file_penetapan_sumber_benih": "/uploads/seed-sources/seedsource-123456.pdf",
    "status": 2,
    "status_label": "Diterima",
    "verifikator_id": "uuid",
    "catatan_verifikasi": "Dokumen lengkap dan sesuai persyaratan",
    "verify_at": "2024-01-15T11:00:00Z",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T11:00:00Z",
    "pemohon": {
      "id": "uuid",
      "namaPemohon": "John Doe", // Data sudah ter-decrypt
      "email": "john@example.com", // Data sudah ter-decrypt
      "user": {
        "name": "John Doe", // Data sudah ter-decrypt
        "email": "john@example.com" // Data sudah ter-decrypt
      }
    },
    "verifikator": {
      "id": "uuid",
      "name": "Jane Verifikator", // Data sudah ter-decrypt
      "email": "verifikator@example.com" // Data sudah ter-decrypt
    }
  }
}
```

## Status Codes

### Success Responses
- `200 OK` - Request berhasil
- `201 Created` - Resource berhasil dibuat

### Error Responses
- `400 Bad Request` - Data request tidak valid
- `401 Unauthorized` - Token tidak valid atau tidak ada
- `403 Forbidden` - User tidak memiliki akses
- `404 Not Found` - Resource tidak ditemukan
- `500 Internal Server Error` - Error server

## File Upload Requirements

### Allowed File Types
- PDF (application/pdf)
- DOC (application/msword)
- DOCX (application/vnd.openxmlformats-officedocument.wordprocessingml.document)

### File Size Limit
- Maximum: 5MB

### Storage Location
Files are stored in: `/uploads/seed-sources/` with auto-generated unique filenames.

## Error Examples

### File Type Error
```json
{
  "status": "error",
  "message": "Invalid file type. Only PDF, DOC, and DOCX are allowed for seed source documents."
}
```

### File Size Error
```json
{
  "status": "error",
  "message": "File size too large. Maximum allowed size is 5MB"
}
```

### Missing Fields Error
```json
{
  "status": "error",
  "message": "Missing required fields: nomor_penetapan, tanggal_penetapan, and file_penetapan_sumber_benih (uploaded file)"
}
```

### Duplicate Nomor Penetapan
```json
{
  "status": "error",
  "message": "Nomor penetapan already exists"
}
```

### Access Denied
```json
{
  "status": "error",
  "message": "Only petani and perusahaan can create seed source applications"
}
```

## Data Security & Encryption

### Encrypted Fields
Untuk keamanan data, field-field berikut disimpan dalam bentuk terenkripsi di database:

**ProfileApplicant:**
- `nik` - Nomor Induk Kependudukan
- `npwp` - Nomor Pokok Wajib Pajak  
- `email` - Email pemohon
- `namaPemohon` - Nama lengkap pemohon
- `telepon` - Nomor telepon
- `alamatPemohon` - Alamat pemohon
- `alamatPerusahaan` - Alamat perusahaan (jika ada)
- `nikKuasa` - NIK kuasa (jika ada)
- `namaKuasa` - Nama kuasa (jika ada)

**User:**
- `name` - Nama user
- `email` - Email user

### Automatic Decryption
API secara otomatis melakukan decryption terhadap semua field yang terenkripsi sebelum mengembalikan response kepada client. Hal ini memastikan:

1. **Data Security**: Data sensitif tetap terenkripsi di database
2. **Ease of Use**: Client mendapatkan data yang sudah readable tanpa perlu decrypt manual
3. **Consistent Format**: Semua endpoint mengembalikan data dalam format yang sama

### Security Best Practices
- Field ID dan foreign key tidak dienkripsi untuk performa query
- Data timestamp tidak dienkripsi karena diperlukan untuk sorting dan filtering
- Encryption key dikelola secara terpisah dan aman
- Decryption hanya dilakukan saat data akan ditampilkan ke client
