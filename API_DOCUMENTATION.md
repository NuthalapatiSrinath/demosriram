# Backend API Documentation

## 🚀 Quick Start

### Installation

```bash
cd backend
npm install
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Update the environment variables with your configuration
3. Generate strong JWT secrets for production

### Run Development Server

```bash
npm run dev
```

### Run Production Server

```bash
npm start
```

Server will start on `http://localhost:3000` (or your configured PORT)

---

## 📋 API Endpoints

### Base URL: `/api`

---

## 🔐 User Authentication Routes

**Base Path:** `/api/user/auth`

### Public Routes

#### Register User

- **POST** `/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!"
  }
  ```
- **Response:** User object + success message

#### Login

- **POST** `/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "Password123!"
  }
  ```
- **Response:** User object + access token (refresh token in httpOnly cookie)

#### Refresh Access Token

- **POST** `/refresh-token`
- **Body:** None (uses cookie) or
  ```json
  {
    "refreshToken": "your-refresh-token"
  }
  ```
- **Response:** New access token

#### Forgot Password

- **POST** `/forgot-password`
- **Body:**
  ```json
  {
    "email": "john@example.com"
  }
  ```
- **Response:** Success message (email sent)

#### Reset Password

- **POST** `/reset-password`
- **Body:**
  ```json
  {
    "token": "reset-token-from-email",
    "newPassword": "NewPassword123!",
    "confirmNewPassword": "NewPassword123!"
  }
  ```
- **Response:** Success message

#### Verify Email

- **POST** `/verify-email`
- **Body:**
  ```json
  {
    "token": "verification-token-from-email"
  }
  ```
- **Response:** Success message

### Protected Routes (Require Authentication)

#### Logout

- **POST** `/logout`
- **Headers:** `Authorization: Bearer <access-token>`
- **Response:** Success message

#### Change Password

- **POST** `/change-password`
- **Headers:** `Authorization: Bearer <access-token>`
- **Body:**
  ```json
  {
    "currentPassword": "OldPassword123!",
    "newPassword": "NewPassword123!",
    "confirmNewPassword": "NewPassword123!"
  }
  ```
- **Response:** Success message

#### Get Current User Profile

- **GET** `/me`
- **Headers:** `Authorization: Bearer <access-token>`
- **Response:** User object

---

## 👨‍💼 Admin Authentication Routes

**Base Path:** `/api/admin/auth`

### Public Routes

#### Admin Login

- **POST** `/login`
- **Body:**
  ```json
  {
    "email": "admin@example.com",
    "password": "AdminPassword123!"
  }
  ```
- **Response:** Admin user object + access token

### Protected Admin Routes

#### Admin Logout

- **POST** `/logout`
- **Headers:** `Authorization: Bearer <access-token>`
- **Response:** Success message

#### Get Admin Profile

- **GET** `/me`
- **Headers:** `Authorization: Bearer <access-token>`
- **Response:** Admin user object

#### Create New Admin

- **POST** `/create-admin`
- **Headers:** `Authorization: Bearer <access-token>`
- **Body:**
  ```json
  {
    "name": "New Admin",
    "email": "newadmin@example.com",
    "password": "AdminPassword123!"
  }
  ```
- **Response:** New admin user object

---

## 👥 Admin User Management Routes

**Base Path:** `/api/admin/users`

**All routes require admin authentication**

#### Get All Users (with pagination)

- **GET** `/`
- **Headers:** `Authorization: Bearer <access-token>`
- **Query Params:**
  - `page` (optional, default: 1)
  - `limit` (optional, default: 10)
  - `search` (optional, searches name/email)
  - `role` (optional, filter by 'user' or 'admin')
- **Example:** `/api/admin/users?page=1&limit=10&search=john&role=user`
- **Response:** Users array + pagination info

#### Get User Statistics

