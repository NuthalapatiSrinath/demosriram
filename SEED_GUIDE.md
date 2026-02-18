# Database Seed Script Usage

## Create Initial Admin Users

To set up the initial admin users in your database, run:

```bash
npm run seed:admins
```

This will create the following admin accounts:

### Super Admin
- **Name:** Sriram Kumar
- **Email:** superadmin@sriram.com
- **Password:** SuperAdmin123!
- **Role:** superadmin
- **Access:** Full system access across all centers

### Delhi Center Admin
- **Name:** Rajesh Sharma
- **Email:** delhi@sriram.com
- **Password:** Delhi123!
- **Role:** centeradmin
- **Center:** Delhi Center
- **Access:** Manage Delhi center operations

### Mumbai Center Admin
- **Name:** Priya Patel
- **Email:** mumbai@sriram.com
- **Password:** Mumbai123!
- **Role:** centeradmin
- **Center:** Mumbai Center
- **Access:** Manage Mumbai center operations

### Bangalore Center Admin
- **Name:** Karthik Reddy
- **Email:** bangalore@sriram.com
- **Password:** Bangalore123!
- **Role:** centeradmin
- **Center:** Bangalore Center
- **Access:** Manage Bangalore center operations

### Hyderabad Center Admin
- **Name:** Lakshmi Naidu
- **Email:** hyderabad@sriram.com
- **Password:** Hyderabad123!
- **Role:** centeradmin
- **Center:** Hyderabad Center
- **Access:** Manage Hyderabad center operations

### Staff/Trainer
- **Name:** Amit Verma
- **Email:** staff@sriram.com
- **Password:** Staff123!
- **Role:** staff
- **Access:** Personal teaching dashboard

## Notes

- If admin users already exist, the script will display them and exit without creating duplicates.
- All admin users are auto-verified (no email verification required).
- Passwords follow the security policy: minimum 8 characters with uppercase, lowercase, number, and special character.

## Testing Login

After seeding, you can test the login endpoints:

### Super Admin Login
```bash
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@sriram.com",
    "password": "SuperAdmin123!"
  }'
```

### Center Admin Login (Delhi)
```bash
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "delhi@sriram.com",
    "password": "Delhi123!"
  }'
```

Use these credentials in your admin panel frontend or Postman for testing!
