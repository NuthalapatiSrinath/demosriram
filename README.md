# Backend API - Complete Authentication & Security

A secure and scalable Node.js/Express backend with complete authentication, user management, and admin features.

## 🚀 Quick Start

### Installation

```bash
cd backend
npm install
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Update the environment variables with your configuration
3. **Important:** Generate strong JWT secrets for production

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

## 📚 Full Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API documentation.

## 🔒 Security Features

✅ **Password Security** - Bcrypt with salt rounds, strong password validation  
✅ **JWT Authentication** - Access + refresh tokens with rotation  
✅ **Rate Limiting** - Prevent brute force attacks  
✅ **Input Validation** - XSS & injection prevention  
✅ **Security Headers** - Helmet.js protection  
✅ **CORS** - Configurable origin control  
✅ **Email Verification** - Optional user verification  
✅ **Cookie Security** - httpOnly, secure, sameSite

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── controllers/     # User & Admin controllers
│   │   ├── admin/       # Admin-specific controllers
│   │   └── user/        # User-specific controllers
│   ├── routes/          # API routes
│   │   ├── admin/       # Admin routes
│   │   └── user/        # User routes
│   ├── middleware/      # Security & auth middleware
│   ├── database/        # MongoDB models
│   ├── config/          # Configuration
│   └── utils/           # Helper utilities
```

## 🔑 Key Features

- **User Authentication**: Register, login, logout, email verification
- **Password Management**: Change password, forgot password, reset password
- **Token Management**: JWT access & refresh tokens with rotation
- **Admin Panel**: User management, statistics, admin creation
- **Rate Limiting**: Multiple layers of protection
- **Input Validation**: Comprehensive validation & sanitization
- **Error Handling**: Centralized error management

## 📦 Tech Stack

- Node.js + Express.js v5
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- helmet, express-rate-limit, validator
- Nodemailer

---

For detailed API endpoints and usage, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
