# Pemeriksa Data Decryption untuk Recommendations

## Overview
Fitur ini menambahkan dukungan untuk menampilkan data pemeriksa (inspectors) pada detail rekomendasi dengan nama dan email yang sudah di-decrypt. Data pemeriksa akan ditampilkan dalam format yang user-friendly pada response API.

## Implementation Details

### 1. Service Layer Enhancement

#### `decryptUserData(user: User)`
- **Purpose**: Mengdekripsi field sensitif dari User model (untuk pemeriksa)
- **Fields yang di-decrypt**:
  - `name` - Nama lengkap pemeriksa
  - `email` - Email pemeriksa
- **Process**: 
  1. Mengambil data JSON dari User instance
  2. Mengiterasi field yang perlu di-decrypt
  3. Mengecek format enkripsi (encrypted:iv:salt)
  4. Menggunakan `CryptoUtil.decrypt()` untuk dekripsi
  5. Mengembalikan User instance dengan data yang sudah di-decrypt

#### Enhanced `processRecommendationData()`
- **Purpose**: Memproses data recommendation dan dekripsi data pemohon + pemeriksa
- **New Feature**: Dekripsi data inspectors jika tersedia
- **Process**:
  1. Mengambil data JSON dari recommendation
  2. Dekripsi data pemohon (existing)
  3. **NEW**: Dekripsi data inspectors jika ada
  4. Mengembalikan data yang sudah diproses lengkap

### 2. Repository Integration

Repository `findByIdWithDetails()` sudah mengambil data inspectors:
```typescript
if (recommendation && recommendation.pemeriksa && recommendation.pemeriksa.length > 0) {
    const inspectors = await User.findAll({
        where: { id: { [Op.in]: recommendation.pemeriksa } },
        include: [{ model: Role, as: 'role' }],
    });
    (recommendation as any).inspectors = inspectors;
}
```

### 3. API Response Structure

#### GET /api/recommendations/:id
```json
{
  "success": true,
  "message": "Recommendation retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "pemohon": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "namaPemohon": "John Doe",
      "email": "john.doe@example.com",
      // ... other pemohon fields (decrypted)
    },
    "pemeriksa": [
      "inspector-uuid-1",
      "inspector-uuid-2"
    ],
    "inspectors": [
      {
        "id": "inspector-uuid-1",
        "name": "Dr. Jane Smith",           // DECRYPTED
        "email": "jane.smith@agency.gov",   // DECRYPTED
        "role": {
          "id": "role-inspektur-uuid",
          "name": "inspektur"
        }
      },
      {
        "id": "inspector-uuid-2", 
        "name": "Prof. Bob Wilson",         // DECRYPTED
        "email": "bob.wilson@agency.gov",   // DECRYPTED
        "role": {
          "id": "role-inspektur-uuid",
          "name": "inspektur"
        }
      }
    ],
    "pemodalan": 50000000,
    "status": 3,
    "status_text": "Verifikasi Lapangan",
    // ... other recommendation fields
  }
}
```

## Features

### 1. **Dual Format Support**
- `pemeriksa`: Array of inspector UUIDs (original format)
- `inspectors`: Array of full inspector objects with decrypted data

### 2. **Security & Privacy**
- Data hanya di-decrypt di memory, tidak disimpan
- Graceful error handling jika dekripsi gagal
- Fallback ke data original jika ada masalah

### 3. **Role Information**
- Setiap inspector object include data role
- Membantu frontend untuk menampilkan informasi lengkap

### 4. **Debug Logging**
- Console logs untuk monitoring proses dekripsi
- Warning logs untuk error handling
- Tracking jumlah inspectors yang diproses

## Debug Output Example

Ketika mengakses detail recommendation:
```
Processing recommendation: 550e8400-e29b-41d4-a716-446655440000
Pemohon data exists: true
Inspectors data exists: true
Decrypting pemohon data for: 550e8400-e29b-41d4-a716-446655440001
Decrypted pemohon name: John Doe
Decrypting inspectors data, count: 2
Decrypted inspector name: Dr. Jane Smith
Decrypted inspector name: Prof. Bob Wilson
```

