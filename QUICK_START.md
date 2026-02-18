# Quick Start Guide

## ✅ Backend Setup Complete!

Your backend is now fully configured with enterprise-level security and authentication.

## 📁 Folder Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── admin/          # Admin controllers
│   │   │   ├── auth.controller.js
│   │   │   └── users.controller.js
│   │   └── user/           # User controllers
│   │       └── auth.controller.js
│   ├── routes/
│   │   ├── admin/          # Admin routes
│   │   │   ├── auth.routes.js
│   │   │   ├── users.routes.js
│   │   │   └── index.js
│   │   ├── user/           # User routes
│   │   │   ├── auth.routes.js
│   │   │   └── index.js
│   │   └── index.js
│   ├── middleware/         # Security & auth middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   ├── security.js
│   │   └── validator.js
│   ├── database/models/
│   │   ├── user/
│   │   │   └── user.model.js
│   │   └── refreshToken.model.js
│   └── config/
```

## 🚀 Start the Server

```bash
cd backend
npm install
npm run dev
```

Server will start on: **http://localhost:3000**

## 🔐 Security Features Implemented

✅ **JWT Authentication** - Access & refresh tokens  
✅ **Password Hashing** - Bcrypt with configurable salt rounds  
✅ **Rate Limiting** - Prevent brute force attacks  
✅ **Input Validation** - Prevent XSS & injection  
✅ **Security Headers** - Helmet for HTTP security  
✅ **CORS Protection** - Configurable allowed origins  
✅ **Email Verification** - User email confirmation  
✅ **Password Reset** - Secure token-based reset  
✅ **Role-Based Access** - User & Admin roles  
✅ **Request Logging** - Track API usage  
✅ **Error Handling** - Centralized error management

## 📍 API Endpoints

### User Routes (`/api/user/auth`)

- **POST** `/register` - Register new user
- **POST** `/login` - User login
- **POST** `/logout` - User logout (protected)
- **POST** `/refresh-token` - Refresh access token
- **POST** `/change-password` - Change password (protected)
- **POST** `/forgot-password` - Request password reset
- **POST** `/reset-password` - Reset password with token
- **POST** `/verify-email` - Verify email address
- **GET** `/me` - Get current user profile (protected)

### Admin Routes (`/api/admin/auth`)

- **POST** `/login` - Admin login
- **POST** `/logout` - Admin logout (protected)
- **GET** `/me` - Get admin profile (protected)
- **POST** `/create-admin` - Create new admin (protected)

### Admin User Management (`/api/admin/users`)

- **GET** `/` - Get all users with pagination (protected, admin only)
- **GET** `/stats` - Get user statistics (protected, admin only)
- **GET** `/:id` - Get user by ID (protected, admin only)
- **PUT** `/:id` - Update user (protected, admin only)
- **DELETE** `/:id` - Delete user (protected, admin only)

### Health Check

- **GET** `/api/health` - Server health check

## 🧪 Test the API

You can test the endpoints using:

1. **Postman** - Import the endpoints
2. **cURL** - Command line testing
3. **Frontend** - Connect your React apps

### Example: Register a User

```bash
curl -X POST http://localhost:3000/api/user/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!"
  }'
```

### Example: Login

```bash
curl -X POST http://localhost:3000/api/user/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

### Example: Get Profile (with token)

```bash
curl -X GET http://localhost:3000/api/user/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## 🔑 Environment Variables

Copy `.env.example` to `.env` and update:

```env
# Required
JWT_ACCESS_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
DATABASE_URL=your-mongodb-connection-string

# Optional (has defaults)
PORT=3000
FRONTEND_URL=http://localhost:3001
```

## 🎯 Next Steps

1. **Create First Admin User** - Manually add an admin to database or use registration then update role
2. **Connect Frontend** - Update API URLs in demo and demoadminpanel
3. **Configure Email** - Set up email credentials for password reset
4. **Deploy** - Deploy to production server

## 📖 Full Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API documentation.

## ⚠️ Security Notes

1. **Change JWT Secrets** - Use strong, random secrets in production
2. **Enable HTTPS** - Set `REFRESH_COOKIE_SECURE=true` in production
3. **Configure CORS** - Update `ALLOWED_ORIGINS` for your domains
4. **Email Setup** - Configure proper email service
5. **Database** - Secure your MongoDB instance
6. **Rate Limiting** - Adjust limits based on your needs

---

🎉 **Your backend is ready to use!**
