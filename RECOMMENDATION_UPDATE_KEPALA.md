# Update Fitur Recommendation - Penambahan Field kepala_id dan Perbaikan Nama Field

## Overview
Telah dilakukan update pada fitur recommendation untuk menambahkan field `kepala_id` dan memperbaiki penamaan field dari `inspektur_kepala_id` menjadi `inspektur_ketua_id` sesuai permintaan.

## Perubahan yang Dilakukan

### 1. Perbaikan Penamaan Field
- **Dari**: `inspektur_kepala_id` → **Menjadi**: `inspektur_ketua_id`
- **Dari**: `inspekturKepala` → **Menjadi**: `inspekturKetua`

### 2. Penambahan Field Baru: kepala_id
- **Tujuan**: Diisi oleh ID dari user dengan role 'kepala' saat melakukan publish recommendation
- **Tipe**: UUID dengan foreign key ke table `users`
- **Penggunaan**: Otomatis diisi dengan ID user kepala yang melakukan publish

## File yang Dimodifikasi

### 1. Migration Baru
- **File**: `src/migrations/20250911000002-add-kepala-id-to-recommendations.ts`
- **Aksi**: Menambahkan kolom `kepala_id` ke table `recommendations` dengan foreign key constraint dan index

### 2. Model
- **File**: `src/models/Recommendation.model.ts`
- **Perubahan**:
  - Update interface: `inspektur_kepala_id` → `inspektur_ketua_id`
  - Menambahkan field `kepala_id` di interface
  - Update column definitions dan associations:
    - `inspekturKepala` → `inspekturKetua`
    - Menambahkan `kepala` association

### 3. Repository
- **File**: `src/repositories/recommendation.repository.ts`
- **Perubahan**:
  - Update include dalam `findByIdWithDetails`:
    - `inspekturKepala` → `inspekturKetua`
    - Menambahkan include untuk `kepala` dengan role information

### 4. Service
- **File**: `src/services/recommendation.service.ts`
- **Perubahan**:
  - Update interface `SchedulingDto`: `inspektur_kepala_id` → `inspektur_ketua_id`
  - Menambahkan `kepala_id` ke interface `PublishDto`
  - Update method `processRecommendationData`:
    - Dekripsi `inspekturKetua` (bukan `inspekturKepala`)
    - Menambahkan dekripsi data `kepala`
  - Update method `scheduleRecommendation`: `inspektur_kepala_id` → `inspektur_ketua_id`
  - Update method `publishRecommendation`: menambahkan `kepala_id`

### 5. Controller
- **File**: `src/controllers/recommendation.controller.ts`
- **Perubahan**:
  - Update dokumentasi Swagger:
    - `inspektur_kepala_id` → `inspektur_ketua_id`
    - Menambahkan dokumentasi untuk `kepala_id`
  - Update method `scheduleRecommendation`: `inspektur_kepala_id` → `inspektur_ketua_id`
  - Update method `publishRecommendation`: otomatis mengisi `kepala_id` dengan user.id

## Workflow Penggunaan yang Diperbarui

### 1. Scheduling (oleh inspektur_ketua):
```typescript
// Otomatis diisi dengan user yang login
{
  "inspektur_ketua_id": "user-id-from-token", // Bukan inspektur_kepala_id lagi
  "tanggal_pemeriksaan": "2025-09-15",
  "pemeriksa": ["inspector-1-id", "inspector-2-id"]
}
```

### 2. Publishing (oleh kepala):
```typescript
// Otomatis diisi dengan user yang login
{
  "kepala_id": "user-id-from-token", // Field baru
  "nomor_rekomendasi": "REC-001",
  "surat_rekomendasi": "content"
}
```

## Response API yang Diperbarui

Response GET ALL dan GET DETAIL sekarang mengembalikan:

```json
{
  "id": "uuid",
  "pemohon": { /* data terdekripsi */ },
  "verifikator": { /* data terdekrips */ },
  "inspekturKetua": { // Bukan inspekturKepala lagi
    "name": "decrypted-name",
    "email": "decrypted-email",
    "role": { "roleName": "inspektur_ketua" }
  },
  "inspektur": { /* data terdekripsi */ },
  "kepala": { // Field baru
    "name": "decrypted-name", 
    "email": "decrypted-email",
    "role": { "roleName": "kepala" }
  },
  "seedSource": { /* data seed source jika ada */ }
}
```

## Summary Field ID yang Tersedia

| Field | Diisi Pada Tahap | Role yang Mengisi | Deskripsi |
|-------|------------------|-------------------|-----------|
| `seedsource_id` | Create | pemohon | ID dari seed sources (optional) |
| `verifikator_id` | Verification | verifikatur | User yang melakukan verifikasi |
| `inspektur_ketua_id` | Scheduling | inspektur_ketua | User yang melakukan scheduling |
| `inspektur_id` | Inspection | inspektur | User yang melakukan inspection |
| `kepala_id` | Publishing | kepala | User yang melakukan publish |

## Fitur Dekripsi Data

Semua field user (verifikator, inspekturKetua, inspektur, kepala) akan otomatis didekripsi:
- Name
- Email
- Role information

## Status Deployment

✅ Migration berhasil dijalankan  
✅ Build berhasil tanpa error  
✅ Semua association dan dekripsi telah diimplementasi  
✅ Penamaan field sudah diperbaiki sesuai permintaan  
✅ Field `kepala_id` berhasil ditambahkan  
✅ API documentation telah diupdate  

Fitur recommendation sekarang sudah memiliki field `kepala_id` dan penamaan yang konsisten untuk `inspektur_ketua_id`!