## Usage Examples

### Frontend Implementation

#### Display Inspector Information
```javascript
// Access decrypted inspector data
if (recommendation.inspectors && recommendation.inspectors.length > 0) {
  recommendation.inspectors.forEach(inspector => {
    console.log(`Inspector: ${inspector.name} (${inspector.email})`);
    console.log(`Role: ${inspector.role.name}`);
  });
}
```

#### Fallback to UUID List
```javascript
// Fallback to UUIDs if inspectors data not available
const inspectorIds = recommendation.pemeriksa || [];
if (!recommendation.inspectors && inspectorIds.length > 0) {
  // Fetch inspector details separately or show UUIDs
  console.log('Inspector IDs:', inspectorIds);
}
```

### API Testing

#### cURL Example
```bash
curl -X GET http://localhost:3000/api/recommendations/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Error Handling

### 1. **Decryption Failures**
```typescript
// Individual field decryption failure
console.warn(`Failed to decrypt field name for User inspector-uuid-1: Invalid encryption format`);

// Complete inspector decryption failure  
console.warn(`Failed to decrypt User data for inspector-uuid-1: Decryption failed`);
```

### 2. **Missing Data**
- Jika tidak ada data inspectors, field `inspectors` akan undefined
- Jika array `pemeriksa` kosong, tidak ada processing yang dilakukan
- Graceful degradation tanpa error

### 3. **Database Issues**
- Repository handles missing inspector records
- Invalid UUIDs di-skip dalam query
- Empty results tidak menyebabkan error

## Performance Considerations

### 1. **Memory Usage**
- Dekripsi dilakukan on-demand saat request
- Data tidak di-cache dalam encrypted state
- Processing minimal untuk empty inspector arrays

### 2. **Database Queries**
- Single additional query untuk fetch inspector details
- Query sudah include role information untuk efficiency
- Menggunakan `Op.in` untuk batch fetch multiple inspectors

### 3. **Scalability**
- Processing time linear dengan jumlah inspectors
- Typical recommendation memiliki 1-3 inspectors
- Error handling tidak blocking untuk partial failures

## Security Notes

1. **Encryption Keys**: Pastikan `ENCRYPTION_KEY` environment variable secure
2. **Transport Security**: Gunakan HTTPS untuk melindungi data decrypted
3. **Access Control**: Role-based access control tetap diterapkan
4. **Audit Trail**: Semua akses data inspector di-log dalam audit system
5. **Data Retention**: Data decrypted tidak disimpan atau di-cache

## Configuration

### Environment Variables
```env
ENCRYPTION_KEY=your-secure-encryption-key-here
NODE_ENV=production
```

### Debug Mode
Untuk enable debug logging:
```env
DEBUG=recommendation:*
NODE_ENV=development
```

## Troubleshooting

### Common Issues

1. **Inspector names showing as encrypted strings**
   - Check encryption key configuration
   - Verify data format in database
   - Check console warnings for decryption errors

2. **Empty inspectors array**
   - Verify `pemeriksa` field has valid UUIDs
   - Check inspector users exist in database
   - Review repository query for includes

3. **Missing role information**
   - Ensure Role model relationship properly configured
   - Check Role model exists and is accessible
   - Verify role foreign key data integrity

### Debug Commands

Check recommendation data:
```sql
SELECT id, pemeriksa FROM recommendations WHERE id = 'recommendation-uuid';
```

Check inspector users:
```sql
SELECT id, name, email FROM users WHERE id IN ('inspector-uuid-1', 'inspector-uuid-2');
```

Verify encryption format:
```javascript
// Check if field is encrypted
const isEncrypted = field.includes(':') && field.split(':').length === 3;
console.log('Field is encrypted:', isEncrypted);
```
