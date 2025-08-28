# Data Decryption untuk Recommendations

## Overview
Sistem rekomendasi sekarang secara otomatis melakukan dekripsi data sensitif pemohon (ProfileApplicant) ketika data ditampilkan dalam recommendations list dan detail. Hal ini memastikan bahwa data yang dikembalikan ke client sudah dalam bentuk plain text yang dapat dibaca.

## Fields yang Di-decrypt

### ProfileApplicant Fields
Berikut adalah field-field yang secara otomatis di-decrypt:

1. **nik** - Nomor Induk Kependudukan
2. **npwp** - Nomor Pokok Wajib Pajak  
3. **email** - Alamat email pemohon
4. **namaPemohon** - Nama lengkap pemohon
5. **telepon** - Nomor telepon pemohon
6. **alamatPemohon** - Alamat lengkap pemohon
7. **alamatPerusahaan** - Alamat perusahaan (untuk role perusahaan)
8. **nikKuasa** - NIK kuasa/perwakilan
9. **namaKuasa** - Nama kuasa/perwakilan

## Implementation Details

### Service Layer Functions

#### `decryptProfileApplicantData(profileApplicant: ProfileApplicant)`
- **Purpose**: Mengdekripsi field-field sensitif dari ProfileApplicant
- **Process**: 
  1. Mengambil data JSON dari model instance
  2. Melakukan iterasi pada setiap field yang perlu di-decrypt
  3. Mengecek format enkripsi (encrypted:iv:salt)
  4. Menggunakan `CryptoUtil.decrypt()` untuk dekripsi
  5. Mengembalikan instance ProfileApplicant dengan data yang sudah di-decrypt

#### `processRecommendationData(recommendation: Recommendation)`
- **Purpose**: Memproses data recommendation dan dekripsi data pemohon
- **Process**:
  1. Mengambil data JSON dari recommendation
  2. Jika ada data pemohon, melakukan dekripsi menggunakan `decryptProfileApplicantData()`
  3. Mengembalikan instance Recommendation dengan data yang sudah diproses

### API Endpoints yang Terpengaruh

#### 1. **GET /api/recommendations**
- **Role Access**: Semua role yang authorized
- **Decryption**: Data pemohon di-decrypt berdasarkan role
- **Inspektur**: Menampilkan nama, email, telepon, alamat pemohon
- **Admin/Verifikatur/Kepala**: Menampilkan semua data termasuk NIK

#### 2. **GET /api/recommendations/:id**
- **Role Access**: Semua role yang authorized
- **Decryption**: Semua data pemohon di-decrypt
- **Return**: Recommendation lengkap dengan data pemohon yang sudah di-decrypt

## Security Features

### 1. **Graceful Error Handling**
```typescript
try {
    decryptedData[field] = CryptoUtil.decrypt(decryptedData[field]);
} catch (error) {
    console.warn(`Failed to decrypt field ${field}:`, error.message);
    // Keep original value if decryption fails
}
```

### 2. **Format Detection**
- System mengecek apakah data dalam format encrypted (contains ':' and has 3 parts)
- Jika bukan format encrypted, data dibiarkan apa adanya
- Backward compatibility dengan format lama

### 3. **Role-based Data Exposure**
- **Petani/Perusahaan**: Hanya melihat data basic tanpa data pemohon
- **Inspektur**: Melihat data kontak pemohon (nama, email, telepon, alamat)
- **Admin/Verifikatur/Kepala**: Melihat semua data termasuk NIK sensitif

## Performance Considerations

### 1. **Selective Processing**
- Dekripsi hanya dilakukan pada endpoints yang membutuhkan data pemohon
- Field yang tidak encrypted tidak diproses
- Error handling yang tidak blocking

### 2. **Memory Management**
- Menggunakan `toJSON()` untuk membuat copy data
- Membuat instance baru untuk hasil yang sudah di-decrypt
- Tidak mengubah instance original

## Usage Examples

### Request dan Response

#### GET /api/recommendations (untuk Admin)
```json
{
  "success": true,
  "message": "Recommendations retrieved successfully",
  "data": {
    "rows": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "pemohon": {
          "id": "550e8400-e29b-41d4-a716-446655440001",
          "namaPemohon": "John Doe",              // DECRYPTED
          "email": "john.doe@example.com",        // DECRYPTED
          "telepon": "08123456789",               // DECRYPTED
          "alamatPemohon": "Jl. Merdeka No. 123", // DECRYPTED
          "nik": "1234567890123456"               // DECRYPTED
        },
        "status": 1,
        "status_text": "Verifikasi Dokumen",
        "created_at": "2024-08-28T04:40:00.000Z"
      }
    ],
    "count": 1,
    "totalPages": 1,
    "currentPage": 1
  }
}
```

#### GET /api/recommendations/:id
```json
{
  "success": true,
  "message": "Recommendation retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "pemohon": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "namaPemohon": "John Doe",                  // DECRYPTED
      "email": "john.doe@example.com",            // DECRYPTED
      "telepon": "08123456789",                   // DECRYPTED
      "alamatPemohon": "Jl. Merdeka No. 123",     // DECRYPTED
      "nik": "1234567890123456",                  // DECRYPTED
      "npwp": "12.345.678.9-012.000",             // DECRYPTED
      // ... all other ProfileApplicant fields
    },
    "pemodalan": 50000000,
    "tenaga_kerja_sd": 2,
    "file_penguasaan_benih": "/uploads/recommendations/document.pdf",
    "status": 1,
    "status_text": "Verifikasi Dokumen",
    "created_at": "2024-08-28T04:40:00.000Z"
  }
}
```

## Error Handling

### 1. **Decryption Failures**
- System akan log warning untuk field yang gagal di-decrypt
- Data original tetap dikembalikan jika dekripsi gagal
- Tidak menggagalkan seluruh request

### 2. **Missing Data**
- Jika ProfileApplicant tidak ada, sistem tetap mengembalikan recommendation
- Null check pada semua tahap processing
- Graceful degradation

## Best Practices

### 1. **Development**
- Selalu test dengan data encrypted dan non-encrypted
- Monitor logs untuk dekripsi yang gagal
- Validate data format sebelum dekripsi

### 2. **Production**
- Monitor performance impact dari dekripsi
- Setup alerting untuk dekripsi failures
- Regular backup encryption keys

## Security Notes

1. **Data di-decrypt hanya di memory** - tidak disimpan dalam bentuk decrypted
2. **Transport security** - pastikan HTTPS aktif untuk melindungi data decrypted
3. **Access control** - role-based filtering tetap diterapkan
4. **Audit trail** - semua akses data tetap di-log dalam audit system

## Troubleshooting

### Common Issues

1. **Field tidak ter-decrypt**
   - Check format data (harus encrypted:iv:salt)
   - Verify encryption key di environment variables
   - Check console warnings untuk error details

2. **Performance slow**
   - Monitor jumlah recommendations yang di-fetch
   - Consider pagination untuk large datasets
   - Check database query performance

3. **Partial decryption**
   - Normal behavior - field yang tidak encrypted dibiarkan apa adanya
   - Check individual field encryption status
   - Verify field ada dalam `ENCRYPTED_FIELDS` list
