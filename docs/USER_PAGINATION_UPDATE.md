# User Management API - Pagination Update

## Overview
Endpoint `GET /api/users` telah diperbaiki untuk mendukung pagination yang proper, sehingga tidak lagi menampilkan semua data sekaligus.

## API Endpoints

### 1. Get All Users (Paginated)
```
GET /api/users?page=1&limit=10
```

**Query Parameters:**
- `page` (optional): Nomor halaman, default = 1, minimum = 1
- `limit` (optional): Jumlah item per halaman, default = 10, maximum = 100

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=20" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**
```json
{
    "status": "success",
    "data": [
        {
            "id": "uuid-here",
            "name": "John Doe",
            "email": "john@example.com",
            "roleId": "role-uuid",
            "role": {
                "id": "role-uuid",
                "roleName": "admin",
                "description": "Administrator"
            },
            "deletionRequested": false,
            "createdAt": "2024-01-01T00:00:00.000Z",
            "updatedAt": "2024-01-01T00:00:00.000Z"
        }
    ],
    "meta": {
        "total": 150,
        "totalPages": 8,
        "currentPage": 1,
        "limit": 20,
        "masking_applied": true,
        "masking_level": "admin"
    }
}
```

### 2. Search Users (New Feature)
```
GET /api/users/search?q=john&page=1&limit=10
```

**Query Parameters:**
- `q` (required): Search term untuk nama atau email, minimum 2 karakter
- `page` (optional): Nomor halaman, default = 1
- `limit` (optional): Jumlah item per halaman, default = 10, maximum = 100

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/users/search?q=john&page=1&limit=10" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**
```json
{
    "status": "success",
    "data": [
        {
            "id": "uuid-here",
            "name": "John Doe",
            "email": "john@example.com",
            "roleId": "role-uuid",
            "role": {
                "id": "role-uuid",
                "roleName": "admin",
                "description": "Administrator"
            },
            "deletionRequested": false,
            "createdAt": "2024-01-01T00:00:00.000Z",
            "updatedAt": "2024-01-01T00:00:00.000Z"
        }
    ],
    "meta": {
        "total": 3,
        "totalPages": 1,
        "currentPage": 1,
        "limit": 10,
        "searchTerm": "john",
        "masking_applied": true,
        "masking_level": "admin"
    }
}
```

## Features

### 🔄 **Pagination**
- **Default**: 10 items per halaman
- **Maximum**: 100 items per halaman untuk mencegah overload
- **Validation**: Page dan limit harus > 0
- **Sorting**: Data diurutkan berdasarkan `createdAt` DESC (terbaru di atas)

### 🔍 **Search Functionality**
- **Search Fields**: Nama dan email user
- **Search Type**: LIKE query (partial match)
- **Minimum Length**: 2 karakter untuk search term
- **Case Insensitive**: Search tidak case-sensitive

### 🛡️ **Data Masking**
- **Role-based Masking**: Data sensitive di-mask berdasarkan role user yang request
- **Masking Levels**: guest, user, admin, dll.
- **Excluded Fields**: Password selalu di-exclude dari response

### 🔐 **Security**
- **Authentication**: Memerlukan valid JWT token
- **Authorization**: Hanya role admin, inspektur_ketua, kepala yang bisa akses
- **Input Validation**: Validasi parameter query dan search term

## Error Responses

### Pagination Errors
```json
{
    "status": "error",
    "message": "Page number must be greater than 0"
}
```

### Search Errors
```json
{
    "status": "error",
    "message": "Search term must be at least 2 characters long"
}
```

### Authentication Errors
```json
{
    "status": "error",
    "message": "Unauthorized"
}
```

## Implementation Details

### Service Layer Changes
- `findAllWithMasking()` method updated to support pagination
- New `searchUsersWithMasking()` method added
- Sequelize `findAndCountAll()` untuk efficient pagination
- Proper limit/offset calculation

### Controller Layer Changes  
- Input validation untuk page, limit, search term
- Error handling untuk invalid parameters
- Comprehensive response metadata
- Support untuk query parameters

### Route Changes
- Added `/search` route (positioned before `/:id` route)
- Maintained existing security middleware
- Swagger documentation updated

## Performance Considerations

1. **Database Indexing**: Pastikan ada index pada kolom `name` dan `email` untuk search performance
2. **Limit Control**: Maximum 100 items per request untuk mencegah database overload
3. **Default Sorting**: Menggunakan `createdAt DESC` untuk consistent ordering
4. **Query Optimization**: Menggunakan `findAndCountAll` untuk efficient total count

## Usage Examples

### Frontend Implementation
```javascript
// Get first page with 20 items
const users = await fetch('/api/users?page=1&limit=20');

// Search users
const searchResults = await fetch('/api/users/search?q=john&page=1&limit=10');

// Navigate to next page
const nextPage = await fetch(`/api/users?page=${currentPage + 1}&limit=20`);
```

### Backend Usage
```typescript
// Service method usage
const result = await userService.findAllWithMasking('admin', 1, 20);
const searchResult = await userService.searchUsersWithMasking('john', 'admin', 1, 10);
```

## Migration Notes

### Breaking Changes
- Response format changed: `data` sekarang array dalam object dengan `meta`
- Total count moved to `meta.total`

### Backward Compatibility
- Existing clients tanpa query params akan mendapat default pagination (page=1, limit=10)
- Response structure tetap consistent untuk `data` array

## Testing

Test pagination dan search:
1. Test dengan berbagai page numbers
2. Test dengan different limits
3. Test edge cases (page=0, limit=0, empty search)
4. Test dengan large datasets untuk performance
5. Test search dengan special characters
6. Test authentication dan authorization

## Summary

✅ **Completed Features:**
- Pagination support untuk GET /api/users
- Search functionality dengan /api/users/search  
- Input validation dan error handling
- Proper response metadata
- Performance optimizations
- Security maintained
- Swagger documentation updated

User list endpoint sekarang scalable dan tidak akan menampilkan semua data sekaligus!
