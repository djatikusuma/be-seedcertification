# Express.js TypeScript API with Sequelize ORM

This is a RESTful API built with Express.js, TypeScript, and Sequelize ORM following SOLID principles. It supports both MySQL and PostgreSQL databases.

## Features

- TypeScript support
- Express.js for API endpoints
- Sequelize ORM with support for both MySQL and PostgreSQL
- SOLID principles implementation
- JWT Authentication with Role-Based Access Control (RBAC)
- Data models with relationships
- UUID for primary keys
- Database migrations and seeders
- ESLint and Prettier for code quality
- Environment-based configuration
- OpenAPI/Swagger documentation
- Jest and Supertest for unit and integration testing
- Global application settings management

## Project Structure

```
.
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # API controllers
│   ├── interfaces/     # TypeScript interfaces
│   ├── middleware/     # Custom middlewares
│   ├── migrations/     # Database migrations
│   ├── models/         # Sequelize data models
│   ├── repositories/   # Repository pattern implementations
│   ├── routes/         # API routes
│   ├── seeders/        # Database seeders
│   ├── services/       # Business logic services
│   ├── services/       # Service layer implementations
│   ├── utils/          # Utility functions
│   └── app.ts          # Main application file
├── .env                # Environment variables
├── .eslintrc.js        # ESLint configuration
├── .gitignore          # Git ignore file
├── .prettierrc         # Prettier configuration
├── .sequelizerc        # Sequelize CLI configuration
├── package.json        # Project dependencies
├── README.md           # Project documentation
└── tsconfig.json       # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- NPM or Yarn
- MySQL or PostgreSQL database

### Installation

1. Clone the repository

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit the .env file with your database credentials
```

4. Run migrations and seeders
```bash
npm run migration:run
npm run seed:run
```

5. Start the development server
```bash
npm run dev
```

### Database Configuration

This project supports both MySQL and PostgreSQL. You can choose your database by setting the `DB_DIALECT` environment variable in the `.env` file:

```
# For MySQL
DB_DIALECT=mysql

# For PostgreSQL
DB_DIALECT=postgres
```

### Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run migration:run` - Run database migrations
- `npm run seed:run` - Run database seeders
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage report

## API Documentation

This API includes Swagger documentation which can be accessed when the server is running at:

```
http://localhost:3000/api-docs
```

## Authentication

Most endpoints require authentication using JWT tokens. To authenticate:

1. Create a user or use an existing one
2. Login using the `/api/auth/login` endpoint
3. Use the returned token in subsequent requests with the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### Auth

- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/refresh` - Refresh JWT token

### User Profile

- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update current user profile
- `GET /api/profile/download` - Download user data
- `POST /api/profile/delete-request` - Request account deletion

### Users

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID (Admin only)
- `POST /api/users` - Create a new user (Admin only)
- `PUT /api/users/:id` - Update a user (Admin only)
- `DELETE /api/users/:id` - Delete a user (Admin only)

### Roles

- `GET /api/roles` - Get all roles (Admin only)
- `GET /api/roles/:id` - Get role by ID (Admin only)
- `POST /api/roles` - Create a new role (Admin only)
- `PUT /api/roles/:id` - Update a role (Admin only)
- `DELETE /api/roles/:id` - Delete a role (Admin only)

### Menus

- `GET /api/menus` - Get all menus
- `GET /api/menus/tree` - Get menus as a tree structure
- `GET /api/menus/:id` - Get menu by ID
- `POST /api/menus` - Create a new menu (Admin only)
- `PUT /api/menus/:id` - Update a menu (Admin only)
- `DELETE /api/menus/:id` - Delete a menu (Admin only)

### Settings

- `GET /api/settings` - Get all application settings (Authenticated)
- `PUT /api/settings` - Update application settings (Admin only)

## Application Settings

The following settings can be managed via the Settings API:

- `appName` - The name of the application
- `timezone` - Default timezone for the application
- `jwtTimeout` - JWT token expiration time (e.g., '24h')
- `appMetaData` - Additional metadata about the application (JSON object)
- `database` - The active database configuration (mysql/postgres)

## Testing

This project uses Jest and Supertest for testing. To run the tests:

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage
```

Tests are organized into:
- Unit tests: Testing individual components in isolation
- Integration tests: Testing API endpoints and component interactions

## License

This project is licensed under the ISC License.
