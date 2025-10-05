# Todo Backend API

A complete backend API system for a Todo application with user authentication and todo management capabilities.

## Features

- **User Authentication**: JWT-based authentication with registration, login, and token verification
- **Todo Management**: Full CRUD operations for todos with user isolation
- **Security**: Password hashing, input validation, rate limiting, and CORS protection
- **Database**: SQLite database with proper schema and relationships
- **API Documentation**: RESTful API with consistent response formats

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit

## Project Structure

```
backend/
├── config/
│   └── database.js          # Database configuration and connection
├── models/
│   ├── User.js              # User model with authentication methods
│   └── Todo.js              # Todo model with CRUD operations
├── routes/
│   ├── auth.js              # Authentication routes (register, login, verify)
│   └── todos.js             # Todo CRUD routes
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   └── validation.js        # Input validation and sanitization
├── utils/
│   └── helpers.js           # Utility functions
└── database/
    ├── init.sql             # Database schema (reference)
    └── todo.db              # SQLite database file (created on first run)
```

## Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server**:

   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register

Register a new user account.

**Request Body**:

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response**:

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "username": "johndoe",
      "email": "john@example.com",
      "created_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token"
  }
}
```

#### POST /api/auth/login

Authenticate user and get JWT token.

**Request Body**:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET /api/auth/verify

Verify JWT token and get user information.

**Headers**: `Authorization: Bearer <token>`

### Todo Endpoints

All todo endpoints require authentication via JWT token in the Authorization header.

#### GET /api/todos

Get all todos for the authenticated user.

**Query Parameters**:

- `status`: `all` | `completed` | `pending` (default: `all`)
- `limit`: Number of todos per page (default: 50, max: 100)
- `offset`: Number of todos to skip (default: 0)

#### POST /api/todos

Create a new todo.

**Request Body**:

```json
{
  "title": "Complete project",
  "description": "Finish the backend API implementation"
}
```

#### GET /api/todos/:id

Get a specific todo by ID.

#### PUT /api/todos/:id

Update a specific todo.

**Request Body** (all fields optional):

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true
}
```

#### DELETE /api/todos/:id

Delete a specific todo.

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": ["Detailed error messages"]
}
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds of 10
- **JWT Authentication**: 24-hour token expiration
- **Input Validation**: Comprehensive validation for all inputs
- **Rate Limiting**: 100 requests per minute per IP
- **CORS Protection**: Configurable CORS settings
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Todos Table

```sql
CREATE TABLE todos (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `JWT_SECRET`: Secret key for JWT tokens
- `FRONTEND_URL`: Frontend URL for CORS configuration

## Testing

The API can be tested using tools like Postman, curl, or any HTTP client.

### Example curl commands:

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create a todo (replace TOKEN with actual JWT token)
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Test todo","description":"This is a test todo"}'
```

## Health Check

The server provides a health check endpoint at `/health` that returns server status and uptime information.

## Error Handling

The API includes comprehensive error handling for:

- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Conflict errors (409)
- Rate limiting (429)
- Server errors (500)

## Development

For development, the server supports hot reloading with nodemon. The database is automatically initialized on first run.

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure proper CORS settings
4. Set up proper logging
5. Use a process manager like PM2
6. Set up database backups

## License

ISC
