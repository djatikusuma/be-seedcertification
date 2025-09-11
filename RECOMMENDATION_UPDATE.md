# Update Fitur Recommendation - Penambahan Field Relasi dan Dekripsi Data

## Overview
Telah dilakukan update pada fitur recommendation untuk menambahkan field-field relasi baru dan implementasi dekripsi data pada saat GET ALL dan GET DETAIL.

## Field Baru yang Ditambahkan

### 1. seedsource_id (UUID, nullable)
- **Tujuan**: Inputan untuk ID dari table seed-sources
- **Tipe**: UUID dengan foreign key ke table `seed_sources`
- **Penggunaan**: Diisi pada saat create recommendation

### 2. verifikator_id (UUID, nullable)
- **Tujuan**: Diisi oleh users pada saat melakukan verifications
- **Tipe**: UUID dengan foreign key ke table `users`
- **Penggunaan**: Otomatis diisi dengan ID user yang melakukan verifikasi

### 3. inspektur_kepala_id (UUID, nullable)
- **Tujuan**: Diisi oleh ID dari users saat scheduling
- **Tipe**: UUID dengan foreign key ke table `users`
- **Penggunaan**: Otomatis diisi dengan ID user inspektur_ketua yang melakukan scheduling

### 4. inspektur_id (UUID, nullable)
- **Tujuan**: Diisi oleh ID dari users saat melakukan inspections
- **Tipe**: UUID dengan foreign key ke table `users`
- **Penggunaan**: Otomatis diisi dengan ID user inspektur yang melakukan inspection

## File yang Dimodifikasi

### 1. Migration
- **File**: `src/migrations/20250911000001-add-relations-to-recommendations.ts`
- **Aksi**: Menambahkan 4 kolom baru ke table `recommendations` dengan foreign key constraints dan indexes

### 2. Model
- **File**: `src/models/Recommendation.model.ts`
- **Perubahan**:
  - Menambahkan interface field baru di `RecommendationInterface`
  - Menambahkan column definitions dengan decorators `@ForeignKey` dan `@BelongsTo`
  - Menambahkan associations ke model `SeedSource` dan `User`

### 3. Repository
- **File**: `src/repositories/recommendation.repository.ts`
- **Perubahan**:
  - Import model `SeedSource`
  - Update method `findByIdWithDetails` untuk include relasi baru:
    - seedSource
    - verifikator (dengan role)
    - inspekturKepala (dengan role)
    - inspektur (dengan role)

### 4. Service
- **File**: `src/services/recommendation.service.ts`
- **Perubahan**:
  - Update interfaces: `CreateRecommendationDto`, `VerificationDto`, `SchedulingDto`, `InspectionDto`
  - Update method `processRecommendationData` untuk menangani dekripsi data:
    - Verifikator data
    - Inspektur kepala data
    - Inspektur data
  - Update method `verifyRecommendation` untuk menerima `verifikator_id`
  - Update method `scheduleRecommendation` untuk menerima `inspektur_kepala_id`
  - Update method `inspectRecommendation` untuk menerima `inspektur_id`

### 5. Controller
- **File**: `src/controllers/recommendation.controller.ts`
- **Perubahan**:
  - Update dokumentasi Swagger untuk menambahkan field baru
  - Update schema `CreateRecommendationRequest` untuk include `seedsource_id`
  - Update method `verifyRecommendation` untuk otomatis mengisi `verifikator_id`
  - Update method `scheduleRecommendation` untuk otomatis mengisi `inspektur_kepala_id`
  - Update method `inspectRecommendation` untuk otomatis mengisi `inspektur_id`

## Fitur Dekripsi Data

### Implementasi
Semua data yang dikembalikan oleh API GET ALL dan GET DETAIL akan otomatis didekripsi:

1. **Data Pemohon (ProfileApplicant)**:
   - NIK, NPWP, Email, Nama Pemohon, Telepon
   - Alamat Pemohon, Alamat Perusahaan
   - NIK Kuasa, Nama Kuasa

2. **Data Verifikator**: 
   - Name, Email (dengan role information)

3. **Data Inspektur Kepala**:
   - Name, Email (dengan role information)

4. **Data Inspektur**:
   - Name, Email (dengan role information)

5. **Data Pemeriksa** (array):
   - Name, Email untuk setiap user dalam array pemeriksa

### Pattern Dekripsi
- Menggunakan `CryptoUtil.decrypt()` untuk mendekripsi field yang terenkripsi
- Safe decryption dengan error handling untuk field yang mungkin sudah dalam bentuk plain text
- Maintain original data jika dekripsi gagal

## Workflow Penggunaan

1. **Create Recommendation**:
   ```json
   {
     "seedsource_id": "uuid-optional",
     "pemodalan": 1000000,
     "tenaga_kerja_sd": 5,
     // ... field lainnya
   }
   ```

2. **Verify Recommendation** (oleh verifikatur):
   - `verifikator_id` otomatis diisi dari user yang login

3. **Schedule Recommendation** (oleh inspektur_ketua):
   - `inspektur_kepala_id` otomatis diisi dari user yang login

4. **Inspect Recommendation** (oleh inspektur):
   - `inspektur_id` otomatis diisi dari user yang login

## Response API

Semua response GET ALL dan GET DETAIL akan mengembalikan data yang sudah didekripsi dengan struktur:

```json
{
  "id": "uuid",
  "pemohon": {
    "namaPemohon": "decrypted-name",
    "email": "decrypted-email",
    // ... data lainnya yang sudah didekripsi
  },
  "verifikator": {
    "name": "decrypted-name",
    "email": "decrypted-email",
    "role": { "roleName": "verifikatur" }
  },
  "inspekturKepala": {
    "name": "decrypted-name",
    "email": "decrypted-email", 
    "role": { "roleName": "inspektur_ketua" }
  },
  "inspektur": {
    "name": "decrypted-name",
    "email": "decrypted-email",
    "role": { "roleName": "inspektur" }
  },
  "seedSource": {
    // data dari seed sources jika ada relasi
  }
}
```

## Status Deployment

✅ Migration berhasil dijalankan
✅ Build berhasil tanpa error
✅ Semua association dan dekripsi telah diimplementasi
✅ API documentation telah diupdate

Fitur recommendation sekarang sudah siap digunakan dengan field-field relasi baru dan dekripsi data yang otomatis.
