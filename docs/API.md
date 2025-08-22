# API Documentation Index

## Overview
This document provides a comprehensive index of all API endpoints available in the Sisolehbun Blockchain Backend.

**Base URL**: `http://localhost:3000/api`

**Authentication**: All protected endpoints require a Bearer token in the Authorization header.

## 📊 Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "status": "success",
  "data": {
    // Response data here
  },
  "meta": {
    // Optional metadata (pagination, masking info, etc.)
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    // Optional validation errors array
  ]
}
```

## 🔐 Authentication Endpoints

### Login
- **POST** `/auth/login`
- **Description**: Authenticate user and get JWT token
- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```
- **Success Response (200)**:
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 👥 User Management Endpoints

### Get All Users
- **GET** `/users`
- **Description**: Get list of all users with data masking applied based on user role
- **Auth Required**: Yes (Admin role)
- **Success Response (200)**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "J*** D**",
      "email": "jo******@example.com",
      "role": {
        "id": "uuid",
        "roleName": "Admin",
        "description": "Administrator role"
      },
      "createdAt": "2025-08-22T00:00:00.000Z",
      "updatedAt": "2025-08-22T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 7,
    "masking_applied": true,
    "masking_level": "admin"
  }
}
```

### Get User by ID
- **GET** `/users/:id`
- **Description**: Get specific user by ID with masking applied
- **Auth Required**: Yes (Admin role)
- **Parameters**: 
  - `id` (string): User UUID
- **Success Response (200)**: Same as single user object above

### Create User
- **POST** `/users`
- **Description**: Create new user
- **Auth Required**: Yes (Admin role)
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "roleId": "role-uuid-here"
}
```

### Update User
- **PUT** `/users/:id`
- **Description**: Update existing user
- **Auth Required**: Yes (Admin role)
- **Parameters**:
  - `id` (string): User UUID
- **Request Body**: Same as create user

### Delete User
- **DELETE** `/users/:id`
- **Description**: Delete user
- **Auth Required**: Yes (Admin role)
- **Parameters**:
  - `id` (string): User UUID

## 👤 Profile Management Endpoints

### Get Current User Profile
- **GET** `/profile`
- **Description**: Get current authenticated user's profile
- **Auth Required**: Yes
- **Success Response (200)**:
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": {
      "roleName": "User"
    },
    "deletionRequested": false,
    "deletionRequestDate": null
  }
}
```

### Update Profile
- **PUT** `/profile`
- **Description**: Update current user's profile
- **Auth Required**: Yes
- **Request Body**:
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

### Request Account Deletion
- **DELETE** `/profile`
- **Description**: Request account deletion
- **Auth Required**: Yes

## 🎭 Role Management Endpoints

### Get All Roles
- **GET** `/roles`
- **Description**: Get list of all available roles
- **Auth Required**: Yes (Admin role)
- **Success Response (200)**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "roleName": "Admin",
      "description": "Administrator with full access",
      "createdAt": "2025-08-22T00:00:00.000Z",
      "updatedAt": "2025-08-22T00:00:00.000Z"
    }
  ]
}
```

### Get Role by ID
- **GET** `/roles/:id`
- **Description**: Get specific role by ID
- **Auth Required**: Yes (Admin role)
- **Parameters**:
  - `id` (string): Role UUID

## ⚙️ Settings Endpoints

### Get Settings
- **GET** `/settings`
- **Description**: Get application settings
- **Auth Required**: Yes (Admin role)

### Update Settings
- **PUT** `/settings`
- **Description**: Update application settings
- **Auth Required**: Yes (Admin role)

## 🗂️ Menu Endpoints

### Get Menus
- **GET** `/menus`
- **Description**: Get menu items
- **Auth Required**: Yes

## 📝 Data Masking Information

Data masking is automatically applied to sensitive fields based on the requesting user's role:

### Admin Role
- **Email**: Shows 4+ characters: `john****@example.com`
- **Name**: No masking applied
- **Phone**: Light masking: `+628*****6789`

### Manager Role  
- **Email**: Shows 3 characters: `joh*****@example.com`
- **Name**: Partial masking: `Joh* D**`
- **Phone**: Medium masking: `+628****6789`

### User Role
- **Email**: Shows 2 characters: `jo******@example.com`
- **Name**: Name masking: `J*** D**`
- **Phone**: Heavy masking: `+628***6789`

### Guest/Unknown
- **Email**: Shows 1 character: `j*******@example.com`
- **Name**: Full name masking: `J*** D**`
- **Phone**: Full masking: `**********`

## 🚫 Error Codes

### Authentication Errors
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Insufficient permissions

### Validation Errors
- **400 Bad Request**: Invalid input data
- **422 Unprocessable Entity**: Validation failed

### Resource Errors
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists

### Server Errors
- **500 Internal Server Error**: Server error occurred

## 🔧 Request Headers

### Required Headers
```
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

### Optional Headers
```
Accept: application/json
User-Agent: YourApp/1.0
```

## 📊 Rate Limiting

Currently no rate limiting is implemented, but consider adding it for production use.

## 🧪 Testing Examples

### Using cURL

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

#### Get Users (with token)
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using JavaScript/Fetch
```javascript
// Login
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'admin123'
  })
});

const { data } = await loginResponse.json();
const token = data.token;

// Get users
const usersResponse = await fetch('http://localhost:3000/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const users = await usersResponse.json();
```

## 🔗 Related Documentation

- [Data Masking Guide](./MASKING_GUIDE.md)
- [Profile System Guide](./PROFILE_SYSTEM.md)
- [Main Documentation](./README.md)

---

*For detailed Swagger/OpenAPI documentation, visit `/api-docs` when the server is running.*
