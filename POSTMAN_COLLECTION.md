# Postman Collection - Sriram IAS Backend API

Complete API endpoints with sample request data for testing in Postman.

**Base URL:** `http://localhost:3000/api`

---

## 📋 Table of Contents

1. [User Authentication](#user-authentication)
2. [Contact Form](#contact-form)
3. [Admin Authentication](#admin-authentication)
4. [Admin - User Management](#admin-user-management)
5. [Admin - Contact Management](#admin-contact-management)
6. [Health Check](#health-check)

---

## 🔐 User Authentication

### 1. Register User

**POST** `/user/auth/register`

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "isVerified": false,
    "createdAt": "..."
  }
}
```

---

### 2. User Login

**POST** `/user/auth/login`

```json
{
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Note:** Save the `accessToken` for authenticated requests.

---

### 3. Get User Profile

**GET** `/user/auth/me`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "isVerified": false,
    "createdAt": "..."
  }
}
```

---

### 4. User Logout

**POST** `/user/auth/logout`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 5. Change Password

**POST** `/user/auth/change-password`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Body:**
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword123!",
  "confirmNewPassword": "NewPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully. Please login again."
}
```

---

### 6. Forgot Password

**POST** `/user/auth/forgot-password`

```json
{
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link will be sent"
}
```

---

### 7. Reset Password

**POST** `/user/auth/reset-password`

```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewPassword123!",
  "confirmNewPassword": "NewPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful. Please login with your new password."
}
```

---

### 8. Verify Email

**POST** `/user/auth/verify-email`

```json
{
  "token": "verification-token-from-email"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully. You can now login."
}
```

---

### 9. Refresh Access Token

**POST** `/user/auth/refresh-token`

**Note:** This uses the refresh token from httpOnly cookie or body.

**Body (optional):**
```json
{
  "refreshToken": "your-refresh-token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new-access-token"
  }
}
```

---

## 📞 Contact Form

### 1. Submit Contact Form

**POST** `/user/contact`

```json
{
  "fullName": "Jane Smith",
  "email": "jane.smith@example.com",
  "phoneNumber": "9876543210",
  "selectedCenter": "Delhi Center",
  "message": "I am interested in UPSC preparation courses. Please contact me."
}
```

**Available Centers:**
- "All Centers"
- "Delhi Center"
- "Mumbai Center"
- "Bangalore Center"
- "Hyderabad Center"

**Response:**
```json
{
  "success": true,
  "message": "Thank you for contacting us! We'll get back to you within 24 hours.",
  "data": {
    "id": "...",
    "fullName": "Jane Smith",
    "email": "jane.smith@example.com",
    "selectedCenter": "Delhi Center"
  }
}
```

---

## 👨‍💼 Admin Authentication

### 1. Admin Login (All Admin Types)

**POST** `/admin/auth/login`

**For Super Admin:**
```json
{
  "email": "superadmin@sriram.com",
  "password": "SuperAdmin123!"
}
```

**For Center Admin (Delhi):**
```json
{
  "email": "delhi@sriram.com",
  "password": "Delhi123!"
}
```

**For Center Admin (Mumbai):**
```json
{
  "email": "mumbai@sriram.com",
  "password": "Mumbai123!"
}
```

**For Center Admin (Bangalore):**
```json
{
  "email": "bangalore@sriram.com",
  "password": "Bangalore123!"
}
```

**For Center Admin (Hyderabad):**
```json
{
  "email": "hyderabad@sriram.com",
  "password": "Hyderabad123!"
}
```

**For Staff:**
```json
{
  "email": "staff@sriram.com",
  "password": "Staff123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "user": {
      "_id": "...",
      "name": "Sriram Kumar",
      "email": "superadmin@sriram.com",
      "role": "superadmin",
      "centerName": null
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Note:** Save the `accessToken` for authenticated admin requests.

---

### 2. Admin Logout

**POST** `/admin/auth/logout`

**Headers:**
```
Authorization: Bearer <admin-accessToken>
```

**Response:**
```json
{
  "success": true,
  "message": "Admin logout successful"
}
```

---

### 3. Get Admin Profile

**GET** `/admin/auth/me`

**Headers:**
```
Authorization: Bearer <admin-accessToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Sriram Kumar",
    "email": "superadmin@sriram.com",
    "role": "superadmin",
    "centerName": null,
    "isVerified": true
  }
}
```

---

### 4. Create New Admin (Super Admin Only)

**POST** `/admin/auth/create-admin`

**Headers:**
```
Authorization: Bearer <superadmin-accessToken>
```

**Create Super Admin:**
```json
{
  "name": "New Super Admin",
  "email": "newsuperadmin@sriram.com",
  "password": "SuperAdmin123!",
  "role": "superadmin"
}
```

**Create Center Admin:**
```json
{
  "name": "Rajesh Sharma",
  "email": "delhi@sriram.com",
  "password": "Delhi123!",
  "role": "centeradmin",
  "centerName": "Delhi Center"
}
```

**Create Staff:**
```json
{
  "name": "Amit Verma",
  "email": "staff@sriram.com",
  "password": "Staff123!",
  "role": "staff"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "data": {
    "_id": "...",
    "name": "Rajesh Sharma",
    "email": "delhi@sriram.com",
    "role": "centeradmin",
    "centerName": "Delhi Center",
    "isVerified": true
  }
}
```

---

## 👥 Admin - User Management

### 1. Get All Users

**GET** `/admin/users`

**Headers:**
```
Authorization: Bearer <admin-accessToken>
```

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `search` (optional, searches name/email)
- `role` (optional, filter by 'user' or 'admin')

**Example:** `/admin/users?page=1&limit=10&search=john&role=user`

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "...",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "user",
        "isVerified": true,
        "createdAt": "..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

---

### 2. Get User Statistics

**GET** `/admin/users/stats`

**Headers:**
```
Authorization: Bearer <admin-accessToken>
```

**Response:**
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

---

### 3. Get User by ID

**GET** `/admin/users/:id`

**Headers:**
```
Authorization: Bearer <admin-accessToken>
```

**Example:** `/admin/users/507f1f77bcf86cd799439011`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "isVerified": true,
    "createdAt": "..."
  }
}
```

---

### 4. Update User

**PUT** `/admin/users/:id`

**Headers:**
```
Authorization: Bearer <admin-accessToken>
```

**Body:**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "role": "user",
  "isVerified": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "_id": "...",
    "name": "John Updated",
    "email": "john.updated@example.com",
    "role": "user",
    "isVerified": true
  }
}
```

---

### 5. Delete User

**DELETE** `/admin/users/:id`

**Headers:**
```
Authorization: Bearer <admin-accessToken>
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 📋 Admin - Contact Management