- **GET** `/stats`
- **Headers:** `Authorization: Bearer <access-token>`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "totalUsers": 100,
      "totalAdmins": 5,
      "verifiedUsers": 80,
      "unverifiedUsers": 20,
      "recentUsers": 15,
      "total": 105
    }
  }
  ```

#### Get User by ID

- **GET** `/:id`
- **Headers:** `Authorization: Bearer <access-token>`
- **Response:** User object

#### Update User

- **PUT** `/:id`
- **Headers:** `Authorization: Bearer <access-token>`
- **Body:**
  ```json
  {
    "name": "Updated Name",
    "email": "updated@example.com",
    "role": "admin",
    "isVerified": true
  }
  ```
- **Response:** Updated user object

#### Delete User

- **DELETE** `/:id`
- **Headers:** `Authorization: Bearer <access-token>`
- **Response:** Success message

---

## 🔒 Security Features

### Implemented Security Measures

1. **Password Security**
   - Bcrypt hashing with configurable salt rounds
   - Password strength validation (min 8 chars, uppercase, lowercase, number, special char)
   - Password history (prevents reusing old passwords)

2. **JWT Authentication**
   - Access tokens (short-lived, 15 minutes)
   - Refresh tokens (long-lived, 7 days)
   - Refresh token rotation
   - Token revocation on logout/password change

3. **Rate Limiting**
   - General API rate limiting (100 req/15min)
   - Strict login rate limiting (5 attempts/15min)
   - Password reset rate limiting (3 req/hour)

4. **Input Validation**
   - Email format validation
   - Strong password requirements
   - Input sanitization (XSS prevention)
   - MongoDB injection prevention

5. **HTTP Security Headers**
   - Helmet.js for security headers
   - CSP (Content Security Policy)
   - HSTS (HTTP Strict Transport Security)

6. **CORS**
   - Configurable allowed origins
   - Credentials support
   - Preflight handling

7. **Other Security Features**
   - HTTP Parameter Pollution (HPP) prevention
   - NoSQL injection prevention (mongo-sanitize)
   - Cookie security (httpOnly, secure, sameSite)
   - Request logging
   - Error handling (no sensitive data exposure)

---

## 📦 Technical Stack

- **Runtime:** Node.js
- **Framework:** Express.js v5
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Email:** Nodemailer
- **Security:**
  - helmet
  - express-rate-limit
  - express-mongo-sanitize
  - hpp (HTTP Parameter Pollution)
  - validator
  - cors

---

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── app/
│   │   ├── app.js           # (deprecated - now using server.js)
│   │   ├── routes.js        # (deprecated - now in /routes)
│   │   └── server.js        # Main server entry point
│   ├── config/
│   │   ├── app.config.js    # App configuration
│   │   ├── db.config.js     # Database configuration
│   │   └── index.js         # Combined config export
│   ├── controllers/
│   │   ├── admin/
│   │   │   ├── auth.controller.js
│   │   │   └── users.controller.js
│   │   └── user/
│   │       └── auth.controller.js
│   ├── database/
│   │   ├── index.js
│   │   └── models/
│   │       ├── user/
│   │       │   └── user.model.js
│   │       └── refreshToken.model.js
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication
│   │   ├── errorHandler.js  # Global error handling
│   │   ├── rateLimiter.js   # Rate limiting
│   │   ├── security.js      # Security headers & CORS
│   │   └── validator.js     # Input validation
│   ├── routes/
│   │   ├── admin/
│   │   │   ├── auth.routes.js
│   │   │   ├── users.routes.js
│   │   │   └── index.js
│   │   ├── user/
│   │   │   ├── auth.routes.js
│   │   │   └── index.js
│   │   └── index.js
│   └── utils/
│       ├── email.js
│       ├── forgotPasswordMailPage.js
│       └── jwt.util.js
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🔑 Environment Variables

See `.env.example` for all available environment variables.

**Important:** Generate strong, unique secrets for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` in production!

---

## 🧪 Testing the API

You can test the API using:

- Postman
- Thunder Client (VS Code extension)
- cURL
- Your frontend application

### Example cURL Request:

```bash
# Register
curl -X POST http://localhost:3000/api/user/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Password123!","confirmPassword":"Password123!"}'

# Login
curl -X POST http://localhost:3000/api/user/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Password123!"}'

# Get Profile (with token)
curl -X GET http://localhost:3000/api/user/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📞 Support

For issues or questions, please contact the development team.

---

## 📝 License

ISC
