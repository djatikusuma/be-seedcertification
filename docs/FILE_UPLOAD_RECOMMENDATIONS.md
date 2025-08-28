# File Upload untuk Recommendations

## Overview
Sistem rekomendasi sekarang mendukung file upload untuk field `file_penguasaan_benih`. File akan disimpan di direktori `uploads/recommendations/` dengan nama yang di-generate otomatis untuk menghindari konflik.

## Supported File Types
- **PDF**: `application/pdf`
- **Microsoft Word**: `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Images**: `image/jpeg`, `image/png`, `image/jpg`

## File Size Limit
- Maximum: **5MB** per file

## API Usage

### Creating Recommendation with File Upload

**Endpoint**: `POST /api/recommendations`

**Content-Type**: `multipart/form-data`

**Required Fields**:
- `file_penguasaan_benih`: File (binary)

**Optional Fields**:
- `pemodalan`: number (decimal)
- `tenaga_kerja_sd`: integer (default: 0)
- `tenaga_kerja_smp`: integer (default: 0)
- `tenaga_kerja_sma`: integer (default: 0)
- `tenaga_kerja_s1_tani`: integer (default: 0)
- `tenaga_kerja_s1_nontani`: integer (default: 0)
- `link_dokumen_pendukung`: string

### Example using cURL

```bash
curl -X POST http://localhost:3000/api/recommendations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file_penguasaan_benih=@/path/to/your/document.pdf" \
  -F "pemodalan=50000000" \
  -F "tenaga_kerja_sd=2" \
  -F "tenaga_kerja_smp=1" \
  -F "link_dokumen_pendukung=https://example.com/docs"
```

### Example using JavaScript/Fetch

```javascript
const formData = new FormData();
formData.append('file_penguasaan_benih', fileInput.files[0]);
formData.append('pemodalan', '50000000');
formData.append('tenaga_kerja_sd', '2');
formData.append('tenaga_kerja_smp', '1');
formData.append('link_dokumen_pendukung', 'https://example.com/docs');

fetch('/api/recommendations', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

### Example using Postman

1. Set method to `POST`
2. Set URL to `http://localhost:3000/api/recommendations`
3. Go to **Headers** tab and add:
   - `Authorization`: `Bearer YOUR_JWT_TOKEN`
4. Go to **Body** tab and select `form-data`
5. Add fields:
   - `file_penguasaan_benih`: Select "File" type and upload your document
   - `pemodalan`: `50000000`
   - `tenaga_kerja_sd`: `2`
   - `tenaga_kerja_smp`: `1`
   - `link_dokumen_pendukung`: `https://example.com/docs`

## Response Format

### Success Response (201 Created)
```json
{
  "success": true,
  "message": "Recommendation created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "pemohon_id": "550e8400-e29b-41d4-a716-446655440001",
    "pemodalan": 50000000,
    "tenaga_kerja_sd": 2,
    "tenaga_kerja_smp": 1,
    "tenaga_kerja_sma": 0,
    "tenaga_kerja_s1_tani": 1,
    "tenaga_kerja_s1_nontani": 0,
    "file_penguasaan_benih": "/uploads/recommendations/document-1693234567890-123456789.pdf",
    "link_dokumen_pendukung": "https://example.com/docs",
    "status": 1,
    "is_sertifikasi": false,
    "created_at": "2024-08-28T04:40:00.000Z",
    "updated_at": "2024-08-28T04:40:00.000Z"
  }
}
```

### Error Responses

#### Missing File (400 Bad Request)
```json
{
  "success": false,
  "message": "File penguasaan benih is required"
}
```

#### Invalid File Type (400 Bad Request)
```json
{
  "success": false,
  "message": "Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, and PNG are allowed."
}
```

#### File Too Large (413 Payload Too Large)
```json
{
  "success": false,
  "message": "File too large. Maximum size is 5MB."
}
```

#### Unauthorized (401 Unauthorized)
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

#### Forbidden (403 Forbidden)
```json
{
  "success": false,
  "message": "Only petani and perusahaan can create recommendations"
}
```

## File Storage

- **Directory**: `uploads/recommendations/`
- **Naming Convention**: `{originalName}-{timestamp}-{randomNumber}.{extension}`
- **Example**: `document-1693234567890-123456789.pdf`

## Security Considerations

1. **File Type Validation**: Only allowed MIME types are accepted
2. **File Size Limit**: Maximum 5MB to prevent abuse
3. **Authentication Required**: Only authenticated users can upload
4. **Role-Based Access**: Only `petani` and `perusahaan` roles can create recommendations
5. **Unique File Names**: Prevents filename conflicts and potential path traversal attacks

## Fallback Support

The API also supports traditional JSON requests where `file_penguasaan_benih` is provided as a string (file path). This maintains backward compatibility.

```json
POST /api/recommendations
Content-Type: application/json

{
  "file_penguasaan_benih": "/path/to/existing/file.pdf",
  "pemodalan": 50000000,
  "tenaga_kerja_sd": 2
}
```