### 1. Get All Contacts

**GET** `/admin/contacts`

**Headers:**
```
Authorization: Bearer <admin-accessToken>
```

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10)
- `status` (optional, filter by 'pending', 'contacted', 'resolved')
- `search` (optional, searches name/email/phone)

**Example:** `/admin/contacts?page=1&limit=10&status=pending`

**Response:**
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "_id": "...",
        "fullName": "Jane Smith",
        "email": "jane.smith@example.com",
        "phoneNumber": "9876543210",
        "selectedCenter": "Delhi Center",
        "message": "Interested in courses",
        "status": "pending",
        "createdAt": "..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 30,
      "pages": 3
    }
  }
}
```

**Note:** Center admins will only see contacts for their center.

---

### 2. Get Contact Statistics

**GET** `/admin/contacts/stats`

**Headers:**
```
Authorization: Bearer <admin-accessToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalContacts": 100,
    "pendingContacts": 30,
    "contactedContacts": 50,
    "resolvedContacts": 20,
    "recentContacts": 15,
    "contactsByCenter": [
      { "_id": "Delhi Center", "count": 40 },
      { "_id": "Mumbai Center", "count": 30 },
      { "_id": "Bangalore Center", "count": 20 },
      { "_id": "Hyderabad Center", "count": 10 }
    ]
  }
}
```

---

### 3. Get Contact by ID

**GET** `/admin/contacts/:id`

**Headers:**
```
Authorization: Bearer <admin-accessToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "fullName": "Jane Smith",
    "email": "jane.smith@example.com",
    "phoneNumber": "9876543210",
    "selectedCenter": "Delhi Center",
    "message": "Interested in courses",
    "status": "pending",
    "assignedTo": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### 4. Update Contact Status

