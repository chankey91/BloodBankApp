# 🛡️ How to Create an Admin User

## Quick Guide to Creating Your First Admin

---

## Method 1: Using MongoDB Shell (Recommended)

### Step 1: Connect to MongoDB

```bash
# If using MongoDB locally
mongosh

# Or specify connection string
mongosh "mongodb://localhost:27017/bloodbank"
```

### Step 2: Update Existing User to Admin

```javascript
// Switch to your database
use bloodbank

// Update an existing user to admin
db.users.updateOne(
  { email: "youremail@example.com" },  // Replace with your email
  { 
    $set: { 
      role: "admin",
      isVerified: true,
      isActive: true
    } 
  }
)

// Verify the update
db.users.findOne({ email: "youremail@example.com" })
```

---

## Method 2: Register New Admin User

### Step 1: Register Via API

Use Postman or cURL to register:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@bloodbank.com",
    "password": "SecurePassword123!",
    "phone": "+1234567890",
    "role": "admin"
  }'
```

### Step 2: Verify in Database

```javascript
// Connect to MongoDB
mongosh "mongodb://localhost:27017/bloodbank"

// Verify and activate the user
db.users.updateOne(
  { email: "admin@bloodbank.com" },
  { 
    $set: { 
      isVerified: true,
      isActive: true
    } 
  }
)
```

---

## Method 3: Using MongoDB Compass (GUI)

### Step 1: Open MongoDB Compass

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Select `bloodbank` database
4. Click on `users` collection

### Step 2: Find Your User

1. Search for your user by email
2. Click on the user document

### Step 3: Edit Document

1. Click "Edit Document" button
2. Change the following fields:
   ```json
   {
     "role": "admin",
     "isVerified": true,
     "isActive": true
   }
   ```
3. Click "Update"

---

## Method 4: Create Super Admin

For a super admin with elevated privileges:

```javascript
db.users.updateOne(
  { email: "superadmin@bloodbank.com" },
  { 
    $set: { 
      role: "admin",
      isVerified: true,
      isActive: true,
      isSuperAdmin: true  // Extra privilege
    } 
  }
)
```

---

## Verification

### Check if Admin User is Created

```javascript
// In MongoDB shell
db.users.findOne(
  { role: "admin" },
  { name: 1, email: 1, role: 1, isVerified: 1, isActive: 1 }
)
```

Expected output:
```json
{
  "_id": ObjectId("..."),
  "name": "Admin User",
  "email": "admin@bloodbank.com",
  "role": "admin",
  "isVerified": true,
  "isActive": true
}
```

---

## Login and Access Admin Panel

### Step 1: Login

1. Go to `http://localhost:3000/login`
2. Enter admin credentials
3. Click "Login"

### Step 2: Access Admin Dashboard

1. Navigate to `http://localhost:3000/admin/dashboard`
2. Or use the main navigation to find admin panel

---

## Security Best Practices

### ✅ DO:
- Use strong passwords (min 12 characters)
- Include uppercase, lowercase, numbers, and symbols
- Use different passwords for each admin
- Enable two-factor authentication (if implemented)
- Regularly rotate passwords
- Limit number of admin users

### ❌ DON'T:
- Use simple passwords like "admin123"
- Share admin credentials
- Leave default admin accounts active
- Use same password across systems
- Grant admin access unnecessarily

---

## Recommended Admin Passwords

Use a password generator with these criteria:
- **Minimum**: 12 characters
- **Include**: Uppercase, lowercase, numbers, symbols
- **Example pattern**: `Bb@2025Admin!Pass`

---

## Troubleshooting

### Problem: "Access Denied" when accessing `/admin/dashboard`

**Solution:**
```javascript
// Verify role in database
db.users.findOne({ email: "your@email.com" })

// Ensure these fields are correct:
// role: "admin"
// isVerified: true
// isActive: true
```

### Problem: Cannot Login

**Check:**
1. Email is correct
2. Password is correct
3. User exists in database
4. `isActive` is `true`

### Problem: 403 Forbidden on Admin Routes

**Check:**
1. JWT token is valid
2. Token is sent in Authorization header
3. User role is "admin"
4. Token has not expired

---

## Quick Copy-Paste Commands

### Create Admin from Existing User

```javascript
// Connect
mongosh "mongodb://localhost:27017/bloodbank"

// Update
db.users.updateOne(
  { email: "REPLACE_WITH_YOUR_EMAIL" },
  { $set: { role: "admin", isVerified: true, isActive: true } }
)

// Verify
db.users.findOne({ email: "REPLACE_WITH_YOUR_EMAIL" })
```

### Find All Admins

```javascript
db.users.find({ role: "admin" }, { name: 1, email: 1, role: 1 })
```

### Count Admin Users

```javascript
db.users.countDocuments({ role: "admin" })
```

### Remove Admin Role

```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "donor" } }
)
```

---

## Multiple Admin Users

You can create multiple admin users with different responsibilities:

```javascript
// Main Super Admin
db.users.updateOne(
  { email: "superadmin@bloodbank.com" },
  { $set: { role: "admin", isSuperAdmin: true, isVerified: true, isActive: true } }
)

// Operations Admin
db.users.updateOne(
  { email: "operations@bloodbank.com" },
  { $set: { role: "admin", isVerified: true, isActive: true } }
)

// Support Admin
db.users.updateOne(
  { email: "support@bloodbank.com" },
  { $set: { role: "admin", isVerified: true, isActive: true } }
)
```

---

## Testing Admin Access

After creating admin user, test these:

1. ✅ Login with admin credentials
2. ✅ Access `/admin/dashboard`
3. ✅ View users at `/admin/users`
4. ✅ Check analytics at `/admin/analytics`
5. ✅ Test notification broadcast
6. ✅ Update settings

---

## Video Tutorial (Steps)

**Creating Admin User:**
1. Open Terminal/Command Prompt
2. Type: `mongosh`
3. Type: `use bloodbank`
4. Copy-paste the updateOne command
5. Verify with findOne command
6. Close MongoDB shell
7. Go to browser and login
8. Navigate to `/admin/dashboard`

---

## Support

If you encounter issues:

1. Check MongoDB is running
2. Verify database name is correct
3. Ensure user email exists
4. Check password is correct
5. Review browser console for errors
6. Check backend logs

---

## Summary

**Quickest Method:**
```bash
# 1. Open MongoDB Shell
mongosh

# 2. Switch to database
use bloodbank

# 3. Make user admin
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin", isVerified: true, isActive: true } }
)

# 4. Login at http://localhost:3000/login
# 5. Access http://localhost:3000/admin/dashboard
```

**Done! You're now an admin! 🎉**

---

*Need more help? Check `ADMIN_PANEL_GUIDE.md` for detailed documentation.*