**PUT** `/admin/contacts/:id`

**Headers:**
```
Authorization: Bearer <admin-accessToken>
```

**Body:**
```json
{
  "status": "contacted",
  "assignedTo": "Rajesh Sharma"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Contact updated successfully",
  "data": {
    "_id": "...",
    "fullName": "Jane Smith",
    "status": "contacted",
    "assignedTo": "Rajesh Sharma",
    "updatedAt": "..."
  }
}
```

---

### 5. Delete Contact (Super Admin Only)

**DELETE** `/admin/contacts/:id`

**Headers:**
```
Authorization: Bearer <superadmin-accessToken>
```

**Response:**
```json
{
  "success": true,
  "message": "Contact deleted successfully"
}
```

---

## 🏥 Health Check

### Health Check

**GET** `/health`

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-02-18T12:00:00.000Z"
}
```

---

## 📝 Postman Setup Instructions

### 1. Create Environment Variables

Create a Postman environment with these variables:

- `base_url`: `http://localhost:3000/api`
- `user_token`: (will be set automatically after login)
- `admin_token`: (will be set automatically after admin login)

### 2. Auto-Save Tokens

Add this script to the **Tests** tab of login endpoints:

**For User Login (`/user/auth/login`):**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.success && response.data.accessToken) {
        pm.environment.set("user_token", response.data.accessToken);
        console.log("User token saved!");
    }
}
```

**For Admin Login (`/admin/auth/login`):**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.success && response.data.accessToken) {
        pm.environment.set("admin_token", response.data.accessToken);
        console.log("Admin token saved!");
    }
}
```

### 3. Use Tokens in Protected Routes

In protected routes, use:
- User routes: `Authorization: Bearer {{user_token}}`
- Admin routes: `Authorization: Bearer {{admin_token}}`

---

## 🎯 Test Workflow

### User Flow:
1. Register user → `/user/auth/register`
2. Login user → `/user/auth/login` (save token)
3. Get profile → `/user/auth/me`
4. Submit contact form → `/user/contact`
5. Change password → `/user/auth/change-password`
6. Logout → `/user/auth/logout`

### Admin Flow:
1. Login as super admin → `/admin/auth/login`
2. Create center admin → `/admin/auth/create-admin`
3. Get all contacts → `/admin/contacts`
4. Update contact status → `/admin/contacts/:id`
5. Get contact stats → `/admin/contacts/stats`
6. Manage users → `/admin/users`

---

## 👤 Test Users & Admins

You can create these test accounts:

### Super Admin:
```json
{
  "email": "superadmin@sriram.com",
  "password": "SuperAdmin123!"
}
```

### Center Admins:
```json
{
  "email": "delhi@sriram.com",
  "password": "Delhi123!",
  "centerName": "Delhi Center"
}
```

### Regular User:
```json
{
  "email": "testuser@example.com",
  "password": "TestUser123!"
}
```

---

## 🔒 Notes

1. All passwords must be at least 8 characters with uppercase, lowercase, number, and special character.
2. Access tokens expire in 15 minutes. Use refresh token endpoint to get a new one.
3. Refresh tokens are stored in httpOnly cookies and expire in 7 days.
4. Center admins can only see contacts for their assigned center.
5. Super admin has access to all data across all centers.
6. Rate limiting is applied: 100 requests per 15 minutes for general APIs, 5 login attempts per 15 minutes.

---

Happy Testing! 🚀
